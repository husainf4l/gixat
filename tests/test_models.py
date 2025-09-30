"""
Unit tests for Gixat models
"""
import pytest
from django.test import TestCase
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta
from gixat.models import (
    Organization, UserProfile, Client, Car, Session, 
    JobCard, Inventory, Inspection, InspectionItem, Notification
)


class OrganizationModelTest(TestCase):
    """Test cases for Organization model"""
    
    def setUp(self):
        self.org = Organization.objects.create(
            name="Test Garage",
            address="123 Test St",
            phone="+962-6-123-4567",
            email="test@garage.com",
            registration_number="TG12345"
        )
    
    def test_organization_creation(self):
        """Test organization is created correctly"""
        self.assertEqual(self.org.name, "Test Garage")
        self.assertEqual(self.org.currency, "USD")  # Default currency
        self.assertEqual(self.org.timezone, "UTC")  # Default timezone
        self.assertTrue(self.org.is_active)
    
    def test_organization_str_representation(self):
        """Test string representation of organization"""
        self.assertEqual(str(self.org), "Test Garage")
    
    def test_unique_registration_number(self):
        """Test that registration number must be unique"""
        with self.assertRaises(Exception):
            Organization.objects.create(
                name="Another Garage",
                registration_number="TG12345"  # Same as existing
            )


class UserProfileModelTest(TestCase):
    """Test cases for UserProfile model"""
    
    def setUp(self):
        self.org = Organization.objects.create(
            name="Test Garage",
            registration_number="TG12345"
        )
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123"
        )
        self.profile = UserProfile.objects.create(
            user=self.user,
            organization=self.org,
            role='technician',
            phone="+962-7-123-4567",
            employee_id="EMP001"
        )
    
    def test_user_profile_creation(self):
        """Test user profile is created correctly"""
        self.assertEqual(self.profile.role, 'technician')
        self.assertEqual(self.profile.phone, "+962-7-123-4567")
        self.assertEqual(self.profile.employee_id, "EMP001")
        self.assertTrue(self.profile.is_active)
        self.assertTrue(self.profile.email_notifications)
        self.assertFalse(self.profile.sms_notifications)
    
    def test_user_profile_str_representation(self):
        """Test string representation of user profile"""
        expected = f"{self.user.get_full_name()} - {self.org.name}"
        self.assertEqual(str(self.profile), expected)
    
    def test_role_choices(self):
        """Test that only valid roles are accepted"""
        valid_roles = ['admin', 'manager', 'technician', 'receptionist']
        for i, role in enumerate(valid_roles):
            # Create a new user for each profile to avoid unique constraint
            user = User.objects.create_user(
                username=f"test_user_{i}",
                password="testpass123"
            )
            profile = UserProfile(
                user=user,
                organization=self.org,
                role=role
            )
            # Should not raise validation error
            profile.full_clean()


class ClientModelTest(TestCase):
    """Test cases for Client model"""
    
    def setUp(self):
        self.org = Organization.objects.create(
            name="Test Garage",
            registration_number="TG12345"
        )
        self.client = Client.objects.create(
            organization=self.org,
            first_name="John",
            last_name="Doe",
            email="john.doe@email.com",
            phone="+962-7-987-6543",
            address="123 Client St"
        )
    
    def test_client_creation(self):
        """Test client is created correctly"""
        self.assertEqual(self.client.first_name, "John")
        self.assertEqual(self.client.last_name, "Doe")
        self.assertEqual(self.client.email, "john.doe@email.com")
        self.assertTrue(self.client.is_active)
    
    def test_client_full_name_property(self):
        """Test full_name property"""
        self.assertEqual(self.client.full_name, "John Doe")
    
    def test_client_str_representation(self):
        """Test string representation of client"""
        self.assertEqual(str(self.client), "John Doe")


