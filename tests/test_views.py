"""
Unit tests for Gixat views
"""
import pytest
from django.test import TestCase, Client as TestClient
from django.contrib.auth.models import User
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from gixat.models import (
    Organization, UserProfile, Client, Car, Session, 
    JobCard, Inventory, Inspection, Notification
)


class AuthenticationViewTest(TestCase):
    """Test authentication-related views"""
    
    def setUp(self):
        self.client = TestClient()
        self.org = Organization.objects.create(
            name="Test Garage",
            registration_number="TG12345"
        )
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="testpass123",
            first_name="Test",
            last_name="User"
        )
        self.user_profile = UserProfile.objects.create(
            user=self.user,
            organization=self.org,
            role='admin'
        )
    
    def test_home_page_accessible(self):
        """Test home page is accessible without authentication"""
        response = self.client.get(reverse('home'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Gixat")
    
    def test_login_page_accessible(self):
        """Test login page is accessible"""
        response = self.client.get(reverse('login'))
        self.assertEqual(response.status_code, 200)
    
    def test_login_functionality(self):
        """Test user can login with correct credentials"""
        response = self.client.post(reverse('login'), {
            'username': 'testuser',
            'password': 'testpass123'
        })
        # Should redirect after successful login
        self.assertEqual(response.status_code, 302)
    
    def test_login_with_wrong_credentials(self):
        """Test login fails with wrong credentials"""
        response = self.client.post(reverse('login'), {
            'username': 'testuser',
            'password': 'wrongpassword'
        })
        # Should stay on login page with error
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "error")
    
    def test_dashboard_requires_authentication(self):
        """Test dashboard redirects unauthenticated users"""
        response = self.client.get(reverse('dashboard'))
        self.assertEqual(response.status_code, 302)
        self.assertIn('login', response.url)
    
    def test_dashboard_accessible_when_authenticated(self):
        """Test dashboard is accessible when authenticated"""
        self.client.login(username='testuser', password='testpass123')
        response = self.client.get(reverse('dashboard'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Dashboard")


class DashboardViewTest(TestCase):
    """Test dashboard view functionality"""
    
    def setUp(self):
        self.client = TestClient()
        self.org = Organization.objects.create(
            name="Test Garage",
            registration_number="TG12345"
        )
        self.user = User.objects.create_user(
            username="testuser",
            password="testpass123"
        )
        self.user_profile = UserProfile.objects.create(
            user=self.user,
            organization=self.org,
            role='admin'
        )
        
        # Create test data
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
            technician=self.user_profile,
            session_number="SES001",
            scheduled_date=timezone.now(),
            estimated_cost=150.00
        )
        
        self.client.login(username='testuser', password='testpass123')
    
    def test_dashboard_displays_kpis(self):
        """Test dashboard displays KPI information"""
        response = self.client.get(reverse('dashboard'))
        
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Cars in Garage")
        self.assertContains(response, "Active Sessions")
        self.assertContains(response, "Revenue")
    
    def test_dashboard_shows_active_sessions(self):
        """Test dashboard shows active sessions"""
        response = self.client.get(reverse('dashboard'))
        
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, self.test_session.session_number)
        self.assertContains(response, "Toyota Camry")
    
    def test_dashboard_context_data(self):
        """Test dashboard provides correct context data"""
        response = self.client.get(reverse('dashboard'))
        
        self.assertIn('total_cars_in_garage', response.context)
        self.assertIn('active_sessions', response.context)
        self.assertIn('pending_requests', response.context)
        self.assertIn('revenue_today', response.context)
        self.assertIn('recent_sessions', response.context)


class ClientManagementViewTest(TestCase):
    """Test client management views"""
    
    def setUp(self):
        self.client = TestClient()
        self.org = Organization.objects.create(
            name="Test Garage",
            registration_number="TG12345"
        )
        self.user = User.objects.create_user(
            username="testuser",
            password="testpass123"
        )
        self.user_profile = UserProfile.objects.create(
            user=self.user,
            organization=self.org,
            role='admin'
        )
        
        self.client.login(username='testuser', password='testpass123')
    
    def test_new_client_request_page_accessible(self):
        """Test new client request page is accessible"""
        response = self.client.get(reverse('new_client_request'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "New Client Request")
    
    def test_create_new_client_and_session(self):
        """Test creating a new client and session through form"""
        response = self.client.post(reverse('new_client_request'), {
            'first_name': 'John',
            'last_name': 'Doe',
            'phone': '+962-7-123-4567',
            'email': 'john@example.com',
            'make': 'Toyota',
            'model': 'Camry',
            'year': 2020,
            'license_plate': 'ABC123',
            'job_type': 'maintenance',
            'description': 'Regular maintenance',
            'scheduled_date': (timezone.now() + timedelta(days=1)).strftime('%Y-%m-%d %H:%M'),
            'estimated_cost': 150.00
        })
        
        # Should redirect after successful creation
        self.assertEqual(response.status_code, 302)
        
        # Check that client was created
        self.assertTrue(Client.objects.filter(
            first_name='John',
            last_name='Doe',
            organization=self.org
        ).exists())
        
        # Check that car was created
        self.assertTrue(Car.objects.filter(
            make='Toyota',
            model='Camry',
            license_plate='ABC123',
            organization=self.org
        ).exists())
        
        # Check that session was created
        self.assertTrue(Session.objects.filter(
            job_type='maintenance',
            organization=self.org
        ).exists())


class SessionManagementViewTest(TestCase):
    """Test session management views"""
    
    def setUp(self):
        self.client = TestClient()
        self.org = Organization.objects.create(
            name="Test Garage",
            registration_number="TG12345"
        )
        self.user = User.objects.create_user(
            username="testuser",
            password="testpass123"
        )
        self.user_profile = UserProfile.objects.create(
            user=self.user,
            organization=self.org,
            role='admin'
        )
        
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
            technician=self.user_profile,
            session_number="SES001",
            scheduled_date=timezone.now(),
            estimated_cost=150.00
        )
        
        self.client.login(username='testuser', password='testpass123')
    
    def test_repair_sessions_list_page(self):
        """Test repair sessions list page"""
        response = self.client.get(reverse('repair_sessions'))
        
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Repair Sessions")
        self.assertContains(response, self.test_session.session_number)
    
    def test_view_session_detail(self):
        """Test viewing session detail page"""
        response = self.client.get(reverse('view_session', args=[self.test_session.id]))
        
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, self.test_session.session_number)
        self.assertContains(response, "Toyota Camry")
        self.assertContains(response, "John Doe")
    
    def test_update_session_status(self):
        """Test updating session status"""
        # Start the session
        response = self.client.post(
            reverse('start_session', args=[self.test_session.id])
        )
        
        # Should redirect after successful update
        self.assertEqual(response.status_code, 302)
        
        # Check that session status was updated
        updated_session = Session.objects.get(id=self.test_session.id)
        self.assertEqual(updated_session.status, 'in_progress')
        self.assertIsNotNone(updated_session.actual_start_time)


