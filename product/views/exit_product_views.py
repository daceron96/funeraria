import json
from django.http import JsonResponse
from django.views.generic.list import ListView
from django.views.generic.edit import CreateView, UpdateView
from django.views.generic.detail import DetailView
from product.forms import ExitProductForm

from product.models import DetailProduct, ExitDetailProduct, ExitProduct, Product
from product.views.core_funtions import humanizar_fecha

def validate_code(request):
	try:
		code = request.GET.get('codigo')
		product_code = code[0:code.index('-')]
		supplier_identifier = code[(code.index('|')+1):len(code)]
		product_detail = DetailProduct.objects.filter(product__code = product_code, supplier__identifier = supplier_identifier, state = True).first()
		if product_detail:
			code_list = eval(product_detail.code_list)
			for cod in code_list:
				if(cod == code):
					product = Product.objects.filter(code = product_code,state = True ).first()
					print(product)
					return JsonResponse({'id':product.id,
						'codigo':product.code,
						'nombre':product.name,
						'categoria':product.category.name,
						'proveedor': product_detail.supplier.id
					})
			return JsonResponse({'error':'El codigo ingresado no se encuentra dentro de la lista de productos en bodega'})
		return JsonResponse({'error':'El codigo ingresado no existe o tiene el formato incorrecto'})
	except:
		return JsonResponse({'error':'El codigo ingresado no existe o tiene el formato incorrecto'})

def create_detail_exit(request):
	product_list = json.loads(request.POST['data'])
	for item in product_list:
		code_list = list(item['lista_codigos'])
		for supplier in item['proveedores']:
			product_detail = DetailProduct.objects.filter(product__code = item['codigo'], supplier = supplier, state = True).first()
			consecutive_list = list(eval(product_detail.code_list))
			count = 0
			for code in code_list:
				for cod_list in consecutive_list:
					if code == cod_list:
						consecutive_list.remove(code)
						count += 1
			product_detail.code_list = consecutive_list
			product_detail.stock_in_cellar -= count
			product_detail.save()
		exit_product = ExitProduct.objects.get(id = request.POST['salida'])
		ExitDetailProduct.objects.create(
			product = Product.objects.get(code = item['codigo']),
			quantity = item['cantidad'],
			code_list = item['lista_codigos'],
			exit_product = exit_product
		)
	return JsonResponse({
		'id': exit_product.id,
		'referencia': exit_product.reference,
		'tipo' : exit_product.exit_type.name,
		'fecha': humanizar_fecha(exit_product.created_date),
		
		})

class ExitListView(ListView):
	model = ExitProduct
	template_name = "salida/lista_salida.html"

	def get_context_data(self, **kwargs):
		context = super().get_context_data(**kwargs)
		context['form'] = ExitProductForm
		return context

class CreateExitProduct(CreateView):
	model = ExitProduct
	form_class = ExitProductForm

	def post(self, *args, **kwargs):
		form = self.form_class(self.request.POST)
		if form.is_valid():
			form.save()
			response = JsonResponse({
				'respuesta': form.instance.id

			})
			response.status_code = 201
			return response
		else:
			error = form.errors
			response = JsonResponse({'error': error})
			response.status_code = 400
			return response

class DetailExitProduct(DetailView):
	model = ExitProduct
	def get_queryset(self):
		return self.model.objects.get(id = self.request.GET['id_salida'])

	def get(self,*args, **kwargs):
		detail_list = []
		exit_product = self.get_queryset()
		for detail in ExitDetailProduct.objects.filter(exit_product__id = exit_product.id , state = True):
			data = {}
			data['producto'] = detail.product.name
			data['codigo'] = detail.product.code
			data['categoria'] = detail.product.category.name
			data['cantidad'] = detail.quantity
			detail_list.append(data)
		response = JsonResponse({
			'referencia' : exit_product.reference,
			'fecha_registro' : humanizar_fecha(exit_product.created_date),
			'tipo_salida': exit_product.exit_type.name,
			'nombre_cliente': exit_product.name_client,
			'identificador': exit_product.identifier,
			'observacion': exit_product.description,
			'detalle_salida': detail_list
		})
		return response