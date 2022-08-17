import imp
from itertools import product
from lib2to3.pytree import Base
from tabnanny import verbose
from django.db import models
from core.models import BaseModel


class CategoryProduct(BaseModel):

    name = models.CharField(max_length= 100)
    class Meta:
        ordering = ['name']
        verbose_name = "Categoria de productos"
        verbose_name_plural = "Categorias de productos"

    def __str__(self):
        return self.name

class SupplierProduct(BaseModel):
    name = models.CharField(max_length=50)
    identifier = models.CharField(max_length=50, unique=True)

    class Meta:
        ordering = ['name']
        verbose_name = "Proveedor de producto"
        verbose_name_plural = "Proveedores de productos"

    def __str__(self):
        return self.name

class Product(BaseModel):
    code      = models.CharField(max_length=50,unique = True)
    consecutive = models.IntegerField(default=0)
    name      = models.CharField(max_length=50)
    category   = models.ForeignKey(CategoryProduct,on_delete=models.SET_NULL, null=True)
    description = models.TextField(blank=True)
    
    class Meta:
        ordering = ['name']
        verbose_name = "Producto"
        verbose_name_plural = "Productos"

    def __str__(self):
        return self.name

    @property
    def stock_in_wait(self):
        from django.db.models import Sum
        quantity = DetailProduct.objects.filter(product= self, state = True).aggregate(Sum('stock_in_wait'))
        if quantity['stock_in_wait__sum'] == None:
            quantity['stock_in_wait__sum'] = 0
        return quantity
    @property
    def stock_in_cellar(self):
        from django.db.models import Sum
        quantity = DetailProduct.objects.filter(product= self, state = True).aggregate(Sum('stock_in_cellar'))
        if quantity['stock_in_cellar__sum'] == None:
            quantity['stock_in_cellar__sum'] = 0
        return quantity


class DetailProduct(BaseModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True)
    supplier = models.ForeignKey(SupplierProduct,on_delete=models.CASCADE, null=True)
    code_list = models.CharField(max_length=10000,blank=True)
    stock_in_cellar = models.IntegerField(default=0)
    stock_in_wait = models.IntegerField(default=0)
    stock_for_sale = models.IntegerField(default=0)

    class Meta:
        ordering = ['-id']
        verbose_name = "Detalle de producto"
        verbose_name_plural = "Detalles de producto"

    def __str__(self):
        return str(self.product.name + "-" +self.supplier.name )

class EntryProduct(BaseModel):
    reference = models.CharField(max_length=100,unique=True,blank=False,null=False)
    supplier = models.ForeignKey(SupplierProduct, on_delete=models.CASCADE)
    quantity_entry = models.PositiveSmallIntegerField(default=0)
    in_wait = models.BooleanField(default=True)
    description = models.TextField(blank=True)
    created_qr = models.BooleanField(default=False)
    url_img_qr = models.CharField(max_length= 100, blank=True)

    class Meta:
        ordering = ['-in_wait','-id'] 
        verbose_name = "Entrada de producto"
        verbose_name_plural = "Entradas de producto"
    
    def __str__(self):
        return str(self.reference)

class DetailEntryProduct(BaseModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveSmallIntegerField(default=0)
    code_list = models.CharField(max_length=1000, default='',blank=True)
    entry_product = models.ForeignKey(EntryProduct, on_delete=models.CASCADE)
    class Meta:
        verbose_name = "Detalle de entrada"
        verbose_name_plural = "Detalles de entradas"
    def __str__(self):
        return str(self.entry_product.reference + " " + self.product.name)


class ExitType(BaseModel):
    name      = models.CharField(max_length=50)    
    class Meta:
        verbose_name = "Tipo de salida"
        verbose_name_plural = "Tipos de salida"
        ordering = ['name']

    def __str__(self):
        return self.name

class ExitProduct(BaseModel):
    reference = models.CharField(max_length=100,unique=True)
    exit_type = models.ForeignKey(ExitType,on_delete=models.CASCADE)
    identifier = models.CharField(max_length=100,null=False,blank=False)
    name_client = models.CharField(max_length=100,blank=False,null=False)
    description = models.TextField(blank=True,null=True)
    class Meta:
        verbose_name = "Salida de producto"
        verbose_name_plural = "Salidas de producto"
        ordering = ['-id']
    def __str__(self):
        return self.reference
    
class ExitDetailProduct(BaseModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(blank = False, null=False)
    code_list = models.CharField(max_length=1000, blank=True,default='')
    exit_product = models.ForeignKey(ExitProduct, on_delete=models.CASCADE)
    class Meta:
        verbose_name = "Detalle de salida de producto"
        verbose_name_plural = "Detalles de salida de producto"
        ordering = ['-id']
    def __str__(self):
        return str(self.product.name + "-" + self.exit_product.reference)

class ProductLoan(BaseModel):

    reference = models.CharField(max_length=50, blank=False,null=False, unique=True)
    identifier = models.CharField(max_length= 50, blank=False, null=False)
    name_client = models.CharField(max_length=50, blank=False, null= False)
    description = models.TextField(blank=True, null= True)
    in_wait = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Prestamo de producto"
        verbose_name_plural = "Prestamos de producto"
        ordering = ['-id']
    def __str__(self):
        return self.reference

class ProductLoanDetail(BaseModel):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(blank=False, null=False)
    code_list = models.CharField(max_length=1000,blank=True,null=True, default='')
    product_loan = models.ForeignKey(ProductLoan, on_delete= models.CASCADE)

    class Meta:
        verbose_name = "Detalle de prestamo"
        verbose_name_plural = "Detalles de prestamo"
        ordering  = ['id']

    def __str__(self):
        return str(self.product.name + "-" + self.product_loan.reference)