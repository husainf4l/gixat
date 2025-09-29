from django.shortcuts import render, redirect
from django.contrib.auth import login
from django.contrib.auth.views import LoginView
from django.contrib import messages
from django.urls import reverse_lazy
from django.db import transaction
from django.db.models import Count, Sum, Q, F, Avg
from django.utils import timezone
from datetime import timedelta
from .forms import CustomLoginForm, CustomSignupForm, OrganizationRegistrationForm, AdminUserCreationForm, ClientRequestForm, InspectionForm, VehicleForm, InventoryItemForm, SessionForm, ProfileForm, OrganizationForm, PasswordChangeForm, NotificationPreferencesForm, SystemSettingsForm
from .models import Organization, UserProfile, Client, Car, Session, JobCard, Inventory, Inspection, Notification
import csv
from django.http import HttpResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side


def home(request):
    return render(request, 'home.html')


def about(request):
    return render(request, 'about.html')


def dashboard(request):
    if not request.user.is_authenticated:
        return redirect('login')
    
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        organization = user_profile.organization
    except UserProfile.DoesNotExist:
        messages.error(request, 'User profile not found. Please contact administrator.')
        return redirect('home')
    
    # Get current date and time
    now = timezone.now()
    today = now.date()
    this_month = today.replace(day=1)
    this_year = today.replace(month=1, day=1)
    
    # Quick Overview KPIs
    cars_in_garage = Session.objects.filter(
        organization=organization,
        status__in=['scheduled', 'in_progress']
    ).count()
    
    pending_requests = Session.objects.filter(
        organization=organization,
        status='scheduled'
    ).count()
    
    inspections_in_progress = Inspection.objects.filter(
        organization=organization,
        status='in_progress'
    ).count()
    
    jobs_in_progress = JobCard.objects.filter(
        session__organization=organization,
        status='in_progress'
    ).count()
    
    inventory_alerts = Inventory.objects.filter(
        organization=organization,
        is_active=True,
        quantity__lte=F('min_quantity')
    ).count()
    
    # Revenue calculations
    revenue_today = Session.objects.filter(
        organization=organization,
        status='completed',
        actual_end_time__date=today
    ).aggregate(total=Sum('actual_cost'))['total'] or 0
    
    revenue_this_month = Session.objects.filter(
        organization=organization,
        status='completed',
        actual_end_time__date__gte=this_month
    ).aggregate(total=Sum('actual_cost'))['total'] or 0
    
    revenue_this_year = Session.objects.filter(
        organization=organization,
        status='completed',
        actual_end_time__date__gte=this_year
    ).aggregate(total=Sum('actual_cost'))['total'] or 0
    
    # Active Cars List
    active_sessions = Session.objects.filter(
        organization=organization,
        status__in=['scheduled', 'in_progress']
    ).select_related('car', 'car__client', 'technician__user').order_by('-scheduled_date')[:10]
    
    # Work Orders Board
    new_requests = Session.objects.filter(organization=organization, status='scheduled')
    approved_assigned = Session.objects.filter(organization=organization, status='in_progress')
    completed_sessions = Session.objects.filter(organization=organization, status='completed')[:5]
    delivered = Session.objects.filter(
        organization=organization, 
        status='completed',
        actual_end_time__date__gte=today - timedelta(days=7)
    )[:5]
    
    # Recent Inspections
    recent_inspections = Inspection.objects.filter(
        organization=organization
    ).select_related('car', 'car__client', 'inspector__user').order_by('-created_at')[:5]
    
    # Inventory Snapshot
    low_stock_items = Inventory.objects.filter(
        organization=organization,
        is_active=True,
        quantity__lte=F('min_quantity')
    ).order_by('quantity')[:5]
    
    # Notifications/Alerts
    notifications = Notification.objects.filter(
        organization=organization,
        user=request.user
    ).order_by('-created_at')[:10]
    
    # Reports/Analytics
    cars_processed_this_week = Session.objects.filter(
        organization=organization,
        status='completed',
        actual_end_time__date__gte=today - timedelta(days=7)
    ).count()
    
    cars_processed_this_month = Session.objects.filter(
        organization=organization,
        status='completed',
        actual_end_time__date__gte=this_month
    ).count()
    
    # Services breakdown (most common jobs)
    services_breakdown = JobCard.objects.filter(
        session__organization=organization,
        status='completed'
    ).values('title').annotate(count=Count('id')).order_by('-count')[:5]
    
    # Staff productivity
    staff_productivity = UserProfile.objects.filter(
        organization=organization,
        role__in=['technician', 'manager']
    ).annotate(
        completed_jobs=Count('session', filter=Q(session__status='completed'))
    ).order_by('-completed_jobs')[:5]
    
    context = {
        # KPIs
        'cars_in_garage': cars_in_garage,
        'pending_requests': pending_requests,
        'inspections_in_progress': inspections_in_progress,
        'jobs_in_progress': jobs_in_progress,
        'inventory_alerts': inventory_alerts,
        'revenue_today': revenue_today,
        'revenue_this_month': revenue_this_month,
        'revenue_this_year': revenue_this_year,
        
        # Active Cars
        'active_sessions': active_sessions,
        
        # Work Orders
        'new_requests': new_requests,
        'approved_assigned': approved_assigned,
        'completed_sessions': completed_sessions,
        'delivered': delivered,
        
        # Recent Inspections
        'recent_inspections': recent_inspections,
        
        # Inventory
        'low_stock_items': low_stock_items,
        
        # Notifications
        'notifications': notifications,
        
        # Analytics
        'cars_processed_this_week': cars_processed_this_week,
        'cars_processed_this_month': cars_processed_this_month,
        'services_breakdown': services_breakdown,
        'staff_productivity': staff_productivity,
    }
    
    return render(request, 'dashboard.html', context)


