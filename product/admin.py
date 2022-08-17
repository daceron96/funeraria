from django.contrib import admin
from product.models import CategoryProduct, ExitDetailProduct, ExitProduct, ExitType, ProductLoanDetail, ProductLoan, SupplierProduct, Product, DetailProduct, EntryProduct,DetailEntryProduct

admin.site.register(CategoryProduct)
admin.site.register(SupplierProduct)
admin.site.register(Product)
admin.site.register(DetailProduct)
admin.site.register(DetailEntryProduct)
admin.site.register(EntryProduct)
admin.site.register(ExitProduct)
admin.site.register(ExitDetailProduct)
admin.site.register(ExitType)
admin.site.register(ProductLoan)
admin.site.register(ProductLoanDetail)
