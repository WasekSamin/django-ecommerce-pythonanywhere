from unicodedata import category
from django.http import HttpResponse, JsonResponse, Http404
from django.shortcuts import render, get_object_or_404, redirect
from django.views import View
from .models import *
from authentication.models import Account
from django.db.models import Q
from datetime import datetime
from math import log, floor
from django.db.models import Sum
import pytz
from django.conf import settings
from django.contrib import messages
from django.template import loader
from django.core.mail import send_mail


# Getting logged in user cart object
def get_cart_object(user):
    cart_obj = None

    if user.is_authenticated:
         # This is for cart sidebar items
        cart_obj_list = Cart.objects.filter(user=user, is_paid=False, is_set_order_status=False)

        if cart_obj_list.exists():
            cart_obj = cart_obj_list.last()
        else:
            cart_obj = None

    return cart_obj


# Getting logged in user wishlist object
def get_wishlist_obj(user):
    wishlist_obj = None

    if user.is_authenticated:
         # Get the wishlist object 
        wishlist_obj = Wishlist.objects.filter(user=user)

        if wishlist_obj.exists():
            wishlist_obj = wishlist_obj.last()
        else:
            wishlist_obj = None

    return wishlist_obj


# Getting all the order objects of the current user
def get_order_objects(user):
    order_objs = None

    if user.is_authenticated:
        order_objs = Order.objects.filter(user=user)

    return order_objs


# Return all the products of top deal
def get_top_deal_products(top_deal):
    return top_deal.product.all().order_by("-created_at")


class HomeView(View):
    def get(self, request):
        banners = Banner.objects.all()[:5]
        categories = Category.objects.all()
        newest_products = Product.objects.all().order_by("-created_at")[:30]
        top_deals = TopDealProduct.objects.all()
        top_deal_ending = None

        # Getting top deal products
        if top_deals.exists():
            top_deal_ending = top_deals.last().ended_at
            top_deal_products = get_top_deal_products(top_deals.last())

        del top_deals

        cheapest_products = Product.objects.filter(Q(discount_percentage__gt=0)).order_by("-discount_percentage")[:30]
        cart_obj = get_cart_object(request.user)
        wishlist_obj = get_wishlist_obj(request.user)

        blogs = Blog.objects.all().order_by("-created_at")[:10]
        blogs = format_datetime_of_blogs_created(blogs)

        args = {
            "banners": banners,
            "categories": categories,
            "newest_products": newest_products,
            "top_deal_products": top_deal_products,
            "top_deal_ending": top_deal_ending,
            "cheapest_products": cheapest_products,
            "cart_obj": cart_obj,
            "wishlist_obj": wishlist_obj,
            "blogs": blogs
        }
        return render(request, "product/home.html", args)


# Fetch product info for quick view modal
class FetchProductQuickView(View):
    def get(self, request, uid):        
        try:
            product_obj = Product.objects.get(uid=uid)

            added_to_wishlist = False

            if request.user.is_authenticated:
                wishlist_obj = Wishlist.objects.filter(user=request.user)

                if wishlist_obj.exists():
                    wishlist_obj = wishlist_obj.last()
                    added_to_wishlist = True if product_obj in wishlist_obj.product.all() else False

            json_resp = {
                "error": False,
                "uid": product_obj.uid,
                "slug": product_obj.slug,
                "image": product_obj.image,
                "title": product_obj.title,
                "image": product_obj.image.url,
                "category": {
                    "slug": product_obj.category.slug,
                    "title": product_obj.category.title
                },
                "price": product_obj.price,
                "discount_percentage": product_obj.discount_percentage,
                "variation": [
                        {
                            "uid": variation.uid,
                            "image": variation.image.url if variation.image else None,
                            "price": variation.price,
                            "color": variation.color,
                            "size": variation.size
                        }
                        for variation in product_obj.variation.all()
                    ],
                "short_description": product_obj.short_description,
                "sku": product_obj.sku,
                "product_in_wishlist": added_to_wishlist
            }
        except Product.DoesNotExist:
            json_resp = {
                "error": True
            }

        return JsonResponse(json_resp, safe=False)


# If only color or size is selected
class FetchProductPriceOnSingleVariationView(View):
    def get(self, request, variation_uid, product_uid):
        try:
            variation_obj = Variation.objects.get(uid=variation_uid)
            product_obj = Product.objects.get(uid=product_uid)

            json_resp = {
                "error": False,
                "price": variation_obj.price,
                "discount_percentage": product_obj.discount_percentage,
                "get_product_data": True
            }
        except Variation.DoesNotExist:
            json_resp = {
                "error": True
            }
        except Product.DoesNotExist:
            json_resp = {
                "error": True
            }

        return JsonResponse(json_resp, safe=False)


# If both color and size is selected
class FetchProductPriceOnMultipleVariationView(View):
    def get(self, request, color_uid, size_uid, product_uid):
        try:
            variation_color_obj = Variation.objects.get(uid=color_uid)
            variation_size_obj = Variation.objects.get(uid=size_uid)
            price = 0.0

            if variation_color_obj.price > variation_size_obj.price:
                price = variation_color_obj.price
            else:
                price = variation_size_obj.price

            product_obj = Product.objects.get(uid=product_uid)

            json_resp = {
                "error": False,
                "price": price,
                "discount_percentage": product_obj.discount_percentage,
                "get_product_data": True
            }
        except Variation.DoesNotExist:
            json_resp = {
                "error": True
            }
        except Product.DoesNotExist:
            json_resp = {
                "error": True
            }

        return JsonResponse(json_resp, safe=False)


def update_cart_total_price(cart_obj):
    if cart_obj.cart_items.count() > 0:
        total_price = round(cart_obj.cart_items.all().aggregate(Sum('price'))["price__sum"], 2)
        
        if cart_obj.promo_code is not None:
            cart_obj.total_price = round(total_price - total_price * cart_obj.promo_code.discount_percentage / 100, 2)
        else:
            cart_obj.total_price = total_price
            
        cart_obj.save()
    else:
        cart_obj.total_price = 0.0
        cart_obj.save()
    
    return cart_obj


