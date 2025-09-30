# """
# Optimized views with pagination and performance improvements
# """
# from django.shortcuts import render, redirect, get_object_or_404
# from django.contrib.auth.decorators import login_required
# from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
# from django.contrib import messages
# from django.db.models import Q, F, Count, Sum, Avg
# from django.views.decorators.cache import cache_page
# from django.views.decorators.vary import vary_on_headers
# from django.utils.decorators import method_decorator
# from django.views.generic import ListView
# from django.contrib.auth.mixins import LoginRequiredMixin
# from gixat.models import (
#     Organization, UserProfile, Client, Car, Session, 
#     JobCard, Inventory, Inspection, Notification
# )
# from gixat.utils.query_optimization import (
#     OptimizedQueryMixin, CacheOptimizedMixin, QueryAnalyzer
# )


# class OptimizedListView(LoginRequiredMixin, ListView, OptimizedQueryMixin):
#     """
#     Base optimized list view with pagination and caching
#     """
#     paginate_by = 25
#     template_name = None
#     context_object_name = 'objects'
    
#     def get_organization(self):
#         """Get user's organization"""
#         try:
#             user_profile = UserProfile.objects.select_related('organization').get(
#                 user=self.request.user
#             )
#             return user_profile.organization, user_profile
#         except UserProfile.DoesNotExist:
#             messages.error(self.request, 'User profile not found. Please contact administrator.')
#             return None, None
    
#     def get_queryset(self):
#         """Override in subclasses"""
#         return self.model.objects.none()
    
#     def get_context_data(self, **kwargs):
#         context = super().get_context_data(**kwargs)
#         organization, user_profile = self.get_organization()
        
#         if organization:
#             context.update({
#                 'organization': organization,
#                 'user_profile': user_profile,
#                 'total_count': self.get_queryset().count(),
#             })
        
#         return context


# class OptimizedSessionListView(OptimizedListView):
#     """
#     Optimized session list view with pagination and filtering
#     """
#     model = Session
#     template_name = 'repair_sessions.html'
#     context_object_name = 'sessions'
#     paginate_by = 20
    
#     def get_queryset(self):
#         organization, user_profile = self.get_organization()
#         if not organization:
#             return Session.objects.none()
        
#         # Use optimized query
#         queryset = self.get_optimized_sessions(
#             organization_id=organization.id,
#             user_profile=user_profile
#         )
        
#         # Apply filters
#         status_filter = self.request.GET.get('status')
#         if status_filter:
#             queryset = queryset.filter(status=status_filter)
        
#         search_query = self.request.GET.get('search')
#         if search_query:
#             queryset = queryset.filter(
#                 Q(session_number__icontains=search_query) |
#                 Q(car__make__icontains=search_query) |
#                 Q(car__model__icontains=search_query) |
#                 Q(car__license_plate__icontains=search_query) |
#                 Q(car__client__first_name__icontains=search_query) |
#                 Q(car__client__last_name__icontains=search_query)
#             )
        
#         return queryset
    
#     def get_context_data(self, **kwargs):
#         context = super().get_context_data(**kwargs)
#         organization, user_profile = self.get_organization()
        
#         if organization:
#             # Get status counts efficiently
#             status_counts = Session.objects.filter(
#                 organization=organization
#             ).values('status').annotate(count=Count('id'))
            
#             status_dict = {item['status']: item['count'] for item in status_counts}
            
#             context.update({
#                 'status_filter': self.request.GET.get('status'),
#                 'search_query': self.request.GET.get('search'),
#                 'active_sessions': status_dict.get('in_progress', 0),
#                 'pending_sessions': status_dict.get('scheduled', 0),
#                 'completed_sessions': status_dict.get('completed', 0),
#                 'cancelled_sessions': status_dict.get('cancelled', 0),
#             })
        
#         return context


# class OptimizedInventoryListView(OptimizedListView):
#     """
#     Optimized inventory list view
#     """
#     model = Inventory
#     template_name = 'inventory.html'
#     context_object_name = 'inventory_items'
#     paginate_by = 30
    
#     def get_queryset(self):
#         organization, _ = self.get_organization()
#         if not organization:
#             return Inventory.objects.none()
        
#         queryset = self.get_optimized_inventory(organization.id)
        
#         # Apply filters
#         category_filter = self.request.GET.get('category')
#         if category_filter:
#             queryset = queryset.filter(category=category_filter)
        
#         low_stock_filter = self.request.GET.get('low_stock')
#         if low_stock_filter == 'true':
#             queryset = queryset.filter(quantity__lte=F('min_quantity'))
        
