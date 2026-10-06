from rest_framework import serializers

from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
        ]


class ProductSerializer(serializers.ModelSerializer):

    class Meta:
        model = Product
        fields = [
            "id",
            "title",
            "description",
            "price",
            "seller",
            "category",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "seller",
            "created_at",
            "updated_at",
        ]