class AddToCartView(View):
    def post(self, request):
        if not request.user.is_authenticated:
            json_resp = {
                "error": True,
                "user_not_login": True
            }
            return JsonResponse(json_resp, safe=False)

        json_resp = {
            "error": True
        }

        color_required = request.POST.get("colorRequired", None)
        size_required = request.POST.get("sizeRequired", None)
        color_uid = request.POST.get("colorId", None)
        size_uid = request.POST.get("sizeId", None)
        product_uid = request.POST.get("productId", None)
        product_qty = request.POST.get("productQty", None)
        
        # Checking if color and size is required or not
        color_required = True if color_required == "true" else False
        size_required = True if size_required == "true" else False

        color_obj, size_obj = None, None

        if product_uid is not None and product_qty is not None:
            try:
                product_obj = Product.objects.get(uid=product_uid)
                # Convert product qty -> str to int
                try:
                    product_qty = int(product_qty)
                except ValueError:
                    json_resp = {
                        "error": True,
                        "invalid_qty_format": True
                    }
                    return JsonResponse(json_resp, safe=False)

                max_price = product_obj.price

                if color_required and color_uid is not None:
                    try:
                        color_obj = Variation.objects.get(uid=color_uid)

                        max_price = color_obj.price
                    except Variation.DoesNotExist:
                        json_resp = {
                            "error": True
                        }
                        return JsonResponse(json_resp, safe=False)
                if size_required and size_uid is not None:
                    try:
                        size_obj = Variation.objects.get(uid=size_uid)

                        if size_obj.price > max_price:
                            max_price = size_obj.price
                    except Variation.DoesNotExist:
                        json_resp = {
                            "error": True
                        }
                        return JsonResponse(json_resp, safe=False)

                if color_required and color_obj is None:
                    json_resp = {
                        "error": True,
                        "color_field_required": True
                    }
                    return JsonResponse(json_resp, safe=False)
                elif size_required and size_obj is None:
                    json_resp = {
                        "error": True,
                        "size_field_required": True
                    }
                    return JsonResponse(json_resp, safe=False)
                
                if product_obj.discount_percentage > 0:
                    max_price = max_price - (max_price * product_obj.discount_percentage / 100)

                cart_item_total_price = round((max_price * product_qty), 2)
                
                cart_item_obj = CartItem(
                    product=product_obj,
                    quantity=product_qty,
                    price=cart_item_total_price,
                )

                if color_obj is not None:
                    cart_item_obj.color = color_obj.color
                if size_obj is not None:
                    cart_item_obj.size = size_obj.size
                    
                cart_item_obj.save()

                cart_obj = get_cart_object(request.user)

                # If cart item already exists
                if cart_obj is not None:
                    # Adding cart item object into cart object
                    cart_obj.cart_items.add(cart_item_obj.uid)
                    
                    # Updating cart object total price
                    cart_obj = update_cart_total_price(cart_obj)
                else:
                    cart_obj = Cart(
                        user=request.user,
                        total_price=cart_item_total_price
                    )
                    cart_obj.save()

                    cart_obj.cart_items.add(cart_item_obj.uid)
                
                json_resp = {
                    "error": False,
                    "product_add_success": True,
                    "cart_counter": cart_obj.cart_items.all().count(),
                    "cart_item_uid": cart_item_obj.uid,
                    "image": product_obj.image.url,
                    "slug": product_obj.slug,
                    "title": product_obj.title,
                    "color": cart_item_obj.color,
                    "size": cart_item_obj.size,
                    "quantity": cart_item_obj.quantity,
                    "price": cart_item_obj.price,
                    "total_price": cart_obj.total_price
                }

            except Product.DoesNotExist:
                json_resp = {
                    "error": True
                }
    
        return JsonResponse(json_resp, safe=False)


class RemoveProductFromCartView(View):
    def post(self, request):
        if not request.user.is_authenticated:
            json_resp = {
                "error": True,
                "user_not_login": True
            }
            return JsonResponse(json_resp, safe=False)

        cart_item_uid = request.POST.get("uid", None)

        json_resp = {
            "error": True
        }

        if cart_item_uid is not None:
            try:
                cart_item_obj = CartItem.objects.get(uid=cart_item_uid)

                cart_obj = get_cart_object(request.user)

                if cart_obj is not None:
                    # Deleting the cart item object
                    cart_item_obj.delete()
                    # Updating cart total price
                    cart_obj = update_cart_total_price(cart_obj)

                    promo_discount = None
                    # Check for promo code
                    if cart_obj.promo_code is not None:
                        promo_discount = cart_obj.promo_code.discount_percentage

                    shipping_charge = get_cart_shipping_charge(cart_obj)

                    json_resp = {
                        "error": False,
                        "product_remove_success": True,
                        "total_price": cart_obj.total_price,
                        "cart_counter": cart_obj.cart_items.count(),
                        "shipping_charge": shipping_charge,
                        "promo_discount": promo_discount
                    }
                else:
                    json_resp = {
                        "error": True
                    }
            except CartItem.DoesNotExist:
                json_resp = {
                    "error": True
                }

        return JsonResponse(json_resp, safe=False)


class AddToWishlistView(View):
    def post(self, request):
        if not request.user.is_authenticated:
            json_resp = {
                "error": True,
                "user_not_login": True
            }
            return JsonResponse(json_resp, safe=False)

        json_resp = {
            "error": True
        }

        product_uid = request.POST.get("uid", None)

        if product_uid is not None:
            try:
                product_obj = Product.objects.get(uid=product_uid)

                wishlist_obj = Wishlist.objects.filter(user=request.user)

                # If user already have a wishlist object
                if wishlist_obj.exists():
                    wishlist_obj = wishlist_obj.last()
                else:   # Else create a wishlist object for the user
                    wishlist_obj = Wishlist(
                        user=request.user,
                    )
                    wishlist_obj.save()

                wishlist_obj.product.add(product_obj.uid)

                json_resp = {
                    "error": False,
                    "wishlist_product_add_success": True,
                    "wishlist_counter": wishlist_obj.product.count()
                }
            except Product.DoesNotExist:
                json_resp = {
                    "error": True
                }

        return JsonResponse(json_resp, safe=False)


class RemoveFromWishlistView(View):
    def post(self, request):
        if not request.user.is_authenticated:
            json_resp = {
                "error": True,
                "user_not_login": True
            }
            return JsonResponse(json_resp, safe=False)

        json_resp = {
            "error": True
        }

        product_uid = request.POST.get("uid", None)

        if product_uid is not None:
            try:
                product_obj = Product.objects.get(uid=product_uid)

                wishlist_obj = Wishlist.objects.filter(user=request.user)

                if wishlist_obj.exists():
                    wishlist_obj = wishlist_obj.last()

                    wishlist_obj.product.remove(product_obj.uid)

                    json_resp = {
                        "error": False,
                        "wishlist_product_remove_success": True,
                        "wishlist_counter": wishlist_obj.product.count()
                    }
                else:
                    json_resp = {
                        "error": True,
                        "wishlist_not_exist": True
                    }
            except Product.DoesNotExist:
                json_resp = {
                    "error": True
                }

        return JsonResponse(json_resp, safe=False)


def get_unique_colors_and_sizes():
    colors, sizes = set(), set()

    for item in Variation.objects.all():
        if item.color:
            colors.add(item.color)
        if item.size:
            sizes.add(item.size)

    return colors, sizes


def get_min_and_max_price(products):
    price_set = []

    for product in products:
        if product.discount_percentage > 0:
            price_set.append(product.price - product.price * product.discount_percentage / 100)
        else:
            price_set.append(product.price)

    min_price = min(price_set) if len(price_set) > 0 else 0.0
    max_price = max(price_set) if len(price_set) > 0 else 0.0

    return round(min_price, 2), round(max_price, 2)
    

class SearchProductView(View):
    def get(self, request, search_text):
        if search_text is not None:
            search_text = search_text.strip()
            products = Product.objects.filter(
                Q(title__icontains=search_text) | Q(category__title__icontains=search_text)
            ).order_by("-created_at")
            newest_products = Product.objects.all().order_by("-created_at")[:5]
            categories = Category.objects.all()
            wishlist_obj = get_wishlist_obj(request.user)
            cart_obj = get_cart_object(request.user)
            min_price, max_price = get_min_and_max_price(products)
            colors, sizes = get_unique_colors_and_sizes()

        args = {
            "products": products,
            "newest_products": newest_products,
            "categories": categories,
            "wishlist_obj": wishlist_obj,
            "cart_obj": cart_obj,
            "search_text": search_text,
            "min_price": min_price,
            "max_price": max_price,
            "colors": colors,
            "sizes": sizes
        }
        return render(request, "product/search_product.html", args)


# Auto search products
class ProductAutoSearchView(View):
    def post(self, request):
        search_text = request.POST.get("searchText", None)

        json_resp = {
            "error": True
        }

        if search_text is not None:
            search_text = search_text.strip()

            found_products = Product.objects.filter(
                Q(title__icontains=search_text) | Q(category__title__icontains=search_text)
            ).order_by("-created_at")[:10]

            products = list(map(lambda product: {
                "uid": product.uid,
                "slug": product.slug,
                "title": product.title,
                "price": round(product.price, 2) if product.discount_percentage <= 0 else round(product.price - (product.price * product.discount_percentage / 100), 2),
                "image": product.image.url if product.image else None
            }, found_products))

            del found_products

            json_resp = {
                "error": False,
                "products": products,
                "search_success": True
            }
        return JsonResponse(json_resp, safe=False)