#         search_query = self.request.GET.get('search')
#         if search_query:
#             queryset = queryset.filter(
#                 Q(name__icontains=search_query) |
#                 Q(part_number__icontains=search_query) |
#                 Q(category__icontains=search_query)
#             )
        
#         # Sorting
#         sort_by = self.request.GET.get('sort', 'name')
#         if sort_by in ['name', 'part_number', 'category', 'quantity', 'unit_price']:
#             if self.request.GET.get('order') == 'desc':
#                 sort_by = f'-{sort_by}'
#             queryset = queryset.order_by(sort_by)
        
#         return queryset
    
#     def get_context_data(self, **kwargs):
#         context = super().get_context_data(**kwargs)
#         organization, _ = self.get_organization()
        
#         if organization:
#             # Get inventory statistics
#             inventory_stats = Inventory.objects.filter(
#                 organization=organization
#             ).aggregate(
#                 total_items=Count('id'),
#                 total_value=Sum(F('quantity') * F('unit_price')),
#                 low_stock_count=Count('id', filter=Q(quantity__lte=F('min_quantity'))),
#                 categories_count=Count('category', distinct=True)
#             )
            
#             # Get categories for filter
#             categories = Inventory.objects.filter(
#                 organization=organization
#             ).values_list('category', flat=True).distinct().order_by('category')
            
#             context.update({
#                 'category_filter': self.request.GET.get('category'),
#                 'low_stock_filter': self.request.GET.get('low_stock'),
#                 'search_query': self.request.GET.get('search'),
#                 'sort_by': self.request.GET.get('sort', 'name'),
#                 'order': self.request.GET.get('order', 'asc'),
#                 'categories': list(categories),
#                 **inventory_stats
#             })
        
#         return context


# @login_required
# def optimized_dashboard(request):
#     """
#     Optimized dashboard view with caching
#     """
#     try:
#         user_profile = UserProfile.objects.select_related('organization').get(
#             user=request.user
#         )
#         organization = user_profile.organization
#     except UserProfile.DoesNotExist:
#         messages.error(request, 'User profile not found. Please contact administrator.')
#         return redirect('home')
    
#     # Get dashboard data with optimized queries
#     dashboard_data = OptimizedQueryMixin.get_dashboard_data(
#         organization.id, user_profile
#     )
    
#     # Get cached statistics
#     cached_stats = CacheOptimizedMixin.get_cached_dashboard_stats(
#         organization.id
#     )
    
#     context = {
#         'organization': organization,
#         'user_profile': user_profile,
#         **dashboard_data,
#         **cached_stats,
#     }
    
#     return render(request, 'dashboard.html', context)


# @login_required
# def paginated_repair_sessions(request):
#     """
#     Paginated repair sessions view
#     """
#     try:
#         user_profile = UserProfile.objects.select_related('organization').get(
#             user=request.user
#         )
#         organization = user_profile.organization
#     except UserProfile.DoesNotExist:
#         messages.error(request, 'User profile not found. Please contact administrator.')
#         return redirect('home')
    
#     # Get optimized queryset
#     sessions_queryset = OptimizedQueryMixin.get_optimized_sessions(
#         organization_id=organization.id,
#         user_profile=user_profile if user_profile.role == 'technician' else None
#     )
    
#     # Apply filters
#     status_filter = request.GET.get('status')
#     if status_filter:
#         sessions_queryset = sessions_queryset.filter(status=status_filter)
    
#     search_query = request.GET.get('search')
#     if search_query:
#         sessions_queryset = sessions_queryset.filter(
#             Q(session_number__icontains=search_query) |
#             Q(car__make__icontains=search_query) |
#             Q(car__model__icontains=search_query) |
#             Q(car__license_plate__icontains=search_query) |
#             Q(car__client__first_name__icontains=search_query) |
#             Q(car__client__last_name__icontains=search_query)
#         )
    
#     # Pagination
#     paginator = Paginator(sessions_queryset, 20)  # 20 sessions per page
#     page = request.GET.get('page')
    
#     try:
#         sessions = paginator.page(page)
#     except PageNotAnInteger:
#         sessions = paginator.page(1)
#     except EmptyPage:
#         sessions = paginator.page(paginator.num_pages)
    
#     # Get status counts
#     status_counts = Session.objects.filter(
#         organization=organization
#     ).values('status').annotate(count=Count('id'))
    
#     status_dict = {item['status']: item['count'] for item in status_counts}
    
