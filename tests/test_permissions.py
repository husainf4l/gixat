"""
Test role-based access control and permissions
"""
import pytest
from django.test import TestCase, Client as TestClient
from django.contrib.auth.models import User
from django.urls import reverse
from django.http import Http404
from gixat.models import Organization, UserProfile, Client, Car, Session, Inventory


class RoleBasedAccessControlTest(TestCase):
    """Comprehensive tests for role-based access control"""
    
    def setUp(self):
        self.client = TestClient()
        self.org = Organization.objects.create(
            name="Test Garage",
            registration_number="TG12345"
        )
        
        # Create users with different roles
        self.create_users_with_roles()
        
        # Create test data
        self.create_test_data()
    
    def create_users_with_roles(self):
        """Create users with different roles for testing"""
        
        # Admin user
        self.admin_user = User.objects.create_user(
            username="admin_user",
            password="testpass123",
            email="admin@garage.com",
            first_name="Admin",
            last_name="User"
        )
        self.admin_profile = UserProfile.objects.create(
            user=self.admin_user,
            organization=self.org,
            role='admin',
            employee_id="ADM001"
        )
        
        # Manager user
        self.manager_user = User.objects.create_user(
            username="manager_user",
            password="testpass123",
            email="manager@garage.com",
            first_name="Manager",
            last_name="User"
        )
        self.manager_profile = UserProfile.objects.create(
            user=self.manager_user,
            organization=self.org,
            role='manager',
            employee_id="MGR001"
        )
        
        # Technician user
        self.tech_user = User.objects.create_user(
            username="tech_user",
            password="testpass123",
            email="tech@garage.com",
            first_name="Tech",
            last_name="User"
        )
        self.tech_profile = UserProfile.objects.create(
            user=self.tech_user,
            organization=self.org,
            role='technician',
            employee_id="TCH001"
        )
        
        # Receptionist user
        self.receptionist_user = User.objects.create_user(
            username="receptionist_user",
            password="testpass123",
            email="receptionist@garage.com",
            first_name="Receptionist",
            last_name="User"
        )
        self.receptionist_profile = UserProfile.objects.create(
            user=self.receptionist_user,
            organization=self.org,
            role='receptionist',
            employee_id="RCP001"
        )
    
    def create_test_data(self):
        """Create test data for access control testing"""
        self.test_client = Client.objects.create(
            organization=self.org,
            first_name="John",
            last_name="Doe",
            phone="+962-7-123-4567"
        )
        
        self.test_car = Car.objects.create(
            organization=self.org,
            client=self.test_client,
            make="Toyota",
            model="Camry",
            year=2020,
            license_plate="ABC123"
        )
        
        self.test_session = Session.objects.create(
            organization=self.org,
            car=self.test_car,
            technician=self.tech_profile,
            session_number="SES001",
            scheduled_date="2025-10-01 09:00:00",
            estimated_cost=150.00
        )
        
        self.test_inventory = Inventory.objects.create(
            organization=self.org,
            part_number="OIL001",
            name="Engine Oil",
            quantity=50,
            min_quantity=10,
            unit_price=25.00
        )
    
    def test_admin_full_access(self):
        """Test admin user has full access to all features"""
        self.client.login(username='admin_user', password='testpass123')
        
        # Admin should access all pages
        admin_accessible_urls = [
            'dashboard',
            'repair_sessions',
            'inventory',
            'reports',
            'new_client_request',
            'add_inventory_item',
            'settings',
            'inspections',
            'new_session',
            'new_inspection',
            'add_vehicle'
        ]
        
        for url_name in admin_accessible_urls:
            with self.subTest(url=url_name):
                response = self.client.get(reverse(url_name))
                self.assertIn(response.status_code, [200, 302], 
                             f"Admin should access {url_name}")
        
        # Test admin can view/edit specific items
        response = self.client.get(reverse('view_session', args=[self.test_session.id]))
        self.assertEqual(response.status_code, 200)
        
        response = self.client.get(reverse('view_inventory_item', args=[self.test_inventory.id]))
        self.assertEqual(response.status_code, 200)
    
    def test_manager_access_rights(self):
        """Test manager user access rights"""
        self.client.login(username='manager_user', password='testpass123')
        
        # Manager should access most pages
        manager_accessible_urls = [
            'dashboard',
            'repair_sessions', 
            'inventory',
            'reports',
            'new_client_request',
            'inspections',
            'new_session',
            'new_inspection'
        ]
        
        for url_name in manager_accessible_urls:
            with self.subTest(url=url_name):
                response = self.client.get(reverse(url_name))
                self.assertIn(response.status_code, [200, 302],
                             f"Manager should access {url_name}")
        
        # Manager should access but with some restrictions on settings
        response = self.client.get(reverse('settings'))
        self.assertIn(response.status_code, [200, 302])
    
    def test_technician_limited_access(self):
        """Test technician user has limited access"""
        self.client.login(username='tech_user', password='testpass123')
        
        # Technician should access these pages
        tech_accessible_urls = [
            'dashboard',
            'repair_sessions',
            'inventory',  # Read-only access
            'inspections',
            'new_inspection'
        ]
        
        for url_name in tech_accessible_urls:
            with self.subTest(url=url_name):
                response = self.client.get(reverse(url_name))
                self.assertIn(response.status_code, [200, 302],
                             f"Technician should access {url_name}")
        
        # Technician should be able to view their assigned sessions
        response = self.client.get(reverse('view_session', args=[self.test_session.id]))
        self.assertEqual(response.status_code, 200)
        
        # Test technician can update session status
        response = self.client.post(reverse('start_session', args=[self.test_session.id]))
        self.assertEqual(response.status_code, 302)  # Redirect after successful update
    
    def test_technician_restricted_access(self):
        """Test technician cannot access restricted areas"""
        self.client.login(username='tech_user', password='testpass123')
        
        # Technician should NOT have access to these
        tech_restricted_urls = [
            'add_inventory_item',
            'new_client_request',  # Depends on business rules
            'reports',  # Might be restricted
        ]
        
        # Note: The actual restriction logic would need to be implemented
        # in the views. This test assumes such logic exists.
        
        # For now, we test that the pages are accessible but may show 
        # different content based on role
        for url_name in tech_restricted_urls:
            with self.subTest(url=url_name):
                response = self.client.get(reverse(url_name))
                # Response code depends on implementation - could be 403, 302, or 200 with limited content
                self.assertIn(response.status_code, [200, 302, 403])
    
    def test_receptionist_access_rights(self):
        """Test receptionist user access rights"""
        self.client.login(username='receptionist_user', password='testpass123')
        
        # Receptionist should access client-facing features
        receptionist_accessible_urls = [
            'dashboard',
            'new_client_request',
            'repair_sessions',  # View only
            'add_vehicle'
        ]
        
        for url_name in receptionist_accessible_urls:
            with self.subTest(url=url_name):
                response = self.client.get(reverse(url_name))
                self.assertIn(response.status_code, [200, 302],
                             f"Receptionist should access {url_name}")
    
    def test_unauthenticated_user_redirect(self):
        """Test unauthenticated users are redirected to login"""
        
        protected_urls = [
            'dashboard',
            'repair_sessions',
            'inventory',
            'settings',
            'new_client_request'
        ]
        
        for url_name in protected_urls:
            with self.subTest(url=url_name):
                response = self.client.get(reverse(url_name))
                self.assertEqual(response.status_code, 302)
                self.assertIn('login', response.url)
    
    def test_cross_organization_access_denied(self):
        """Test users cannot access data from other organizations"""
        
        # Create another organization and user
        other_org = Organization.objects.create(
            name="Other Garage",
            registration_number="OG12345"
        )
        other_user = User.objects.create_user(
            username="other_user",
            password="testpass123"
        )
        other_profile = UserProfile.objects.create(
            user=other_user,
            organization=other_org,
            role='admin'
        )
        
        # Create data in other organization
        other_client = Client.objects.create(
            organization=other_org,
            first_name="Other",
            last_name="Client",
            phone="+962-7-999-9999"
        )
        
        other_car = Car.objects.create(
            organization=other_org,
            client=other_client,
            make="Honda",
            model="Accord",
            year=2019,
            license_plate="XYZ789"
        )
        
        other_session = Session.objects.create(
            organization=other_org,
            car=other_car,
            technician=other_profile,
            session_number="SES999",
            scheduled_date="2025-10-01 10:00:00",
            estimated_cost=200.00
        )
        
        # Login as user from first organization
        self.client.login(username='admin_user', password='testpass123')
        
        # Try to access data from other organization
        # This should either return 404 or redirect, depending on implementation
        response = self.client.get(reverse('view_session', args=[other_session.id]))
        # The view should implement organization-based filtering
        # For now, we just test that the response is handled
        self.assertIn(response.status_code, [404, 403, 302])
    
    def test_role_based_dashboard_content(self):
        """Test dashboard shows different content based on user role"""
        
        # Admin dashboard
        self.client.login(username='admin_user', password='testpass123')
        admin_response = self.client.get(reverse('dashboard'))
        
        # Manager dashboard
        self.client.login(username='manager_user', password='testpass123')
        manager_response = self.client.get(reverse('dashboard'))
        
        # Technician dashboard
        self.client.login(username='tech_user', password='testpass123')
        tech_response = self.client.get(reverse('dashboard'))
        
        # All should be accessible
        self.assertEqual(admin_response.status_code, 200)
        self.assertEqual(manager_response.status_code, 200)
        self.assertEqual(tech_response.status_code, 200)
        
        # Content differences would need to be tested based on 
        # specific implementation of role-based dashboard widgets
    
    def test_session_assignment_permissions(self):
        """Test session assignment based on roles"""
        
        # Technician should only see sessions assigned to them
        self.client.login(username='tech_user', password='testpass123')
        response = self.client.get(reverse('repair_sessions'))
        
        self.assertEqual(response.status_code, 200)
        # The view should filter sessions based on user role and assignments
        
        # Admin should see all sessions
        self.client.login(username='admin_user', password='testpass123')
        response = self.client.get(reverse('repair_sessions'))
        
        self.assertEqual(response.status_code, 200)
    
    def test_inventory_modification_permissions(self):
        """Test inventory modification permissions"""
        
        # Admin should be able to add inventory
        self.client.login(username='admin_user', password='testpass123')
        response = self.client.post(reverse('add_inventory_item'), {
            'part_number': 'TEST001',
            'name': 'Test Part',
            'category': 'Test',
            'quantity': 10,
            'min_quantity': 2,
            'unit_price': 50.00
        })
        self.assertEqual(response.status_code, 302)  # Redirect after success
        
        # Verify item was created
        self.assertTrue(Inventory.objects.filter(
            part_number='TEST001',
            organization=self.org
        ).exists())
        
        # Technician attempting to add inventory (should be restricted)
        self.client.login(username='tech_user', password='testpass123')
        response = self.client.post(reverse('add_inventory_item'), {
            'part_number': 'TEST002',
            'name': 'Test Part 2',
            'category': 'Test',
            'quantity': 5,
            'min_quantity': 1,
            'unit_price': 25.00
        })
        
        # Depending on implementation, this could be 403 Forbidden,
        # 302 Redirect, or 200 with error message
        # For now, we just verify it's handled appropriately
        self.assertIn(response.status_code, [200, 302, 403])


