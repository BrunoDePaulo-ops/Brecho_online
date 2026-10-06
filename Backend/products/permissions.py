from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Qualquer pessoa pode visualizar o produto.
    Apenas o dono do produto pode alterá-lo ou excluí-lo.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        return obj.seller == request.user