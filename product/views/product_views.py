from django.views.generic.list import ListView
from django.views.generic.edit import CreateView, UpdateView
from django.views.generic.detail import DetailView
from django.http import JsonResponse
from product.views.core_funtions import *
from product.models import DetailProduct, Product, CategoryProduct, SupplierProduct
from product.forms import ProductForm



class ProductListView(ListView):
	model = Product
	template_name = 'product/product_list.html'
	
	def get_queryset(self):
		return self.model.objects.filter(state = True)

	def get_context_data(self, **kwargs):
		context = super().get_context_data(**kwargs)
		context['form'] = ProductForm
		context['categorys'] = CategoryProduct.objects.filter(state=True)
		context['suppliers'] = SupplierProduct.objects.filter(state=True)
		return context

	

class DetailProductView(DetailView):
	model = Product
	def get_queryset(self):
		return self.model.objects.get(id = self.request.GET['id_producto'])

	def get(self, *args, **kwargs):
		
		supplier_list = []
		product = self.get_queryset()
		for supplier in DetailProduct.objects.filter(product__id=product.id,state = True):
			data = {}
			data['name'] = supplier.supplier.name
			data['identifier'] = supplier.supplier.identifier
			data['stock_in_cellar'] = supplier.stock_in_cellar
			data['stock_in_wait'] = supplier.stock_in_wait
			supplier_list.append(data)
		response = JsonResponse({
			'id': product.id,
			'name': product.name,
			'category': product.category.name,
			'created_date': humanizar_fecha(product.created_date),
			'suppliers': supplier_list

		})
		return response

class CreateProducView(CreateView):
	model = Product
	form_class = ProductForm

	def post(self, *args, **kwargs):
		form = self.form_class(self.request.POST)
		if form.is_valid():
			form.save()
			response = JsonResponse({
				'id': form.instance.id,
				'code': form.instance.code,
				'name': form.instance.name,
				'category': form.instance.category.name

			})
			response.status_code = 201
			return response
		else:
			error = form.errors
			response = JsonResponse({'error': error})
			response.status_code = 400
			return response

class UpdateProductView(UpdateView):
	model = Product
	form_class = ProductForm

	def get(self, request, *args, **kwargs):
		object = self.get_object()
		response = JsonResponse({
			'id': object.id,
			'code': object.code,
			'name': object.name,
			'category': object.category.id,
			'description': object.description,

		})
		return response

	def post(self, *args, **kwargs):
		form = self.form_class(self.request.POST, instance=self.get_object())
		if form.is_valid():
			producto = form.save(commit=False)
			producto.code = self.get_object().code
			producto.save()
			response = JsonResponse({
				'id': form.instance.pk,
				'name': form.instance.name,
				'category': form.instance.category.name,
			})
			response.status_code = 200
			return response
		else:
			error = form.errors
			response = JsonResponse({'error': error})
			response.status_code = 400
			return response

def serializar_query_product(query):
	product_list = []
	for product in query:
		data = {}
		data['id'] = product.id
		data['code'] = product.code 
		data['name'] = product.name 
		data['category'] = product.category.name
		data['stock_in_wait'] = product.stock_in_wait['stock_in_wait__sum']
		data['stock_in_cellar'] = product.stock_in_cellar['stock_in_cellar__sum']
		product_list.append(data)
	return product_list


def filterProductByName(request):

	if request.GET:
		term = request.GET.get('term')
		query = Product.objects.filter(name__icontains = term)
		return JsonResponse({
			'list' : serializar_query_product(query)
		})

def filterProductByCategory(request):
	
	if request.GET:

		id_category = request.GET.get('id_category')
		print(type(id_category))
		if id_category != "-1":
			query = Product.objects.filter(category__id = id_category, state = True)
			
		else:
			query = Product.objects.filter(state = True)
		return JsonResponse({
				'list' : serializar_query_product(query)
			})