def appointments(request):
    if not request.user.is_authenticated:
        return redirect('login')
    
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        organization = user_profile.organization
    except UserProfile.DoesNotExist:
        messages.error(request, 'User profile not found. Please contact administrator.')
        return redirect('home')
    
    # Get all sessions/appointments
    sessions = Session.objects.filter(
        organization=organization
    ).select_related('car', 'car__client', 'technician__user').order_by('-scheduled_date')
    
    # Filter by status if provided
    status_filter = request.GET.get('status')
    if status_filter:
        sessions = sessions.filter(status=status_filter)
    
    context = {
        'sessions': sessions,
        'status_filter': status_filter,
    }
    
    return render(request, 'appointments.html', context)


def services(request):
    if not request.user.is_authenticated:
        return redirect('login')
    
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        organization = user_profile.organization
    except UserProfile.DoesNotExist:
        messages.error(request, 'User profile not found. Please contact administrator.')
        return redirect('home')
    
    # Get all job cards/services
    job_cards = JobCard.objects.filter(
        session__organization=organization
    ).select_related('session', 'session__car', 'session__car__client', 'assigned_technician__user').order_by('-created_at')
    
    # Filter by status if provided
    status_filter = request.GET.get('status')
    if status_filter:
        job_cards = job_cards.filter(status=status_filter)
    
    context = {
        'job_cards': job_cards,
        'status_filter': status_filter,
    }
    
    return render(request, 'services.html', context)


def inventory(request):
    if not request.user.is_authenticated:
        return redirect('login')
    
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        organization = user_profile.organization
    except UserProfile.DoesNotExist:
        messages.error(request, 'User profile not found. Please contact administrator.')
        return redirect('home')
    
    # Get all inventory items
    inventory_items = Inventory.objects.filter(
        organization=organization
    ).order_by('name')
    
    # Filter by category if provided
    category_filter = request.GET.get('category')
    if category_filter:
        inventory_items = inventory_items.filter(category=category_filter)
    
    # Get low stock items
    low_stock_items = Inventory.objects.filter(
        organization=organization,
        is_active=True,
        quantity__lte=F('min_quantity')
    ).order_by('quantity')
    
    context = {
        'inventory_items': inventory_items,
        'low_stock_items': low_stock_items,
        'category_filter': category_filter,
        'categories': Inventory.CATEGORY_CHOICES,
    }
    
    return render(request, 'inventory.html', context)


def reports(request):
    if not request.user.is_authenticated:
        return redirect('login')
    
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        organization = user_profile.organization
    except UserProfile.DoesNotExist:
        messages.error(request, 'User profile not found. Please contact administrator.')
        return redirect('home')
    
    # Get current date and time
    now = timezone.now()
    today = now.date()
    this_month = today.replace(day=1)
    this_year = today.replace(month=1, day=1)
    
    # Revenue reports
    revenue_today = Session.objects.filter(
        organization=organization,
        status='completed',
        actual_end_time__date=today
    ).aggregate(total=Sum('actual_cost'))['total'] or 0
    
    revenue_this_month = Session.objects.filter(
        organization=organization,
        status='completed',
        actual_end_time__date__gte=this_month
    ).aggregate(total=Sum('actual_cost'))['total'] or 0
    
    revenue_this_year = Session.objects.filter(
        organization=organization,
        status='completed',
        actual_end_time__date__gte=this_year
    ).aggregate(total=Sum('actual_cost'))['total'] or 0
    
    # Service statistics
    total_sessions = Session.objects.filter(organization=organization).count()
    completed_sessions = Session.objects.filter(organization=organization, status='completed').count()
    completion_rate = (completed_sessions / total_sessions * 100) if total_sessions > 0 else 0
    
    # Most popular services
    popular_services = JobCard.objects.filter(
        session__organization=organization,
        status='completed'
    ).values('title').annotate(
        count=Count('id'),
        revenue=Sum(F('parts_cost') + F('labor_cost'))
    ).order_by('-count')[:10]
    
    # Technician performance
    technician_performance = UserProfile.objects.filter(
        organization=organization,
        role__in=['technician', 'manager']
    ).annotate(
        sessions_completed=Count('session', filter=Q(session__status='completed')),
        total_revenue=Sum('session__actual_cost', filter=Q(session__status='completed'))
    ).order_by('-sessions_completed')
    
    # Monthly revenue trend (last 12 months)
    monthly_revenue = []
    for i in range(11, -1, -1):
        month_start = (now - timedelta(days=30*i)).replace(day=1)
        month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        revenue = Session.objects.filter(
            organization=organization,
            status='completed',
            actual_end_time__date__gte=month_start,
            actual_end_time__date__lte=month_end
        ).aggregate(total=Sum('actual_cost'))['total'] or 0
        monthly_revenue.append({
            'month': month_start.strftime('%B %Y'),
            'revenue': revenue
        })
    
    context = {
        'revenue_today': revenue_today,
        'revenue_this_month': revenue_this_month,
        'revenue_this_year': revenue_this_year,
        'total_sessions': total_sessions,
        'completed_sessions': completed_sessions,
        'completion_rate': completion_rate,
        'popular_services': popular_services,
        'technician_performance': technician_performance,
        'monthly_revenue': monthly_revenue,
    }
    
    return render(request, 'reports.html', context)


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


