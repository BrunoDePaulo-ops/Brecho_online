import json, boto3
from django.conf import settings

sqs_client = boto3.client(
    "sqs",
    region_name=settings.AWS_REGION,
)

def publish_image_processing_message(product_id, s3_key):
    message = {
        "produto_id": str(product_id),
        "s3_key": s3_key,
    }

    sqs_client.send_message(
        QueueUrl=settings.SQS_IMAGE_PROCESSING_QUEUE_URL,
        MessageBody=json.dumps(message),
    )