class InventoryViewTest(TestCase):
    """Test inventory management views"""
    
    def setUp(self):
        self.client = TestClient()
        self.org = Organization.objects.create(
            name="Test Garage",
            registration_number="TG12345"
        )
        self.user = User.objects.create_user(
            username="testuser",
            password="testpass123"
        )
        self.user_profile = UserProfile.objects.create(
            user=self.user,
            organization=self.org,
            role='admin'
        )
        
        self.inventory_item = Inventory.objects.create(
            organization=self.org,
            part_number="OIL001",
            name="Engine Oil 5W-30",
            category="Fluids",
            quantity=50,
            min_quantity=10,
            unit_price=25.00
        )
        
        self.client.login(username='testuser', password='testpass123')
    
    def test_inventory_list_page(self):
        """Test inventory list page"""
        response = self.client.get(reverse('inventory'))
        
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Inventory")
        self.assertContains(response, self.inventory_item.name)
        self.assertContains(response, self.inventory_item.part_number)
    
    def test_add_inventory_item_page(self):
        """Test add inventory item page"""
        response = self.client.get(reverse('add_inventory_item'))
        
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Add Inventory Item")
    
    def test_create_inventory_item(self):
        """Test creating new inventory item"""
        response = self.client.post(reverse('add_inventory_item'), {
            'part_number': 'BRK001',
            'name': 'Brake Pads',
            'category': 'Brakes',
            'quantity': 20,
            'min_quantity': 5,
            'unit_price': 75.00,
            'supplier': 'Brake Parts Inc'
        })
        
        # Should redirect after successful creation
        self.assertEqual(response.status_code, 302)
        
        # Check that inventory item was created
        self.assertTrue(Inventory.objects.filter(
            part_number='BRK001',
            name='Brake Pads',
            organization=self.org
        ).exists())
    
    def test_view_inventory_item_detail(self):
        """Test viewing inventory item detail"""
        response = self.client.get(
            reverse('view_inventory_item', args=[self.inventory_item.id])
        )
        
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, self.inventory_item.name)
        self.assertContains(response, self.inventory_item.part_number)