def settings(request):
    if not request.user.is_authenticated:
        return redirect('login')
    
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        organization = user_profile.organization
    except UserProfile.DoesNotExist:
        messages.error(request, 'User profile not found. Please contact administrator.')
        return redirect('home')
    
    # Initialize forms
    profile_form = ProfileForm(instance=request.user, user_profile=user_profile)
    organization_form = OrganizationForm(instance=organization)
    password_form = PasswordChangeForm(user=request.user)
    preferences_form = NotificationPreferencesForm(initial={
        'email_new_appointments': getattr(user_profile, 'email_notifications', True),
        'email_completed_services': getattr(user_profile, 'email_notifications', True),
        'email_inventory_alerts': getattr(user_profile, 'email_notifications', True),
        'sms_urgent_matters': getattr(user_profile, 'sms_notifications', False),
    })
    system_form = SystemSettingsForm(initial={
        'timezone': getattr(organization, 'timezone', 'UTC'),
        'currency': getattr(organization, 'currency', 'USD'),
        'auto_backup': getattr(organization, 'auto_backup', False),
    })
    
    if request.method == 'POST':
        # Handle profile update
        if 'save_profile' in request.POST:
            profile_form = ProfileForm(request.POST, instance=request.user, user_profile=user_profile)
            if profile_form.is_valid():
                profile_form.save()
                messages.success(request, 'Profile updated successfully!')
                return redirect('settings')
        
        # Handle organization update
        elif 'save_organization' in request.POST:
            organization_form = OrganizationForm(request.POST, instance=organization)
            if organization_form.is_valid():
                organization_form.save()
                messages.success(request, 'Organization settings updated successfully!')
                return redirect('settings')
        
        # Handle password change
        elif 'change_password' in request.POST:
            password_form = PasswordChangeForm(request.POST, user=request.user)
            if password_form.is_valid():
                request.user.set_password(password_form.cleaned_data['new_password'])
                request.user.save()
                messages.success(request, 'Password changed successfully! Please log in again.')
                return redirect('login')
        
        # Handle preferences update
        elif 'save_preferences' in request.POST:
            preferences_form = NotificationPreferencesForm(request.POST)
            if preferences_form.is_valid():
                # Save preferences to user profile or settings
                user_profile.email_notifications = preferences_form.cleaned_data.get('email_new_appointments', False) or preferences_form.cleaned_data.get('email_completed_services', False) or preferences_form.cleaned_data.get('email_inventory_alerts', False)
                user_profile.sms_notifications = preferences_form.cleaned_data.get('sms_urgent_matters', False)
                user_profile.save()
                messages.success(request, 'Notification preferences updated successfully!')
                return redirect('settings')
        
        # Handle system settings update
        elif 'save_settings' in request.POST:
            system_form = SystemSettingsForm(request.POST)
            if system_form.is_valid():
                # Save system settings to organization or user profile
                organization.timezone = system_form.cleaned_data.get('timezone', 'UTC')
                organization.currency = system_form.cleaned_data.get('currency', 'USD')
                organization.auto_backup = system_form.cleaned_data.get('auto_backup', False)
                organization.save()
                messages.success(request, 'System settings updated successfully!')
                return redirect('settings')
        
        # Handle account deletion
        elif 'delete_account' in request.POST:
            # Mark user as inactive instead of deleting
            request.user.is_active = False
            request.user.save()
            user_profile.is_active = False
            user_profile.save()
            messages.success(request, 'Account deactivated successfully.')
            return redirect('home')
    
    context = {
        'profile_form': profile_form,
        'organization_form': organization_form,
        'password_form': password_form,
        'preferences_form': preferences_form,
        'system_form': system_form,
        'user_profile': user_profile,
        'organization': organization,
    }
    
    return render(request, 'settings.html', context)


