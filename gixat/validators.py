"""
Custom password validators for enhanced security
"""
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _
import re


class CustomPasswordValidator:
    """
    Validate that the password meets custom complexity requirements.
    """
    def __init__(self, min_length=8, require_uppercase=True, require_lowercase=True, 
                 require_digit=True, require_special=True):
        self.min_length = min_length
        self.require_uppercase = require_uppercase
        self.require_lowercase = require_lowercase
        self.require_digit = require_digit
        self.require_special = require_special

    def validate(self, password, user=None):
        errors = []
        
        if len(password) < self.min_length:
            errors.append(
                _("Password must be at least %(min_length)d characters long.") % 
                {'min_length': self.min_length}
            )
        
        if self.require_uppercase and not re.search(r'[A-Z]', password):
            errors.append(_("Password must contain at least one uppercase letter."))
        
        if self.require_lowercase and not re.search(r'[a-z]', password):
            errors.append(_("Password must contain at least one lowercase letter."))
        
        if self.require_digit and not re.search(r'\d', password):
            errors.append(_("Password must contain at least one digit."))
        
        if self.require_special and not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append(_("Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>)."))
        
        if errors:
            raise ValidationError(errors)

    def get_help_text(self):
        help_texts = [
            _("Your password must be at least %(min_length)d characters long.") % 
            {'min_length': self.min_length}
        ]
        
        if self.require_uppercase:
            help_texts.append(_("Your password must contain at least one uppercase letter."))
        
        if self.require_lowercase:
            help_texts.append(_("Your password must contain at least one lowercase letter."))
        
        if self.require_digit:
            help_texts.append(_("Your password must contain at least one digit."))
        
        if self.require_special:
            help_texts.append(_("Your password must contain at least one special character."))
        
        return " ".join(help_texts)


class NoCommonPatternsValidator:
    """
    Validate that the password doesn't contain common patterns.
    """
    def __init__(self):
        self.common_patterns = [
            r'123',
            r'abc',
            r'qwerty',
            r'password',
            r'admin',
            r'user',
            r'login',
        ]

    def validate(self, password, user=None):
        password_lower = password.lower()
        
        for pattern in self.common_patterns:
            if pattern in password_lower:
                raise ValidationError(
                    _("Password cannot contain common patterns like '%(pattern)s'.") % 
                    {'pattern': pattern}
                )

    def get_help_text(self):
        return _("Your password cannot contain common patterns like '123', 'abc', 'qwerty', etc.")


class NoPersonalInfoValidator:
    """
    Validate that the password doesn't contain user's personal information.
    """
    def validate(self, password, user=None):
        if not user:
            return
        
        password_lower = password.lower()
        errors = []
        
        # Check username
        if user.username and len(user.username) >= 3 and user.username.lower() in password_lower:
            errors.append(_("Password cannot contain your username."))
        
        # Check first name
        if user.first_name and len(user.first_name) >= 3 and user.first_name.lower() in password_lower:
            errors.append(_("Password cannot contain your first name."))
        
        # Check last name
        if user.last_name and len(user.last_name) >= 3 and user.last_name.lower() in password_lower:
            errors.append(_("Password cannot contain your last name."))
        
        # Check email
        if user.email and '@' in user.email:
            email_prefix = user.email.split('@')[0].lower()
            if len(email_prefix) >= 3 and email_prefix in password_lower:
                errors.append(_("Password cannot contain your email address."))
        
        if errors:
            raise ValidationError(errors)

    def get_help_text(self):
        return _("Your password cannot contain your personal information (username, name, email).")


class NoRepeatingCharactersValidator:
    """
    Validate that the password doesn't have too many repeating characters.
    """
    def __init__(self, max_repeating=3):
        self.max_repeating = max_repeating

    def validate(self, password, user=None):
        count = 1
        prev_char = None
        
        for char in password:
            if char == prev_char:
                count += 1
                if count > self.max_repeating:
                    raise ValidationError(
                        _("Password cannot have more than %(max)d repeating characters in a row.") % 
                        {'max': self.max_repeating}
                    )
            else:
                count = 1
                prev_char = char

    def get_help_text(self):
        return _("Your password cannot have more than %(max)d repeating characters in a row.") % \
               {'max': self.max_repeating}