class ShopView(View):
    def get(self, request):
        categories = Category.objects.all()
        products = Product.objects.all().order_by("-created_at")
        newest_products = products[:5]
        
        min_price, max_price = get_min_and_max_price(products)

        cart_obj = get_cart_object(request.user)
        wishlist_obj = get_wishlist_obj(request.user)

        colors, sizes = get_unique_colors_and_sizes()

        args = {
            "categories": categories,
            "products": products,
            "newest_products": newest_products,
            "cart_obj": cart_obj,
            "wishlist_obj": wishlist_obj,
            "colors": colors,
            "sizes": sizes,
            "min_price": min_price,
            "max_price": max_price
        }
        return render(request, "product/shop.html", args)


def filter_by_color(products, color):
    product_uid_list = set()
                    
    for product in products:
        product_obj = product.variation.filter(color__icontains=color)

        if len(product_obj) > 0:
            product_uid_list.add(product.uid)

    if len(product_uid_list) > 0:
        products = products.filter(uid__in=product_uid_list).order_by("-created_at")

    return products


def filter_by_size(products, size):
    product_uid_list = set()
    
    for product in products:
        for variation in product.variation.all():
            if variation.size is not None and variation.size.lower() == size:
                product_uid_list.add(product.uid)

    if len(product_uid_list) > 0:
        products = products.filter(uid__in=product_uid_list).order_by("-created_at")

    return products


def filter_by_sort_way(products, sort_way):
    if sort_way == "price_low":
        products = products.order_by("price")
    elif sort_way == "price_high":
        products = products.order_by("-price")
    else:
        products = products.order_by("-created_at")

    return products
    


class ShopFilterProductView(View):
    def get(self, request, filter_min_price, filter_max_price, color, size, sort_way):
        if filter_min_price is not None and filter_max_price is not None and color is not None and size is not None and sort_way is not None:
            try:
                categories = Category.objects.all()

                products = Product.objects.all()
                newest_products = products.order_by("-created_at")[:5]
                min_price, max_price = get_min_and_max_price(products)

                colors, sizes = get_unique_colors_and_sizes()
                
                filter_min_price = round(float(filter_min_price), 2)
                filter_max_price = round(float(filter_max_price), 2)

                color = color.lower() if color != "none" else None
                size = size.lower() if size != "none" else None
                sort_way = sort_way.lower() if sort_way != "none" else None

                # products = Product.objects.filter(price__range=(filter_min_price, filter_max_price + 1)).order_by("-created_at")
                product_list = []

                for product in products:
                    if product.discount_percentage > 0:
                        product_price = product.price - product.price * product.discount_percentage / 100
                        if filter_min_price <= product_price <= filter_max_price + 1:
                            product_list.append(product.uid)
                    else:
                        product_list.append(product.uid)

                products = Product.objects.filter(uid__in=product_list).order_by("-created_at")
                
                del product_list

                # Filtering by color
                if color is not None:
                    products = filter_by_color(products, color)

                # Filtering by size
                if size is not None:
                    products = filter_by_size(products, size)

                # Sorting products
                if sort_way is not None:
                    products = filter_by_sort_way(products, sort_way)

                cart_obj = get_cart_object(request.user)
                wishlist_obj = get_wishlist_obj(request.user)
            except ValueError:
                raise Http404("Invalid format!")
        else:
            raise Http404("Something is wrong!")

        args = {
            "min_price": min_price,
            "max_price": max_price,
            "cart_obj": cart_obj,
            "wishlist_obj": wishlist_obj,
            "categories": categories,
            "products": products,
            "newest_products": newest_products,
            "colors": colors,
            "sizes": sizes,
            "checked_color": f"#{color}" if color is not None else None,
            "checked_size": size,
            "sort_way": sort_way,
            "filter_min_price": filter_min_price,
            "filter_max_price": filter_max_price,
        }
        return render(request, "product/shop.html", args)


class CategoryWiseFilterProductView(View):
    def get(self, request, slug, filter_min_price, filter_max_price, color, size, sort_way):
        if slug is not None and filter_min_price is not None and filter_max_price is not None and color is not None and size is not None and sort_way is not None:
            try:
                categories = Category.objects.all()
                try:
                    category_obj = Category.objects.get(slug=slug)
                except Category.DoesNotExist:
                    raise Http404("Invalid category!");
                else:
                    products = Product.objects.filter(category=category_obj)
                    newest_products = Product.objects.all().order_by("-created_at")[:5]
                    min_price, max_price = get_min_and_max_price(products)

                    colors, sizes = get_unique_colors_and_sizes()
                    
                    filter_min_price = round(float(filter_min_price), 2)
                    filter_max_price = round(float(filter_max_price), 2)

                    color = color.lower() if color != "none" else None
                    size = size.lower() if size != "none" else None
                    sort_way = sort_way.lower() if sort_way != "none" else None

                    # products = Product.objects.filter(price__range=(filter_min_price, filter_max_price + 1)).order_by("-created_at")
                    product_list = []

                    for product in products:
                        if product.discount_percentage > 0:
                            product_price = product.price - product.price * product.discount_percentage / 100
                            if filter_min_price <= product_price <= filter_max_price + 1:
                                product_list.append(product.uid)
                        else:
                            product_list.append(product.uid)

                    products = Product.objects.filter(uid__in=product_list).order_by("-created_at")
                    
                    del product_list

                    # Filtering by color
                    if color is not None:
                        products = filter_by_color(products, color)

                    # Filtering by size
                    if size is not None:
                        products = filter_by_size(products, size)

                    # Sorting products
                    if sort_way is not None:
                        products = filter_by_sort_way(products, sort_way)

                    cart_obj = get_cart_object(request.user)
                    wishlist_obj = get_wishlist_obj(request.user)
            except ValueError:
                raise Http404("Invalid format!")
        else:
            raise Http404("Something went wrong!")

        args = {
            "category_obj": category_obj,
            "min_price": min_price,
            "max_price": max_price,
            "cart_obj": cart_obj,
            "wishlist_obj": wishlist_obj,
            "categories": categories,
            "products": products,
            "newest_products": newest_products,
            "colors": colors,
            "sizes": sizes,
            "checked_color": f"#{color}" if color is not None else None,
            "checked_size": size,
            "sort_way": sort_way,
            "filter_min_price": filter_min_price,
            "filter_max_price": filter_max_price,
        }
        return render(request, "product/category_wise_product.html", args)


