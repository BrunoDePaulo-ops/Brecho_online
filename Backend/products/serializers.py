import os, uuid
from rest_framework import serializers
from .models import Category, Product, ProductImage
from django.db import transaction
from .services.queue import publish_image_processing_message
from .services.storage import delete_product_image,get_s3_client, upload_product_image
import boto3
from django.conf import settings
class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
        ]
        
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = [
            "id",
            "s3_key",
            "original_filename",
            "created_at",
        ]

class ProductSerializer(serializers.ModelSerializer):
    
    images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=True,
        allow_empty=False,
    )
    image_urls = serializers.SerializerMethodField()
    
    category_name = serializers.CharField(
        source="category.name",
        read_only=True,
    )
    buyer_name = serializers.SerializerMethodField()
    def get_buyer_name(self, obj):
        request = self.context.get("request")

        if (
            not request
            or not request.user.is_authenticated
            or obj.seller_id != request.user.pk
        ):
            return None

        if obj.buyer is None:
            return None

        get_full_name = getattr(obj.buyer, "get_full_name", None)

        if callable(get_full_name):
            nome = get_full_name().strip()
            if nome:
                return nome

        return (
            getattr(obj.buyer, "username", None)
            or str(obj.buyer_id)
        )
    
    class Meta:
        model = Product
        fields = [
            "id",
            "title",
            "description",
            "price",
            "seller",
            "category",
            "category_name",
            "status",
            "images",
            "image_urls",
            "buyer_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "seller",
            "created_at",
            "updated_at",
        ]

    def get_image_urls(self, obj):
        s3 = get_s3_client()
        urls = []

        for image in obj.images.all():
            thumb_key = image.s3_key.replace("foto-original", "thumb_600")
            url = s3.generate_presigned_url(
                ClientMethod="get_object",
                Params={
                    "Bucket": settings.S3_BUCKET,
                    "Key": thumb_key,
                },
                ExpiresIn=3600,
            )

            urls.append(url)

        return urls
    
    def create(self, validated_data):
        images = validated_data.pop("images")
        seller = validated_data.pop("seller")

        with transaction.atomic():
            product = Product.objects.create(
                seller=seller,
                **validated_data,
            )

            for image in images:
                extension = os.path.splitext(image.name)[1].lower() or ".jpg"

                image_id = uuid.uuid4()

                s3_key = (
                    # f"produtos/{product.id}/{image_id}"
                    f"produtos/{image_id}"
                    f"/foto-original{extension}"
                )

                upload_product_image(
                    file=image,
                    s3_key=s3_key,
                )

                ProductImage.objects.create(
                    id=image_id,
                    product=product,
                    s3_key=s3_key,
                    original_filename=image.name,
                )

                publish_image_processing_message(
                    product_id=product.id,
                    s3_key=s3_key,
                )

        return product