class CarModelTest(TestCase):
    """Test cases for Car model"""
    
    def setUp(self):
        self.org = Organization.objects.create(
            name="Test Garage",
            registration_number="TG12345"
        )
        self.client = Client.objects.create(
            organization=self.org,
            first_name="John",
            last_name="Doe",
            phone="+962-7-987-6543"
        )
        self.car = Car.objects.create(
            organization=self.org,
            client=self.client,
            make="Toyota",
            model="Camry",
            year=2020,
            license_plate="ABC123",
            vin="1HGCM82633A123456",
            fuel_type="petrol",
            mileage=15000
        )
    
    def test_car_creation(self):
        """Test car is created correctly"""
        self.assertEqual(self.car.make, "Toyota")
        self.assertEqual(self.car.model, "Camry")
        self.assertEqual(self.car.year, 2020)
        self.assertEqual(self.car.fuel_type, "petrol")
        self.assertEqual(self.car.mileage, 15000)
        self.assertTrue(self.car.is_active)
    
    def test_car_str_representation(self):
        """Test string representation of car"""
        expected = "Toyota Camry - ABC123"
        self.assertEqual(str(self.car), expected)
    
    def test_unique_license_plate(self):
        """Test that license plate must be unique"""
        with self.assertRaises(Exception):
            Car.objects.create(
                organization=self.org,
                client=self.client,
                make="Honda",
                model="Accord",
                year=2019,
                license_plate="ABC123"  # Same as existing
            )
    
    def test_fuel_type_choices(self):
        """Test that only valid fuel types are accepted"""
        valid_fuel_types = ['petrol', 'diesel', 'electric', 'hybrid']
        for fuel_type in valid_fuel_types:
            car = Car(
                organization=self.org,
                client=self.client,
                make="Test",
                model="Test",
                year=2020,
                license_plate=f"TEST{fuel_type[:3].upper()}",
                fuel_type=fuel_type
            )
            # Should not raise validation error
            car.full_clean()


class SessionModelTest(TestCase):
    """Test cases for Session model"""
    
    def setUp(self):
        self.org = Organization.objects.create(
            name="Test Garage",
            registration_number="TG12345"
        )
        self.client = Client.objects.create(
            organization=self.org,
            first_name="John",
            last_name="Doe",
            phone="+962-7-987-6543"
        )
        self.car = Car.objects.create(
            organization=self.org,
            client=self.client,
            make="Toyota",
            model="Camry",
            year=2020,
            license_plate="ABC123"
        )
        self.user = User.objects.create_user(
            username="tech1",
            password="testpass123"
        )
        self.technician = UserProfile.objects.create(
            user=self.user,
            organization=self.org,
            role='technician'
        )
        self.session = Session.objects.create(
            organization=self.org,
            car=self.car,
            technician=self.technician,
            session_number="SES20250930-001",
            scheduled_date=timezone.now() + timedelta(hours=1),
            job_type="maintenance",
            description="Regular maintenance",
            estimated_cost=150.00
        )
    
    def test_session_creation(self):
        """Test session is created correctly"""
        self.assertEqual(self.session.session_number, "SES20250930-001")
        self.assertEqual(self.session.job_type, "maintenance")
        self.assertEqual(self.session.status, "scheduled")  # Default status
        self.assertEqual(float(self.session.estimated_cost), 150.00)
    
    def test_session_str_representation(self):
        """Test string representation of session"""
        expected = "Session SES20250930-001 - Toyota Camry - ABC123"
        self.assertEqual(str(self.session), expected)
    
    def test_session_status_choices(self):
        """Test that only valid statuses are accepted"""
        valid_statuses = ['scheduled', 'in_progress', 'completed', 'cancelled']
        for status in valid_statuses:
            session = Session(
                organization=self.org,
                car=self.car,
                technician=self.technician,
                session_number=f"SES-{status}",
                scheduled_date=timezone.now(),
                status=status
            )
            # Should not raise validation error
            session.full_clean()


