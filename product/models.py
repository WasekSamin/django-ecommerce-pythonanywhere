from distutils.command.upload import upload
from django.db import models
from PIL import Image
from datetime import datetime
from uuid import uuid4
from colorfield.fields import ColorField
from tinymce.models import HTMLField
from ckeditor.fields import RichTextField
from django.template.defaultfilters import slugify
from django.contrib.auth import get_user_model

User = get_user_model()

class Banner(models.Model):
    uid = models.UUIDField(primary_key=True, editable=False, default=uuid4)
    image = models.ImageField(upload_to="images/banner", null=True)
    created_at = models.DateTimeField(default=datetime.now)

    def __str__(self):
        return str(self.uid)

    def save(self):
        if self.image is None:
            return
        
        super(Banner, self).save()

        img = Image.open(self.image.path)
        img = img.resize((1536, 600), Image.ANTIALIAS)
        img.save(self.image.path)


class Subcategory(models.Model):
    uid = models.UUIDField(primary_key=True, editable=False, default=uuid4)
    slug = models.SlugField(max_length=120, null=True, blank=True, unique=True)
    title = models.CharField(max_length=120, unique=True)
    created_at = models.DateTimeField(default=datetime.now)

    def __str__(self):
        return self.title

    def save(self):
        self.slug = slugify(self.title)
        
        super(Subcategory, self).save()


class Category(models.Model):
    uid = models.UUIDField(primary_key=True, editable=False, default=uuid4)
    slug = models.SlugField(max_length=120, null=True, blank=True, unique=True)
    title = models.CharField(max_length=120, unique=True)
    image = models.ImageField(upload_to="images/category", null=True)
    subcategory = models.ManyToManyField(Subcategory, blank=True)
    created_at = models.DateTimeField(default=datetime.now)

    def __str__(self):
        return self.title

    def save(self):
        if not self.image:
            return

        self.slug = slugify(self.title)

        super(Category, self).save()

        img = Image.open(self.image.path)
        if img.width > 600 or img.height > 600:
            img = img.resize((600, 600), Image.ANTIALIAS)
            img.save(self.image.path)


class Variation(models.Model):
    uid = models.UUIDField(primary_key=True, editable=False, default=uuid4)
    image = models.ImageField(upload_to="images/variation", null=True, blank=True)
    price = models.DecimalField(default=0.0, decimal_places=2, max_digits=10)
    color = ColorField(null=True, blank=True)
    size = models.CharField(max_length=120, null=True, blank=True)
    created_at = models.DateTimeField(default=datetime.now)

    def __str__(self):
        return str(self.uid)

    def save(self):
        super(Variation, self).save()

        if not self.image:
            return

        img = Image.open(self.image.path)
        if img.width > 600 or img.height > 600:
            img = img.resize((600, 600), Image.ANTIALIAS)
            img.save(self.image.path)


class ProductImage(models.Model):
    uid = models.UUIDField(primary_key=True, editable=False, default=uuid4)
    image = models.ImageField(upload_to="images/product", null=True)
    created_at = models.DateTimeField(default=datetime.now)

    def __str__(self):
        return str(self.uid)

    def save(self):
        if not self.image:
            return

        super(ProductImage, self).save()
        
        img = Image.open(self.image.path)
        if img.width > 600 or img.height > 600:
            img = img.resize((600, 600), Image.ANTIALIAS)
            img.save(self.image.path)


class ProductType(models.Model):
    title = models.CharField(max_length=120, unique=True)
    shipping_charge = models.DecimalField(default=0.0, decimal_places=2, max_digits=6)
    created_at = models.DateTimeField(default=datetime.now)

    def __str__(self):
        return self.title


class ProductAdditionalInformation(models.Model):
    uid = models.UUIDField(primary_key=True, editable=False, default=uuid4)
    weights_in_gram = models.DecimalField(default=0.0, decimal_places=2, max_digits=10)
    width_in_cm = models.PositiveIntegerField(default=0)
    height_in_cm = models.PositiveIntegerField(default=0)
    depth_in_cm = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(default=datetime.now)

    def __str__(self):
        return str(self.uid)


class Product(models.Model):
    uid = models.UUIDField(primary_key=True, editable=False, default=uuid4)
    slug = models.SlugField(max_length=120, null=True, blank=True, unique=True)
    title = models.CharField(max_length=120, unique=True)
    image = models.ImageField(upload_to="images/product", null=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    price = models.DecimalField(default=0.0, max_digits=10, decimal_places=2)
    discount_percentage = models.PositiveIntegerField(default=0)
    variation = models.ManyToManyField(Variation, blank=True)
    product_type = models.ForeignKey(ProductType, on_delete=models.SET_NULL, null=True)
    short_description = HTMLField()
    long_description = HTMLField(null=True, blank=True)
    additional_information = models.ForeignKey(ProductAdditionalInformation, on_delete=models.SET_NULL, null=True, blank=True)
    sku = models.CharField(max_length=120, null=True)
    created_at = models.DateTimeField(default=datetime.now)

    def __str__(self):
        return self.title

    def save(self):
        if not self.image:
            return

        self.slug = slugify(self.title)

        super(Product, self).save()

        img = Image.open(self.image.path)
        if img.width > 600 or img.height > 600:
            img = img.resize((600, 600), Image.ANTIALIAS)
            img.save(self.image.path)


class TopDealProduct(models.Model):
    uid = models.UUIDField(primary_key=True, editable=False, default=uuid4)
    product = models.ManyToManyField(Product)
    created_at = models.DateTimeField(default=datetime.now)
    ended_at = models.DateTimeField()

    def __str__(self):
        return str(self.uid)

    
class ProductReview(models.Model):
    uid = models.UUIDField(primary_key=True, editable=False, default=uuid4)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True)
    review_star = models.IntegerField(default=1)
    comment = models.TextField()
    created_at = models.DateTimeField(default=datetime.now)

    def __str__(self):
        return str(self.uid)


