const { validateEmail, validatePassword, validateFullName } = require('../utils/validator');

function validateSignup(req, res, next) {
  const { email, password, fullName } = req.body;
  
  const errors = {};
  
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.errors;
  }
  
  const passwordValidation = validatePassword(password, email);
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.errors;
  }
  
  const nameValidation = validateFullName(fullName);
  if (!nameValidation.valid) {
    errors.fullName = nameValidation.errors;
  }
  
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors
      }
    });
  }
  
  next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;
  
  const errors = {};
  
  if (!email) {
    errors.email = ['Email is required'];
  }
  
  if (!password) {
    errors.password = ['Password is required'];
  }
  
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors
      }
    });
  }
  
  next();
}

function validateRefreshToken(req, res, next) {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Refresh token is required',
        details: { refreshToken: ['Refresh token is required'] }
      }
    });
  }
  
  next();
}

module.exports = {
  validateSignup,
  validateLogin,
  validateRefreshToken
};
