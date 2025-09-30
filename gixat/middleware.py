"""
Custom middleware for security enhancements
"""
import time
from collections import defaultdict
from django.http import HttpResponse
from django.core.cache import cache
from django.conf import settings
from django.contrib.auth.signals import user_login_failed
from django.dispatch import receiver
import logging

logger = logging.getLogger(__name__)


class RateLimitMiddleware:
    """
    Rate limiting middleware to prevent abuse
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.rate_limit_enabled = getattr(settings, 'RATE_LIMIT_ENABLE', True)
        self.rate_limit_per_minute = getattr(settings, 'RATE_LIMIT_PER_MINUTE', 60)
        self.rate_limit_per_hour = getattr(settings, 'RATE_LIMIT_PER_HOUR', 1000)
    
    def __call__(self, request):
        # Check rate limits before processing request
        if self.rate_limit_enabled:
            client_ip = self.get_client_ip(request)
            if self.is_rate_limited(client_ip):
                logger.warning(f"Rate limit exceeded for IP: {client_ip}")
                return HttpResponse("Rate limit exceeded. Please try again later.", status=429)
        
        response = self.get_response(request)
        return response
        
    def process_request(self, request):
        if not self.rate_limit_enabled:
            return None
            
        # Get client IP
        client_ip = self.get_client_ip(request)
        
        # Check rate limits
        if self.is_rate_limited(client_ip):
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            return HttpResponse("Rate limit exceeded. Please try again later.", status=429)
        
        return None
    
    def get_client_ip(self, request):
        """Get the client's IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def is_rate_limited(self, client_ip):
        """Check if the client IP has exceeded rate limits"""
        now = int(time.time())
        minute_key = f"rate_limit:{client_ip}:minute:{now // 60}"
        hour_key = f"rate_limit:{client_ip}:hour:{now // 3600}"
        
        # Check minute limit
        minute_count = cache.get(minute_key, 0)
        if minute_count >= self.rate_limit_per_minute:
            return True
        
        # Check hour limit
        hour_count = cache.get(hour_key, 0)
        if hour_count >= self.rate_limit_per_hour:
            return True
        
        # Increment counters
        cache.set(minute_key, minute_count + 1, timeout=60)
        cache.set(hour_key, hour_count + 1, timeout=3600)
        
        return False


class LoginAttemptMiddleware:
    """
    Middleware to track and limit login attempts
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.max_attempts = getattr(settings, 'MAX_LOGIN_ATTEMPTS', 5)
        self.lockout_duration = getattr(settings, 'LOGIN_LOCKOUT_DURATION', 300)  # 5 minutes
    
    def __call__(self, request):
        response = self.get_response(request)
        return response
    
    def is_login_locked(self, identifier):
        """Check if login is locked for the identifier (IP or username)"""
        lockout_key = f"login_lockout:{identifier}"
        attempts_key = f"login_attempts:{identifier}"
        
        # Check if currently locked out
        if cache.get(lockout_key):
            return True
        
        # Check attempt count
        attempts = cache.get(attempts_key, 0)
        if attempts >= self.max_attempts:
            # Lock out the identifier
            cache.set(lockout_key, True, timeout=self.lockout_duration)
            cache.delete(attempts_key)
            logger.warning(f"Login locked for {identifier} due to too many failed attempts")
            return True
        
        return False
    
    def record_failed_attempt(self, identifier):
        """Record a failed login attempt"""
        attempts_key = f"login_attempts:{identifier}"
        attempts = cache.get(attempts_key, 0)
        cache.set(attempts_key, attempts + 1, timeout=self.lockout_duration)
    
    def clear_failed_attempts(self, identifier):
        """Clear failed attempts on successful login"""
        attempts_key = f"login_attempts:{identifier}"
        cache.delete(attempts_key)


class SecurityHeadersMiddleware:
    """
    Add security headers to responses
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        return self.process_response(request, response)
    
    def process_response(self, request, response):
        # Content Security Policy
        if not getattr(settings, 'DEBUG', False):
            response['Content-Security-Policy'] = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' cdn.tailwindcss.com; "
                "style-src 'self' 'unsafe-inline' cdn.tailwindcss.com fonts.googleapis.com; "
                "font-src 'self' fonts.gstatic.com; "
                "img-src 'self' data: https:; "
                "connect-src 'self';"
            )
        
        # Prevent clickjacking
        response['X-Frame-Options'] = 'DENY'
        
        # Prevent MIME type sniffing
        response['X-Content-Type-Options'] = 'nosniff'
        
        # XSS Protection
        response['X-XSS-Protection'] = '1; mode=block'
        
        # Referrer Policy
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # Feature Policy / Permissions Policy
        response['Permissions-Policy'] = (
            "geolocation=(), "
            "microphone=(), "
            "camera=()"
        )
        
        return response


class AuditLoggingMiddleware:
    """
    Log security-relevant events
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Log before processing
        self.process_request(request)
        response = self.get_response(request)
        # Log after processing
        self.process_response(request, response)
        return response
    
    def process_request(self, request):
        # Log sensitive operations
        if request.method in ['POST', 'PUT', 'DELETE', 'PATCH']:
            sensitive_paths = [
                '/admin/',
                '/login/',
                '/signup/',
                '/settings/',
                '/session/',
                '/inventory/',
            ]
            
            if any(path in request.path for path in sensitive_paths):
                client_ip = self.get_client_ip(request)
                user = getattr(request, 'user', None)
                username = user.username if user and user.is_authenticated else 'anonymous'
                
                logger.info(
                    f"Security Event - Method: {request.method}, "
                    f"Path: {request.path}, "
                    f"User: {username}, "
                    f"IP: {client_ip}"
                )
        
        return None
    
    def process_response(self, request, response):
        """Process response for additional logging if needed"""
        return response
    
    def get_client_ip(self, request):
        """Get the client's IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


# Signal handlers for login tracking
@receiver(user_login_failed)
def log_failed_login(sender, credentials, request, **kwargs):
    """Log failed login attempts"""
    if 'username' in credentials:
        username = credentials['username']
        client_ip = request.META.get('REMOTE_ADDR', 'unknown')
        
        logger.warning(
            f"Failed login attempt - Username: {username}, IP: {client_ip}"
        )
        
        # Record failed attempt
        middleware = LoginAttemptMiddleware(None)
        middleware.record_failed_attempt(username)
        middleware.record_failed_attempt(client_ip)