# Generated by Django 3.2.13 on 2022-06-03 16:06

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0020_alter_order_payment_method'),
    ]

    operations = [
        migrations.AlterField(
            model_name='order',
            name='order_status',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='product.orderstatus'),
        ),
    ]
