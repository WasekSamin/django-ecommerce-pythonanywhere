from django.urls import path

from .views import *


app_name = "authentication"
urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("edit-password/", ChangePasswordView.as_view(), name="edit-password"),
    path("password-change-email-confirm/", PasswordUpdateEmailSendConfirmView.as_view(), name="password-change-email-confirm"),
    path("edit-password/<str:token>/", UpdatePasswordView.as_view(), name="update-password"),
    path("activate-account/<str:token>/", ActivateAccountView.as_view(), name="activate-account"),
    path("create-account/", CreateAccountView.as_view(), name="create-account"),
    path("make-login/", MakeLoginView.as_view(), name="make-login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("active-account-success/<str:token>/", ActiveAccountSuccessView.as_view(), name="active-account-success"),
    path("active-account-failed/", ActiveAccountFailedView.as_view(), name="active-account-failed"),
]