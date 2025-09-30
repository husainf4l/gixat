"""
Query optimization utilities
"""
from django.db.models import QuerySet, Prefetch
from django.db.models.query import ModelIterable
from gixat.models import (
    Organization, UserProfile, Client, Car, Session, 
    JobCard, Inventory, Inspection, Notification
)


class OptimizedQueryMixin:
    """
    Mixin to provide optimized query methods for views
    """
    
    @staticmethod
    def get_optimized_sessions(organization_id=None, user_profile=None):
        """
        Get sessions with optimized queries using select_related and prefetch_related
        """
        queryset = Session.objects.select_related(
            'organization',
            'car',
            'car__client',
            'technician',
            'technician__user'
        ).prefetch_related(
            Prefetch(
                'jobcard_set',
                queryset=JobCard.objects.select_related('assigned_technician', 'assigned_technician__user')
            )
        )
        
        if organization_id:
            queryset = queryset.filter(organization_id=organization_id)
        
        if user_profile and user_profile.role == 'technician':
            queryset = queryset.filter(technician=user_profile)
        
        return queryset.order_by('-scheduled_date')
    
    @staticmethod
    def get_optimized_clients(organization_id):
        """
        Get clients with their cars in optimized way
        """
        return Client.objects.filter(
            organization_id=organization_id
        ).select_related('organization').prefetch_related(
            Prefetch(
                'car_set',
                queryset=Car.objects.select_related('client').order_by('make', 'model')
            )
        ).order_by('first_name', 'last_name')
    
    @staticmethod
    def get_optimized_inventory(organization_id):
        """
        Get inventory with optimized queries
        """
        return Inventory.objects.filter(
            organization_id=organization_id
        ).select_related('organization').order_by('category', 'name')
    
    @staticmethod
    def get_optimized_inspections(organization_id=None, user_profile=None):
        """
        Get inspections with optimized queries
        """
        queryset = Inspection.objects.select_related(
            'organization',
            'car',
            'car__client',
            'inspector',
            'inspector__user'
        ).prefetch_related('items')
        
        if organization_id:
            queryset = queryset.filter(organization_id=organization_id)
        
        if user_profile and user_profile.role == 'technician':
            queryset = queryset.filter(inspector=user_profile)
        
        return queryset.order_by('-scheduled_date')
    
    @staticmethod
    def get_optimized_notifications(user_id, organization_id):
        """
        Get notifications with optimized queries
        """
        return Notification.objects.filter(
            user_id=user_id,
            organization_id=organization_id
        ).select_related(
            'user',
            'organization',
            'related_session',
            'related_session__car',
            'related_inspection',
            'related_inventory'
        ).order_by('-created_at')
    
    @staticmethod
    def get_dashboard_data(organization_id, user_profile):
        """
        Get all dashboard data with optimized queries
        """
        from django.db.models import Count, Sum, Q
        from django.utils import timezone
        from datetime import timedelta
        
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        # Base querysets
        sessions_qs = Session.objects.filter(organization_id=organization_id)
        
        # KPI data with single queries
        kpi_data = {
            'total_cars_in_garage': sessions_qs.filter(
                status__in=['scheduled', 'in_progress']
            ).count(),
            
            'active_sessions': sessions_qs.filter(
                status='in_progress'
            ).count(),
            
            'pending_requests': sessions_qs.filter(
                status='scheduled'
            ).count(),
            
            'completed_today': sessions_qs.filter(
                status='completed',
                actual_end_time__date=today
            ).count(),
            
            'revenue_today': sessions_qs.filter(
                status='completed',
                actual_end_time__date=today
            ).aggregate(
                total=Sum('actual_cost')
            )['total'] or 0,
            
            'revenue_month': sessions_qs.filter(
                status='completed',
                actual_end_time__date__gte=month_ago
            ).aggregate(
                total=Sum('actual_cost')
            )['total'] or 0,
        }
        
        # Recent sessions with optimized query
        recent_sessions = OptimizedQueryMixin.get_optimized_sessions(
            organization_id=organization_id,
            user_profile=user_profile if user_profile.role == 'technician' else None
        )[:10]  # Limit to 10 recent sessions
        
        # Low stock items
        low_stock_items = Inventory.objects.filter(
            organization_id=organization_id,
            quantity__lte=F('min_quantity')
        ).select_related('organization')[:5]
        
        # Recent notifications
        recent_notifications = OptimizedQueryMixin.get_optimized_notifications(
            user_profile.user.id,
            organization_id
        ).filter(is_read=False)[:5]
        
        return {
            **kpi_data,
            'recent_sessions': recent_sessions,
            'low_stock_items': low_stock_items,
            'recent_notifications': recent_notifications,
        }


