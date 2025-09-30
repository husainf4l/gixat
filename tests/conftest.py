"""
Test configuration and coverage setup
"""

# pytest configuration
pytest_plugins = []

# Test settings
import os
import sys
from pathlib import Path

# Add the project root to the Python path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

# Django settings for testing
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Setup Django before importing anything else
import django
django.setup()

# Coverage configuration
COVERAGE_CONFIG = {
    'source': ['gixat'],
    'omit': [
        '*/migrations/*',
        '*/venv/*',
        '*/env/*',
        '*/tests/*',
        'manage.py',
        'config/wsgi.py',
        'config/asgi.py',
    ],
    'exclude_lines': [
        'pragma: no cover',
        'def __repr__',
        'if self.debug:',
        'if settings.DEBUG',
        'raise AssertionError',
        'raise NotImplementedError',
        'if 0:',
        'if __name__ == .__main__.:',
        'class .*\bProtocol\):',
        '@(abc\.)?abstractmethod',
    ],
    'show_missing': True,
    'precision': 2,
}

def run_tests_with_coverage():
    """Run tests with coverage reporting"""
    import coverage
    import pytest
    
    # Start coverage
    cov = coverage.Coverage(**COVERAGE_CONFIG)
    cov.start()
    
    # Run tests
    exit_code = pytest.main([
        'tests/',
        '-v',
        '--tb=short',
        '--strict-markers',
        '-x'  # Stop on first failure
    ])
    
    # Stop coverage and generate report
    cov.stop()
    cov.save()
    
    print("\n" + "="*50)
    print("COVERAGE REPORT")
    print("="*50)
    cov.report()
    
    # Generate HTML report
    cov.html_report(directory='htmlcov')
    print(f"\nDetailed HTML coverage report generated in htmlcov/")
    
    return exit_code

if __name__ == '__main__':
    exit_code = run_tests_with_coverage()
    sys.exit(exit_code)