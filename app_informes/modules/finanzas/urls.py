from django.urls import path
from . import views 

urlpatterns = [
    path('cheques-cartera/', views.chequesCartera_view, name='cheques_cartera'),
]