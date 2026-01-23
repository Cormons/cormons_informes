from django.urls import path
from . import views 

urlpatterns = [
    path('buscar-descripcion/', views.buscarClienteDescripcion_view, name='buscar_cliente_descripcion'),
    path('buscar-codigo/', views.buscarClienteCodigo_view, name='buscar_cliente_codigo'),
]