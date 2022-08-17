from django.views.generic.list import ListView
from django.views.generic.edit import CreateView, UpdateView
from django.http import JsonResponse
from product.views.core_funtions import *
from product.models import ExitType
from product.forms import ExitTypeForm



class ExitTypeListView(ListView):
    model = ExitType
    template_name: str = 'tipo_salida/lista_tipo_salida.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['form'] = ExitTypeForm
        return context

class CreateExitTypeView(CreateView):
    model = ExitType
    form_class = ExitTypeForm

    def post(self, *args, **kwargs):
        form = self.form_class(self.request.POST)
        if form.is_valid():
            form.save()
            response = JsonResponse({
                'id': form.instance.id,
				'nombre': form.instance.name,
				'created': humanizar_fecha(form.instance.created_date),
				'updated': humanizar_fecha(form.instance.modified_date)
            })
            return response
        else:
            response = JsonResponse({'error':form.errors})
            response.status_code = 400
            return response

class UpdateExitTypeView(UpdateView):
    model = ExitType
    form_class = ExitTypeForm
    
    def get(self,*args, **kwargs):
        print(self.get_object())
        response = JsonResponse({
            'id': self.get_object().id,
            'nombre': self.get_object().name
        })
        return response

    def post(self, *args, **kwargs):
        form = self.form_class(self.request.POST, instance = self.get_object())
        if form.is_valid():
            form.save()
            response = JsonResponse({
				'id': form.instance.id,
				'nombre': form.instance.name,
				'updated': humanizar_fecha(form.instance.modified_date)
			})
            return response

        else:
            response = JsonResponse({'error':form.errors})
            return response
