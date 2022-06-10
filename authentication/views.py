from django.shortcuts import redirect, render, get_object_or_404
from django.views import View
from django.http import JsonResponse
from .models import *
from product.models import Category
from django.core.mail import send_mail
from django.conf import settings
from django.template import loader
from django.contrib.auth import authenticate, login, logout
from product.views import get_cart_object, get_wishlist_obj
from django.contrib import messages

current_domain_link = "https://django-ecommerce-repl.waseksamin.repl.co"


class RegisterView(View):
    def get(self, request):
        if request.user.is_authenticated:
            return redirect("product:home")

        categories = Category.objects.all()
        current_page = "register"

        args = {
            "current_page": current_page,
            "categories": categories,
        }
        return render(request, "authentication/register.html", args)


class CreateAccountView(View):
    def post(self, request):
        username = request.POST.get("username", None)
        email = request.POST.get("email", None)
        password = request.POST.get("password", None)
        json_resp = {
            "error": True
        }

        if username is not None and email is not None and password is not None:
            account_obj = Account.objects.filter(email=email)

            if account_obj.exists():
                # If user email already in use
                json_resp = {
                    "error": True,
                    "account_exist": True
                }
                return JsonResponse(json_resp, safe=False)
            else:
                # Create account
                user = Account(
                    username=username, 
                    email=email
                )
                user.set_password(password)
                user.save()

                # Create activate user object
                activate_user_obj = ActivateUser(
                    user=user
                )
                activate_user_obj.save()

                # Email template
                html_message = loader.render_to_string(
                    "authentication/send_mail_for_active_account.html",
                    {
                        "username": username,
                        "activation_link": f"{current_domain_link}/authentication/activate-account/{activate_user_obj.token}/",
                    }
                )

                # Sending mail
                send_mail(
                    'Account Activation',
                    "",
                    settings.EMAIL_HOST_USER,
                    [email],
                    fail_silently=False,
                    html_message=html_message
                )

                json_resp = {
                    "error": False,
                    "account_created": True
                }
                return JsonResponse(json_resp, safe=False)
        else:
            JsonResponse(json_resp, safe=False)


class LoginView(View):
    def get(self, request):
        if request.user.is_authenticated:
            return redirect("product:home")

        current_page = "login"
        categories = Category.objects.all()

        args = {
            "current_page": current_page,
            "categories": categories,
        }
        return render(request, "authentication/login.html", args)


class MakeLoginView(View):
    def post(self, request):
        email = request.POST.get("email", None)
        password = request.POST.get("password", None)

        json_resp = {
            "error": True
        }

        if email is not None and password is not None:
            user = authenticate(email=email, password=password)

            if user is not None:
                login(request, user)
 
                json_resp = {
                    "error": False,
                    "login_success": True
                }
            else:
                account_obj = Account.objects.filter(email=email)

                if account_obj.exists():
                    account_obj = account_obj.last()

                    valid_password = account_obj.check_password(password)

                    if (account_obj.is_active and not valid_password) \
                        or (not account_obj.is_active and not valid_password):
                        json_resp = {
                            "error": True,
                            "login_failed": True
                        }
                    else:
                        # If user account is not active
                        json_resp = {
                            "error": True,
                            "account_active": False
                        }                    
                else:
                    json_resp = {
                        "error": True,
                        "login_failed": True
                    }
            return JsonResponse(json_resp, safe=False)
        else:
            return JsonResponse(json_resp, safe=False)


class ChangePasswordView(View):
    def get(self, request):
        categories = Category.objects.all()
        cart_obj = get_cart_object(request.user)
        wishlist_obj = get_wishlist_obj(request.user)

        args = {
            "categories": categories,
            "cart_obj": cart_obj,
            "wishlist_obj": wishlist_obj
        }
        return render(request, "authentication/change_password_form.html", args)

    def post(self, request):
        email = request.POST.get("email", None)

        if email is not None:
            try:
                account_obj = Account.objects.get(email=email)
            except Account.DoesNotExist:
                messages.error(request, "Invalid email! Please type correct email...")
                return redirect("authentication:edit-password")
            else:
                update_password_obj = UpdatePassword(
                    user=account_obj,
                )
                update_password_obj.save()

                # Email template
                html_message = loader.render_to_string(
                    "authentication/send_mail_for_password_update.html",
                    {
                        "username": update_password_obj.user.username,
                        "change_password_link": f"{current_domain_link}/authentication/edit-password/{update_password_obj.token}/",
                    }
                )

                # Sending mail
                send_mail(
                    'Change/Update Password',
                    "",
                    settings.EMAIL_HOST_USER,
                    [email],
                    fail_silently=False,
                    html_message=html_message
                )
                return redirect("authentication:password-change-email-confirm")
        else:
            messages.error(request, "Invalid email! Please type correct email...")
            return redirect("authentication:edit-password")


class PasswordUpdateEmailSendConfirmView(View):
    def get(self, request):
        categories = Category.objects.all()
        cart_obj = get_cart_object(request.user)
        wishlist_obj = get_wishlist_obj(request.user)
        
        args = {
            "categories": categories,
            "cart_obj": cart_obj,
            "wishlist_obj": wishlist_obj
        }
        return render(request, "authentication/email_has_send_for_password_update.html", args)


class UpdatePasswordView(View):
    def get(self, request, token):
        try:
            update_password_obj = UpdatePassword.objects.get(token=token)
        except UpdatePassword.DoesnotExist:
            return redirect("authentication:login")
        else:
            del update_password_obj
            categories = Category.objects.all()
            cart_obj = get_cart_object(request.user)
            wishlist_obj = get_wishlist_obj(request.user)

        args = {
            "categories": categories,
            "cart_obj": cart_obj,
            "wishlist_obj": wishlist_obj
        }
        return render(request, "authentication/update_password_form.html", args)

    def post(self, request, token):
        new_password = request.POST.get("newPassword", None)

        json_resp = {
            "error": True
        }

        if new_password is not None:
            try:
                update_password_obj = UpdatePassword.objects.get(token=token)
            except UpdatePassword.DoesNotExist:
                json_resp = {
                    "error": True,
                    "invalid_token": True
                }
            else:
                try:
                    account_obj = Account.objects.get(email=update_password_obj.user.email)
                    account_obj.set_password(new_password)
                    
                    account_obj.save()
    
                    json_resp = {
                        "error": False,
                        "password_updated": True
                    }
                except Account.DoesNotExist:
                    json_resp = {
                        "error": True,
                        "account_not_found": True
                    }
        return JsonResponse(json_resp, safe=False)
            


class ActivateAccountView(View):
    def get(self, request, token):
        token = request.path.split("/")[-2]

        active_user_obj = ActivateUser.objects.filter(token=token)

        if active_user_obj.exists():
            active_user_obj = active_user_obj.last()

            account_obj = get_object_or_404(Account, uid=active_user_obj.user.uid)
            account_obj.is_active = True
            account_obj.save()

            return redirect(f"/authentication/active-account-success/{active_user_obj.token}/")
        else:
            return redirect("authentication:active-account-failed")


class ActiveAccountSuccessView(View):
    def get(self, request, token):
        return render(request, "authentication/account_active_success.html")


class ActiveAccountFailedView(View):
    def get(self, request):
        return render(request, "authentication/account_active_failed.html")








class LogoutView(View):
    def get(self, request):
        logout(request)
        return redirect("authentication:login")