class SubategoryWiseFilterProductView(View):
    def get(self, request, slug, filter_min_price, filter_max_price, color, size, sort_way):
        if slug is not None and filter_min_price is not None and filter_max_price is not None and color is not None and size is not None and sort_way is not None:
            try:
                categories = Category.objects.all()
                try:
                    subcategory_obj = Subcategory.objects.get(slug=slug)
                except Category.DoesNotExist:
                    raise Http404("Invalid category!");
                else:
                    products = Product.objects.filter(category__subcategory=subcategory_obj)
                    newest_products = Product.objects.all().order_by("-created_at")[:5]
                    min_price, max_price = get_min_and_max_price(products)

                    colors, sizes = get_unique_colors_and_sizes()
                    
                    filter_min_price = round(float(filter_min_price), 2)
                    filter_max_price = round(float(filter_max_price), 2)

                    color = color.lower() if color != "none" else None
                    size = size.lower() if size != "none" else None
                    sort_way = sort_way.lower() if sort_way != "none" else None

                    # products = Product.objects.filter(price__range=(filter_min_price, filter_max_price + 1)).order_by("-created_at")
                    product_list = []

                    for product in products:
                        if product.discount_percentage > 0:
                            product_price = product.price - product.price * product.discount_percentage / 100
                            if filter_min_price <= product_price <= filter_max_price + 1:
                                product_list.append(product.uid)
                        else:
                            product_list.append(product.uid)

                    products = Product.objects.filter(uid__in=product_list).order_by("-created_at")
                    
                    del product_list

                    # Filtering by color
                    if color is not None:
                        products = filter_by_color(products, color)

                    # Filtering by size
                    if size is not None:
                        products = filter_by_size(products, size)

                    # Sorting products
                    if sort_way is not None:
                        products = filter_by_sort_way(products, sort_way)

                    cart_obj = get_cart_object(request.user)
                    wishlist_obj = get_wishlist_obj(request.user)
            except ValueError:
                raise Http404("Invalid format!")
        else:
            raise Http404("Something went wrong!")

        args = {
            "subcategory_obj": subcategory_obj,
            "min_price": min_price,
            "max_price": max_price,
            "cart_obj": cart_obj,
            "wishlist_obj": wishlist_obj,
            "categories": categories,
            "products": products,
            "newest_products": newest_products,
            "colors": colors,
            "sizes": sizes,
            "checked_color": f"#{color}" if color is not None else None,
            "checked_size": size,
            "sort_way": sort_way,
            "filter_min_price": filter_min_price,
            "filter_max_price": filter_max_price,
        }
        return render(request, "product/subcategory_wise_product.html", args)


class SearchProductFilterView(View):
    def get(self, request, search_text, filter_min_price, filter_max_price, color, size, sort_way):
        if filter_min_price is not None and filter_max_price is not None and color is not None and size is not None and sort_way is not None:
            try:
                categories = Category.objects.all()
                newest_products = Product.objects.all().order_by("-created_at")[:5]

                products = Product.objects.filter(
                    Q(title__icontains=search_text) | Q(category__title__icontains=search_text)
                ).order_by("-created_at")
                min_price, max_price = get_min_and_max_price(products)

                colors, sizes = get_unique_colors_and_sizes()
                
                filter_min_price = round(float(filter_min_price), 2)
                filter_max_price = round(float(filter_max_price), 2)

                color = color.lower() if color != "none" else None
                size = size.lower() if size != "none" else None
                sort_way = sort_way.lower() if sort_way != "none" else None

                # products = Product.objects.filter(price__range=(filter_min_price, filter_max_price + 1)).order_by("-created_at")
                product_list = []

                for product in Product.objects.all():
                    if product.discount_percentage > 0:
                        product_price = product.price - product.price * product.discount_percentage / 100
                        if filter_min_price <= product_price <= filter_max_price + 1:
                            product_list.append(product.uid)
                    else:
                        product_list.append(product.uid)

                products = Product.objects.filter(uid__in=product_list).order_by("-created_at")
                
                del product_list

                # Filtering by color
                if color is not None:
                    products = filter_by_color(products, color)

                # Filtering by size
                if size is not None:
                    products = filter_by_size(products, size)

                # Sorting products
                if sort_way is not None:
                    products = filter_by_sort_way(products, sort_way)

                cart_obj = get_cart_object(request.user)
                wishlist_obj = get_wishlist_obj(request.user)
            except ValueError:
                raise Http404("Invalid format!")
        else:
            raise Http404("Something is wrong!")

        args = {
            "min_price": min_price,
            "max_price": max_price,
            "cart_obj": cart_obj,
            "wishlist_obj": wishlist_obj,
            "categories": categories,
            "products": products,
            "newest_products": newest_products,
            "colors": colors,
            "sizes": sizes,
            "checked_color": f"#{color}" if color is not None else None,
            "checked_size": size,
            "sort_way": sort_way,
            "filter_min_price": filter_min_price,
            "filter_max_price": filter_max_price,
        }
        return render(request, "product/search_product.html", args)


class CategoryWiseProductView(View):
    def get(self, request, slug):
        category_obj = get_object_or_404(Category, slug=slug)
        products = Product.objects.filter(category=category_obj)
        newest_products = Product.objects.all().order_by("-created_at")[:5]
        wishlist_obj = get_wishlist_obj(request.user)
        cart_obj = get_cart_object(request.user)
        min_price, max_price = get_min_and_max_price(products)
        colors, sizes = get_unique_colors_and_sizes()
        categories = Category.objects.all()

        args = {
            "category_obj": category_obj,
            "products": products,
            "newest_products": newest_products,
            "wishlist_obj": wishlist_obj,
            "cart_obj": cart_obj,
            "min_price": min_price,
            "max_price": max_price,
            "colors": colors,
            "sizes": sizes,
            "categories": categories
        }
        return render(request, "product/category_wise_product.html", args)


class SubcategoryWiseProductView(View):
    def get(self, request, slug):
        subcategory_obj = get_object_or_404(Subcategory, slug=slug)
        products = Product.objects.filter(category__subcategory=subcategory_obj)
        newest_products = Product.objects.all().order_by("-created_at")[:5]
        wishlist_obj = get_wishlist_obj(request.user)
        cart_obj = get_cart_object(request.user)
        min_price, max_price = get_min_and_max_price(products)
        colors, sizes = get_unique_colors_and_sizes()
        categories = Category.objects.all()

        args = {
            "subcategory_obj": subcategory_obj,
            "products": products,
            "newest_products": newest_products,
            "wishlist_obj": wishlist_obj,
            "cart_obj": cart_obj,
            "min_price": min_price,
            "max_price": max_price,
            "colors": colors,
            "sizes": sizes,
            "categories": categories
        }
        return render(request, "product/subcategory_wise_product.html", args)


def get_related_products(product_obj):
    # Returns only 10 products
    return Product.objects.filter(category__title=product_obj.category.title).exclude(uid=product_obj.uid)[:10]


def get_product_all_reviews(product_obj):
    reviews = ProductReview.objects.filter(product=product_obj).order_by("-created_at")
    product_reviews = [{
        "user": {
            "username": review.user.username,
            "profile_pic": review.user.profile_pic.url if review.user.profile_pic else None
        },
        "product": {
            "uid": review.product.uid
        },
        "review_star": review.review_star,
        "comment": review.comment,
        "created_at": datetime.strftime(review.created_at, "%b %d, %Y %I:%M %p")
    } for review in reviews]
    return product_reviews


# Converting number to human format
def human_format(number):
    units = ['', 'K', 'M', 'G', 'T', 'P']
    k = 1000.0
    magnitude = int(floor(log(number, k)))
    return '%.2f%s' % (number / k**magnitude, units[magnitude])


def get_prev_and_next_obj(lst, obj):
    prev, nxt = -1, -1
    prev_obj, next_obj = None, None

    current_index = -1
    # Getting current product object index 
    for i, item in enumerate(lst):
        if item.uid == obj.uid:
            current_index = i
            break

    # Getting prev and next object index
    if current_index > 0:
        prev = current_index - 1
    if current_index != len(lst) - 1:
        nxt = current_index + 1

    # Getting prev and next object
    if prev > -1:
        prev_obj = lst[prev]
    if nxt > -1:
        next_obj = lst[nxt]

    return prev_obj, next_obj
    

