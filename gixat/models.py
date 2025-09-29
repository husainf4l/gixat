from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.validators import FileExtensionValidator


class Organization(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    registration_number = models.CharField(max_length=50, unique=True, blank=True)
    timezone = models.CharField(max_length=50, default='UTC')
    currency = models.CharField(max_length=10, default='USD')
    auto_backup = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('manager', 'Manager'),
        ('technician', 'Technician'),
        ('receptionist', 'Receptionist'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='technician')
    phone = models.CharField(max_length=20, blank=True)
    employee_id = models.CharField(max_length=50, blank=True)
    hire_date = models.DateField(null=True, blank=True)
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.organization.name}"

    class Meta:
        ordering = ['user__first_name', 'user__last_name']


class Client(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20)
    address = models.TextField(blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    class Meta:
        ordering = ['first_name', 'last_name']


class Car(models.Model):
    FUEL_TYPE_CHOICES = [
        ('petrol', 'Petrol'),
        ('diesel', 'Diesel'),
        ('electric', 'Electric'),
        ('hybrid', 'Hybrid'),
    ]

    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    make = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    year = models.PositiveIntegerField()
    color = models.CharField(max_length=30, blank=True)
    license_plate = models.CharField(max_length=20, unique=True)
    vin = models.CharField(max_length=17, unique=True, blank=True)
    engine_number = models.CharField(max_length=50, blank=True)
    fuel_type = models.CharField(max_length=20, choices=FUEL_TYPE_CHOICES, default='petrol')
    mileage = models.PositiveIntegerField(default=0, help_text="Current mileage in kilometers")
    photo = models.ImageField(
        upload_to='vehicle_photos/',
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'gif'])],
        help_text="Upload a photo of the vehicle"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.make} {self.model} - {self.license_plate}"

    class Meta:
        ordering = ['make', 'model', 'year']


class Session(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    car = models.ForeignKey(Car, on_delete=models.CASCADE)
    technician = models.ForeignKey(UserProfile, on_delete=models.CASCADE, limit_choices_to={'role__in': ['technician', 'manager']})
    session_number = models.CharField(max_length=50, unique=True)
    scheduled_date = models.DateTimeField()
    actual_start_time = models.DateTimeField(null=True, blank=True)
    actual_end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    description = models.TextField(blank=True, help_text="Initial description of work to be done")
    notes = models.TextField(blank=True, help_text="Session notes and updates")
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    actual_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Session {self.session_number} - {self.car}"

    @property
    def duration(self):
        if self.actual_start_time and self.actual_end_time:
            return self.actual_end_time - self.actual_start_time
        return None

    def save(self, *args, **kwargs):
        if not self.session_number:
            # Generate session number
            today = timezone.now().date()
            prefix = f"SES{today.strftime('%Y%m%d')}"
            last_session = Session.objects.filter(session_number__startswith=prefix).order_by('-session_number').first()
            if last_session:
                last_num = int(last_session.session_number[-3:])
                new_num = last_num + 1
            else:
                new_num = 1
            self.session_number = f"{prefix}{new_num:03d}"
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-scheduled_date']


class JobCard(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('on_hold', 'On Hold'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='job_cards')
    job_number = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    assigned_technician = models.ForeignKey(UserProfile, on_delete=models.CASCADE, limit_choices_to={'role__in': ['technician', 'manager']})
    estimated_hours = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    actual_hours = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    parts_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    labor_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Job {self.job_number} - {self.title}"

    @property
    def total_cost(self):
        return self.parts_cost + self.labor_cost

    def save(self, *args, **kwargs):
        if not self.job_number:
            # Generate job number
            today = timezone.now().date()
            prefix = f"JOB{today.strftime('%Y%m%d')}"
            last_job = JobCard.objects.filter(job_number__startswith=prefix).order_by('-job_number').first()
            if last_job:
                last_num = int(last_job.job_number[-3:])
                new_num = last_num + 1
            else:
                new_num = 1
            self.job_number = f"{prefix}{new_num:03d}"
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-created_at']


class Inventory(models.Model):
    CATEGORY_CHOICES = [
        ('engine', 'Engine Parts'),
        ('transmission', 'Transmission'),
        ('brakes', 'Brakes'),
        ('suspension', 'Suspension'),
        ('electrical', 'Electrical'),
        ('body', 'Body Parts'),
        ('tires', 'Tires'),
        ('fluids', 'Fluids'),
        ('tools', 'Tools'),
        ('other', 'Other'),
    ]

    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    part_number = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    quantity = models.PositiveIntegerField(default=0)
    min_quantity = models.PositiveIntegerField(default=5, help_text="Minimum stock level before alert")
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    supplier = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=50, blank=True, help_text="Warehouse location")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.part_number} - {self.name}"

    @property
    def is_low_stock(self):
        return self.quantity <= self.min_quantity

    class Meta:
        ordering = ['name']


class Inspection(models.Model):
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('waiting_approval', 'Waiting for Client Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    car = models.ForeignKey(Car, on_delete=models.CASCADE)
    inspector = models.ForeignKey(UserProfile, on_delete=models.CASCADE, limit_choices_to={'role__in': ['technician', 'manager']})
    inspection_number = models.CharField(max_length=50, unique=True)
    scheduled_date = models.DateTimeField()
    actual_start_time = models.DateTimeField(null=True, blank=True)
    actual_end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    overall_condition = models.TextField(blank=True)
    recommendations = models.TextField(blank=True)
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    client_approved = models.BooleanField(null=True, blank=True)
    client_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Inspection {self.inspection_number} - {self.car}"

    def save(self, *args, **kwargs):
        if not self.inspection_number:
            # Generate inspection number
            today = timezone.now().date()
            prefix = f"INS{today.strftime('%Y%m%d')}"
            last_inspection = Inspection.objects.filter(inspection_number__startswith=prefix).order_by('-inspection_number').first()
            if last_inspection:
                last_num = int(last_inspection.inspection_number[-3:])
                new_num = last_num + 1
            else:
                new_num = 1
            self.inspection_number = f"{prefix}{new_num:03d}"
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-scheduled_date']


class InspectionItem(models.Model):
    CONDITION_CHOICES = [
        ('excellent', 'Excellent'),
        ('good', 'Good'),
        ('fair', 'Fair'),
        ('poor', 'Poor'),
        ('critical', 'Critical'),
    ]

    inspection = models.ForeignKey(Inspection, on_delete=models.CASCADE, related_name='items')
    component = models.CharField(max_length=100)
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='good')
    notes = models.TextField(blank=True)
    needs_repair = models.BooleanField(default=False)
    estimated_repair_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"{self.component} - {self.condition}"


class Notification(models.Model):
    TYPE_CHOICES = [
        ('info', 'Information'),
        ('warning', 'Warning'),
        ('error', 'Error'),
        ('success', 'Success'),
    ]

    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='info')
    is_read = models.BooleanField(default=False)
    related_session = models.ForeignKey(Session, on_delete=models.SET_NULL, null=True, blank=True)
    related_inspection = models.ForeignKey(Inspection, on_delete=models.SET_NULL, null=True, blank=True)
    related_inventory = models.ForeignKey(Inventory, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.user.username}"

    class Meta:
        ordering = ['-created_at']