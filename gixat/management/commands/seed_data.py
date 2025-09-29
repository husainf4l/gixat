from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import date, datetime, timedelta
import random
from gixat.models import (
    Organization, UserProfile, Client, Car, Session, JobCard,
    Inventory, Inspection, InspectionItem, Notification
)


class Command(BaseCommand):
    help = 'Seed database with demo data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding database with demo data...')

        # Create organizations
        organizations = self.create_organizations()

        # Create users and user profiles
        users = self.create_users(organizations)

        # Create clients
        clients = self.create_clients(organizations)

        # Create cars
        cars = self.create_cars(organizations, clients)

        # Create inventory
        inventory_items = self.create_inventory(organizations)

        # Create sessions
        sessions = self.create_sessions(organizations, cars, users)

        # Create job cards
        self.create_job_cards(sessions, users)

        # Create inspections
        inspections = self.create_inspections(organizations, cars, users)

        # Create notifications
        self.create_notifications(organizations, users, sessions, inspections, inventory_items)

        self.stdout.write(
            self.style.SUCCESS('Successfully seeded database with demo data!')
        )

    def create_organizations(self):
        organizations_data = [
            {
                'name': 'Gixat Auto Repair',
                'address': '123 Main Street, Downtown City, ST 12345',
                'phone': '+1-555-0123',
                'email': 'info@gixatautorepair.com',
                'registration_number': 'GAR2024001'
            },
            {
                'name': 'Elite Motors Workshop',
                'address': '456 Industrial Blvd, Tech Park, ST 67890',
                'phone': '+1-555-0456',
                'email': 'contact@elitemotors.com',
                'registration_number': 'EMW2024002'
            }
        ]

        organizations = []
        for org_data in organizations_data:
            org, created = Organization.objects.get_or_create(
                registration_number=org_data['registration_number'],
                defaults=org_data
            )
            organizations.append(org)
            if created:
                self.stdout.write(f'Created organization: {org.name}')

        return organizations

    def create_users(self, organizations):
        users_data = [
            {
                'username': 'admin',
                'first_name': 'John',
                'last_name': 'Admin',
                'email': 'admin@gixatautorepair.com',
                'role': 'admin',
                'organization': organizations[0],
                'phone': '+1-555-1001',
                'employee_id': 'EMP001'
            },
            {
                'username': 'manager1',
                'first_name': 'Sarah',
                'last_name': 'Manager',
                'email': 'sarah@gixatautorepair.com',
                'role': 'manager',
                'organization': organizations[0],
                'phone': '+1-555-1002',
                'employee_id': 'EMP002'
            },
            {
                'username': 'tech1',
                'first_name': 'Mike',
                'last_name': 'Technician',
                'email': 'mike@gixatautorepair.com',
                'role': 'technician',
                'organization': organizations[0],
                'phone': '+1-555-1003',
                'employee_id': 'EMP003'
            },
            {
                'username': 'tech2',
                'first_name': 'Lisa',
                'last_name': 'Technician',
                'email': 'lisa@gixatautorepair.com',
                'role': 'technician',
                'organization': organizations[0],
                'phone': '+1-555-1004',
                'employee_id': 'EMP004'
            },
            {
                'username': 'receptionist1',
                'first_name': 'Anna',
                'last_name': 'Receptionist',
                'email': 'anna@gixatautorepair.com',
                'role': 'receptionist',
                'organization': organizations[0],
                'phone': '+1-555-1005',
                'employee_id': 'EMP005'
            }
        ]

        users = []
        for user_data in users_data:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults={
                    'first_name': user_data['first_name'],
                    'last_name': user_data['last_name'],
                    'email': user_data['email'],
                    'is_staff': user_data['role'] == 'admin',
                    'is_superuser': user_data['role'] == 'admin'
                }
            )
            if created:
                user.set_password('password123')
                user.save()

            profile, profile_created = UserProfile.objects.get_or_create(
                user=user,
                defaults={
                    'organization': user_data['organization'],
                    'role': user_data['role'],
                    'phone': user_data['phone'],
                    'employee_id': user_data['employee_id'],
                    'hire_date': date.today() - timedelta(days=random.randint(30, 365))
                }
            )
            users.append(user)
            if created or profile_created:
                self.stdout.write(f'Created user: {user.get_full_name()} ({user_data["role"]})')

        return users

    def create_clients(self, organizations):
        clients_data = [
            {
                'first_name': 'Robert',
                'last_name': 'Johnson',
                'email': 'robert.johnson@email.com',
                'phone': '+1-555-2001',
                'address': '789 Oak Street, Residential Area, ST 11111',
                'date_of_birth': date(1985, 3, 15),
                'organization': organizations[0]
            },
            {
                'first_name': 'Maria',
                'last_name': 'Garcia',
                'email': 'maria.garcia@email.com',
                'phone': '+1-555-2002',
                'address': '321 Pine Avenue, Suburban District, ST 22222',
                'date_of_birth': date(1990, 7, 22),
                'organization': organizations[0]
            },
            {
                'first_name': 'David',
                'last_name': 'Williams',
                'email': 'david.williams@email.com',
                'phone': '+1-555-2003',
                'address': '654 Elm Drive, Business Quarter, ST 33333',
                'date_of_birth': date(1978, 11, 8),
                'organization': organizations[0]
            },
            {
                'first_name': 'Jennifer',
                'last_name': 'Brown',
                'email': 'jennifer.brown@email.com',
                'phone': '+1-555-2004',
                'address': '987 Maple Lane, Family Neighborhood, ST 44444',
                'date_of_birth': date(1982, 5, 30),
                'organization': organizations[0]
            },
            {
                'first_name': 'Michael',
                'last_name': 'Davis',
                'email': 'michael.davis@email.com',
                'phone': '+1-555-2005',
                'address': '147 Cedar Court, Executive Estates, ST 55555',
                'date_of_birth': date(1975, 9, 12),
                'organization': organizations[0]
            }
        ]

        clients = []
        for client_data in clients_data:
            client, created = Client.objects.get_or_create(
                email=client_data['email'],
                defaults=client_data
            )
            clients.append(client)
            if created:
                self.stdout.write(f'Created client: {client.full_name}')

        return clients

    def create_cars(self, organizations, clients):
        cars_data = [
            {
                'make': 'Toyota',
                'model': 'Camry',
                'year': 2020,
                'color': 'Silver',
                'license_plate': 'ABC-1234',
                'vin': '1N4AL3AP0FC123456',
                'engine_number': '2AR-FE-123456',
                'fuel_type': 'petrol',
                'mileage': 45000,
                'client': clients[0],
                'organization': organizations[0]
            },
            {
                'make': 'Honda',
                'model': 'Civic',
                'year': 2019,
                'color': 'Blue',
                'license_plate': 'XYZ-5678',
                'vin': '2HGFC2F59KH123456',
                'engine_number': 'L15B7-123456',
                'fuel_type': 'petrol',
                'mileage': 32000,
                'client': clients[1],
                'organization': organizations[0]
            },
            {
                'make': 'Ford',
                'model': 'F-150',
                'year': 2021,
                'color': 'Black',
                'license_plate': 'DEF-9012',
                'vin': '1FTFW1ET0DFC12345',
                'engine_number': '3.3L-V6-123456',
                'fuel_type': 'petrol',
                'mileage': 28000,
                'client': clients[2],
                'organization': organizations[0]
            },
            {
                'make': 'Chevrolet',
                'model': 'Malibu',
                'year': 2018,
                'color': 'White',
                'license_plate': 'GHI-3456',
                'vin': '1G1ZD5ST0JF123456',
                'engine_number': '1.5L-Turbo-123456',
                'fuel_type': 'petrol',
                'mileage': 67000,
                'client': clients[3],
                'organization': organizations[0]
            },
            {
                'make': 'BMW',
                'model': 'X3',
                'year': 2022,
                'color': 'Gray',
                'license_plate': 'JKL-7890',
                'vin': '5UXWX9C53L0B12345',
                'engine_number': 'B48-123456',
                'fuel_type': 'petrol',
                'mileage': 15000,
                'client': clients[4],
                'organization': organizations[0]
            },
            {
                'make': 'Tesla',
                'model': 'Model 3',
                'year': 2023,
                'color': 'Red',
                'license_plate': 'MNO-1122',
                'vin': '5YJ3E1EA0KF123456',
                'engine_number': 'N/A',
                'fuel_type': 'electric',
                'mileage': 8000,
                'client': clients[0],
                'organization': organizations[0]
            }
        ]

        cars = []
        for car_data in cars_data:
            car, created = Car.objects.get_or_create(
                license_plate=car_data['license_plate'],
                defaults=car_data
            )
            cars.append(car)
            if created:
                self.stdout.write(f'Created car: {car.make} {car.model} - {car.license_plate}')

        return cars

    def create_inventory(self, organizations):
        inventory_data = [
            {
                'part_number': 'BRK-PAD-001',
                'name': 'Brake Pads Set',
                'description': 'High-quality ceramic brake pads for various vehicle models',
                'category': 'brakes',
                'quantity': 25,
                'min_quantity': 5,
                'unit_price': 89.99,
                'supplier': 'AutoParts Plus',
                'location': 'Aisle 3, Shelf B',
                'organization': organizations[0]
            },
            {
                'part_number': 'OIL-FLT-002',
                'name': 'Oil Filter',
                'description': 'Premium oil filter for engine protection',
                'category': 'engine',
                'quantity': 50,
                'min_quantity': 10,
                'unit_price': 12.99,
                'supplier': 'EngineCare Inc',
                'location': 'Aisle 2, Shelf A',
                'organization': organizations[0]
            },
            {
                'part_number': 'BAT-12V-003',
                'name': '12V Car Battery',
                'description': 'Heavy-duty automotive battery with 2-year warranty',
                'category': 'electrical',
                'quantity': 15,
                'min_quantity': 3,
                'unit_price': 149.99,
                'supplier': 'PowerSource Batteries',
                'location': 'Aisle 4, Shelf C',
                'organization': organizations[0]
            },
            {
                'part_number': 'TIR-205-55-16',
                'name': 'Tire 205/55R16',
                'description': 'All-season performance tire',
                'category': 'tires',
                'quantity': 40,
                'min_quantity': 8,
                'unit_price': 129.99,
                'supplier': 'TireMasters',
                'location': 'Aisle 5, Shelf D',
                'organization': organizations[0]
            },
            {
                'part_number': 'AIR-FLT-004',
                'name': 'Air Filter',
                'description': 'High-efficiency cabin air filter',
                'category': 'engine',
                'quantity': 30,
                'min_quantity': 6,
                'unit_price': 24.99,
                'supplier': 'CleanAir Filters',
                'location': 'Aisle 2, Shelf C',
                'organization': organizations[0]
            },
            {
                'part_number': 'SPK-PLG-005',
                'name': 'Spark Plug Set',
                'description': 'Iridium spark plugs for improved ignition',
                'category': 'engine',
                'quantity': 20,
                'min_quantity': 4,
                'unit_price': 45.99,
                'supplier': 'SparkTech',
                'location': 'Aisle 2, Shelf D',
                'organization': organizations[0]
            }
        ]

        inventory_items = []
        for item_data in inventory_data:
            item, created = Inventory.objects.get_or_create(
                part_number=item_data['part_number'],
                defaults=item_data
            )
            inventory_items.append(item)
            if created:
                self.stdout.write(f'Created inventory item: {item.name}')

        return inventory_items

    def create_sessions(self, organizations, cars, users):
        sessions_data = [
            {
                'car': cars[0],
                'technician': UserProfile.objects.get(user__username='tech1'),
                'scheduled_date': timezone.now() + timedelta(days=1),
                'status': 'scheduled',
                'description': 'Regular maintenance check and oil change',
                'estimated_cost': 89.99,
                'organization': organizations[0]
            },
            {
                'car': cars[1],
                'technician': UserProfile.objects.get(user__username='tech2'),
                'scheduled_date': timezone.now() - timedelta(days=2),
                'actual_start_time': timezone.now() - timedelta(days=2, hours=1),
                'actual_end_time': timezone.now() - timedelta(days=2),
                'status': 'completed',
                'description': 'Brake inspection and replacement',
                'notes': 'Front brake pads replaced. Rear pads still good.',
                'estimated_cost': 249.99,
                'actual_cost': 234.99,
                'organization': organizations[0]
            },
            {
                'car': cars[2],
                'technician': UserProfile.objects.get(user__username='tech1'),
                'scheduled_date': timezone.now() + timedelta(days=3),
                'status': 'scheduled',
                'description': 'Tire rotation and alignment check',
                'estimated_cost': 79.99,
                'organization': organizations[0]
            },
            {
                'car': cars[3],
                'technician': UserProfile.objects.get(user__username='tech2'),
                'scheduled_date': timezone.now() - timedelta(days=5),
                'actual_start_time': timezone.now() - timedelta(days=5, hours=2),
                'actual_end_time': timezone.now() - timedelta(days=5),
                'status': 'completed',
                'description': 'Battery replacement and electrical system check',
                'notes': 'Battery was completely dead. Replaced with new heavy-duty battery.',
                'estimated_cost': 179.99,
                'actual_cost': 169.99,
                'organization': organizations[0]
            }
        ]

        sessions = []
        for session_data in sessions_data:
            session = Session.objects.create(**session_data)
            sessions.append(session)
            self.stdout.write(f'Created session: {session.session_number} for {session.car}')

        return sessions

    def create_job_cards(self, sessions, users):
        job_cards_data = [
            {
                'session': sessions[0],
                'title': 'Oil Change',
                'description': 'Complete oil change with filter replacement',
                'priority': 'medium',
                'status': 'pending',
                'assigned_technician': UserProfile.objects.get(user__username='tech1'),
                'estimated_hours': 1.5,
                'parts_cost': 39.99,
                'labor_cost': 50.00
            },
            {
                'session': sessions[1],
                'title': 'Brake Pad Replacement',
                'description': 'Replace front brake pads and inspect rotors',
                'priority': 'high',
                'status': 'completed',
                'assigned_technician': UserProfile.objects.get(user__username='tech2'),
                'estimated_hours': 2.0,
                'actual_hours': 1.8,
                'parts_cost': 149.99,
                'labor_cost': 85.00,
                'started_at': sessions[1].actual_start_time,
                'completed_at': sessions[1].actual_end_time,
                'notes': 'Pads replaced successfully. Rotors in good condition.'
            },
            {
                'session': sessions[2],
                'title': 'Tire Rotation',
                'description': 'Rotate tires and check alignment',
                'priority': 'low',
                'status': 'pending',
                'assigned_technician': UserProfile.objects.get(user__username='tech1'),
                'estimated_hours': 1.0,
                'parts_cost': 0.00,
                'labor_cost': 79.99
            },
            {
                'session': sessions[3],
                'title': 'Battery Replacement',
                'description': 'Replace dead battery and test electrical system',
                'priority': 'urgent',
                'status': 'completed',
                'assigned_technician': UserProfile.objects.get(user__username='tech2'),
                'estimated_hours': 1.0,
                'actual_hours': 0.8,
                'parts_cost': 149.99,
                'labor_cost': 20.00,
                'started_at': sessions[3].actual_start_time,
                'completed_at': sessions[3].actual_end_time,
                'notes': 'Battery replaced. Alternator and starter tested - all good.'
            }
        ]

        for job_data in job_cards_data:
            job_card = JobCard.objects.create(**job_data)
            self.stdout.write(f'Created job card: {job_card.job_number} - {job_card.title}')

    def create_inspections(self, organizations, cars, users):
        inspections_data = [
            {
                'car': cars[0],
                'inspector': UserProfile.objects.get(user__username='tech1'),
                'scheduled_date': timezone.now() + timedelta(days=7),
                'status': 'scheduled',
                'organization': organizations[0]
            },
            {
                'car': cars[1],
                'inspector': UserProfile.objects.get(user__username='tech2'),
                'scheduled_date': timezone.now() - timedelta(days=10),
                'actual_start_time': timezone.now() - timedelta(days=10, hours=1),
                'actual_end_time': timezone.now() - timedelta(days=10),
                'status': 'completed',
                'overall_condition': 'Good condition overall. Minor wear on brake pads.',
                'recommendations': 'Replace brake pads within next 5,000 km. Check tire pressure monthly.',
                'estimated_cost': 249.99,
                'client_approved': True,
                'organization': organizations[0]
            },
            {
                'car': cars[4],
                'inspector': UserProfile.objects.get(user__username='tech1'),
                'scheduled_date': timezone.now() - timedelta(days=3),
                'actual_start_time': timezone.now() - timedelta(days=3, hours=2),
                'actual_end_time': timezone.now() - timedelta(days=3),
                'status': 'waiting_approval',
                'overall_condition': 'Excellent condition. Recent model with low mileage.',
                'recommendations': 'No immediate repairs needed. Schedule regular maintenance.',
                'estimated_cost': 0.00,
                'organization': organizations[0]
            }
        ]

        inspections = []
        for inspection_data in inspections_data:
            inspection = Inspection.objects.create(**inspection_data)
            inspections.append(inspection)
            self.stdout.write(f'Created inspection: {inspection.inspection_number} for {inspection.car}')

            # Create inspection items for completed inspections
            if inspection.status == 'completed':
                self.create_inspection_items(inspection)

        return inspections

    def create_inspection_items(self, inspection):
        components = [
            ('Engine', 'excellent', False, None),
            ('Transmission', 'good', False, None),
            ('Brakes', 'fair', True, 249.99),
            ('Suspension', 'good', False, None),
            ('Electrical System', 'excellent', False, None),
            ('Tires', 'good', False, None),
            ('Body/Exterior', 'good', False, None),
            ('Interior', 'excellent', False, None)
        ]

        for component, condition, needs_repair, cost in components:
            InspectionItem.objects.create(
                inspection=inspection,
                component=component,
                condition=condition,
                needs_repair=needs_repair,
                estimated_repair_cost=cost
            )

    def create_notifications(self, organizations, users, sessions, inspections, inventory_items):
        notifications_data = [
            {
                'user': users[0],  # admin
                'title': 'Low Stock Alert',
                'message': f'Brake Pads Set ({inventory_items[0].part_number}) is running low. Current stock: {inventory_items[0].quantity}',
                'notification_type': 'warning',
                'related_inventory': inventory_items[0],
                'organization': organizations[0]
            },
            {
                'user': users[1],  # manager
                'title': 'Session Completed',
                'message': f'Session {sessions[1].session_number} for {sessions[1].car} has been completed.',
                'notification_type': 'success',
                'related_session': sessions[1],
                'organization': organizations[0]
            },
            {
                'user': users[2],  # tech1
                'title': 'New Session Assigned',
                'message': f'You have been assigned to Session {sessions[0].session_number} scheduled for {sessions[0].scheduled_date.strftime("%B %d, %Y at %I:%M %p")}.',
                'notification_type': 'info',
                'related_session': sessions[0],
                'organization': organizations[0]
            },
            {
                'user': users[3],  # tech2
                'title': 'Inspection Completed',
                'message': f'Inspection {inspections[1].inspection_number} for {inspections[1].car} is ready for client approval.',
                'notification_type': 'info',
                'related_inspection': inspections[1],
                'organization': organizations[0]
            },
            {
                'user': users[0],  # admin
                'title': 'System Maintenance Reminder',
                'message': 'Scheduled system maintenance will occur tonight at 2:00 AM. System may be unavailable for 30 minutes.',
                'notification_type': 'info',
                'organization': organizations[0]
            }
        ]

        for notification_data in notifications_data:
            notification = Notification.objects.create(**notification_data)
            self.stdout.write(f'Created notification: {notification.title}')