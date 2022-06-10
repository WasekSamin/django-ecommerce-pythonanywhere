from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser
from datetime import datetime
from uuid import uuid4
from PIL import Image


class AccountManager(BaseUserManager):
    def create_user(self, email, username, password=None):
        if not email:
            return ValueError("Email field is required!")
        elif not username:
            return ValueError("Username field is required!")
        
        email = self.normalize_email(email)

        user = self.model(email=email, username=username)
        user.set_password(password)
        user.save()

    def create_superuser(self, email, username, password=None):
        if not email:
            return ValueError("Email field is required!")
        elif not username:
            return ValueError("Username field is required!")

        email = self.normalize_email(email)

        user = self.model(email=email, username=username)
        user.set_password(password)
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.save()


class Account(AbstractBaseUser):
    uid = models.UUIDField(primary_key=True, editable=False, default=uuid4)
    username = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    profile_pic = models.ImageField(upload_to="images/profile", null=True, blank=True)
    address = models.CharField(max_length=200, null=True, blank=True)
    phone_no = models.CharField(max_length=20, null=True, blank=True)
    created_at = models.DateTimeField(default=datetime.now)

    objects = AccountManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def has_perm(self, perm, obj=None):
        return self.is_superuser

    def has_module_perms(self, app_label):
        return self.is_superuser

    def __str__(self):
        return self.email

    # def save(self):
    #     super(Account, self).save()

    #     if self.profile_pic:
    #         img = Image.open(self.profile_pic.path)

    #         if img.width > 800 or img.height > 600:
    #             img.thumbnail((800, 600))
    #             img.save(self.profile_pic.path)


class ActivateUser(models.Model):
    user = models.OneToOneField(Account, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid4)
    created_at = models.DateTimeField(default=datetime.now)

    def __str__(self):
        return str(self.token)


class UpdatePassword(models.Model):
    user = models.ForeignKey(Account, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid4)
    created_at = models.DateTimeField(default=datetime.now)

    def __str__(self):
        return str(self.token)