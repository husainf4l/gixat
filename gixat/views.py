from django.shortcuts import render, redirect
from django.contrib.auth import login
from django.contrib.auth.views import LoginView
from django.contrib import messages
from django.urls import reverse_lazy
from django.db import transaction
from .forms import CustomLoginForm, CustomSignupForm, OrganizationRegistrationForm, AdminUserCreationForm


def home(request):
    return render(request, 'home.html')


def about(request):
    return render(request, 'about.html')


def dashboard(request):
    return render(request, 'dashboard.html')


class CustomLoginView(LoginView):
    template_name = 'login.html'
    form_class = CustomLoginForm
    
    def get_success_url(self):
        return reverse_lazy('dashboard')
    
    def form_valid(self, form):
        messages.success(self.request, f'Welcome back, {form.get_user().get_full_name()}!')
        return super().form_valid(form)


def signup_choice_view(request):
    return render(request, 'signup_choice.html')


def register_organization_view(request):
    if request.method == 'POST':
        org_form = OrganizationRegistrationForm(request.POST)
        user_form = AdminUserCreationForm(request.POST)
        
        if org_form.is_valid() and user_form.is_valid():
            try:
                with transaction.atomic():
                    # Create organization
                    organization = org_form.save()
                    
                    # Create admin user with profile
                    user = user_form.save(commit=True, organization=organization)
                    
                    # Log the user in
                    login(request, user)
                    
                    messages.success(request, f'Organization "{organization.name}" created successfully! Welcome, {user.get_full_name()}!')
                    return redirect('home')
                    
            except Exception as e:
                messages.error(request, 'An error occurred while creating your organization. Please try again.')
    else:
        org_form = OrganizationRegistrationForm()
        user_form = AdminUserCreationForm()
    
    return render(request, 'register_organization.html', {
        'form': org_form,
        'user_form': user_form
    })


def signup_view(request):
    if request.method == 'POST':
        form = CustomSignupForm(request.POST)
        if form.is_valid():
            user = form.save()
            username = form.cleaned_data.get('username')
            messages.success(request, f'Account created for {username}! You can now login.')
            return redirect('login')
    else:
        form = CustomSignupForm()
    
    return render(request, 'signup.html', {'form': form})