# Generated by Django 4.0.4 on 2022-05-28 17:10

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0014_remove_productadditionalinformation_variation'),
    ]

    operations = [
        migrations.AddField(
            model_name='productreview',
            name='product',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='product.product'),
        ),
    ]