class ProductDetailView(View):
    def get(self, request, slug):
        product_obj = get_object_or_404(Product, slug=slug)
        product_color_variation, product_size_variation = [], []
        categories = Category.objects.all()

        # Ordering by created datetime
        copied_products = Product.objects.all().order_by("created_at")

        # Find previous and next product object
        # As the products are ordered by created datetime, so next becomes prev and prev becomes next
        next_product_obj, prev_product_obj = get_prev_and_next_obj(copied_products, product_obj)

        # Clearing
        del copied_products

        if product_obj.variation:
            for variation in product_obj.variation.all():
                if variation.color:
                    product_color_variation.append({
                        "uid": variation.uid,
                        "color": variation.color
                    })
                if variation.size:
                    product_size_variation.append({
                        "uid": variation.uid,
                        "size": variation.size
                    })

        color_required = True if len(product_color_variation) > 0 else False
        size_required = True if len(product_size_variation) > 0 else False

        cart_obj = get_cart_object(request.user)
        wishlist_obj = get_wishlist_obj(request.user)

        # Check if the product is in wishlist or not 
        product_in_wishlist = True if wishlist_obj is not None and product_obj in wishlist_obj.product.all() else False
        
        # Related products
        related_products = get_related_products(product_obj)
        # Product reviews
        product_reviews = get_product_all_reviews(product_obj)

        # Converting total review number to human format
        if len(product_reviews) > 999:
            number_of_reviews = human_format(len(product_reviews))
        else:
            number_of_reviews = len(product_reviews)

        args = {
            "product": product_obj,
            "categories": categories,
            "product_color_variation": product_color_variation,
            "product_size_variation": product_size_variation,
            "cart_obj": cart_obj,
            "wishlist_obj": wishlist_obj,
            "color_required": color_required,
            "size_required": size_required,
            "product_in_wishlist": product_in_wishlist,
            "related_products": related_products,
            "product_reviews": product_reviews,
            "number_of_reviews": number_of_reviews,
            "prev_product_obj": prev_product_obj,
            "next_product_obj": next_product_obj,
        }
        return render(request, "product/product_detail.html", args)


class ProductDetailReviewFormSubmitView(View):
    def post(self, request):
        if not request.user.is_authenticated:
            json_resp = {
                "error": True,
                "user_not_login": True
            }
            return JsonResponse(json_resp, safe=False)

        rating = request.POST.get("rating", None)
        message = request.POST.get("message", None)
        product_uid = request.POST.get("productId", None)

        json_resp = {
            "error": True
        }

        if rating is not None and message is not None and product_uid is not None:
            try:
                product_obj = Product.objects.get(uid=product_uid)

                review_obj = ProductReview(
                    user=request.user,
                    product=product_obj,
                    review_star=rating,
                    comment=message
                )
                review_obj.save()

                product_reviews = ProductReview.objects.filter(product=product_obj)
                number_of_reviews = len(product_reviews)

                # Converting total review number to human format
                if number_of_reviews > 999:
                    number_of_reviews = human_format(number_of_reviews)

                json_resp = {
                    "error": False,
                    "review_submitted": True,
                    "user": {
                        "username": request.user.username,
                        "profile_pic": request.user.profile_pic.url if request.user.profile_pic else None
                    },
                    "uid": product_obj.uid,
                    "number_of_reviews": number_of_reviews,
                    "created_at": datetime.strftime(review_obj.created_at, "%b %d, %Y %I:%M %p")
                }
            except Product.DoesNotExist:
                json_resp = {
                    "error": True
                }

        return JsonResponse(json_resp, safe=False)


def get_cart_shipping_charge(cart_obj):
    shipping_price_set = set()

    for cart_item in cart_obj.cart_items.all():
        shipping_price_set.add(cart_item.product.product_type.shipping_charge)

    return round(max(shipping_price_set), 2) if len(shipping_price_set) > 0 else 0.0


class CartView(View):
    def get(self, request):
        categories = Category.objects.all()
        wishlist_obj = get_wishlist_obj(request.user)
        cart_obj = get_cart_object(request.user)
        shipping_charge = get_cart_shipping_charge(cart_obj) if cart_obj is not None else 0.0

        promo_discount = None

        cart_total_price = round(cart_obj.total_price + shipping_charge, 2) if cart_obj is not None and cart_obj.total_price != 0.0 else 0.0

        if cart_obj is not None and cart_obj.promo_code is not None:
            promo_discount = cart_obj.promo_code.discount_percentage
            cart_obj = update_cart_total_price(cart_obj)
        
        args = {
            "categories": categories,
            "wishlist_obj": wishlist_obj,
            "cart_obj": cart_obj,
            "shipping_charge": shipping_charge,
            "promo_discount": promo_discount,
            "cart_total_price": cart_total_price
        }
        return render(request, "product/cart.html", args)


def get_cart_item_obj(cart_obj, cart_item_uid):
    cart_item_obj = None

    try:
        cart_item_obj = cart_obj.cart_items.get(uid=cart_item_uid)
    except CartItem.DoesNotExist:
        cart_item_obj = None

    return cart_item_obj


# Update cart item price and quantity
def update_cart_item_obj(cart_item_obj, product_qty):
    cart_item_obj.price = round(cart_item_obj.price / cart_item_obj.quantity * product_qty, 2)
    cart_item_obj.quantity = product_qty

    cart_item_obj.save()

    return cart_item_obj
    
    
# Update cart item
class UpdateCartItemView(View):
    def post(self, request):
        if not request.user.is_authenticated:
            json_resp = {
                "error": True,
                "user_not_login": True
            }
            return JsonResponse(json_resp, safe=False)

        cart_item_uid = request.POST.get("cartItemId", None)
        product_qty = request.POST.get("qty", None)

        if cart_item_uid is not None and product_qty is not None:
            try:
                product_qty = int(product_qty)

                cart_obj = get_cart_object(request.user)

                if cart_obj is not None:
                    cart_item_obj = get_cart_item_obj(cart_obj, cart_item_uid)

                    if cart_item_obj is not None:
                        # Updating cart item price and quantity
                        cart_item_obj = update_cart_item_obj(cart_item_obj, product_qty)

                        # Update cart total price
                        cart_obj = update_cart_total_price(cart_obj)

                        promo_discount = None
                        # Check for promocode
                        if cart_obj.promo_code is not None:
                            promo_discount = cart_obj.promo_code.discount_percentage

                        # Shipping charge
                        shipping_charge = get_cart_shipping_charge(cart_obj)

                        json_resp = {
                            "error": False,
                            "product_update_price": cart_item_obj.price,
                            "total_price": cart_obj.total_price,
                            "shipping_charge": shipping_charge,
                            "cart_updated": True,
                            "promo_discount": promo_discount
                        }
                        return JsonResponse(json_resp, safe=False)
                    else:
                        json_resp = {
                            "error": True
                        }
                        return JsonResponse(json_resp, safe=False)
            except ValueError:
                json_resp = {
                    "error": True,
                    "invalid_format": True
                }
        
        json_resp = {
            "error": True
        }
        return JsonResponse(json_resp, safe=False)


# Check for promocode expiration
# Returns boolean value
def check_promocode_expiration(promo_obj):
    return True if datetime.now(pytz.utc) > promo_obj.ended_at else False


