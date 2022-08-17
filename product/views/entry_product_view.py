import json
import qrcode
from PIL import Image, ImageDraw, ImageFont
from django.http import JsonResponse
from django.views.generic.list import ListView
from django.views.generic.edit import CreateView, UpdateView
from django.views.generic.detail import DetailView
from product.views.core_funtions import *
from product.models import DetailEntryProduct, DetailProduct, EntryProduct,Product, SupplierProduct

def autocomplete_supplier(request):
	if 'term' in request.GET:
		term = request.GET.get('term')
		query_name = SupplierProduct.objects.filter(name__icontains = term).filter(state = True).values('identifier','name')
		query_identifier = SupplierProduct.objects.filter(identifier__icontains = term).filter(state=True).values('identifier','name')
		supplier_list = []
		for supplier in query_name:
			supplier_list.append(supplier['identifier'] + " | " + supplier['name'])
		for supplier in query_identifier:
			supplier_list.append(supplier['identifier'] + " | " + supplier['name'])

		return JsonResponse(supplier_list, safe=False)

def autocomplete_product(request):
	if 'term' in request.GET:
		term = request.GET.get('term')
		query_name = Product.objects.filter(name__icontains = term, state = True).values('code','name')
		query_code = Product.objects.filter(code__icontains = term, state = True).values('code','name')
		product_list = []
		for product in query_name:
			product_list.append(product['code'] + " | " + product['name'])
		for product in query_code:
			product_list.append(product['code'] + " | " + product['name'])
		return JsonResponse(product_list, safe = False)


def validate_registration_data(request):

	supplier = SupplierProduct.objects.filter(identifier = request.GET.get('proveedor'), state = True)
	entry = EntryProduct.objects.filter(reference = (request.GET.get('referencia')).upper(), state = True)
	error_list = []
	if len(supplier) == 0:
		error = {}
		error['campo'] = 'proveedor'
		error['mensaje'] = 'El proveedor no ha sido registrado'
		error_list.append(error)
		
	if len(entry) != 0:
		error = {}
		error['campo'] = 'referencia'
		error['mensaje'] = 'Este número de referencia ya ha sido registrado'
		error_list.append(error)
		
	response = JsonResponse({
		'lista_errores': error_list,
		
	})

	return response

def get_producto(request):
	product = Product.objects.get(code = request.GET.get('producto'), state = True)
	response = JsonResponse({
		'name': product.name,
		'code': product.code,
		'category': product.category.name
	})
	return response

def create_product_detail(new_detail,new_entry):

	try:
		detail_upd = DetailProduct.objects.get(product = new_detail.product.id, supplier = new_entry.supplier.id, state = True)
		detail_upd.stock_in_wait = detail_upd.stock_in_wait + new_detail.quantity
		detail_upd.save()
	except:
		DetailProduct.objects.create(
			product = new_detail.product,
			supplier = new_entry.supplier,
			stock_in_wait = new_detail.quantity
		)

def create_qr_code(request):
	if request.GET:
		entry = EntryProduct.objects.get(id = request.GET['id_entrada'])
		if(not entry.created_qr):
			detail_list = DetailEntryProduct.objects.filter(entry_product__id = entry.id)
			img_final = Image.new('RGB', (611 * entry.quantity_entry,340),'white')
			count = 0
			for detail in detail_list:
				product = Product.objects.get(id = detail.product.id)
				initial_consecutive = product.consecutive
				consecutive_list = []
				for indice in range(detail.quantity):
					initial_consecutive += 1
					code = product.code + "-" + str(initial_consecutive)
					data = code + "|" + entry.supplier.identifier
					img_qr = qrcode.make(data)
					logo = Image.open("media/logo.jpeg")
					icon = Image.open("media/icono.png")
					img_qr.size
					logo.size
					img_qr_size = img_qr.resize((262,310))
					logo_size = logo.resize((328,310))
					img_aux = Image.new('RGB',(611,340), 'white')
					img_aux.paste(img_qr_size,(0,0))
					img_aux.paste(logo_size,(262,0))
					if((indice+1) != detail.quantity):
						img_aux.paste(icon,(590,0))
					string = code + " | " + product.category.name + " | " + entry.reference
					draw = ImageDraw.Draw(img_aux)
					font = ImageFont.truetype("arial.ttf", 25)
					draw.text((20, 290), string, font=font, fill="black")
					img_final.paste(img_aux,(count,0))
					count += 611
					consecutive_list.append(data)
				detail.code_list = consecutive_list
				detail.save()
				product.consecutive += detail.quantity
				product.save()
			entry.created_qr = True
			url = 'media/codigos-qr/'+entry.reference + '.png'
			img_final.save(url)
			entry.url_img_qr = url
			entry.save()
			return JsonResponse({'data':url})

def serializar_query_entry(query):
	entry_list = []
	for entry in query:
		data = {}
		data['id'] = entry.id
		data['reference'] = entry.reference 
		data['supplier'] = entry.supplier.name
		data['created'] = humanizar_fecha(entry.created_date)
		data['in_wait'] = entry.in_wait
		entry_list.append(data)
	return entry_list


def filterEntryBySupplier(request):
	
	if request.GET:
		id_supplier = request.GET.get('id_supplier')
		query = EntryProduct.objects.filter(supplier__id = id_supplier, state=True)
		return JsonResponse({
			'list' : serializar_query_entry(query)
		})

