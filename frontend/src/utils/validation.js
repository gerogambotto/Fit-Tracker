// Input validation utilities

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const validateName = (name) => {
  return name && name.trim().length >= 2 && name.trim().length <= 100;
};

export const validateHeight = (height) => {
  const heightNum = parseFloat(height);
  return !isNaN(heightNum) && heightNum > 0.5 && heightNum < 3.0;
};

export const validateWeight = (weight) => {
  const weightNum = parseFloat(weight);
  return !isNaN(weightNum) && weightNum > 20 && weightNum < 500;
};

export const validateAge = (birthDate) => {
  if (!birthDate) return false;
  const today = new Date();
  const birth = new Date(birthDate);
  const age = today.getFullYear() - birth.getFullYear();
  return age >= 10 && age <= 120;
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

export const validatePositiveNumber = (value, min = 0, max = Infinity) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
};

export const getValidationErrors = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = data[field];
    const fieldRules = rules[field];
    
    if (fieldRules.required && (!value || value.toString().trim() === '')) {
      errors[field] = `${fieldRules.label || field} es requerido`;
      return;
    }
    
    if (value && fieldRules.validator && !fieldRules.validator(value)) {
      errors[field] = fieldRules.message || `${fieldRules.label || field} no es válido`;
    }
  });
  
  return errors;
};