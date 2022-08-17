from django.views.generic.list import ListView
from django.views.generic.edit import CreateView, UpdateView
from django.http import JsonResponse
from product.views.core_funtions import *
from product.models import CategoryProduct
from product.forms import CategoryForm


#CRUD CATEGORIA DE PRODUCTO
class CategoryListView(ListView):
	model = CategoryProduct
	template_name = 'category_product/category_list.html'

	def get_context_data(self, **kwargs):
		context = super().get_context_data(**kwargs)
		context['form'] = CategoryForm
		return context

class CreateCategoryProductView(CreateView):
	model = CategoryProduct
	form_class = CategoryForm

	def post(self, *args, **kwargs):
		form = self.form_class(self.request.POST)
		if form.is_valid():
			form.save()
			response = JsonResponse({
				'id' : form.instance.id,
				'name' : form.instance.name,
				'created_date' : humanizar_fecha(form.instance.created_date),
				'modified_date' : humanizar_fecha(form.instance.modified_date),
			})
			response.status_code = 201
			return response
		else:
			error = form.errors
			response = JsonResponse({'error': error})
			response.status_code = 400
			return response

class UpdateCategoryProductView(UpdateView):
	model = CategoryProduct
	form_class = CategoryForm

	def get(self, request, *args, **kwargs):
		object = self.get_object()
		response = JsonResponse({
			'id': object.id,
			'name': object.name,

		})
		return response

	def post(self, *args, **kwargs):
		form = self.form_class(self.request.POST, instance=self.get_object())
		if form.is_valid():
			form.save()
			response = JsonResponse({
				'id':form.instance.id,
				'name':form.instance.name,
				'modified_date':humanizar_fecha(form.instance.modified_date)
			})
			response.status_code = 200
			return response
		else:
			error = form.errors
			response = JsonResponse({'error': error})
			response.status_code = 400
			return response