def filterEntryByReference(request):
	if request.GET:
		term = request.GET.get('term')
		query = EntryProduct.objects.filter(reference__icontains = term, state = True)
		return JsonResponse({
			'list' : serializar_query_entry(query)
		})



class EntryListView(ListView):
	model = EntryProduct
	template_name = "entry/list_entry.html"
	
	def get_context_data(self, **kwargs):
		context = super().get_context_data(**kwargs)
		context['suppliers'] = SupplierProduct.objects.filter(state = True).values('id','name')
		return context


class DetailEntryView(DetailView):
	model = EntryProduct
	def get_queryset(self):
		return self.model.objects.filter(id = self.request.GET['id_entrada'])[0]

	def get(self,*args, **kwargs):
		entry = self.get_queryset()
		detail_list = []
		for detail in DetailEntryProduct.objects.filter(entry_product__id = entry.id, state = True):
			data = {}
			data['code'] = detail.product.code
			data['name'] = detail.product.name
			data['category'] = detail.product.category.name
			data['quantity'] = detail.quantity
			if self.request.GET.get('aux'):
				data['code_list'] = eval(detail.code_list)
			detail_list.append(data)
		if not entry.in_wait:
			modified_date = humanizar_fecha(entry.modified_date),
		else:
			modified_date = entry.modified_date
		response = JsonResponse({
			'id': entry.id,
			'reference': entry.reference,
			'created_date': entry.created_date,
			'modified_date': modified_date,
			'supplier': entry.supplier.identifier + " | " + entry.supplier.name,
			'in_wait': entry.in_wait,
			'created_qr': entry.created_qr,
			'url' : entry.url_img_qr,
			'details': detail_list
		})
		return response


class CreateEntryView(CreateView):
	model = EntryProduct
	def post(self,*args, **kwargs):
		product_list = json.loads(self.request.POST['data'])
		total_quanitity = 0
		new_entry = self.model.objects.create(
			reference = self.request.POST['referencia'].upper(),
			supplier = SupplierProduct.objects.get(identifier = self.request.POST['proveedor'])
		)
		for detail in product_list:
			new_detail = DetailEntryProduct.objects.create(
				product = Product.objects.get(code = detail['codigo']),
				quantity = detail['cantidad'],
				entry_product = new_entry
			)
			create_product_detail(new_detail,new_entry)
			total_quanitity += new_detail.quantity
		new_entry.quantity_entry = total_quanitity
		new_entry.save()
		response = JsonResponse({
			'id': new_entry.id,
			'referencia': new_entry.reference,
			'proveedor': new_entry.supplier.name,
			'fecha_ingreso': humanizar_fecha(new_entry.created_date),
		})
		return response

class UpdateEntryView(UpdateView):
	model = EntryProduct
	def post(self,*args, **kwargs):
		product_list = json.loads(self.request.POST['data'])
		entry = self.get_object()
		detail_list = DetailEntryProduct.objects.filter(entry_product = entry.id, state = True)
		product_dic = {}
		for item in product_list:
			product_dic.setdefault(item['codigo'],item['cantidad'])

		for detail in detail_list:
			in_list = False
			for product in product_dic.keys():
				if(detail.product.code == product):	
					in_list = True
					if(detail.quantity != product_dic[product]):		
						product_detail_update = DetailProduct.objects.get(product__id = detail.product.id, supplier = entry.supplier.id, state = True)
						product_detail_update.stock_in_wait = product_detail_update.stock_in_wait - detail.quantity + product_dic[product]
						product_detail_update.save()
						entry.quantity_entry = entry.quantity_entry - detail.quantity + product_dic[product]
						entry.save()
					product_dic.pop(product)
					break
			if not in_list:
				product_detail_update = DetailProduct.objects.get(product__id = detail.product.id, supplier = entry.supplier.id, state = True)
				product_detail_update.stock_in_wait -= detail.quantity
				product_detail_update.save()
				entry.quantity_entry -= detail.quantity
				entry.save()
				detail.state = False
				detail.save()
			for key in product_dic.keys():
				new_detail = DetailEntryProduct.objects.create(
					product = Product.objects.get(code = key),
					quantity = product_dic[key],
					entry_product = entry
				)
				entry.quantity_entry += new_detail.quantity
				entry.save()
				create_product_detail(new_detail,entry)
		return JsonResponse({'id':entry.id})

class CreateIncomeView(UpdateView):
	model = EntryProduct
	def post(self, *args, **kwargs):
		entry = self.get_object()
		entry.in_wait = False
		for detail in DetailEntryProduct.objects.filter(entry_product = entry.id):
			print(detail.entry_product.id)
			detail_product = DetailProduct.objects.get(product = detail.product.id, supplier = entry.supplier.id)
			detail_product.stock_in_cellar += detail.quantity
			detail_product.stock_in_wait -= detail.quantity
			try:
				product_code_list = eval(detail_product.code_list)
				detail_code_list = eval(detail.code_list)
				product_code_list += detail_code_list
			except:
				product_code_list = eval(detail.code_list)
			detail_product.code_list = product_code_list
			detail_product.save()
			entry.save()
		return JsonResponse({'id':entry.id})
		
