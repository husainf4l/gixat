from django.urls import path
from django.contrib.auth.views import LogoutView
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('about/', views.about, name='about'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('accounts/profile/', views.dashboard, name='profile'),  # Redirect profile to dashboard
    path('login/', views.CustomLoginView.as_view(), name='login'),
    path('get-started/', views.signup_choice_view, name='signup_choice'),
    path('register-organization/', views.register_organization_view, name='register_organization'),
    path('signup/', views.signup_view, name='signup'),
    path('logout/', LogoutView.as_view(next_page='home'), name='logout'),
]