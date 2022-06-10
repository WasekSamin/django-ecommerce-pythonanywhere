# Generated by Django 3.2.13 on 2022-06-01 08:58

import datetime
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0017_blogreview_blog'),
    ]

    operations = [
        migrations.CreateModel(
            name='PromoCode',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('code', models.CharField(max_length=30, unique=True)),
                ('discount_percentage', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(default=datetime.datetime.now)),
                ('ended_at', models.DateTimeField()),
                ('product', models.ManyToManyField(blank=True, to='product.Product')),
            ],
        ),
        migrations.AddField(
            model_name='cart',
            name='promo_code',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='product.promocode'),
        ),
    ]