def new_client_request(request):
    if not request.user.is_authenticated:
        return redirect('login')
    
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        organization = user_profile.organization
    except UserProfile.DoesNotExist:
        messages.error(request, 'User profile not found. Please contact administrator.')
        return redirect('home')
    
    if request.method == 'POST':
        form = ClientRequestForm(request.POST, organization=organization)
        if form.is_valid():
            try:
                with transaction.atomic():
                    # Handle client creation/selection
                    if form.cleaned_data.get('existing_client'):
                        client = form.cleaned_data['existing_client']
                    else:
                        # Create new client
                        client = Client.objects.create(
                            organization=organization,
                            first_name=form.cleaned_data['first_name'],
                            last_name=form.cleaned_data['last_name'],
                            email=form.cleaned_data.get('email'),
                            phone=form.cleaned_data.get('phone')
                        )
                    
                    # Handle car creation/selection
                    if form.cleaned_data.get('existing_car'):
                        car = form.cleaned_data['existing_car']
                    else:
                        # Create new car
                        car = Car.objects.create(
                            organization=organization,
                            client=client,
                            make=form.cleaned_data['make'],
                            model=form.cleaned_data['model'],
                            year=form.cleaned_data['year'],
                            license_plate=form.cleaned_data['license_plate']
                        )
                    
                    # Create session
                    session = form.save(commit=False)
                    session.organization = organization
                    session.car = car
                    session.technician = user_profile  # Assign to current user or could be selected
                    session.save()
                    
                    messages.success(request, f'Client request created successfully! Session #{session.session_number} has been scheduled.')
                    return redirect('appointments')
                    
            except Exception as e:
                messages.error(request, f'An error occurred while creating the client request: {str(e)}')
    else:
        form = ClientRequestForm(organization=organization)
    
    context = {
        'form': form,
        'title': 'New Client Request',
        'submit_text': 'Create Request'
    }
    
    return render(request, 'form_page.html', context)


def inspections(request):
    if not request.user.is_authenticated:
        return redirect('login')
    
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        organization = user_profile.organization
    except UserProfile.DoesNotExist:
        messages.error(request, 'User profile not found. Please contact administrator.')
        return redirect('home')
    
    # Get all inspections for the organization
    inspections_list = Inspection.objects.filter(
        organization=organization
    ).select_related('car', 'car__client', 'inspector').order_by('-created_at')
    
    # Filter by status if provided
    status_filter = request.GET.get('status')
    if status_filter:
        inspections_list = inspections_list.filter(status=status_filter)
    
    # Search by inspection number or car
    search_query = request.GET.get('search')
    if search_query:
        inspections_list = inspections_list.filter(
            Q(inspection_number__icontains=search_query) |
            Q(car__make__icontains=search_query) |
            Q(car__model__icontains=search_query) |
            Q(car__license_plate__icontains=search_query) |
            Q(car__client__full_name__icontains=search_query)
        )
    
    context = {
        'inspections': inspections_list,
        'status_filter': status_filter,
        'search_query': search_query,
        'title': 'Inspections - Quality Control'
    }
    
    return render(request, 'inspections.html', context)


def new_inspection(request):
    if not request.user.is_authenticated:
        return redirect('login')
    
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        organization = user_profile.organization
    except UserProfile.DoesNotExist:
        messages.error(request, 'User profile not found. Please contact administrator.')
        return redirect('home')
    
    if request.method == 'POST':
        form = InspectionForm(request.POST, organization=organization)
        if form.is_valid():
            inspection = form.save(commit=False)
            inspection.organization = organization
            inspection.inspector = user_profile
            inspection.save()
            
            messages.success(request, f'Inspection scheduled successfully! Inspection #{inspection.inspection_number} has been created.')
            return redirect('dashboard')
    else:
        form = InspectionForm(organization=organization)
    
    context = {
        'form': form,
        'title': 'Schedule New Inspection',
        'submit_text': 'Schedule Inspection'
    }
    
    return render(request, 'form_page.html', context)


def add_vehicle(request):
    if not request.user.is_authenticated:
        return redirect('login')
    
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        organization = user_profile.organization
    except UserProfile.DoesNotExist:
        messages.error(request, 'User profile not found. Please contact administrator.')
        return redirect('home')
    
    if request.method == 'POST':
        form = VehicleForm(request.POST, organization=organization)
        if form.is_valid():
            vehicle = form.save(commit=False)
            vehicle.organization = organization
            vehicle.save()
            
            messages.success(request, f'Vehicle "{vehicle.make} {vehicle.model}" has been added successfully!')
            return redirect('dashboard')
    else:
        form = VehicleForm(organization=organization)
    
    context = {
        'form': form,
        'title': 'Add New Vehicle',
        'submit_text': 'Add Vehicle'
    }
    
    return render(request, 'form_page.html', context)


def add_inventory_item(request):
    if not request.user.is_authenticated:
        return redirect('login')
    
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        organization = user_profile.organization
    except UserProfile.DoesNotExist:
        messages.error(request, 'User profile not found. Please contact administrator.')
        return redirect('home')
    
    if request.method == 'POST':
        form = InventoryItemForm(request.POST)
        if form.is_valid():
            inventory_item = form.save(commit=False)
            inventory_item.organization = organization
            inventory_item.save()
            
            messages.success(request, f'Inventory item "{inventory_item.name}" has been added successfully!')
            return redirect('inventory')
    else:
        form = InventoryItemForm()
    
    context = {
        'form': form,
        'title': 'Add Inventory Item',
        'submit_text': 'Add Item'
    }
    
    return render(request, 'form_page.html', context)


