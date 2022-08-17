import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE",'funeraria.settings')
import django, random
from datetime import datetime

django.setup()
from django.contrib.auth.models import User

from product.models import *
def start():
	create_category()
	create_supplier()
	create_product()

def create_category():
	CategoryProduct.objects.create(name = 'Cofre fino')
	CategoryProduct.objects.create(name = 'Cofre semifino')
	CategoryProduct.objects.create(name = 'Cofre plan')
	CategoryProduct.objects.create(name = 'Cenizario')
	CategoryProduct.objects.create(name = 'Cofre Cofre niños')

def create_supplier():
	SupplierProduct.objects.create(name ='Luz Marina Lopez', identifier = '41936049-7')
	SupplierProduct.objects.create(name ='FABRICA DE COFRES INFANTILES ',identifier =  '14949465-6')
	SupplierProduct.objects.create(name ='INDUSTRIAS JC ',identifier =  '1113526374-9',)
	SupplierProduct.objects.create(name = 'Claudia Lorena Loaiza', identifier = '246006276-5')
	SupplierProduct.objects.create(name = 'De Coffins SAS', identifier = '900359923-1')
	SupplierProduct.objects.create(name = 'Frascisco Javier Agudelo', identifier = '9735821')
	SupplierProduct.objects.create(name = 'Paula Andrea Alzate Sanchez', identifier = '42155499-1')
	SupplierProduct.objects.create(name = 'Scarleth Agudelo Ceballos', identifier = '1090277167-9')
def create_product():
	Product.objects.create(code = 'CLT',name='Celestial',category=CategoryProduct.objects.get(name = 'Cofre fino'))
	Product.objects.create(code = 'DBT',name='Doble tapa',category=CategoryProduct.objects.get(name = 'Cofre fino'))
	Product.objects.create(code = 'CND',name='Canadiense',category=CategoryProduct.objects.get(name = 'Cofre fino'))
	Product.objects.create(code = 'MNS',name='Ministro',category=CategoryProduct.objects.get(name = 'Cofre fino'))
	Product.objects.create(code = 'BRB',name='Burbuja',category=CategoryProduct.objects.get(name = 'Cofre fino'))
	Product.objects.create(code = 'IMP',name='Imperial',category=CategoryProduct.objects.get(name = 'Cofre fino'))
	Product.objects.create(code = 'ISB',name='Isabelina',category=CategoryProduct.objects.get(name = 'Cofre fino'))
	Product.objects.create(code = 'SNTA',name='Santa ana',category=CategoryProduct.objects.get(name = 'Cofre fino'))
	Product.objects.create(code = 'CRT',name='Corintia',category=CategoryProduct.objects.get(name = 'Cofre fino'))
	Product.objects.create(code = 'HXG',name='Hexagonal',category=CategoryProduct.objects.get(name = 'Cofre fino'))
	Product.objects.create(code = 'CPN',name='Copon',category=CategoryProduct.objects.get(name = 'Cofre semifino'))
	Product.objects.create(code = 'CPT',name='Capitel',category=CategoryProduct.objects.get(name = 'Cofre semifino'))
	Product.objects.create(code = 'TCP',name='Tapa cruz pana',category=CategoryProduct.objects.get(name = 'Cofre semifino'))
	Product.objects.create(code = 'CLN',name='Columna',category=CategoryProduct.objects.get(name = 'Cofre semifino'))
	Product.objects.create(code = 'TRN',name='Torno',category=CategoryProduct.objects.get(name = 'Cofre semifino'))
	Product.objects.create(code = 'VTR',name='Vitrina',category=CategoryProduct.objects.get(name = 'Cofre semifino'))
	Product.objects.create(code = 'SPN',name='Española',category=CategoryProduct.objects.get(name = 'Cofre semifino'))
	Product.objects.create(code = 'VDC',name='Vidrio corto',category=CategoryProduct.objects.get(name = 'Cofre plan'))
	Product.objects.create(code = 'VTN',name='Ventanera',category=CategoryProduct.objects.get(name = 'Cofre plan'))
	Product.objects.create(code = 'VTNP',name='Ventanera pana',category=CategoryProduct.objects.get(name = 'Cofre plan'))
	Product.objects.create(code = 'AVT',name='Avioneta',category=CategoryProduct.objects.get(name = 'Cofre plan'))
	Product.objects.create(code = 'EXT',name='Extra',category=CategoryProduct.objects.get(name = 'Cofre plan'))
	Product.objects.create(code = 'CNZR',name='Restos 70 * 30',category=CategoryProduct.objects.get(name = 'Cenizario'))

opc = 0
while int(opc) != 10:
	print("Seleciona la opcion: ")
	print('1. Crear datos iniciales - proveedores,productos,categorias. ')
	print('2. Crear entradas. ')
	print('3. Crear ingreso. ')
	print('4. Crear salida. ')
	print('5. Crear usuario. ')
	print('6. Generar codigo barras. ')
	print('10. Salir. ')
	opc = input('Opcion. ')
	if int(opc)==1:
		start()
		print('datos creados')
   
   