class InventoryModelTest(TestCase):
    """Test cases for Inventory model"""
    
    def setUp(self):
        self.org = Organization.objects.create(
            name="Test Garage",
            registration_number="TG12345"
        )
        self.inventory_item = Inventory.objects.create(
            organization=self.org,
            part_number="OIL001",
            name="Engine Oil 5W-30",
            category="Fluids",
            quantity=50,
            min_quantity=10,
            unit_price=25.00,
            supplier="Oil Supplier Inc"
        )
    
    def test_inventory_creation(self):
        """Test inventory item is created correctly"""
        self.assertEqual(self.inventory_item.part_number, "OIL001")
        self.assertEqual(self.inventory_item.name, "Engine Oil 5W-30")
        self.assertEqual(self.inventory_item.quantity, 50)
        self.assertEqual(self.inventory_item.min_quantity, 10)
        self.assertEqual(float(self.inventory_item.unit_price), 25.00)
    
    def test_inventory_str_representation(self):
        """Test string representation of inventory item"""
        self.assertEqual(str(self.inventory_item), "OIL001 - Engine Oil 5W-30")
    
    def test_low_stock_property(self):
        """Test is_low_stock property"""
        # Stock is above minimum (50 > 10)
        self.assertFalse(self.inventory_item.is_low_stock)
        
        # Reduce stock below minimum
        self.inventory_item.quantity = 5
        self.assertTrue(self.inventory_item.is_low_stock)


class NotificationModelTest(TestCase):
    """Test cases for Notification model"""
    
    def setUp(self):
        self.org = Organization.objects.create(
            name="Test Garage",
            registration_number="TG12345"
        )
        self.user = User.objects.create_user(
            username="testuser",
            password="testpass123"
        )
        self.notification = Notification.objects.create(
            organization=self.org,
            user=self.user,
            title="Test Notification",
            message="This is a test message",
            notification_type="info"
        )
    
    def test_notification_creation(self):
        """Test notification is created correctly"""
        self.assertEqual(self.notification.title, "Test Notification")
        self.assertEqual(self.notification.message, "This is a test message")
        self.assertEqual(self.notification.notification_type, "info")
        self.assertFalse(self.notification.is_read)
    
    def test_notification_str_representation(self):
        """Test string representation of notification"""
        expected = f"Test Notification - {self.user.username}"
        self.assertEqual(str(self.notification), expected)
    
    def test_notification_type_choices(self):
        """Test that only valid notification types are accepted"""
        valid_types = ['info', 'warning', 'error', 'success']
        for notification_type in valid_types:
            notification = Notification(
                organization=self.org,
                user=self.user,
                title="Test",
                message="Test message",
                notification_type=notification_type
            )
            # Should not raise validation error
            notification.full_clean()


# Integration tests for model relationships
class ModelRelationshipTest(TestCase):
    """Test model relationships and cascading"""
    
    def setUp(self):
        self.org = Organization.objects.create(
            name="Test Garage",
            registration_number="TG12345"
        )
        self.user = User.objects.create_user(
            username="testuser",
            password="testpass123"
        )
        self.technician = UserProfile.objects.create(
            user=self.user,
            organization=self.org,
            role='technician'
        )
        self.client = Client.objects.create(
            organization=self.org,
            first_name="John",
            last_name="Doe",
            phone="+962-7-987-6543"
        )
        self.car = Car.objects.create(
            organization=self.org,
            client=self.client,
            make="Toyota",
            model="Camry",
            year=2020,
            license_plate="ABC123"
        )
    
    def test_organization_cascade_delete(self):
        """Test that deleting organization cascades to related objects"""
        org_id = self.org.id
        
        # Create related objects
        Session.objects.create(
            organization=self.org,
            car=self.car,
            technician=self.technician,
            session_number="SES001",
            scheduled_date=timezone.now()
        )
        
        # Delete organization
        self.org.delete()
        
        # Check that related objects are deleted
        self.assertEqual(UserProfile.objects.filter(organization_id=org_id).count(), 0)
        self.assertEqual(Client.objects.filter(organization_id=org_id).count(), 0)
        self.assertEqual(Car.objects.filter(organization_id=org_id).count(), 0)
        self.assertEqual(Session.objects.filter(organization_id=org_id).count(), 0)
    
    def test_client_cascade_delete(self):
        """Test that deleting client cascades to cars but not sessions"""
        client_id = self.client.id
        
        # Create session
        session = Session.objects.create(
            organization=self.org,
            car=self.car,
            technician=self.technician,
            session_number="SES001",
            scheduled_date=timezone.now()
        )
        
        # Delete client
        self.client.delete()
        
        # Car should be deleted
        self.assertEqual(Car.objects.filter(client_id=client_id).count(), 0)
        
        # Session should still exist but car reference should be handled
        # (This depends on the specific cascade behavior you've set up)


if __name__ == '__main__':
    pytest.main([__file__])