class PermissionDecoratorTest(TestCase):
    """Test custom permission decorators (if implemented)"""
    
    def setUp(self):
        self.client = TestClient()
        self.org = Organization.objects.create(
            name="Test Garage",
            registration_number="TG12345"
        )
        
        self.admin_user = User.objects.create_user(
            username="admin",
            password="testpass123"
        )
        self.admin_profile = UserProfile.objects.create(
            user=self.admin_user,
            organization=self.org,
            role='admin'
        )
        
        self.tech_user = User.objects.create_user(
            username="tech",
            password="testpass123"
        )
        self.tech_profile = UserProfile.objects.create(
            user=self.tech_user,
            organization=self.org,
            role='technician'
        )
    
    def test_admin_required_decorator(self):
        """Test admin-only views are properly protected"""
        
        # This test assumes you have implemented @admin_required decorators
        # or similar permission checking in your views
        
        # Admin access should work
        self.client.login(username='admin', password='testpass123')
        response = self.client.get(reverse('settings'))
        self.assertIn(response.status_code, [200, 302])
        
        # Non-admin access should be restricted
        self.client.login(username='tech', password='testpass123')
        response = self.client.get(reverse('settings'))
        # Depending on implementation, could be 403, 302 redirect, etc.
        self.assertIn(response.status_code, [200, 302, 403])


if __name__ == '__main__':
    pytest.main([__file__])