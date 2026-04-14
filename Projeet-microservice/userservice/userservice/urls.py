from django.contrib import admin
from django.urls import include, path

from users.views import HealthCheckView, LoginView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", HealthCheckView.as_view(), name="health-check"),
    path("api/auth/login/", LoginView.as_view(), name="login"),
    path("api/", include("users.urls")),
]
