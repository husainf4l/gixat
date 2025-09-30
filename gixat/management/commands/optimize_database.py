"""
Database optimization management command
"""
from django.core.management.base import BaseCommand
from django.db import connection
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Add database indexes for performance optimization'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what indexes would be created without actually creating them',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        indexes_to_create = [
            # Organization indexes
            {
                'table': 'gixat_organization',
                'name': 'idx_organization_registration_number',
                'columns': ['registration_number'],
                'description': 'Index for organization lookup by registration number'
            },
            
            # Client indexes
            {
                'table': 'gixat_client',
                'name': 'idx_client_organization_name',
                'columns': ['organization_id', 'first_name', 'last_name'],
                'description': 'Composite index for client search by organization and name'
            },
            {
                'table': 'gixat_client',
                'name': 'idx_client_phone',
                'columns': ['phone'],
                'description': 'Index for client lookup by phone number'
            },
            {
                'table': 'gixat_client',
                'name': 'idx_client_email',
                'columns': ['email'],
                'description': 'Index for client lookup by email'
            },
            
            # Car indexes
            {
                'table': 'gixat_car',
                'name': 'idx_car_license_plate',
                'columns': ['license_plate'],
                'description': 'Index for car lookup by license plate'
            },
            {
                'table': 'gixat_car',
                'name': 'idx_car_organization_client',
                'columns': ['organization_id', 'client_id'],
                'description': 'Composite index for cars by organization and client'
            },
            {
                'table': 'gixat_car',
                'name': 'idx_car_make_model',
                'columns': ['make', 'model', 'year'],
                'description': 'Composite index for car search by make, model, year'
            },
            
            # Session indexes
            {
                'table': 'gixat_session',
                'name': 'idx_session_organization_status',
                'columns': ['organization_id', 'status'],
                'description': 'Composite index for session filtering by organization and status'
            },
            {
                'table': 'gixat_session',
                'name': 'idx_session_technician_status',
                'columns': ['technician_id', 'status'],
                'description': 'Composite index for technician workload queries'
            },
            {
                'table': 'gixat_session',
                'name': 'idx_session_scheduled_date',
                'columns': ['scheduled_date'],
                'description': 'Index for session scheduling queries'
            },
            {
                'table': 'gixat_session',
                'name': 'idx_session_created_at',
                'columns': ['created_at'],
                'description': 'Index for recent sessions queries'
            },
            
            # Inventory indexes
            {
                'table': 'gixat_inventory',
                'name': 'idx_inventory_part_number',
                'columns': ['part_number'],
                'description': 'Index for inventory lookup by part number'
            },
            {
                'table': 'gixat_inventory',
                'name': 'idx_inventory_organization_category',
                'columns': ['organization_id', 'category'],
                'description': 'Composite index for inventory filtering by organization and category'
            },
            {
                'table': 'gixat_inventory',
                'name': 'idx_inventory_low_stock',
                'columns': ['organization_id', 'quantity', 'min_quantity'],
                'description': 'Composite index for low stock alerts'
            },
            
            # Inspection indexes
            {
                'table': 'gixat_inspection',
                'name': 'idx_inspection_organization_status',
                'columns': ['organization_id', 'status'],
                'description': 'Composite index for inspection filtering'
            },
            {
                'table': 'gixat_inspection',
                'name': 'idx_inspection_scheduled_date',
                'columns': ['scheduled_date'],
                'description': 'Index for inspection scheduling'
            },
            
            # JobCard indexes
            {
                'table': 'gixat_jobcard',
                'name': 'idx_jobcard_session_status',
                'columns': ['session_id', 'status'],
                'description': 'Composite index for job card status tracking'
            },
            {
                'table': 'gixat_jobcard',
                'name': 'idx_jobcard_technician_status',
                'columns': ['assigned_technician_id', 'status'],
                'description': 'Composite index for technician job tracking'
            },
            
            # Notification indexes
            {
                'table': 'gixat_notification',
                'name': 'idx_notification_user_read',
                'columns': ['user_id', 'is_read'],
                'description': 'Composite index for user notification queries'
            },
            {
                'table': 'gixat_notification',
                'name': 'idx_notification_created_at',
                'columns': ['created_at'],
                'description': 'Index for recent notifications'
            },
        ]
        
        if dry_run:
            self.stdout.write(self.style.SUCCESS('DRY RUN: Would create the following indexes:'))
            for index in indexes_to_create:
                self.stdout.write(f"  - {index['name']} on {index['table']} ({', '.join(index['columns'])})")
                self.stdout.write(f"    Description: {index['description']}")
            return
        
        with connection.cursor() as cursor:
            created_count = 0
            skipped_count = 0
            
            for index in indexes_to_create:
                try:
                    # Check if index already exists
                    cursor.execute("""
                        SELECT indexname FROM pg_indexes 
                        WHERE tablename = %s AND indexname = %s;
                    """, [index['table'], index['name']])
                    
                    if cursor.fetchone():
                        self.stdout.write(
                            self.style.WARNING(f"Index {index['name']} already exists, skipping")
                        )
                        skipped_count += 1
                        continue
                    
                    # Create the index
                    columns_str = ', '.join(index['columns'])
                    sql = f"""
                        CREATE INDEX CONCURRENTLY {index['name']} 
                        ON {index['table']} ({columns_str});
                    """
                    
                    self.stdout.write(f"Creating index {index['name']}...")
                    cursor.execute(sql)
                    
                    self.stdout.write(
                        self.style.SUCCESS(f"✓ Created index {index['name']}")
                    )
                    created_count += 1
                    
                except Exception as e:
                    self.stdout.write(
                        self.style.ERROR(f"✗ Failed to create index {index['name']}: {str(e)}")
                    )
                    logger.error(f"Failed to create index {index['name']}: {str(e)}")
        
        self.stdout.write(
            self.style.SUCCESS(
                f"\nDatabase optimization complete. "
                f"Created: {created_count}, Skipped: {skipped_count}"
            )
        )
        
        # Provide recommendations
        self.stdout.write("\n" + "="*50)
        self.stdout.write("PERFORMANCE RECOMMENDATIONS:")
        self.stdout.write("="*50)
        self.stdout.write("1. Monitor query performance using Django Debug Toolbar")
        self.stdout.write("2. Use select_related() for foreign key relationships")
        self.stdout.write("3. Use prefetch_related() for many-to-many and reverse foreign key relationships")
        self.stdout.write("4. Consider database connection pooling (PgBouncer)")
        self.stdout.write("5. Implement caching for frequently accessed data")
        self.stdout.write("6. Use database query logging to identify slow queries")
        
        # Show current database stats
        self.show_database_stats(cursor)
    
    def show_database_stats(self, cursor):
        """Show current database statistics"""
        try:
            cursor.execute("""
                SELECT schemaname, tablename, n_tup_ins, n_tup_upd, n_tup_del, n_live_tup
                FROM pg_stat_user_tables 
                WHERE tablename LIKE 'gixat_%'
                ORDER BY n_live_tup DESC;
            """)
            
            stats = cursor.fetchall()
            if stats:
                self.stdout.write("\nDatabase Table Statistics:")
                self.stdout.write("-" * 70)
                self.stdout.write(f"{'Table':<25} {'Records':<10} {'Inserts':<10} {'Updates':<10} {'Deletes':<10}")
                self.stdout.write("-" * 70)
                
                for stat in stats:
                    schema, table, inserts, updates, deletes, records = stat
                    self.stdout.write(f"{table:<25} {records:<10} {inserts:<10} {updates:<10} {deletes:<10}")
                    
        except Exception as e:
            self.stdout.write(self.style.WARNING(f"Could not retrieve database stats: {str(e)}"))