class CacheOptimizedMixin:
    """
    Mixin to provide caching functionality for expensive queries
    """
    
    @staticmethod
    def get_cached_dashboard_stats(organization_id, cache_timeout=300):
        """
        Get dashboard statistics with caching (5 minutes default)
        """
        from django.core.cache import cache
        
        cache_key = f"dashboard_stats_{organization_id}"
        stats = cache.get(cache_key)
        
        if stats is None:
            from django.db.models import Count, Sum, Avg
            from django.utils import timezone
            from datetime import timedelta
            
            today = timezone.now().date()
            month_ago = today - timedelta(days=30)
            
            sessions_qs = Session.objects.filter(organization_id=organization_id)
            
            stats = {
                'total_sessions': sessions_qs.count(),
                'completed_sessions': sessions_qs.filter(status='completed').count(),
                'average_session_cost': sessions_qs.filter(
                    status='completed'
                ).aggregate(avg=Avg('actual_cost'))['avg'] or 0,
                'monthly_revenue': sessions_qs.filter(
                    status='completed',
                    actual_end_time__date__gte=month_ago
                ).aggregate(total=Sum('actual_cost'))['total'] or 0,
                'inventory_count': Inventory.objects.filter(
                    organization_id=organization_id
                ).count(),
                'low_stock_count': Inventory.objects.filter(
                    organization_id=organization_id,
                    quantity__lte=F('min_quantity')
                ).count(),
            }
            
            cache.set(cache_key, stats, cache_timeout)
        
        return stats
    
    @staticmethod
    def invalidate_dashboard_cache(organization_id):
        """
        Invalidate dashboard cache when data changes
        """
        from django.core.cache import cache
        cache_key = f"dashboard_stats_{organization_id}"
        cache.delete(cache_key)
    
    @staticmethod
    def get_cached_user_permissions(user_id, cache_timeout=1800):
        """
        Get user permissions with caching (30 minutes default)
        """
        from django.core.cache import cache
        
        cache_key = f"user_permissions_{user_id}"
        permissions = cache.get(cache_key)
        
        if permissions is None:
            try:
                user_profile = UserProfile.objects.select_related(
                    'user', 'organization'
                ).get(user_id=user_id)
                
                permissions = {
                    'role': user_profile.role,
                    'organization_id': user_profile.organization.id,
                    'can_manage_inventory': user_profile.role in ['admin', 'manager'],
                    'can_create_sessions': user_profile.role in ['admin', 'manager', 'receptionist'],
                    'can_modify_sessions': user_profile.role in ['admin', 'manager', 'technician'],
                    'can_view_reports': user_profile.role in ['admin', 'manager'],
                    'can_manage_users': user_profile.role == 'admin',
                }
                
                cache.set(cache_key, permissions, cache_timeout)
            except UserProfile.DoesNotExist:
                permissions = {}
        
        return permissions
    
    @staticmethod
    def invalidate_user_cache(user_id):
        """
        Invalidate user cache when permissions change
        """
        from django.core.cache import cache
        cache_key = f"user_permissions_{user_id}"
        cache.delete(cache_key)


# Query optimization utilities
def optimize_queryset_for_list_view(queryset, select_related_fields=None, prefetch_related_fields=None):
    """
    Generic function to optimize querysets for list views
    """
    if select_related_fields:
        queryset = queryset.select_related(*select_related_fields)
    
    if prefetch_related_fields:
        queryset = queryset.prefetch_related(*prefetch_related_fields)
    
    return queryset


def get_optimized_session_queryset(organization_id=None, user_profile=None):
    """
    Get optimized queryset for sessions
    """
    return OptimizedQueryMixin.get_optimized_sessions(organization_id, user_profile)


# Database query analyzers
class QueryAnalyzer:
    """
    Utility class to analyze and log slow queries
    """
    
    @staticmethod
    def log_query_performance(queryset, operation_name="Unknown"):
        """
        Log query performance for analysis
        """
        import time
        import logging
        from django.db import connection
        
        logger = logging.getLogger('gixat.performance')
        
        start_time = time.time()
        initial_queries = len(connection.queries)
        
        # Execute the queryset
        list(queryset)  # Force evaluation
        
        end_time = time.time()
        final_queries = len(connection.queries)
        
        duration = end_time - start_time
        query_count = final_queries - initial_queries
        
        if duration > 0.1:  # Log if query takes more than 100ms
            logger.warning(
                f"Slow query detected - Operation: {operation_name}, "
                f"Duration: {duration:.3f}s, Query count: {query_count}"
            )
        
        return {
            'duration': duration,
            'query_count': query_count,
            'queries': connection.queries[initial_queries:final_queries]
        }


# Context processors for common data
def common_context(request):
    """
    Context processor to provide common optimized data to all templates
    """
    context = {}
    
    if request.user.is_authenticated:
        try:
            user_profile = UserProfile.objects.select_related(
                'organization'
            ).get(user=request.user)
            
            context.update({
                'user_profile': user_profile,
                'user_permissions': CacheOptimizedMixin.get_cached_user_permissions(
                    request.user.id
                ),
            })
            
            # Add unread notifications count
            unread_notifications = Notification.objects.filter(
                user=request.user,
                organization=user_profile.organization,
                is_read=False
            ).count()
            
            context['unread_notifications_count'] = unread_notifications
            
        except UserProfile.DoesNotExist:
            pass
    
    return context