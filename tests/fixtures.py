"""
Test fixtures and sample data for Gixat application
"""
import pytest
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from gixat.models import (
    Organization, UserProfile, Client, Car, Session, 
    JobCard, Inventory, Inspection, Notification
)


@pytest.fixture
def sample_organization():
    """Create a sample organization for testing"""
    return Organization.objects.create(
        name="Test Garage Ltd",
        address="123 Test Street, Test City",
        phone="+962-6-123-4567",
        email="test@testgarage.com",
        registration_number="TG12345",
        timezone="Asia/Amman",
        currency="JOD"
    )


@pytest.fixture
def admin_user(sample_organization):
    """Create an admin user for testing"""
    user = User.objects.create_user(
        username="admin_test",
        email="admin@testgarage.com",
        password="testpass123",
        first_name="Admin",
        last_name="User"
    )
    UserProfile.objects.create(
        user=user,
        organization=sample_organization,
        role='admin',
        phone="+962-7-123-4567",
        employee_id="EMP001"
    )
    return user


@pytest.fixture
def technician_user(sample_organization):
    """Create a technician user for testing"""
    user = User.objects.create_user(
        username="tech_test",
        email="tech@testgarage.com",
        password="testpass123",
        first_name="Tech",
        last_name="User"
    )
    UserProfile.objects.create(
        user=user,
        organization=sample_organization,
        role='technician',
        phone="+962-7-234-5678",
        employee_id="EMP002"
    )
    return user


@pytest.fixture
def sample_client(sample_organization):
    """Create a sample client for testing"""
    return Client.objects.create(
        organization=sample_organization,
        first_name="John",
        last_name="Doe",
        email="john.doe@email.com",
        phone="+962-7-987-6543",
        address="456 Client Street, Amman"
    )


@pytest.fixture
def sample_car(sample_organization, sample_client):
    """Create a sample car for testing"""
    return Car.objects.create(
        organization=sample_organization,
        client=sample_client,
        make="Toyota",
        model="Camry",
        year=2020,
        color="Silver",
        license_plate="ABC123",
        vin="1HGCM82633A123456",
        fuel_type="petrol",
        mileage=15000
    )


@pytest.fixture
def sample_session(sample_organization, sample_car, technician_user):
    """Create a sample repair session for testing"""
    tech_profile = UserProfile.objects.get(user=technician_user)
    return Session.objects.create(
        organization=sample_organization,
        car=sample_car,
        technician=tech_profile,
        session_number="SES20250930-001",
        scheduled_date=timezone.now() + timedelta(hours=1),
        expected_end_date=timezone.now() + timedelta(days=1),
        job_type="maintenance",
        description="Regular maintenance check",
        estimated_cost=150.00
    )


@pytest.fixture
def sample_job_card(sample_session, technician_user):
    """Create a sample job card for testing"""
    tech_profile = UserProfile.objects.get(user=technician_user)
    return JobCard.objects.create(
        session=sample_session,
        job_number="JOB001",
        title="Oil Change",
        description="Change engine oil and filter",
        priority="medium",
        assigned_technician=tech_profile,
        estimated_hours=1.5,
        labor_cost=50.00
    )


@pytest.fixture
def sample_inventory_item(sample_organization):
    """Create a sample inventory item for testing"""
    return Inventory.objects.create(
        organization=sample_organization,
        part_number="OIL001",
        name="Engine Oil 5W-30",
        description="High quality synthetic engine oil",
        category="Fluids",
        quantity=50,
        min_quantity=10,
        unit_price=25.00,
        supplier="Oil Supplier Inc"
    )


@pytest.fixture
def sample_inspection(sample_organization, sample_car, technician_user):
    """Create a sample inspection for testing"""
    tech_profile = UserProfile.objects.get(user=technician_user)
    return Inspection.objects.create(
        organization=sample_organization,
        car=sample_car,
        technician=tech_profile,
        inspection_number="INS20250930-001",
        scheduled_date=timezone.now(),
        overall_condition="Good overall condition",
        recommendations="Replace air filter in next service"
    )


@pytest.fixture
def sample_notification(sample_organization, admin_user):
    """Create a sample notification for testing"""
    return Notification.objects.create(
        organization=sample_organization,
        user=admin_user,
        title="Test Notification",
        message="This is a test notification message",
        notification_type="info"
    )


