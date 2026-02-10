from django.urls import path
from . import views 

urlpatterns = [
    path('buscar-descripcion/', views.buscarClienteDescripcion_view, name='buscar_cliente_descripcion'),
    path('buscar-codigo/', views.buscarClienteCodigo_view, name='buscar_cliente_codigo'),
    path('lista-precios-cliente/', views.listaPrecios_view, name='lista_precios_cliente'),
]