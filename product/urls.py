from django.urls import path
from product.views.category_views import CategoryListView, CreateCategoryProductView, UpdateCategoryProductView
from product.views.supplier_views import SupplierListView, CreateSupplierProductView, UpdateSupplierProductView
from product.views.product_views import (ProductListView, DetailProductView,CreateProducView ,UpdateProductView, 
    filterProductByName,filterProductByCategory)
from product.views.entry_product_view import (EntryListView, DetailEntryView, CreateEntryView, CreateIncomeView,
    UpdateEntryView)
from product.views.entry_product_view import (create_qr_code,get_producto,validate_registration_data,
    autocomplete_product,autocomplete_supplier, filterEntryBySupplier, filterEntryByReference)

from product.views.exit_product_views import ExitListView,CreateExitProduct,DetailExitProduct
from product.views.exit_product_views import validate_code, create_detail_exit
from product.views.exit_type_views import CreateExitTypeView, ExitTypeListView, UpdateExitTypeView
from product.views.product_loan_view import ProductLoanCreateView,product_loan_detail_create,ProductLoanDetailView,ProductLoanListView,ProductLoanRepaymentView
product_patterns = ([    
    #CATEGORY
    path('category-list',CategoryListView.as_view(), name = 'category_list'),
    path('category-create/',CreateCategoryProductView.as_view(), name = 'create_category'),
    path('category-update/<int:pk>/',UpdateCategoryProductView.as_view(), name='update_category'),
    
    #SUPPLIER
    path('supplier-list/',SupplierListView.as_view(), name = 'supplier_list'),
    path('supplier-create/',CreateSupplierProductView.as_view(), name = 'create_supplier'),
    path('supplier-update/<int:pk>/',UpdateSupplierProductView.as_view(), name='update_supplier'),

    #PRODUCT
    path('product-list/',ProductListView.as_view(), name = 'product_list'),
    path('product-detail/',DetailProductView.as_view(), name='detail_product'),
    path('product-create/',CreateProducView.as_view(), name = 'create_product'),
    path('product-update/<int:pk>/',UpdateProductView.as_view(), name='update_product'),
    path('product-filter-name/',filterProductByName, name = 'filter_product_name'),
    path('product-filter-category/',filterProductByCategory, name = 'filter_product_category'),

    #ENTRY PRODUCT
    path('entry-list/',EntryListView.as_view(), name = 'entry_list'),
    path('entry-detail/',DetailEntryView.as_view(), name = 'entry_detail'),
    path('entry-create/',CreateEntryView.as_view(), name = 'create_entry'),
    path('entry-income/<int:pk>/',CreateIncomeView.as_view(), name = 'icome_entry'),
    path('entry-update/<int:pk>/',UpdateEntryView.as_view(), name = 'update_entry'),

    #query functions for product
    path('autocomplete-supplier/',autocomplete_supplier, name = 'autocomplete_supplier'),
    path('autocomplete-product/',autocomplete_product, name = 'autocomplete_product'),
    path('validate-data/',validate_registration_data, name = 'validate_data'),
    path('product-get/',get_producto, name = 'get_product'),
    path('create-qr-code/',create_qr_code, name = 'create_qr'),
    path('entry-filter-supplier/',filterEntryBySupplier, name = 'filter_entry_supplier'),
    path('entry-filter-reference/',filterEntryByReference, name = 'filter_entry_reference'),

    #EXIT PRODUCT
    path('exit-list/',ExitListView.as_view(), name = 'exit_list'),
    path('exit-create/',CreateExitProduct.as_view(), name = 'create_exit'),
    path('exit-detail/',DetailExitProduct.as_view(), name = 'detail_exit'),

    #query functions for exit product
    path('validate-code/',validate_code, name = 'validate_code'),
    path('create-detail-exit/',create_detail_exit, name = 'create_detail_exit'),

    #EXIT TYPE
    path('exit-type-list',ExitTypeListView.as_view(), name = 'exit_type_list'),
    path('exit-type-create/',CreateExitTypeView.as_view(), name = 'exit_type_create'),
    path('exit-type-update/<int:pk>/',UpdateExitTypeView.as_view(), name='exit_type_update'),

    #Product Loan
    path('loan-product-list/',ProductLoanListView.as_view(), name = 'loan_list'),
    path('loan-new/',ProductLoanCreateView.as_view(), name = 'new_loan'),
    path('loan-new-detail/',product_loan_detail_create, name='loan_new_detail'),
    path('loan-detail/',ProductLoanDetailView.as_view(),name='loan_detail'),
    path('update-repayment/<int:pk>/',ProductLoanRepaymentView.as_view(), name = 'loan_repayment'),

    
],'product')
