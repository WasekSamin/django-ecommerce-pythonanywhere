# Generated by Django 4.0.4 on 2022-05-25 05:21

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='product',
            name='extra_images',
        ),
    ]
