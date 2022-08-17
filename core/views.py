from django.shortcuts import redirect

def homePageView(request):
    
    return redirect('product:product_list')
