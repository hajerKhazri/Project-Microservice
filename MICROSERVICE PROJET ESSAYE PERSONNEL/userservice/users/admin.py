from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("id", "username", "email", "role", "enabled", "is_staff", "created_at")
    list_filter = ("role", "enabled", "is_staff", "is_superuser")
    search_fields = ("username", "email", "first_name", "last_name")
    ordering = ("id",)

    fieldsets = BaseUserAdmin.fieldsets + (
        ("Service user", {"fields": ("role", "enabled", "created_at")}),
    )
    readonly_fields = ("created_at",)