class ApplyPromocodeView(View):
    def post(self, request):
        if not request.user.is_authenticated:
            json_resp = {
                "error": True,
                "user_not_login": True
            }
            return JsonResponse(json_resp, safe=False)
        
        json_resp = {
            "error": True
        }

        promocode = request.POST.get("promocode", None)

        if promocode is not None:
            try:
                promocode_obj = PromoCode.objects.get(code=promocode)

                promo_code_expired = check_promocode_expiration(promocode_obj)
                if promo_code_expired:
                    json_resp = {
                        "error": True,
                        "promo_expired": True
                    }
                    return JsonResponse(json_resp, safe=False)
                
                cart_objs = Cart.objects.filter(user=request.user, promo_code=promocode_obj)

                # If promocode is already used by the user
                if cart_objs.exists():
                    json_resp = {
                        "error": True,
                        "code_already_applied": True
                    }
                    return JsonResponse(json_resp, safe=False)
                else:
                    del cart_objs
                    cart_obj = get_cart_object(request.user)

                    # Apply promocode
                    if cart_obj is not None:
                        cart_obj.promo_code = promocode_obj
                        cart_obj.total_price = round(cart_obj.total_price -  cart_obj.total_price * promocode_obj.discount_percentage / 100, 2)
                        cart_obj.save()

                        # Shipping charge
                        shipping_charge = get_cart_shipping_charge(cart_obj)

                        json_resp = {
                            "error": False,
                            "applied_promocode": True,
                            "total_price": cart_obj.total_price,
                            "discount_percentage": promocode_obj.discount_percentage,
                            "shipping_charge": shipping_charge
                        }
            except PromoCode.DoesNotExist:
                json_resp = {
                    "error": True,
                    "invalid_code": True
                }
        
        return JsonResponse(json_resp, safe=False)


class CheckoutView(View):
    def get(self, request):
        categories = Category.objects.all()
        wishlist_obj = get_wishlist_obj(request.user)
        cart_obj = get_cart_object(request.user)
        countries = Country.objects.all()

        shipping_charge = get_cart_shipping_charge(cart_obj) if cart_obj is not None else 0.0

        cart_total_price = round(cart_obj.total_price + shipping_charge, 2) if cart_obj is not None and cart_obj.total_price != 0.0 else 0.0
        
        args = {
            "categories": categories,
            "wishlist_obj": wishlist_obj,
            "cart_obj": cart_obj,
            "shipping_charge": shipping_charge,
            "cart_total_price": cart_total_price,
            "countries": countries
        }
        return render(request, "product/checkout.html", args)


# Get shipping charge + shipping product type
def get_checkout_shipping_type(cart_obj):
    shipping_product_set = {}

    for cart_item in cart_obj.cart_items.all():
        shipping_product_set[cart_item.product.product_type.title] = cart_item.product.product_type.shipping_charge

    max_shipping_price = 0.0
    shipping_product_type = None

    if len(shipping_product_set) > 0:
        for shipping_type, shipping_charge in shipping_product_set.items():
            if shipping_charge > max_shipping_price:
                max_shipping_price = shipping_charge
                shipping_product_type = shipping_type

    return max_shipping_price, shipping_product_type

    
class SubmitCheckoutFormView(View):
    def post(self, request):
        if not request.user.is_authenticated:
            json_resp = {
                "error": True,
                "user_not_login": True
            }
            return JsonResponse(json_resp, safe=False)

        json_resp = {
            "error": True
        }
            
        first_name = request.POST.get("firstName", None)
        last_name = request.POST.get("lastName", None)
        phone_no = request.POST.get("phoneNo", None)
        street_addr = request.POST.get("streetAddr", None)
        apartment = request.POST.get("apartment", None)
        city = request.POST.get("city", None)
        country = request.POST.get("country", None)
        zip_code = request.POST.get("zipCode", None)
        shipping_addr = request.POST.get("shippingAddr", None)
        payment_method = request.POST.get("paymentMethod", None)

        if first_name is not None and last_name is not None and phone_no is not None and street_addr is not None and city is not None and country is not None and zip_code is not None and payment_method is not None:
            ship_to_different_addr = True if shipping_addr is not None and len(shipping_addr.strip()) > 0 else False

            try:
                country = Country.objects.get(title=country)
                cart_obj = get_cart_object(request.user)

                if cart_obj is not None:
                    # Shipping charge and shipping type
                    shipping_charge, shipping_product_type = get_checkout_shipping_type(cart_obj)

                    # Getting cart total price
                    cart_total_price = round(cart_obj.total_price + shipping_charge, 2) if cart_obj is not None else 0.0

                    try:
                        payment_method = PaymentMethod.objects.get(title=payment_method)
                        shipping_product_type = ProductType.objects.get(title=shipping_product_type)
                    except PaymentMethod.DoesNotExist:
                        json_resp = {
                            "error": True,
                            "invalid_payment_method": True
                        }
                        return JsonResponse(json_resp, safe=False)
                    except ProductType.DoesNotExist:
                        json_resp = {
                            "error": True
                        }
                        return JsonResponse(json_resp, safe=False)

                    order_status = "Processing"
                    order_status = OrderStatus.objects.get(title=order_status)
                    
                    order_obj = Order(
                        first_name=first_name,
                        last_name=last_name,
                        phone_no=phone_no,
                        street_address=street_addr,
                        apartment=apartment,
                        city=city,
                        country=country,
                        zip_code=zip_code,
                        user=request.user,
                        cart=cart_obj,
                        payment_method=payment_method,
                        price=cart_obj.total_price,
                        shipping_product_type=shipping_product_type,
                        total_price=cart_total_price,
                        order_status=order_status,
                        is_paid=False if payment_method.title == "Cash On Delivery" else True
                    )

                    # If different shipping address is set
                    if ship_to_different_addr:
                        order_obj.shipping_address = shipping_addr.strip()
                        order_obj.shipping_to_different_address = True

                    order_obj.save()

                    # Set cart obj order status and paid status
                    cart_obj.is_set_order_status = True
                    cart_obj.is_paid = True if order_obj.is_paid else False
                    cart_obj.save()

                    #### SENDING ORDER CONFIRM MAIL ####
                    # Email template
                    html_message = loader.render_to_string(
                        "product/invoice_mail.html",
                        {
                            "username": request.user.username,
                            "order_obj": order_obj,
                        }
                    )

                    # Sending mail
                    send_mail(
                        'Order Confirmed',
                        "",
                        settings.EMAIL_HOST_USER,
                        [request.user.email],
                        fail_silently=False,
                        html_message=html_message
                    )

                    json_resp = {
                        "error": False,
                        "order_created": True,
                        "order_id": order_obj.uid
                    }
                else:
                    json_resp = {
                        "error": True,
                        "cart_not_found": True
                    }
                    return JsonResponse(json_resp, safe=False)
            except Country.DoesNotExist:
                json_resp = {
                    "error": True,
                    "invalid_country": True
                }

        return JsonResponse(json_resp, safe=False) 


def get_formatted_datetime_wishlist_products(wishlist_obj):
    products = []
    
    if wishlist_obj is not None:
        products = [{
            "uid": product.uid,
            "title": product.title,
            "slug": product.slug,
            "price": product.price,
            "discount_percentage": product.discount_percentage,
            "image": product.image.url if product.image else None,
            "added_date": datetime.strftime(wishlist_obj.created_at, "%b %d, %Y %I:%M %p")
        } for product in wishlist_obj.product.all()]

    return products
    

class WishlistView(View):
    def get(self, request):
        categories = Category.objects.all()
        wishlist_obj = get_wishlist_obj(request.user)
        products = get_formatted_datetime_wishlist_products(wishlist_obj)
        cart_obj = get_cart_object(request.user)
        
        args = {
            "categories": categories,
            "wishlist_obj": wishlist_obj,
            "cart_obj": cart_obj,
            "products": products,
        }
        return render(request, "product/wishlist.html", args)