def view_inventory_item(request, item_id):
    if not request.user.is_authenticated:
        return redirect('login')
    
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        organization = user_profile.organization
    except UserProfile.DoesNotExist:
        messages.error(request, 'User profile not found. Please contact administrator.')
        return redirect('home')
    
    try:
        item = Inventory.objects.get(id=item_id, organization=organization)
    except Inventory.DoesNotExist:
        messages.error(request, 'Inventory item not found.')
        return redirect('inventory')
    
    context = {
        'item': item,
        'title': f'View Inventory Item: {item.name}',
        'total_value': item.unit_price * item.quantity
    }
    
    return render(request, 'inventory_item_detail.html', context)


def edit_inventory_item(request, item_id):
    if not request.user.is_authenticated:
        return redirect('login')
    
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        organization = user_profile.organization
    except UserProfile.DoesNotExist:
        messages.error(request, 'User profile not found. Please contact administrator.')
        return redirect('home')
    
    try:
        item = Inventory.objects.get(id=item_id, organization=organization)
    except Inventory.DoesNotExist:
        messages.error(request, 'Inventory item not found.')
        return redirect('inventory')
    
    if request.method == 'POST':
        form = InventoryItemForm(request.POST, instance=item)
        if form.is_valid():
            form.save()
            messages.success(request, f'Inventory item "{item.name}" has been updated successfully!')
            return redirect('inventory')
    else:
        form = InventoryItemForm(instance=item)
    
    context = {
        'form': form,
        'item': item,
        'title': f'Edit Inventory Item: {item.name}',
        'submit_text': 'Update Item'
    }
    
    return render(request, 'form_page.html', context)


def view_session(request, session_id):
    if not request.user.is_authenticated:
        return redirect('login')
    
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        organization = user_profile.organization
    except UserProfile.DoesNotExist:
        messages.error(request, 'User profile not found. Please contact administrator.')
        return redirect('home')
    
    try:
        session = Session.objects.get(id=session_id, organization=organization)
    except Session.DoesNotExist:
        messages.error(request, 'Session not found.')
        return redirect('appointments')
    
    # Get related job cards
    job_cards = session.job_cards.all().order_by('-created_at')
    
    context = {
        'session': session,
        'job_cards': job_cards,
        'title': f'View Session: {session.session_number}',
    }
    
    return render(request, 'session_detail.html', context)


def edit_session(request, session_id):
    if not request.user.is_authenticated:
        return redirect('login')
    
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        organization = user_profile.organization
    except UserProfile.DoesNotExist:
        messages.error(request, 'User profile not found. Please contact administrator.')
        return redirect('home')
    
    try:
        session = Session.objects.get(id=session_id, organization=organization)
    except Session.DoesNotExist:
        messages.error(request, 'Session not found.')
        return redirect('appointments')
    
    if request.method == 'POST':
        form = SessionForm(request.POST, instance=session, organization=organization)
        if form.is_valid():
            form.save()
            messages.success(request, f'Session "{session.session_number}" has been updated successfully!')
            return redirect('appointments')
    else:
        form = SessionForm(instance=session, organization=organization)
    
    context = {
        'form': form,
        'session': session,
        'title': f'Edit Session: {session.session_number}',
        'submit_text': 'Update Session'
    }
    
    return render(request, 'form_page.html', context)