# Test data creation functions for manual testing
def create_test_data():
    """Create comprehensive test data for manual testing"""
    
    # Create organizations
    orgs = []
    for i in range(3):
        org = Organization.objects.create(
            name=f"Test Garage {i+1}",
            address=f"{i+1}00 Test Street, Test City {i+1}",
            phone=f"+962-6-{i+1}23-4567",
            email=f"contact@testgarage{i+1}.com",
            registration_number=f"TG{i+1}2345",
            timezone="Asia/Amman",
            currency="JOD"
        )
        orgs.append(org)
    
    # Create users for each organization
    for i, org in enumerate(orgs):
        # Admin user
        admin = User.objects.create_user(
            username=f"admin{i+1}",
            email=f"admin@testgarage{i+1}.com",
            password="testpass123",
            first_name=f"Admin",
            last_name=f"User{i+1}"
        )
        UserProfile.objects.create(
            user=admin,
            organization=org,
            role='admin',
            phone=f"+962-7-{i+1}11-1111",
            employee_id=f"ADM{i+1}01"
        )
        
        # Technician users
        for j in range(2):
            tech = User.objects.create_user(
                username=f"tech{i+1}_{j+1}",
                email=f"tech{j+1}@testgarage{i+1}.com",
                password="testpass123",
                first_name=f"Technician{j+1}",
                last_name=f"User{i+1}"
            )
            UserProfile.objects.create(
                user=tech,
                organization=org,
                role='technician',
                phone=f"+962-7-{i+1}{j+2}2-2222",
                employee_id=f"TCH{i+1}{j+1}1"
            )
    
    # Create clients and cars
    car_makes = ["Toyota", "Honda", "BMW", "Mercedes", "Audi"]
    car_models = ["Camry", "Accord", "320i", "C-Class", "A4"]
    
    for i, org in enumerate(orgs):
        for j in range(5):  # 5 clients per organization
            client = Client.objects.create(
                organization=org,
                first_name=f"Client{j+1}",
                last_name=f"LastName{i+1}",
                email=f"client{j+1}@org{i+1}.com",
                phone=f"+962-7-{i+1}{j+1}0-0000",
                address=f"{j+1}00 Client Street, Amman"
            )
            
            # Create 1-2 cars per client
            for k in range(1, 3 if j % 2 == 0 else 2):  # Some clients have 2 cars
                car = Car.objects.create(
                    organization=org,
                    client=client,
                    make=car_makes[j % len(car_makes)],
                    model=car_models[j % len(car_models)],
                    year=2018 + j,
                    color=["Red", "Blue", "Silver", "Black", "White"][j % 5],
                    license_plate=f"ABC{i+1}{j+1}{k}",
                    vin=f"1HGCM826{i}{j}A12345{k}",
                    fuel_type=["petrol", "diesel", "hybrid"][j % 3],
                    mileage=10000 + (j * 5000)
                )
                
                # Create some sessions for these cars
                if j < 3:  # Only first 3 clients get sessions
                    tech_profiles = UserProfile.objects.filter(
                        organization=org, 
                        role='technician'
                    )
                    if tech_profiles:
                        session = Session.objects.create(
                            organization=org,
                            car=car,
                            technician=tech_profiles[j % len(tech_profiles)],
                            session_number=f"SES{timezone.now().strftime('%Y%m%d')}-{i+1}{j+1}{k}",
                            scheduled_date=timezone.now() + timedelta(days=j),
                            expected_end_date=timezone.now() + timedelta(days=j+1),
                            job_type=["maintenance", "repair", "inspection"][j % 3],
                            description=f"Service for {car.make} {car.model}",
                            estimated_cost=100.00 + (j * 50),
                            status=["scheduled", "in_progress", "completed"][j % 3]
                        )
                        
                        # Create job cards for sessions
                        JobCard.objects.create(
                            session=session,
                            job_number=f"JOB{i+1}{j+1}{k}01",
                            title=f"Service Task {j+1}",
                            description=f"Perform maintenance task {j+1}",
                            priority=["low", "medium", "high"][j % 3],
                            assigned_technician=tech_profiles[j % len(tech_profiles)],
                            estimated_hours=2.0 + j,
                            labor_cost=75.00 + (j * 25)
                        )
    
    # Create inventory items
    parts = [
        ("OIL001", "Engine Oil 5W-30", "Fluids", 50, 10, 25.00),
        ("FLT001", "Oil Filter", "Filters", 30, 5, 15.00),
        ("BRK001", "Brake Pads", "Brakes", 20, 3, 75.00),
        ("TYR001", "All Season Tire", "Tires", 15, 2, 120.00),
        ("BAT001", "Car Battery", "Electrical", 10, 2, 150.00),
        ("SPK001", "Spark Plugs", "Engine", 40, 8, 12.00),
        ("AIR001", "Air Filter", "Filters", 25, 5, 18.00),
        ("CLT001", "Coolant", "Fluids", 35, 8, 22.00),
    ]
    
    for org in orgs:
        for part_data in parts:
            Inventory.objects.create(
                organization=org,
                part_number=part_data[0],
                name=part_data[1],
                category=part_data[2],
                quantity=part_data[3],
                min_quantity=part_data[4],
                unit_price=part_data[5],
                supplier=f"Parts Supplier {org.id}",
                description=f"High quality {part_data[1].lower()}"
            )
    
    print("Test data created successfully!")
    print(f"Created {Organization.objects.count()} organizations")
    print(f"Created {User.objects.count()} users")
    print(f"Created {Client.objects.count()} clients")
    print(f"Created {Car.objects.count()} cars")
    print(f"Created {Session.objects.count()} sessions")
    print(f"Created {Inventory.objects.count()} inventory items")


# Command to run: python manage.py shell -c "from tests.fixtures import create_test_data; create_test_data()"