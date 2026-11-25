from functools import lru_cache

import boto3
from botocore.config import Config
from django.conf import settings


@lru_cache(maxsize=2)
def get_s3_client(public=False):
    """Cliente compatível com S3 conectado ao MinIO."""
    return boto3.client(
        "s3",
        endpoint_url=(
            settings.MINIO_PUBLIC_ENDPOINT_URL if public else settings.MINIO_ENDPOINT_URL
        ),
        region_name=settings.MINIO_REGION,
        aws_access_key_id=settings.MINIO_ACCESS_KEY,
        aws_secret_access_key=settings.MINIO_SECRET_KEY,
        config=Config(signature_version="s3v4", s3={"addressing_style": "path"}),
    )


def upload_product_image(file, s3_key):
    get_s3_client().upload_fileobj(
        file,
        settings.MINIO_BUCKET,
        s3_key,
        ExtraArgs={"ContentType": file.content_type},
    )


def delete_product_images(s3_keys):
    keys = set()

    for s3_key in s3_keys:
        keys.add(s3_key)
        folder = s3_key.rsplit("/", 1)[0]
        keys.update({
            f"{folder}/thumb_300.jpg",
            f"{folder}/thumb_600.jpg",
        })

    if not keys:
        return

    get_s3_client().delete_objects(
        Bucket=settings.MINIO_BUCKET,
        Delete={"Objects": [{"Key": key} for key in keys]},
    )