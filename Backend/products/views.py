from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .permissions import IsOwnerOrReadOnly

from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by("id")
    serializer_class = CategorySerializer


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
    
    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)
