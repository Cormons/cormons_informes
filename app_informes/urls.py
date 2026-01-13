from django.urls import path
from . import views

app_name = 'app_informes'

urlpatterns = [
    path('', views.informes_view, name='informes'),
    path('permisos-informes/', views.permisosInformes_view, name='obtener_permisos_informes'),
    path('cheques-cartera/', views.chequesCartera_view, name='chequesCartera'),
    path('logout/', views.logout_view, name='logout'),
]