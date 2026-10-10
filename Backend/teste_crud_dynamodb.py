
from io import BytesIO
from uuid import uuid4
from unittest.mock import patch

import boto3
from boto3.dynamodb.conditions import Attr
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from rest_framework.test import APIClient

from products.models import Category


def verificar(nome, resposta, status_esperado):
    print(f"{nome}: HTTP {resposta.status_code}")

    if resposta.status_code != status_esperado:
        print("Resposta:", resposta.data)
        raise AssertionError(f"Falha na operação {nome}")


# Obtém o administrador criado anteriormente
User = get_user_model()
usuario = User.objects.filter(is_superuser=True).first()

if usuario is None:
    raise RuntimeError("Crie um superusuário antes de testar.")

categoria, _ = Category.objects.get_or_create(name="Roupas")

api = APIClient(HTTP_HOST="localhost")
api.force_authenticate(user=usuario)

# Gera uma pequena imagem PNG válida
buffer = BytesIO()
Image.new("RGB", (20, 20), "white").save(
    buffer, format="PNG"
)

imagem = SimpleUploadedFile(
    "teste.png",
    buffer.getvalue(),
    content_type="image/png",
)

nome_teste = f"Camiseta teste {uuid4().hex[:8]}"

# Simula somente S3 e SQS.
# O banco PostgreSQL e o DynamoDB continuam reais.
with (
    patch("products.serializers.upload_product_image"),
    patch("products.serializers.publish_image_processing_message"),
):
    # CREATE
    resposta = api.post(
        "/api/products/",
        {
            "title": nome_teste,
            "description": "Produto para testar auditoria",
            "price": "49.90",
            "category": categoria.pk,
            "status": "ACTIVE",
            "images": [imagem],
        },
        format="multipart",
    )

    verificar("CREATE", resposta, 201)
    produto_id = str(resposta.data["id"])
    url = f"/api/products/{produto_id}/"

    # READ - Lista
    resposta = api.get("/api/products/")
    verificar("READ lista", resposta, 200)

    # READ - Detalhe
    resposta = api.get(url)
    verificar("READ detalhe", resposta, 200)

    # UPDATE
    resposta = api.patch(
        url,
        {"price": "39.90"},
        format="multipart",
    )
    verificar("UPDATE", resposta, 200)

    # DELETE
    resposta = api.delete(url)
    verificar("DELETE", resposta, 204)


# Confere os eventos no DynamoDB real
tabela = boto3.resource(
    "dynamodb",
    region_name=settings.AWS_REGION,
).Table(settings.DYNAMODB_TABLE)

filtro = Attr("entity").eq("Product") & (
    Attr("entity_id").eq(produto_id)
    | Attr("data.product_ids").contains(produto_id)
)

eventos = []
parametros = {
    "FilterExpression": filtro,
    "ConsistentRead": True,
}

while True:
    resultado = tabela.scan(**parametros)
    eventos.extend(resultado.get("Items", []))

    if "LastEvaluatedKey" not in resultado:
        break

    parametros["ExclusiveStartKey"] = resultado["LastEvaluatedKey"]

eventos.sort(key=lambda evento: evento["timestamp"])
acoes = [evento["action"] for evento in eventos]

print("\nEventos encontrados no DynamoDB:")
for evento in eventos:
    print(
        evento["action"],
        evento["entity_id"],
        evento["timestamp"],
    )

print(f"\nTotal: {len(eventos)} eventos")

assert acoes.count("CREATE") == 1
assert acoes.count("READ") == 2
assert acoes.count("UPDATE") == 1
assert acoes.count("DELETE") == 1

print("\nTESTE COMPLETO: CRUD e auditoria funcionando!")
