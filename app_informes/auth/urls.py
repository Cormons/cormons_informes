from django.urls import path
from . import views  

urlpatterns = [
    path('permisos-informes/', views.permisosInformes_view, name='permisos_informes'),
]