def export_reports_csv(request):
    if not request.user.is_authenticated:
        return redirect('login')
    
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        organization = user_profile.organization
    except UserProfile.DoesNotExist:
        return redirect('home')
    
    # Get current date and time
    now = timezone.now()
    today = now.date()
    this_month = today.replace(day=1)
    this_year = today.replace(month=1, day=1)
    
    # Create the HttpResponse object with CSV header
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="gixat_reports_{today}.csv"'
    
    writer = csv.writer(response)
    
    # Write report header
    writer.writerow(['Gixat Auto Repair Reports'])
    writer.writerow(['Generated on:', now.strftime('%Y-%m-%d %H:%M:%S')])
    writer.writerow(['Organization:', organization.name])
    writer.writerow([])
    
    # Revenue Summary
    writer.writerow(['REVENUE SUMMARY'])
    writer.writerow(['Period', 'Amount'])
    
    revenue_today = Session.objects.filter(
        organization=organization,
        status='completed',
        actual_end_time__date=today
    ).aggregate(total=Sum('actual_cost'))['total'] or 0
    
    revenue_this_month = Session.objects.filter(
        organization=organization,
        status='completed',
        actual_end_time__date__gte=this_month
    ).aggregate(total=Sum('actual_cost'))['total'] or 0
    
    revenue_this_year = Session.objects.filter(
        organization=organization,
        status='completed',
        actual_end_time__date__gte=this_year
    ).aggregate(total=Sum('actual_cost'))['total'] or 0
    
    writer.writerow(['Today', f'${revenue_today:.2f}'])
    writer.writerow(['This Month', f'${revenue_this_month:.2f}'])
    writer.writerow(['This Year', f'${revenue_this_year:.2f}'])
    writer.writerow([])
    
    # Session Statistics
    writer.writerow(['SESSION STATISTICS'])
    total_sessions = Session.objects.filter(organization=organization).count()
    completed_sessions = Session.objects.filter(organization=organization, status='completed').count()
    completion_rate = (completed_sessions / total_sessions * 100) if total_sessions > 0 else 0
    
    writer.writerow(['Total Sessions', total_sessions])
    writer.writerow(['Completed Sessions', completed_sessions])
    writer.writerow(['Completion Rate', f'{completion_rate:.1f}%'])
    writer.writerow([])
    
    # Popular Services
    writer.writerow(['POPULAR SERVICES'])
    writer.writerow(['Service', 'Jobs Completed', 'Revenue'])
    
    popular_services = JobCard.objects.filter(
        session__organization=organization,
        status='completed'
    ).values('title').annotate(
        count=Count('id'),
        revenue=Sum(F('parts_cost') + F('labor_cost'))
    ).order_by('-count')[:10]
    
    for service in popular_services:
        writer.writerow([service['title'], service['count'], f'${service["revenue"]:.2f}'])
    
    writer.writerow([])
    
    # Technician Performance
    writer.writerow(['TECHNICIAN PERFORMANCE'])
    writer.writerow(['Technician', 'Sessions Completed', 'Total Revenue'])
    
    technician_performance = UserProfile.objects.filter(
        organization=organization,
        role__in=['technician', 'manager']
    ).annotate(
        sessions_completed=Count('session', filter=Q(session__status='completed')),
        total_revenue=Sum('session__actual_cost', filter=Q(session__status='completed'))
    ).order_by('-sessions_completed')
    
    for tech in technician_performance:
        writer.writerow([
            f'{tech.user.first_name} {tech.user.last_name}',
            tech.sessions_completed,
            f'${tech.total_revenue or 0:.2f}'
        ])
    
    writer.writerow([])
    
    # Monthly Revenue Trend
    writer.writerow(['MONTHLY REVENUE TREND (Last 12 Months)'])
    writer.writerow(['Month', 'Revenue'])
    
    for i in range(11, -1, -1):
        month_start = (now - timedelta(days=30*i)).replace(day=1)
        month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        revenue = Session.objects.filter(
            organization=organization,
            status='completed',
            actual_end_time__date__gte=month_start,
            actual_end_time__date__lte=month_end
        ).aggregate(total=Sum('actual_cost'))['total'] or 0
        writer.writerow([month_start.strftime('%B %Y'), f'${revenue:.2f}'])
    
    return response


