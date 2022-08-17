from django import forms
from product.models import CategoryProduct, ExitProduct, ExitType, ProductLoan, SupplierProduct, Product



class CategoryForm(forms.ModelForm):
    class Meta:
        model = CategoryProduct
        fields = ['name']

        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'autocomplete': 'off'},),
        }
        
        labels = {
            'name': 'Nombre',
        } 
        
class SupplierForm(forms.ModelForm):
    class Meta:
        model = SupplierProduct
        fields = ['identifier','name']

        widgets = {
            'identifier': forms.TextInput(attrs={'class': 'form-control', 'autocomplete': 'off'},),
            'name': forms.TextInput(attrs={'class': 'form-control', 'autocomplete': 'off'},),
        }
        
        labels = {
            'identifier': 'Nit - Identificacion',
            'name': 'Nombre',
        } 
 
        error_messages = {
            'identifier': {
                'unique': "Ya existe un proveedor registrado con el mismo nit-identificacion"
            },
        }

class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = ['code', 'name', 'category', 'description']

        widgets = {

            'code': forms.TextInput(attrs={'class': 'form-control', 'autocomplete': 'off', 'onkeyup': 'mayus(this)', },),
            'name': forms.TextInput(attrs={'class': 'form-control', 'autocomplete': 'off'},),
            'category': forms.Select(attrs={'class': 'form-select'}, ),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': '10'}, ),

        }

        labels = {
            'code': 'Código',
            'name' : 'Nombre',
            'category' : 'Categoria',
            'description': 'Descripción',
        }

        error_messages = {
            'code': {
                'unique': "Ya existe un producto registrado con este mismo código."
            },
        }

class ExitProductForm(forms.ModelForm):
    class Meta:
        model = ExitProduct
        fields = ['reference','exit_type','identifier','name_client','description']
        
        
        widgets = {
            'reference': forms.TextInput(attrs={'class':'form-control','autocomplete':'off'},),
            'exit_type': forms.Select(attrs={'class': 'form-select'}, ),
            'identifier': forms.TextInput(attrs={'class':'form-control','autocomplete':'off'},),
            'name_client': forms.TextInput(attrs={'class':'form-control','autocomplete':'off'},),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': '10'}, ),

        }
        
        labels = {
            'reference': 'Referencia',
            'exit_type': 'Tipo de salida',
            'identifier': 'Nit - Identificacion',
            'name_client': 'Nombre del cliente',
            'description': 'Observacion',
        } 

        error_messages = {
            'reference': {
                'unique': "Ya existe una salida con esta misma referencia"
            },
        }


class ExitTypeForm(forms.ModelForm):
    class Meta:
        model = ExitType
        fields = ['name']

        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'autocomplete': 'off'},),

        }
        labels = {
            'name': 'Nombre',
        } 


class ProductLoanForm(forms.ModelForm):
    class Meta:
        model = ProductLoan
        fields = ['reference','identifier','name_client','description']
        
        
        widgets = {
            'reference': forms.TextInput(attrs={'class':'form-control','autocomplete':'off'},),
            'identifier': forms.TextInput(attrs={'class':'form-control','autocomplete':'off'},),
            'name_client': forms.TextInput(attrs={'class':'form-control','autocomplete':'off'},),
            'description': forms.Textarea(attrs={'class': 'form-control col-12', 'rows': '10'}, ),

        }
        
        labels = {
            'reference': 'Referencia',
            'identifier': 'Nit - Identificacion',
            'name_client': 'Nombre del cliente',
            'description': 'Descripcion'
        } 

        error_messages = {
            'reference': {
                'unique': "Ya existe una salida con esta misma referencia"
            },
        }