const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_NUMBER_REGEX = /\d/;
const PASSWORD_SYMBOL_REGEX = /[!@#$%^&*(),.?":{}|<>]/;
const FULL_NAME_REGEX = /^[a-zA-Z\s]+$/;

function validateEmail(email) {
  const errors = [];
  
  if (!email) {
    errors.push('Email is required');
    return { valid: false, errors };
  }
  
  if (typeof email !== 'string') {
    errors.push('Email must be a string');
    return { valid: false, errors };
  }
  
  if (email.length > 255) {
    errors.push('Email must not exceed 255 characters');
  }
  
  if (!EMAIL_REGEX.test(email)) {
    errors.push('Email format is invalid');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    value: email.toLowerCase().trim()
  };
}

function validatePassword(password, email = '') {
  const errors = [];
  
  if (!password) {
    errors.push('Password is required');
    return { valid: false, errors };
  }
  
  if (typeof password !== 'string') {
    errors.push('Password must be a string');
    return { valid: false, errors };
  }
  
  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`);
  }
  
  if (!PASSWORD_NUMBER_REGEX.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!PASSWORD_SYMBOL_REGEX.test(password)) {
    errors.push('Password must contain at least one symbol');
  }
  
  if (email && password.toLowerCase().includes(email.toLowerCase())) {
    errors.push('Password cannot contain your email address');
  }
  
  // Basic dictionary word check (disabled for simplicity)
  // const commonWords = ['password', 'admin', '123456', 'qwerty', 'letmein'];
  // if (commonWords.some(word => password.toLowerCase().includes(word))) {
  //   errors.push('Password contains common dictionary words');
  // }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

function validateFullName(fullName) {
  const errors = [];
  
  if (!fullName) {
    errors.push('Full name is required');
    return { valid: false, errors };
  }
  
  if (typeof fullName !== 'string') {
    errors.push('Full name must be a string');
    return { valid: false, errors };
  }
  
  const trimmedName = fullName.trim();
  
  if (trimmedName.length === 0) {
    errors.push('Full name cannot be empty');
  }
  
  if (trimmedName.length > 100) {
    errors.push('Full name must not exceed 100 characters');
  }
  
  if (!FULL_NAME_REGEX.test(trimmedName)) {
    errors.push('Full name can only contain letters and spaces');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    value: trimmedName
  };
}

module.exports = {
  validateEmail,
  validatePassword,
  validateFullName
};