def export_reports_excel(request):
    if not request.user.is_authenticated:
        return redirect('login')
    
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        organization = user_profile.organization
    except UserProfile.DoesNotExist:
        return redirect('home')
    
    # Get current date and time
    now = timezone.now()
    today = now.date()
    this_month = today.replace(day=1)
    this_year = today.replace(month=1, day=1)
    
    # Create workbook
    wb = openpyxl.Workbook()
    
    # Revenue Summary Sheet
    ws_revenue = wb.active
    ws_revenue.title = "Revenue Summary"
    
    # Header styling
    header_font = Font(bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="366092", end_color="366092", fill_type="solid")
    border = Border(left=Side(style='thin'), right=Side(style='thin'), top=Side(style='thin'), bottom=Side(style='thin'))
    
    # Title
    ws_revenue['A1'] = 'Gixat Auto Repair Reports'
    ws_revenue['A1'].font = Font(bold=True, size=16)
    ws_revenue['A2'] = f'Generated on: {now.strftime("%Y-%m-%d %H:%M:%S")}'
    ws_revenue['A3'] = f'Organization: {organization.name}'
    
    # Revenue data
    ws_revenue['A5'] = 'Period'
    ws_revenue['B5'] = 'Amount'
    ws_revenue['A5'].font = header_font
    ws_revenue['B5'].font = header_font
    ws_revenue['A5'].fill = header_fill
    ws_revenue['B5'].fill = header_fill
    
    revenue_today = Session.objects.filter(
        organization=organization,
        status='completed',
        actual_end_time__date=today
    ).aggregate(total=Sum('actual_cost'))['total'] or 0
    
    revenue_this_month = Session.objects.filter(
        organization=organization,
        status='completed',
        actual_end_time__date__gte=this_month
    ).aggregate(total=Sum('actual_cost'))['total'] or 0
    
    revenue_this_year = Session.objects.filter(
        organization=organization,
        status='completed',
        actual_end_time__date__gte=this_year
    ).aggregate(total=Sum('actual_cost'))['total'] or 0
    
    ws_revenue['A6'] = 'Today'
    ws_revenue['B6'] = revenue_today
    ws_revenue['B6'].number_format = '$#,##0.00'
    
    ws_revenue['A7'] = 'This Month'
    ws_revenue['B7'] = revenue_this_month
    ws_revenue['B7'].number_format = '$#,##0.00'
    
    ws_revenue['A8'] = 'This Year'
    ws_revenue['B8'] = revenue_this_year
    ws_revenue['B8'].number_format = '$#,##0.00'
    
    # Services Sheet
    ws_services = wb.create_sheet("Popular Services")
    ws_services['A1'] = 'Popular Services'
    ws_services['A1'].font = Font(bold=True, size=14)
    
    ws_services['A3'] = 'Service'
    ws_services['B3'] = 'Jobs Completed'
    ws_services['C3'] = 'Revenue'
    for cell in ['A3', 'B3', 'C3']:
        ws_services[cell].font = header_font
        ws_services[cell].fill = header_fill
    
    popular_services = JobCard.objects.filter(
        session__organization=organization,
        status='completed'
    ).values('title').annotate(
        count=Count('id'),
        revenue=Sum(F('parts_cost') + F('labor_cost'))
    ).order_by('-count')[:10]
    
    row = 4
    for service in popular_services:
        ws_services[f'A{row}'] = service['title']
        ws_services[f'B{row}'] = service['count']
        ws_services[f'C{row}'] = service['revenue']
        ws_services[f'C{row}'].number_format = '$#,##0.00'
        row += 1
    
    # Technicians Sheet
    ws_tech = wb.create_sheet("Technician Performance")
    ws_tech['A1'] = 'Technician Performance'
    ws_tech['A1'].font = Font(bold=True, size=14)
    
    ws_tech['A3'] = 'Technician'
    ws_tech['B3'] = 'Sessions Completed'
    ws_tech['C3'] = 'Total Revenue'
    for cell in ['A3', 'B3', 'C3']:
        ws_tech[cell].font = header_font
        ws_tech[cell].fill = header_fill
    
    technician_performance = UserProfile.objects.filter(
        organization=organization,
        role__in=['technician', 'manager']
    ).annotate(
        sessions_completed=Count('session', filter=Q(session__status='completed')),
        total_revenue=Sum('session__actual_cost', filter=Q(session__status='completed'))
    ).order_by('-sessions_completed')
    
    row = 4
    for tech in technician_performance:
        ws_tech[f'A{row}'] = f'{tech.user.first_name} {tech.user.last_name}'
        ws_tech[f'B{row}'] = tech.sessions_completed
        ws_tech[f'C{row}'] = tech.total_revenue or 0
        ws_tech[f'C{row}'].number_format = '$#,##0.00'
        row += 1
    
    # Monthly Trend Sheet
    ws_trend = wb.create_sheet("Monthly Revenue Trend")
    ws_trend['A1'] = 'Monthly Revenue Trend (Last 12 Months)'
    ws_trend['A1'].font = Font(bold=True, size=14)
    
    ws_trend['A3'] = 'Month'
    ws_trend['B3'] = 'Revenue'
    for cell in ['A3', 'B3']:
        ws_trend[cell].font = header_font
        ws_trend[cell].fill = header_fill
    
    row = 4
    for i in range(11, -1, -1):
        month_start = (now - timedelta(days=30*i)).replace(day=1)
        month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        revenue = Session.objects.filter(
            organization=organization,
            status='completed',
            actual_end_time__date__gte=month_start,
            actual_end_time__date__lte=month_end
        ).aggregate(total=Sum('actual_cost'))['total'] or 0
        
        ws_trend[f'A{row}'] = month_start.strftime('%B %Y')
        ws_trend[f'B{row}'] = revenue
        ws_trend[f'B{row}'].number_format = '$#,##0.00'
        row += 1
    
    # Auto-adjust column widths
    for ws in [ws_revenue, ws_services, ws_tech, ws_trend]:
        for column in ws.columns:
            max_length = 0
            column_letter = column[0].column_letter
            for cell in column:
                try:
                    if len(str(cell.value)) > max_length:
                        max_length = len(str(cell.value))
                except:
                    pass
            adjusted_width = (max_length + 2)
            ws.column_dimensions[column_letter].width = adjusted_width
    
    # Create response
    response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    response['Content-Disposition'] = f'attachment; filename="gixat_reports_{today}.xlsx"'
    
    wb.save(response)
    return response


