from django.contrib import admin

from .models import *


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = (
        "uid", "email", "username",
        "is_active", "created_at"
    )


@admin.register(ActivateUser)
class ActivateUserAdmin(admin.ModelAdmin):
    list_display = (
        "user", "token", "created_at"
    )


@admin.register(UpdatePassword)
class UpdatePasswordAdmin(admin.ModelAdmin):
    list_display = (
        "user", "token", "created_at"
    )