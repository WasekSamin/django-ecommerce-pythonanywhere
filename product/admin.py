from django.contrib import admin

from .models import *


@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = (
        "uid", "image", "created_at"
    )


@admin.register(Subcategory)
class SubcategoryAdmin(admin.ModelAdmin):
    list_display = (
        "uid", "title",
        "slug", "created_at"
    )


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = (
        "uid", "title", "slug", 
        "image", "created_at"
    )


@admin.register(Variation)
class VariationAdmin(admin.ModelAdmin):
    list_display = (
        "uid", "color", "image", "price",
        "size", "created_at"
    )


admin.site.register(ProductImage)


@admin.register(ProductType)
class ProductTypeAdmin(admin.ModelAdmin):
    list_display = (
        "id", "title",
        "shipping_charge", "created_at"
    )


@admin.register(ProductAdditionalInformation)
class ProductAdditionalInformationAdmin(admin.ModelAdmin):
    list_display = (
        "uid", "weights_in_gram",
        "width_in_cm", "height_in_cm",
        "depth_in_cm", "created_at"
    )


@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = (
        "uid", "user",
        "review_star", "product",
        "created_at"
    )


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "uid", "slug",
        "title", "category",
        "price", "discount_percentage",
        "product_type", "sku", "created_at"
    )


@admin.register(TopDealProduct)
class TopDealProductAdmin(admin.ModelAdmin):
    list_display = (
        "uid", "created_at", "ended_at"
    )


@admin.register(PromoCode)
class PromoCodeAdmin(admin.ModelAdmin):
    list_display = (
        "id", "code", "discount_percentage",
        "created_at", "ended_at"
    )


@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    list_display = (
        "uid", "slug",
        "title", "created_at"
    )


@admin.register(Blog)
class BlogAdmin(admin.ModelAdmin):
    list_display = (
        "uid", "slug",
        "title", "creator",
        "category", "created_at"
    )


@admin.register(BlogReview)
class BlogReviewAdmin(admin.ModelAdmin):
    list_display = (
        "uid", "user", "blog",
        "comment", "created_at"
    )


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = (
        "uid", "user", "created_at"
    )


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = (
        "uid", "product",
        "quantity", "created_at"
    )


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = (
        "uid", "user", "created_at"
    )


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = (
        "id", "title", "created_at"
    )


@admin.register(Country)
class CountryAdmin(admin.ModelAdmin):
    list_display = (
        "id", "title", "created_at"
    )


@admin.register(OrderStatus)
class OrderStatusAdmin(admin.ModelAdmin):
    list_display = (
        "id", "title", "created_at"
    )


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "uid", "first_name", "last_name",
        "phone_no", "street_address", 
        "apartment", "shipping_to_different_address",
        "shipping_address", "city", "country", "zip_code",
        "user", "cart", "price", "shipping_product_type",
        "total_price", "is_paid", "payment_method",
        "order_status", "created_at"
    )


@admin.register(PurchasedOrder)
class PurchasedOrderAdmin(admin.ModelAdmin):
    list_display = (
        "uid", "user", "created_at"
    )


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = (
        "uid", "email", "message",
        "file", "created_at"
    )