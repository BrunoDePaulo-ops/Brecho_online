from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        required=False,
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password", None)

        user = User(**validated_data)

        if password:
            user.set_password(password)

        user.save()

        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()

        return instance

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    email = serializers.EmailField(write_only=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields.pop("username", None)

    def validate(self, attrs):
        User = get_user_model()

        email = attrs["email"]
        senha = attrs["password"]

        usuario = User.objects.filter(
            email__iexact=email
        ).first()

        if usuario is None:
            raise AuthenticationFailed(
                "E-mail ou senha inválidos."
            )

        # Valida as credenciais usando o username real.
        data = super().validate({
            "username": usuario.get_username(),
            "password": senha,
        })

        # Retorna os dados básicos do usuário autenticado.
        data["usuario"] = {
            "id": usuario.id,
            "username": usuario.username,
            "nome": usuario.get_full_name() or usuario.username,
            "email": usuario.email,
        }

        return data