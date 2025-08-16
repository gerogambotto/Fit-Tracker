import re
from typing import Optional
from datetime import datetime, timezone
from pydantic import validator
import html

def validate_email(email: str) -> bool:
    """Validate email format"""
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(email_pattern, email) is not None

def validate_password_strength(password: str) -> bool:
    """Validate password strength"""
    if len(password) < 8:
        return False
    if not re.search(r'[A-Z]', password):
        return False
    if not re.search(r'[a-z]', password):
        return False
    if not re.search(r'\d', password):
        return False
    return True

def sanitize_string(value: str) -> str:
    """Sanitize string input to prevent XSS"""
    if not isinstance(value, str):
        return value
    return html.escape(value.strip())

def validate_name(name: str) -> bool:
    """Validate name format"""
    if not name or len(name.strip()) < 2 or len(name.strip()) > 100:
        return False
    # Only allow letters, spaces, hyphens, and apostrophes
    return re.match(r"^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-']+$", name.strip()) is not None

def validate_height(height: float) -> bool:
    """Validate height in meters"""
    return 0.5 <= height <= 3.0

def validate_weight(weight: float) -> bool:
    """Validate weight in kg"""
    return 20.0 <= weight <= 500.0

def validate_age_from_birthdate(birth_date: datetime) -> bool:
    """Validate age from birth date"""
    if not birth_date:
        return False
    
    today = datetime.now(timezone.utc)
    age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
    return 10 <= age <= 120

def validate_positive_number(value: float, min_val: float = 0, max_val: float = float('inf')) -> bool:
    """Validate positive number within range"""
    return min_val <= value <= max_val

class ValidationError(Exception):
    """Custom validation error"""
    def __init__(self, message: str, field: Optional[str] = None):
        self.message = message
        self.field = field
        super().__init__(self.message)