def format_datetime_of_blogs_created(blogs):
    formatted_blogs = [{
        "uid": blog.uid,
        "slug": blog.slug,
        "title": blog.title,
        "image": blog.image.url if blog.image else None,
        "creator": blog.creator.username,
        "category": {
            "slug": blog.category.slug,
            "title": blog.category.title
        },
        "content": blog.content,
        "created_at": datetime.strftime(blog.created_at, "%b %d, %Y %I:%M %p"),
        # Number of reviews for each blog
        # If number of reviews is less than 1000, than set it as a number format,
        # otherwise change it to human readable format
        "number_of_reviews": len(BlogReview.objects.select_related("blog").filter(blog=blog.uid)) if len(BlogReview.objects.select_related("blog").filter(blog=blog.uid)) < 1000 else human_format(len(BlogReview.objects.select_related("blog").filter(blog=blog.uid)))
    } for blog in blogs]
    return formatted_blogs


class BlogListView(View):
    def get(self, request):
        blogs = Blog.objects.all().order_by("-created_at")
        blogs = format_datetime_of_blogs_created(blogs)
        recent_blogs = blogs[:5]
        blog_categories = BlogCategory.objects.all()
        categories = Category.objects.all()
        cart_obj = get_cart_object(request.user)
        wishlist_obj = get_wishlist_obj(request.user)
        
        args = {
            "categories": categories,
            "blogs": blogs,
            "recent_blogs": recent_blogs,
            "blog_categories": blog_categories,
            "cart_obj": cart_obj,
            "wishlist_obj": wishlist_obj
        }
        return render(request, "product/blogs.html", args)


class SearchBlogView(View):
    def get(self, request, search_text):
        if search_text is not None:
            search_text = search_text.strip()
            print(search_text)
            blogs = Blog.objects.filter(
                Q(title__icontains=search_text) | Q(category__title__icontains=search_text)
            ).order_by("-created_at")
            blogs = format_datetime_of_blogs_created(blogs)
            recent_blogs = blogs[:5]
            blog_categories = BlogCategory.objects.all()
            categories = Category.objects.all()
            wishlist_obj = get_wishlist_obj(request.user)
            cart_obj = get_cart_object(request.user)

        args = {
            "categories": categories,
            "blogs": blogs,
            "recent_blogs": recent_blogs,
            "blog_categories": blog_categories,
            "cart_obj": cart_obj,
            "wishlist_obj": wishlist_obj,
            "search_text": search_text
        }
        return render(request, "product/search_blog.html", args)


# Auto search blog
class BlogAutoSearchView(View):
    def post(self, request):
        search_text = request.POST.get("searchText", None)

        json_resp = {
            "error": True
        }

        if search_text is not None:
            search_text = search_text.strip()

            found_blogs = Blog.objects.filter(
                Q(title__icontains=search_text) | Q(category__title__icontains=search_text)
            ).order_by("-created_at")[:10]

            blogs = list(map(lambda blog: {
                "uid": blog.uid,
                "slug": blog.slug,
                "title": blog.title,
                "image": blog.image.url if blog.image is not None else None,
                "category": blog.category.title
            }, found_blogs))

            del found_blogs

            json_resp = {
                "error": False,
                "blogs": blogs,
                "search_success": True
            }
        return JsonResponse(json_resp, safe=False)


class CategoryWiseBlogView(View):
    def get(self, request, slug):
        category_obj = get_object_or_404(BlogCategory, slug=slug)
        blogs = Blog.objects.filter(category=category_obj)
        blogs = format_datetime_of_blogs_created(blogs)
        recent_blogs = blogs[:5]
        blog_categories = BlogCategory.objects.all()
        categories = Category.objects.all()
        cart_obj = get_cart_object(request.user)
        wishlist_obj = get_wishlist_obj(request.user)

        args = {
            "category_obj": category_obj,
            "categories": categories,
            "blogs": blogs,
            "recent_blogs": recent_blogs,
            "blog_categories": blog_categories,
            "cart_obj": cart_obj,
            "wishlist_obj": wishlist_obj,
        }
        return render(request, "product/category_wise_blog.html", args)


def get_blog_object_reviews(blog_obj):
    reviews = BlogReview.objects.filter(blog=blog_obj).order_by("-created_at")
    blog_reviews = [{
        "uid": review.uid,
        "user": {
            "username": review.user.username,
            "profile_pic": review.user.profile_pic.url if review.user.profile_pic is not None else None
        },
        "blog": {
            "uid": review.blog.uid
        },
        "comment": review.comment,
        "created_at":datetime.strftime(review.created_at, "%b %d, %Y %I:%M %p")
    } for review in reviews]

    return blog_reviews


class BlogDetailView(View):
    def get(self, request, slug):
        get_blog_obj = get_object_or_404(Blog, slug=slug)
        blog_obj = {
            "uid": get_blog_obj.uid,
            "slug": get_blog_obj.slug,
            "title": get_blog_obj.title,
            "image": get_blog_obj.image.url if get_blog_obj.image else None,
            "category": {
                "slug": get_blog_obj.category.slug,
                "title": get_blog_obj.category.title
            },
            "content": get_blog_obj.content,
            "creator": get_blog_obj.creator.username,
            "created_at": datetime.strftime(get_blog_obj.created_at, "%b %d, %Y %I:%M %p")
        }

        blogs = Blog.objects.all().order_by("-created_at")[:5]
        recent_blogs = format_datetime_of_blogs_created(blogs)
        blog_reviews = get_blog_object_reviews(get_blog_obj)
        blog_categories = BlogCategory.objects.all()
        categories = Category.objects.all()
        cart_obj = get_cart_object(request.user)
        wishlist_obj = get_wishlist_obj(request.user)

        copied_blogs = Blog.objects.all().order_by("created_at")

        # Find previous and next blog object
        # As the blogs are ordered by created datetime, so next becomes prev and prev becomes next
        next_blog_obj, prev_blog_obj = get_prev_and_next_obj(copied_blogs, get_blog_obj)

        # Clearing
        del copied_blogs
        del get_blog_obj

        # Converting total review number to human format 
        if len(blog_reviews) > 999:
            number_of_reviews = human_format(len(blog_reviews))
        else:
            number_of_reviews = len(blog_reviews)
        
        args = {
            "blog_obj": blog_obj,
            "prev_blog_obj": prev_blog_obj,
            "next_blog_obj": next_blog_obj,
            "recent_blogs": recent_blogs,
            "blog_categories": blog_categories,
            "categories": categories,
            "cart_obj": cart_obj,
            "wishlist_obj": wishlist_obj,
            "blog_reviews": blog_reviews,
            "number_of_reviews": number_of_reviews
        }
        return render(request, "product/blog_detail.html", args)


class SubmitBlogCommentFormView(View):
    def post(self, request):
        if not request.user.is_authenticated:
            json_resp = {
                "error": True,
                "user_not_login": True
            }
            return JsonResponse(json_resp, safe=False)
            
        comment = request.POST.get("comment", None)
        blog = request.POST.get("blog", None)

        json_resp = {
            "error": True
        }

        if comment is not None:
            try:
                blog_obj = Blog.objects.get(slug=blog)
                blog_review_obj = BlogReview(
                    user=request.user,
                    blog=blog_obj,
                    comment=comment
                )
                blog_review_obj.save()

                blog_reviews = BlogReview.objects.filter(blog=blog_obj)
                number_of_reviews = len(blog_reviews)

                del blog_reviews

                # Converting total review number to human format 
                if number_of_reviews > 999:
                    number_of_reviews = human_format(len(blog_reviews))
    
                json_resp = {
                    "error": False,
                    "comment_created": True,
                    "username": blog_review_obj.user.username,
                    "profile_pic": request.user.profile_pic.url if request.user.profile_pic is not None else None,
                    "created_at": datetime.strftime(blog_review_obj.created_at, "%b %d, %Y %I:%M %p"),
                    "number_of_reviews": number_of_reviews
                }
            except Blog.DoesNotExist:
                json_resp = {
                    "error": True
                }

        return JsonResponse(json_resp, safe=False)


