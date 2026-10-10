import logging
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework import viewsets
from rest_framework.decorators import action
from django_redis import get_redis_connection
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from .permissions import IsOwnerOrReadOnly
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer

from django.db import transaction
from .services.audit import registrar_evento
from django.core.cache import cache

logger = logging.getLogger(__name__)

def dados_do_produto(produto):
    return {
        "title": produto.title,
        "description": produto.description,
        "price": str(produto.price),
        "category_id": produto.category_id,
        "seller_id": str(produto.seller_id),
        "status": produto.status,
        "images": list(
            produto.images.values_list("s3_key", flat=True)
        ),
    }

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by("id")
    serializer_class = CategorySerializer

# Cache — chaves e TTL
CACHE_KEY_PRODUTOS = "produtos:listagem"
CACHE_TTL_PRODUTOS = 60 * 5   # 5 minutos


class ProductViewSet(viewsets.ModelViewSet):
    queryset = (
        Product.objects
        .select_related("seller", "category")
        .prefetch_related("images")
        .all()
        .order_by("id")
    )
    
    serializer_class = ProductSerializer
    
    parser_classes = [
        MultiPartParser,
        FormParser,
    ]
    
    permission_classes = [
        IsAuthenticatedOrReadOnly,
        IsOwnerOrReadOnly,
    ]

    def _auditar(self, action, entity_id, data):
        """
        Centraliza a gravação dos eventos no DynamoDB.
        Uma falha de auditoria é registrada no log.
        """
        usuario = self.request.user

        actor_id = (
            usuario.pk
            if usuario.is_authenticated
            else "anonymous"
        )

        try:
            registrar_evento(
                action=action,
                entity="Product",
                entity_id=entity_id,
                actor_id=actor_id,
                data=data,
            )
        except Exception:
            logger.exception(
                "Falha ao registrar auditoria: %s, produto=%s",
                action,
                entity_id,
            )

    def _auditar_apos_commit(self, action, entity_id, data):
        """
        Agenda a auditoria após a confirmação
        da transação do PostgreSQL.
        """
        transaction.on_commit(
            lambda: self._auditar(action, entity_id, data)
        )

    # CREATE
    def perform_create(self, serializer):
        print(">>> PERFORM_CREATE <<<")
        produto = serializer.save(seller=self.request.user)

        cache.delete(CACHE_KEY_PRODUTOS)
        cache.delete("home:dados") 

        self._auditar_apos_commit(
            action="CREATE",
            entity_id=produto.pk,
            data={"after": dados_do_produto(produto)},
        )

    # READ - Listagem
    def list(self, request, *args, **kwargs):
        tem_filtros = bool(request.query_params)

        # Só usa cache se não tiver filtros na query string
        if not tem_filtros:
            cached = cache.get(CACHE_KEY_PRODUTOS)
            if cached is not None:
                logger.info("Cache HIT — listagem de produtos")
                return Response(cached)
            logger.info("Cache MISS — buscando do banco")

        response = super().list(request, *args, **kwargs)

        conteudo = response.data

        if isinstance(conteudo, dict):
            produtos = conteudo.get("results", [])
        else:
            produtos = conteudo

        ids = [str(p["id"]) for p in produtos]

        self._auditar(
            action="READ",
            entity_id="list",
            data={
                "operation": "list",
                "product_ids": ids,
                "count": len(ids),
                "filters": {
                    key: request.query_params.getlist(key)
                    for key in request.query_params
                },
            },
        )

        # Salva no cache (só se não tiver filtros)
        if not tem_filtros:
            cache.set(CACHE_KEY_PRODUTOS, conteudo, CACHE_TTL_PRODUTOS)

        return response

    # READ - Produto individual
    def retrieve(self, request, *args, **kwargs):
        produto = self.get_object()
        print(f">>> RETRIEVE CHAMADO: pk={produto.pk}")
        redis_conn = get_redis_connection("default")
        resultado = redis_conn.zincrby("produtos:views", 1, str(produto.pk))
        print(f">>> ZINCRBY EXECUTOU: resultado={resultado}")

        serializer = self.get_serializer(produto)
        
        

        self._auditar(
            action="READ",
            entity_id=produto.pk,
            data={
                "operation": "retrieve",
                "product": dados_do_produto(produto),
            },
        )

        return Response(serializer.data)

    # UPDATE
    def perform_update(self, serializer):
        print(">>> PERFORM_UPDATE <<<")
        produto = serializer.instance

        dados_anteriores = dados_do_produto(produto)

        produto = serializer.save()

        dados_novos = dados_do_produto(produto)

        cache.delete(CACHE_KEY_PRODUTOS)
        cache.delete("home:dados") 

        self._auditar_apos_commit(
            action="UPDATE",
            entity_id=produto.pk,
            data={
                "before": dados_anteriores,
                "after": dados_novos,
            },
        )

    # DELETE
    def perform_destroy(self, instance):
        print(">>> PERFORM_DESTROY <<<")
        produto_id = instance.pk
        dados_anteriores = dados_do_produto(instance)

        instance.delete()

        cache.delete("home:dados")
        cache.delete(CACHE_KEY_PRODUTOS)
        cache.delete("produtos:mais_acessados")

        redis_conn = get_redis_connection("default")   
        redis_conn.zrem("produtos:views", str(produto_id))

        self._auditar_apos_commit(
            action="DELETE",
            entity_id=produto_id,
            data={
                "before": dados_anteriores,
            },
        )

    # READ - Top 5 mais acessados      
    @action(detail=False, methods=["get"], url_path="mais-acessados")
    def mais_acessados(self, request):
        CACHE_KEY = "produtos:mais_acessados"
        CACHE_TTL = 60 * 5
        
        cached = cache.get(CACHE_KEY)
        if cached is not None:
            print(">>> CACHE HIT (mais_acessados) <<<")
            return Response(cached)
        print(">>> CACHE MISS (mais_acessados) <<<")
        
        redis_conn = get_redis_connection("default")
        top_ids_bytes = redis_conn.zrevrange("produtos:views", 0, 4)
        top_ids = [id.decode("utf-8") if isinstance(id, bytes) else id for id in top_ids_bytes]
        
        if not top_ids:
            return Response([])
        
        produtos = Product.objects.filter(pk__in=top_ids)
        produtos_dict = {str(p.pk): p for p in produtos}
        produtos_ordenados = [produtos_dict[id] for id in top_ids if id in produtos_dict]
        
        serializer = self.get_serializer(produtos_ordenados, many=True)
        cache.set(CACHE_KEY, serializer.data, CACHE_TTL)
        
        return Response(serializer.data)

    # READ - Dados da home (destaques + mais procurados + todos)
    @action(detail=False, methods=["get"], url_path="home")
    def home(self, request):
        CACHE_KEY = "home:dados"
        CACHE_TTL = 60 * 5   # 5 minutos

        cached = cache.get(CACHE_KEY)
        if cached is not None:
            print(">>> CACHE HIT (home) <<<")
            return Response(cached)
        print(">>> CACHE MISS (home) <<<")

        # Todos os produtos ativos
        todos = list(Product.objects.filter(status="ACTIVE").order_by("-created_at"))

        # Destaques = 3 primeiros
        destaques = todos[:3]

        # Mais procurados = top 5 do Redis (Sorted Set)
        redis_conn = get_redis_connection("default")
        top_ids_bytes = redis_conn.zrevrange("produtos:views", 0, 4)
        top_ids = [
            id.decode("utf-8") if isinstance(id, bytes) else id
            for id in top_ids_bytes
        ]

        produtos_dict = {str(p.pk): p for p in todos}
        mais_procurados = [
            produtos_dict[id] for id in top_ids if id in produtos_dict
        ]

        # Serializa
        serializer = self.get_serializer
        dados = {
            "destaques": serializer(destaques, many=True).data,
            "mais_procurados": serializer(mais_procurados, many=True).data,
            "todos": serializer(todos, many=True).data,
        }

        cache.set(CACHE_KEY, dados, CACHE_TTL)
        return Response(dados)
