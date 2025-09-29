from django.urls import path
from django.contrib.auth.views import LogoutView
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('about/', views.about, name='about'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('appointments/', views.appointments, name='appointments'),
    path('services/', views.services, name='services'),
    path('inventory/', views.inventory, name='inventory'),
    path('reports/', views.reports, name='reports'),
    path('settings/', views.settings, name='settings'),
    path('inspections/', views.inspections, name='inspections'),
    path('new-client-request/', views.new_client_request, name='new_client_request'),
    path('new-inspection/', views.new_inspection, name='new_inspection'),
    path('add-vehicle/', views.add_vehicle, name='add_vehicle'),
    path('add-inventory-item/', views.add_inventory_item, name='add_inventory_item'),
    path('inventory-item/<int:item_id>/', views.view_inventory_item, name='view_inventory_item'),
    path('inventory-item/<int:item_id>/edit/', views.edit_inventory_item, name='edit_inventory_item'),
    path('export-reports/csv/', views.export_reports_csv, name='export_reports_csv'),
    path('export-reports/excel/', views.export_reports_excel, name='export_reports_excel'),
    path('export-reports/pdf/', views.export_reports_pdf, name='export_reports_pdf'),
    path('accounts/profile/', views.dashboard, name='profile'),  # Redirect profile to dashboard
    path('login/', views.CustomLoginView.as_view(), name='login'),
    path('get-started/', views.signup_choice_view, name='signup_choice'),
    path('register-organization/', views.register_organization_view, name='register_organization'),
    path('signup/', views.signup_view, name='signup'),
    path('logout/', LogoutView.as_view(next_page='home'), name='logout'),
    path('session/<int:session_id>/', views.view_session, name='view_session'),
    path('session/<int:session_id>/edit/', views.edit_session, name='edit_session'),
]