class DashboardAccountView(View):
    def get(self, request):
        if not request.user.is_authenticated:
            return redirect("product:home")
            
        dashboard_header = "My Account"
        wishlist_obj = get_wishlist_obj(request.user)
        cart_obj = get_cart_object(request.user)
        categories = Category.objects.all()

        args = {
            "dashboard_header": dashboard_header,
            "categories": categories,
            "cart_obj": cart_obj,
            "wishlist_obj": wishlist_obj
        }
        return render(request, "product/dashboard_account.html", args)


class UpdateAccountInfoView(View):
    def post(self, request):
        if not request.user.is_authenticated:
            json_resp = {
                "error": True,
                "user_not_login": True
            }
            return JsonResponse(json_resp, safe=False)

        json_resp = {
            "error": True
        }

        username = request.POST.get("username", None)
        phone_no = request.POST.get("phoneNo", None)
        address = request.POST.get("address", None)
        profile_pic = request.FILES.get("profilePic", None)

        if username is not None:
            try:
                account_obj = Account.objects.get(email=request.user.email)

                account_obj.username = username

                if phone_no is not None and len(phone_no.strip()) > 0:
                    account_obj.phone_no = phone_no.strip()
                if address is not None and len(address.strip()) > 0:
                    account_obj.address = address.strip()
                if profile_pic is not None:
                    account_obj.profile_pic = profile_pic
                
                account_obj.save()

                json_resp = {
                    "error": False,
                    "account_updated": True,
                    "username": account_obj.username,
                    "profile_pic": account_obj.profile_pic.url if account_obj.profile_pic is not None else None
                }
            except Account.DoesNotExist:
                json_resp = {
                    "error": True
                }
        return JsonResponse(json_resp, safe=False)


def format_order_object_datetime(order_objs):
    order_objs = [{
        "uid": order.uid,
        "created_at": datetime.strftime(order.created_at, "%b %d, %Y %I:%M %p"),
        "total_price": order.total_price,
        "order_status": order.order_status,
    } for order in order_objs]

    return order_objs


class DashboardOrderView(View):
    def get(self, request):
        if not request.user.is_authenticated:
            return redirect("product:home")
            
        dashboard_header = "My Account"
        wishlist_obj = get_wishlist_obj(request.user)
        cart_obj = get_cart_object(request.user)
        categories = Category.objects.all()
        dashboard_header = "Purcharsed Orders"
        dashboard_order_objs = get_order_objects(request.user)
        order_total_price = 0.0
        order_objs = None

        if dashboard_order_objs is not None:
            order_objs = format_order_object_datetime(dashboard_order_objs)
            order_total_price = round(dashboard_order_objs.aggregate(Sum('total_price'))["total_price__sum"], 2)

        del dashboard_order_objs

        args = {
            "dashboard_header": dashboard_header,
            "categories": categories,
            "wishlist_obj": wishlist_obj,
            "cart_obj": cart_obj,
            "order_objs": order_objs,
            "order_total_price": order_total_price
        }
        return render(request, "product/dashboard_orders.html", args)


class DashboardOrderDetailView(View):
    def get(self, request, order_id):
        if not request.user.is_authenticated:
            return redirect("product:home")

        order_obj = get_object_or_404(Order, user=request.user, uid=order_id)
        categories = Category.objects.all()
        wishlist_obj = get_wishlist_obj(request.user)
        cart_obj = get_cart_object(request.user)
        order_created_at = datetime.strftime(order_obj.created_at, "%b %d, %Y %I:%M %p")

        args = {
            "order_obj": order_obj,
            "categories": categories,
            "cart_obj": cart_obj,
            "wishlist_obj": wishlist_obj,
            "order_created_at": order_created_at
        }
        return render(request, "product/dashboard_order_detail.html", args)


class DashboardWishlistView(View):
    def get(self, request):
        if not request.user.is_authenticated:
            return redirect("product:home")
        
        dashboard_header = "Your Wishlist"
        categories = Category.objects.all()
        wishlist_obj = get_wishlist_obj(request.user)
        cart_obj = get_cart_object(request.user)

        args = {
            "dashboard_header": dashboard_header,
            "categories": categories,
            "wishlist_obj": wishlist_obj,
            "cart_obj": cart_obj,
        }
        return render(request, "product/dashboard_wishlist.html", args)


class OrderReceivedView(View):
    def get(self, request, order_id):
        dashboard_header = "Order Received"
        categories = Category.objects.all()
        order_obj = get_object_or_404(Order, user=request.user, uid=order_id)
        order_created_at = datetime.strftime(order_obj.created_at, "%b %d, %Y %I:%M %p")
        wishlist_obj = get_wishlist_obj(request.user)
        cart_obj = get_cart_object(request.user)

        args = {
            "dashboard_header": dashboard_header,
            "categories": categories,
            "order_obj": order_obj,
            "order_created_at": order_created_at,
            "wishlist_obj": wishlist_obj,
            "cart_obj": cart_obj
        }
        return render(request, "product/order_received.html", args)


class TrackOrderView(View):
    def get(self, request, order_id):
        order_obj = get_object_or_404(Order, uid=order_id, user=request.user)
        order_created_at = datetime.strftime(order_obj.created_at, "%b %d, %Y %I:%M %p")
        categories = Category.objects.all()
        wishlist_obj = get_wishlist_obj(request.user)
        cart_obj = get_cart_object(request.user)

        args = {
            "categories": categories,
            "wishlist_obj": wishlist_obj,
            "cart_obj": cart_obj,
            "order_obj": order_obj,
            "order_created_at": order_created_at
        }
        return render(request, "product/track_order.html", args)


class TrackOrderFormView(View):
    def get(self, request):
        categories = Category.objects.all()
        wishlist_obj = get_wishlist_obj(request.user)
        cart_obj = get_cart_object(request.user)

        args = {
            "categories": categories,
            "wishlist_obj": wishlist_obj,
            "cart_obj": cart_obj,
        }
        return render(request, "product/track_order_form.html", args)

    def post(self, request):
        email = request.POST.get("billing_email", None)
        track_order_id = request.POST.get("order_id", None)

        try:
            user_obj = Account.objects.get(email=email)
            order_obj = Order.objects.get(user=user_obj, uid=track_order_id)
        except:
            messages.error(request, "Invalid order data!")
            return redirect("/track-order/")
        else:
            return redirect(f"/track-order/{order_obj.uid}")


class AboutUsView(View):
    def get(self, request):
        return render(request, "product/about_us.html")


class ContactUsView(View):
    def get(self, request):
        categories = Category.objects.all()
        cart_obj = get_cart_object(request.user)
        wishlist_obj = get_wishlist_obj(request.user)
        
        args = {
            "categories": categories,
            "cart_obj": cart_obj,
            "wishlist_obj": wishlist_obj
        }
        return render(request, "product/contact.html", args)

    def post(self, request):
        email = request.POST.get("email", None)
        message = request.POST.get("message", None)
        file = request.FILES.get("issue_file", None)

        if email is not None and message is not None:
            contact_obj = Contact(
                email=email,
                message=message
            )

            if file is not None:
                contact_obj.file = file

            contact_obj.save()
            messages.success(request, "Message sent successfully!")
            return redirect("product:contact-us")
        else:
            messages.error(request, "Email & Message field is required!")
            return redirect("product:contact-us")