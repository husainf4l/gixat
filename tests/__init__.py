"""
Test package initialization
"""

# Import fixtures for easy access in tests
from .fixtures import (
    sample_organization,
    admin_user,
    technician_user,
    sample_client,
    sample_car,
    sample_session,
    sample_job_card,
    sample_inventory_item,
    sample_inspection,
    sample_notification,
    create_test_data
)

__all__ = [
    'sample_organization',
    'admin_user', 
    'technician_user',
    'sample_client',
    'sample_car',
    'sample_session',
    'sample_job_card',
    'sample_inventory_item',
    'sample_inspection',
    'sample_notification',
    'create_test_data'
]