def export_reports_pdf(request):
    if not request.user.is_authenticated:
        return redirect('login')
    
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        organization = user_profile.organization
    except UserProfile.DoesNotExist:
        return redirect('home')
    
    # Get current date and time
    now = timezone.now()
    today = now.date()
    this_month = today.replace(day=1)
    this_year = today.replace(month=1, day=1)
    
    # Create PDF response
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="gixat_reports_{today}.pdf"'
    
    # Create PDF document
    doc = SimpleDocTemplate(response, pagesize=A4)
    elements = []
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        alignment=1  # Center alignment
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Heading2'],
        fontSize=16,
        spaceAfter=20,
    )
    
    normal_style = styles['Normal']
    
    # Title
    elements.append(Paragraph("Gixat Auto Repair Reports", title_style))
    elements.append(Paragraph(f"Generated on: {now.strftime('%Y-%m-%d %H:%M:%S')}", normal_style))
    elements.append(Paragraph(f"Organization: {organization.name}", normal_style))
    elements.append(Spacer(1, 20))
    
    # Revenue Summary
    elements.append(Paragraph("Revenue Summary", subtitle_style))
    
    revenue_today = Session.objects.filter(
        organization=organization,
        status='completed',
        actual_end_time__date=today
    ).aggregate(total=Sum('actual_cost'))['total'] or 0
    
    revenue_this_month = Session.objects.filter(
        organization=organization,
        status='completed',
        actual_end_time__date__gte=this_month
    ).aggregate(total=Sum('actual_cost'))['total'] or 0
    
    revenue_this_year = Session.objects.filter(
        organization=organization,
        status='completed',
        actual_end_time__date__gte=this_year
    ).aggregate(total=Sum('actual_cost'))['total'] or 0
    
    revenue_data = [
        ['Period', 'Amount'],
        ['Today', f'${revenue_today:.2f}'],
        ['This Month', f'${revenue_this_month:.2f}'],
        ['This Year', f'${revenue_this_year:.2f}']
    ]
    
    revenue_table = Table(revenue_data)
    revenue_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 14),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(revenue_table)
    elements.append(Spacer(1, 20))
    
    # Session Statistics
    elements.append(Paragraph("Session Statistics", subtitle_style))
    
    total_sessions = Session.objects.filter(organization=organization).count()
    completed_sessions = Session.objects.filter(organization=organization, status='completed').count()
    completion_rate = (completed_sessions / total_sessions * 100) if total_sessions > 0 else 0
    
    stats_data = [
        ['Metric', 'Value'],
        ['Total Sessions', str(total_sessions)],
        ['Completed Sessions', str(completed_sessions)],
        ['Completion Rate', f'{completion_rate:.1f}%']
    ]
    
    stats_table = Table(stats_data)
    stats_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(stats_table)
    elements.append(Spacer(1, 20))
    
    # Popular Services
    elements.append(Paragraph("Popular Services", subtitle_style))
    
    popular_services = JobCard.objects.filter(
        session__organization=organization,
        status='completed'
    ).values('title').annotate(
        count=Count('id'),
        revenue=Sum(F('parts_cost') + F('labor_cost'))
    ).order_by('-count')[:10]
    
    services_data = [['Service', 'Jobs Completed', 'Revenue']]
    for service in popular_services:
        services_data.append([
            service['title'],
            str(service['count']),
            f'${service["revenue"]:.2f}'
        ])
    
    services_table = Table(services_data)
    services_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(services_table)
    elements.append(Spacer(1, 20))
    
    # Technician Performance
    elements.append(Paragraph("Technician Performance", subtitle_style))
    
    technician_performance = UserProfile.objects.filter(
        organization=organization,
        role__in=['technician', 'manager']
    ).annotate(
        sessions_completed=Count('session', filter=Q(session__status='completed')),
        total_revenue=Sum('session__actual_cost', filter=Q(session__status='completed'))
    ).order_by('-sessions_completed')
    
    tech_data = [['Technician', 'Sessions Completed', 'Total Revenue']]
    for tech in technician_performance:
        tech_data.append([
            f'{tech.user.first_name} {tech.user.last_name}',
            str(tech.sessions_completed),
            f'${tech.total_revenue or 0:.2f}'
        ])
    
    tech_table = Table(tech_data)
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(tech_table)
    
    # Monthly Trend Sheet
    ws_trend = wb.create_sheet("Monthly Revenue Trend")
    ws_trend['A1'] = 'Monthly Revenue Trend (Last 12 Months)'
    ws_trend['A1'].font = Font(bold=True, size=14)
    
    ws_trend['A3'] = 'Month'
    ws_trend['B3'] = 'Revenue'
    for cell in ['A3', 'B3']:
        ws_trend[cell].font = header_font
        ws_trend[cell].fill = header_fill
    
    row = 4
    for i in range(11, -1, -1):
        month_start = (now - timedelta(days=30*i)).replace(day=1)
        month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        revenue = Session.objects.filter(
            organization=organization,
            status='completed',
            actual_end_time__date__gte=month_start,
            actual_end_time__date__lte=month_end
        ).aggregate(total=Sum('actual_cost'))['total'] or 0
        
        ws_trend[f'A{row}'] = month_start.strftime('%B %Y')
        ws_trend[f'B{row}'] = revenue
        ws_trend[f'B{row}'].number_format = '$#,##0.00'
        row += 1
    
    # Auto-adjust column widths
    for ws in [ws_revenue, ws_services, ws_tech, ws_trend]:
        for column in ws.columns:
            max_length = 0
            column_letter = column[0].column_letter
            for cell in column:
                try:
                    if len(str(cell.value)) > max_length:
                        max_length = len(str(cell.value))
                except:
                    pass
            adjusted_width = (max_length + 2)
            ws.column_dimensions[column_letter].width = adjusted_width
    
    # Create response
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="gixat_reports_{today}.pdf"'
    
    # Build PDF
    doc.build(elements)
    
    return response


class CustomLoginView(LoginView):
    template_name = 'login.html'
    form_class = CustomLoginForm
    
    def get_success_url(self):
        return reverse_lazy('dashboard')
    
    def form_valid(self, form):
        messages.success(self.request, f'Welcome back, {form.get_user().get_full_name()}!')
        return super().form_valid(form)

