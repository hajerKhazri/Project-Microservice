from django.db import connections
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User
from .serializers import LoginSerializer, UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("id")
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

@method_decorator(csrf_exempt, name="dispatch")
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        print(f"Login attempt with data: {request.data}")
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            print(f"Login validation failed: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = serializer.validated_data["user"]

        return Response(
            {
                "message": "Login successful.",
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        database_status = "up"
        try:
            with connections["default"].cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
        except Exception:
            database_status = "down"

        http_status = status.HTTP_200_OK if database_status == "up" else status.HTTP_503_SERVICE_UNAVAILABLE
        return Response(
            {
                "service": "user-service",
                "status": "ok" if database_status == "up" else "degraded",
                "database": database_status,
            },
            status=http_status,
        )
