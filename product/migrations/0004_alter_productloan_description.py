# Generated by Django 4.0.6 on 2022-08-11 19:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0003_rename_producloandetail_productloandetail_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='productloan',
            name='description',
            field=models.TextField(blank=True, null=True),
        ),
    ]