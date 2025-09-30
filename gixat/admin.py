from django.contrib import admin
from .models import Organization, UserProfile, Client, Car, Session, JobCard, Inventory, InventoryTransaction


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'email', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'email', 'registration_number']
    list_editable = ['is_active']


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['get_full_name', 'organization', 'role', 'employee_id', 'is_active']
    list_filter = ['role', 'organization', 'is_active', 'hire_date']
    search_fields = ['user__first_name', 'user__last_name', 'user__email', 'employee_id']
    list_editable = ['is_active']
    
    def get_full_name(self, obj):
        return obj.user.get_full_name()
    get_full_name.short_description = 'Full Name'


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'phone', 'organization', 'is_active', 'created_at']
    list_filter = ['organization', 'is_active', 'created_at']
    search_fields = ['first_name', 'last_name', 'email', 'phone']
    list_editable = ['is_active']


@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'client', 'year', 'color', 'fuel_type', 'mileage', 'is_active']
    list_filter = ['make', 'fuel_type', 'year', 'organization', 'is_active']
    search_fields = ['make', 'model', 'license_plate', 'vin', 'client__first_name', 'client__last_name']
    list_editable = ['is_active']


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ['session_number', 'car', 'technician_name', 'status', 'scheduled_date', 'actual_cost']
    list_filter = ['status', 'organization', 'scheduled_date', 'technician']
    search_fields = ['session_number', 'car__license_plate', 'car__make', 'car__model', 'technician__user__first_name']
    list_editable = ['status']
    date_hierarchy = 'scheduled_date'
    
    def technician_name(self, obj):
        return obj.technician.user.get_full_name()
    technician_name.short_description = 'Technician'


@admin.register(JobCard)
class JobCardAdmin(admin.ModelAdmin):
    list_display = ['job_number', 'title', 'session', 'assigned_technician_name', 'priority', 'status', 'total_cost']
    list_filter = ['status', 'priority', 'assigned_technician', 'created_at']
    search_fields = ['job_number', 'title', 'description', 'session__session_number']
    list_editable = ['status', 'priority']
    date_hierarchy = 'created_at'
    
    def assigned_technician_name(self, obj):
        return obj.assigned_technician.user.get_full_name()
    assigned_technician_name.short_description = 'Assigned Technician'


@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ['part_number', 'name', 'category', 'quantity', 'min_quantity', 'unit_price', 'is_low_stock', 'is_active']
    list_filter = ['category', 'organization', 'is_active', 'created_at']
    search_fields = ['part_number', 'name', 'description', 'supplier']
    list_editable = ['quantity', 'min_quantity', 'unit_price', 'is_active']
    
    def is_low_stock(self, obj):
        return obj.is_low_stock
    is_low_stock.boolean = True
    is_low_stock.short_description = 'Low Stock'


@admin.register(InventoryTransaction)
class InventoryTransactionAdmin(admin.ModelAdmin):
    list_display = ['inventory_item', 'transaction_type', 'quantity', 'unit_price', 'session', 'created_by', 'created_at']
    list_filter = ['transaction_type', 'organization', 'created_at']
    search_fields = ['inventory_item__name', 'inventory_item__part_number', 'session__session_number', 'notes']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'