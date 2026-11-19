import io
import json
from types import SimpleNamespace
from unittest.mock import MagicMock, patch
from urllib.parse import parse_qs, urlparse

from django.test import SimpleTestCase, override_settings

from .serializers import ProductSerializer
from .services.queue import publish_image_processing_message
from .services.storage import delete_product_images, get_s3_client, upload_product_image


@override_settings(
    MINIO_ENDPOINT_URL="http://minio:9000",
    MINIO_PUBLIC_ENDPOINT_URL="http://localhost:9000",
    MINIO_ACCESS_KEY="local-minio-key",
    MINIO_SECRET_KEY="local-minio-secret",
    MINIO_BUCKET="test-products",
    MINIO_REGION="us-east-1",
)
class MinIOTests(SimpleTestCase):
    def setUp(self):
        get_s3_client.cache_clear()
        self.addCleanup(get_s3_client.cache_clear)

    def test_upload_uses_internal_endpoint_and_minio_credentials(self):
        client = get_s3_client()
        self.assertEqual(client.meta.endpoint_url, "http://minio:9000")
        self.assertEqual(client.meta.config.s3["addressing_style"], "path")
        # Use o signer real para verificar que credenciais AWS não foram herdadas.
        url = client.generate_presigned_url(
            "get_object", Params={"Bucket": "test-products", "Key": "image.jpg"}
        )
        self.assertTrue(
            parse_qs(urlparse(url).query)["X-Amz-Credential"][0].startswith("local-minio-key/")
        )
        file = io.BytesIO(b"image")
        file.content_type = "image/png"
        with patch.object(client, "upload_fileobj") as upload:
            upload_product_image(file, "produtos/image/foto-original.png")
        upload.assert_called_once_with(
            file, "test-products", "produtos/image/foto-original.png",
            ExtraArgs={"ContentType": "image/png"},
        )

    def test_png_and_jpeg_originals_use_public_jpeg_thumbnail_urls(self):
        for extension in ("png", "jpg", "jpeg", "webp"):
            with self.subTest(extension=extension):
                product = SimpleNamespace(images=MagicMock())
                product.images.all.return_value = [
                    SimpleNamespace(s3_key=f"produtos/image/foto-original.{extension}")
                ]
                url, = ProductSerializer().get_image_urls(product)
                parsed = urlparse(url)
                self.assertEqual(parsed.netloc, "localhost:9000")
                self.assertEqual(parsed.path, "/test-products/produtos/image/thumb_600.jpg")
                self.assertEqual(parse_qs(parsed.query)["X-Amz-Expires"], ["3600"])

    @patch("products.services.storage.get_s3_client")
    def test_delete_product_images_removes_original_and_thumbnails(self, get_client):
        delete_product_images([
            "produtos/image-1/foto-original.png",
            "produtos/image-2/foto-original.jpg",
        ])

        get_client.return_value.delete_objects.assert_called_once()
        call = get_client.return_value.delete_objects.call_args.kwargs
        self.assertEqual(call["Bucket"], "test-products")
        self.assertEqual(
            {item["Key"] for item in call["Delete"]["Objects"]},
            {
                "produtos/image-1/foto-original.png",
                "produtos/image-1/thumb_300.jpg",
                "produtos/image-1/thumb_600.jpg",
                "produtos/image-2/foto-original.jpg",
                "produtos/image-2/thumb_300.jpg",
                "produtos/image-2/thumb_600.jpg",
            },
        )


@override_settings(
    RABBITMQ_URL="amqp://brecho:brecho@rabbitmq:5672/%2F",
    RABBITMQ_IMAGE_QUEUE="image-processing",
)
class RabbitMQPublisherTests(SimpleTestCase):
    @patch("products.services.queue.pika.BlockingConnection")
    def test_publishes_persistent_message_with_confirmation(self, connect):
        channel = connect.return_value.channel.return_value
        publish_image_processing_message("product-123", "produtos/image/foto-original.png")
        channel.confirm_delivery.assert_called_once_with()
        published = channel.basic_publish.call_args.kwargs
        self.assertEqual(published["routing_key"], "image-processing")
        self.assertTrue(published["mandatory"])
        self.assertEqual(published["properties"].delivery_mode, 2)
        self.assertEqual(json.loads(published["body"]), {
            "produto_id": "product-123", "s3_key": "produtos/image/foto-original.png",
        })
        channel.queue_declare.assert_any_call(
            queue="image-processing.failed", durable=True
        )
        channel.queue_declare.assert_any_call(
            queue="image-processing", durable=True,
            arguments={
                "x-dead-letter-exchange": "",
                "x-dead-letter-routing-key": "image-processing.failed",
            },
        )
        connect.return_value.close.assert_called_once_with()

    @patch("products.services.queue.pika.BlockingConnection")
    def test_publish_failure_is_propagated_and_connection_is_closed(self, connect):
        connect.return_value.channel.return_value.basic_publish.side_effect = RuntimeError("offline")
        with self.assertRaisesRegex(RuntimeError, "offline"):
            publish_image_processing_message("product-123", "image.jpg")
        connect.return_value.close.assert_called_once_with()
