from functools import lru_cache

import boto3
from django.conf import settings


@lru_cache(maxsize=1)
def get_s3_client():
    return boto3.client("s3", region_name=settings.AWS_REGION)


def upload_product_image(file, s3_key):
    get_s3_client().upload_fileobj(
        file,
        settings.S3_BUCKET,
        s3_key,
        ExtraArgs={"ContentType": file.content_type},
    )


def delete_product_image(s3_key):
    get_s3_client().delete_object(
        Bucket=settings.S3_BUCKET,
        Key=s3_key,
    )