#     context = {
#         'sessions': sessions,
#         'organization': organization,
#         'user_profile': user_profile,
#         'status_filter': status_filter,
#         'search_query': search_query,
#         'total_sessions': sessions_queryset.count(),
#         'active_sessions': status_dict.get('in_progress', 0),
#         'pending_sessions': status_dict.get('scheduled', 0),
#         'completed_sessions': status_dict.get('completed', 0),
#     }
    
#     return render(request, 'repair_sessions.html', context)


# @login_required
# def paginated_inventory_view(request):
#     """
#     Paginated inventory view with filtering and sorting
#     """
#     try:
#         user_profile = UserProfile.objects.select_related('organization').get(
#             user=request.user
#         )
#         organization = user_profile.organization
#     except UserProfile.DoesNotExist:
#         messages.error(request, 'User profile not found. Please contact administrator.')
#         return redirect('home')
    
#     # Get base queryset
#     inventory_queryset = OptimizedQueryMixin.get_optimized_inventory(organization.id)
    
#     # Apply filters
#     category_filter = request.GET.get('category')
#     if category_filter:
#         inventory_queryset = inventory_queryset.filter(category=category_filter)
    
#     low_stock_filter = request.GET.get('low_stock')
#     if low_stock_filter == 'true':
#         inventory_queryset = inventory_queryset.filter(quantity__lte=F('min_quantity'))
    
#     search_query = request.GET.get('search')
#     if search_query:
#         inventory_queryset = inventory_queryset.filter(
#             Q(name__icontains=search_query) |
#             Q(part_number__icontains=search_query) |
#             Q(category__icontains=search_query)
#         )
    
#     # Sorting
#     sort_by = request.GET.get('sort', 'name')
#     order = request.GET.get('order', 'asc')
    
#     if sort_by in ['name', 'part_number', 'category', 'quantity', 'unit_price']:
#         if order == 'desc':
#             sort_by = f'-{sort_by}'
#         inventory_queryset = inventory_queryset.order_by(sort_by)
    
#     # Pagination
#     paginator = Paginator(inventory_queryset, 30)  # 30 items per page
#     page = request.GET.get('page')
    
#     try:
#         inventory_items = paginator.page(page)
#     except PageNotAnInteger:
#         inventory_items = paginator.page(1)
#     except EmptyPage:
#         inventory_items = paginator.page(paginator.num_pages)
    
#     # Get statistics
#     inventory_stats = Inventory.objects.filter(
#         organization=organization
#     ).aggregate(
#         total_items=Count('id'),
#         total_value=Sum(F('quantity') * F('unit_price')),
#         low_stock_count=Count('id', filter=Q(quantity__lte=F('min_quantity')))
#     )
    
#     # Get categories for filter
#     categories = Inventory.objects.filter(
#         organization=organization
#     ).values_list('category', flat=True).distinct().order_by('category')
    
#     context = {
#         'inventory_items': inventory_items,
#         'organization': organization,
#         'user_profile': user_profile,
#         'category_filter': category_filter,
#         'low_stock_filter': low_stock_filter,
#         'search_query': search_query,
#         'sort_by': request.GET.get('sort', 'name'),
#         'order': order,
#         'categories': list(categories),
#         **inventory_stats
#     }
    
#     return render(request, 'inventory.html', context)


# @cache_page(60 * 5)  # Cache for 5 minutes
# @vary_on_headers('User-Agent')
# def cached_reports_view(request):
#     """
#     Cached reports view for better performance
#     """
#     if not request.user.is_authenticated:
#         return redirect('login')
    
#     try:
#         user_profile = UserProfile.objects.select_related('organization').get(
#             user=request.user
#         )
#         organization = user_profile.organization
#     except UserProfile.DoesNotExist:
#         messages.error(request, 'User profile not found. Please contact administrator.')
#         return redirect('home')
    
#     # Get cached statistics
#     stats = CacheOptimizedMixin.get_cached_dashboard_stats(organization.id)
    
#     # Additional report data
#     from django.utils import timezone
#     from datetime import timedelta
    
#     today = timezone.now().date()
#     week_ago = today - timedelta(days=7)
#     month_ago = today - timedelta(days=30)
    
#     # Weekly trends
#     weekly_data = Session.objects.filter(
#         organization=organization,
#         created_at__date__gte=week_ago
#     ).extra(
#         select={'day': 'date(created_at)'}
#     ).values('day').annotate(
#         count=Count('id'),
#         revenue=Sum('actual_cost', filter=Q(status='completed'))
#     ).order_by('day')
    
#     context = {
#         'organization': organization,
#         'user_profile': user_profile,
#         'weekly_data': list(weekly_data),
#         **stats
#     }
    
#     return render(request, 'reports.html', context)