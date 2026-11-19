import json

import pika
from django.conf import settings


def publish_image_processing_message(product_id, s3_key):
    parameters = pika.URLParameters(settings.RABBITMQ_URL)
    parameters.connection_attempts = 3
    parameters.retry_delay = 2
    parameters.socket_timeout = 10
    parameters.blocked_connection_timeout = 30
    connection = pika.BlockingConnection(parameters)
    try:
        channel = connection.channel()
        queue = settings.RABBITMQ_IMAGE_QUEUE
        channel.queue_declare(queue=f"{queue}.failed", durable=True)
        channel.queue_declare(
            queue=queue,
            durable=True,
            arguments={
                "x-dead-letter-exchange": "",
                "x-dead-letter-routing-key": f"{queue}.failed",
            },
        )
        channel.confirm_delivery()
        channel.basic_publish(
            exchange="",
            routing_key=queue,
            body=json.dumps({"produto_id": str(product_id), "s3_key": s3_key}),
            properties=pika.BasicProperties(
                content_type="application/json",
                delivery_mode=2,
            ),
            mandatory=True,
        )
    finally:
        connection.close()