class PromoCode(models.Model):
    code = models.CharField(max_length=30, unique=True)
    discount_percentage = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(default=datetime.now)
    ended_at = models.DateTimeField()

    def __str__(self):
        return self.code


class BlogCategory(models.Model):
    uid = models.UUIDField(primary_key=True, editable=False, default=uuid4)
    slug = models.SlugField(max_length=120, null=True, blank=True, unique=True)
    title = models.CharField(max_length=120, unique=True)
    created_at = models.DateTimeField(default=datetime.now)

    def __str__(self):
        return self.title

    def save(self):
        self.slug = slugify(self.title)

        super(BlogCategory, self).save()


class Blog(models.Model):
    uid = models.UUIDField(primary_key=True, editable=False, default=uuid4)
    slug = models.SlugField(max_length=120, null=True, blank=True, unique=True)
    title = models.CharField(max_length=120, unique=True)
    image = models.ImageField(upload_to="images/blog", null=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.ForeignKey(BlogCategory, on_delete=models.SET_NULL, null=True)
    content = RichTextField(null=True)
    created_at = models.DateTimeField(default=datetime.now)

    def __str__(self):
        return self.title

    def save(self):
        if not self.image:
            return

        self.slug = slugify(self.title)

        super(Blog, self).save()
        
        img = Image.open(self.image.path)

        if img.width > 800 or img.height > 800:
            img = img.resize((800, 600), Image.ANTIALIAS)
            img.save(self.image.path)


class BlogReview(models.Model):
    uid = models.UUIDField(primary_key=True, editable=False, default=uuid4)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    blog = models.ForeignKey(Blog, on_delete=models.CASCADE, null=True)
    comment = models.TextField()
    created_at = models.DateTimeField(default=datetime.now)

    def __str__(self):
        return str(self.uid)
        

class Wishlist(models.Model):
    uid = models.UUIDField(primary_key=True, editable=False, default=uuid4)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ManyToManyField(Product, blank=True)
    created_at = models.DateTimeField(default=datetime.now)

    def __str__(self):
        return str(self.uid)


class CartItem(models.Model):
    uid = models.UUIDField(primary_key=True, editable=False, default=uuid4)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField(default=0)
    price = models.DecimalField(default=0.0, decimal_places=2, max_digits=10)
    size = models.CharField(max_length=120, null=True, blank=True)
    color = models.CharField(max_length=120, null=True, blank=True)
    created_at = models.DateTimeField(default=datetime.now)

    def __str__(self):
        return str(self.uid)


class Cart(models.Model):
    uid = models.UUIDField(primary_key=True, editable=False, default=uuid4)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    is_paid = models.BooleanField(default=False)
    is_set_order_status = models.BooleanField(default=False)
    cart_items = models.ManyToManyField(CartItem, blank=True)
    total_price = models.DecimalField(default=0.0, decimal_places=2, max_digits=10)
    promo_code = models.ForeignKey(PromoCode, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(default=datetime.now)

    def __str__(self):
        return str(self.uid)


class PaymentMethod(models.Model):
    title = models.CharField(max_length=120, unique=True)
    created_at = models.DateTimeField(default=datetime.now)

    def __str__(self):
        return self.title



class Country(models.Model):
    title = models.CharField(max_length=120, unique=True)
    created_at = models.DateTimeField(default=datetime.now)

    def __str__(self):
        return self.title


class OrderStatus(models.Model):
    title = models.CharField(max_length=120, unique=True)
    created_at = models.DateTimeField(default=datetime.now)

    def __str__(self):
        return self.title


class Order(models.Model):
    uid = models.UUIDField(primary_key=True, editable=False, default=uuid4)
    first_name = models.CharField(max_length=120)
    last_name = models.CharField(max_length=120)
    phone_no = models.CharField(max_length=20)
    street_address = models.CharField(max_length=120)
    apartment = models.CharField(max_length=120, null=True, blank=True)
    shipping_to_different_address = models.BooleanField(default=False)
    shipping_address = models.CharField(max_length=120, null=True, blank=True)
    city = models.CharField(max_length=120)
    country = models.ForeignKey(Country, on_delete=models.SET_NULL, null=True)
    zip_code = models.CharField(max_length=120)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE)
    price = models.DecimalField(default=0.0, decimal_places=2, max_digits=10)
    shipping_product_type = models.ForeignKey(ProductType, on_delete=models.SET_NULL, null=True)
    total_price = models.DecimalField(default=0.0, decimal_places=2, max_digits=10)
    is_paid = models.BooleanField(default=False)
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.SET_NULL, null=True)
    order_status = models.ForeignKey(OrderStatus, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(default=datetime.now)

    def __str__(self):
        return str(self.uid)


class PurchasedOrder(models.Model):
    uid = models.UUIDField(primary_key=True, editable=False, default=uuid4)
    order = models.ManyToManyField(Order)
    user = models.OneToOneField(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(default=datetime.now)

    def __str__(self):
        return str(self.uid)


class Contact(models.Model):
    uid = models.UUIDField(primary_key=True, editable=False, default=uuid4)
    email = models.EmailField()
    message = models.TextField()
    file = models.FileField(upload_to="issue_file/", null=True, blank=True)
    created_at = models.DateTimeField(default=datetime.now)

    def __str__(self):
        return str(self.uid)