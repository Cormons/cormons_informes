from django.urls import path, include
from . import views

urlpatterns = [
    # Autenticación y permisos
    path('auth/', include('app_informes.auth.urls')),
    
    # Módulos de negocio
    path('finanzas/', include('app_informes.modules.finanzas.urls')),
    path('ventas/', include('app_informes.modules.ventas.urls')),
    
    # Vistas principales (AQUÍ va informes_view, NO en auth/urls.py)
    path('', views.informes_view, name='informes'),
    path('logout/', views.logout_view, name='logout'),
]