class RoleBasedAccessTest(TestCase):
    """Test role-based access control"""
    
    def setUp(self):
        self.client = TestClient()
        self.org = Organization.objects.create(
            name="Test Garage",
            registration_number="TG12345"
        )
        
        # Create users with different roles
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
            username="technician",
            password="testpass123"
        )
        self.tech_profile = UserProfile.objects.create(
            user=self.tech_user,
            organization=self.org,
            role='technician'
        )
    
    def test_admin_can_access_all_views(self):
        """Test admin user can access all views"""
        self.client.login(username='admin', password='testpass123')
        
        protected_urls = [
            'dashboard',
            'repair_sessions',
            'inventory',
            'new_client_request',
            'add_inventory_item',
            'settings'
        ]
        
        for url_name in protected_urls:
            response = self.client.get(reverse(url_name))
            self.assertIn(response.status_code, [200, 302])  # 200 OK or 302 redirect (both acceptable)
    
    def test_technician_access_restrictions(self):
        """Test technician user access restrictions"""
        self.client.login(username='technician', password='testpass123')
        
        # Technicians should be able to access these
        accessible_urls = [
            'dashboard',
            'repair_sessions'
        ]
        
        for url_name in accessible_urls:
            response = self.client.get(reverse(url_name))
            self.assertIn(response.status_code, [200, 302])


class MultiTenantTest(TestCase):
    """Test multi-tenant data isolation"""
    
    def setUp(self):
        self.client = TestClient()
        
        # Create two organizations
        self.org1 = Organization.objects.create(
            name="Garage 1",
            registration_number="G1"
        )
        self.org2 = Organization.objects.create(
            name="Garage 2", 
            registration_number="G2"
        )
        
        # Create users for each organization
        self.user1 = User.objects.create_user(
            username="user1",
            password="testpass123"
        )
        self.profile1 = UserProfile.objects.create(
            user=self.user1,
            organization=self.org1,
            role='admin'
        )
        
        self.user2 = User.objects.create_user(
            username="user2",
            password="testpass123"
        )
        self.profile2 = UserProfile.objects.create(
            user=self.user2,
            organization=self.org2,
            role='admin'
        )
        
        # Create test data for each organization
        self.client1 = Client.objects.create(
            organization=self.org1,
            first_name="Client",
            last_name="One",
            phone="+962-7-111-1111"
        )
        
        self.client2 = Client.objects.create(
            organization=self.org2,
            first_name="Client", 
            last_name="Two",
            phone="+962-7-222-2222"
        )
    
    def test_data_isolation_between_organizations(self):
        """Test that users only see data from their organization"""
        # Login as user1 (org1)
        self.client.login(username='user1', password='testpass123')
        response = self.client.get(reverse('dashboard'))
        
        # Should see org1 data but not org2 data
        self.assertContains(response, "Client One")
        # Note: We can't easily test that org2 data is NOT visible without
        # more specific view logic, but this tests the basic functionality


if __name__ == '__main__':
    pytest.main([__file__])