import json
from django.views.generic.list import ListView
from django.views.generic.edit import CreateView, UpdateView
from django.views.generic.detail import DetailView
from django.http import JsonResponse
from product.views.core_funtions import *
from product.models import DetailProduct, Product, ProductLoan, ProductLoanDetail
from product.forms import ProductLoanForm


class ProductLoanListView(ListView):
	model = ProductLoan
	template_name = 'prestamo/lista_prestamo.html'

	def get_context_data(self, **kwargs):
		context = super().get_context_data(**kwargs)
		context["form"] = ProductLoanForm
		return context

class ProductLoanDetailView(DetailView):
	model = ProductLoan
	
	def get_queryset(self):
		return self.model.objects.filter(id = self.request.GET['id_prestamo']).first()

	def get(self,*args, **kwargs):
		detail_list = []
		print(self.get_queryset())
		for detail in ProductLoanDetail.objects.filter(product_loan__id = self.get_queryset().id):
			data = {}
			data['codigo'] = detail.product.code    
			data['producto'] = detail.product.name      
			data['categoria'] = detail.product.category.name
			data['cantidad'] = detail.quantity
			try:
				data['codigos_consecutivo'] = eval(detail.lista_codigos)
			except:
				pass
			detail_list.append(data)
		
		try:
			fecha_reingreso = humanizar_fecha(self.get_queryset().modified_date),
		except:
			fecha_reingreso = self.get_queryset().modified_date
		
		response = JsonResponse({
			'id': self.get_queryset().id,
			'referencia': self.get_queryset().reference,
			'fecha_registro': humanizar_fecha(self.get_queryset().created_date),
			'fecha_reingreso': fecha_reingreso,
			'identificador' : self.get_queryset().identifier,
			'nombre_cliente' : self.get_queryset().name_client,
			'observacion' : self.get_queryset().description,
			'en_espera': self.get_queryset().in_wait,
			'detalle_prestamo': detail_list

		})
		return response

class ProductLoanCreateView(CreateView):
	model = ProductLoan
	form_class = ProductLoanForm

	def post(self, *args, **kwargs):
		
		form = self.form_class(self.request.POST)
		if form.is_valid():
			form.save()
			response = JsonResponse({
				'respuesta' : form.instance.id
			})

			return response
		else:
			response = JsonResponse({'error':form.errors})
			response.status_code = 400
			return response

def product_loan_detail_create(request):

	product_list = json.loads(request.POST['data'])
	
	for item in product_list:
		code_list = item['lista_codigos']
		for supplier in item['proveedores']:
			product_detail = DetailProduct.objects.get(product__code = item['codigo'], supplier = supplier)
			consecutive_list = eval(product_detail.code_list)
			count = 0
			for code in code_list:
				for cod_list in consecutive_list:
					if code == cod_list:
						consecutive_list.remove(code)
						count += 1
			product_detail.code_list = consecutive_list
			product_detail.stock_in_cellar -= count
			product_detail.save()
		product_loan = ProductLoan.objects.get(id = request.POST['prestamo'])
		ProductLoanDetail.objects.create(
			product = Product.objects.get(code = item['codigo']),
			quantity = item['cantidad'],
			code_list = item['lista_codigos'],
			product_loan = product_loan
		)
	return JsonResponse({
		'id': product_loan.id,
		'referencia': product_loan.reference,
		'identificador': product_loan.identifier,
		'fecha_registro' : humanizar_fecha(product_loan.created_date)
	})

class ProductLoanRepaymentView(UpdateView):
	
	model = ProductLoan
	def post(self,*args, **kwargs):
		product_loan = self.get_object()

		for detail in ProductLoanDetail.objects.filter(product_loan = product_loan.id):
			code_list = eval(detail.code_list)
			for code in code_list:
				product_detail = DetailProduct.objects.get(product = detail.product.id, supplier__identifier = code[code.find('|')+1:len(code)])
				product_detail.stock_in_wait += 1
				aux_list = eval(product_detail.code_list)
				aux_list.append(code)
				product_detail.code_list = aux_list
				product_detail.save()
		product_loan.in_wait = False
		product_loan.save()

		return JsonResponse({
			'bandera':True
		})