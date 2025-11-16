const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const rateLimitMiddleware = require('../middleware/rateLimit.middleware');
const { validateSignup, validateLogin, validateRefreshToken } = require('../middleware/validation.middleware');

// Public routes
router.post('/signup', rateLimitMiddleware('signup'), validateSignup, authController.signup);
router.post('/login', rateLimitMiddleware('login'), validateLogin, authController.login);
router.post('/refresh', validateRefreshToken, authController.refresh);

// Protected routes
router.post('/logout', authMiddleware, authController.logout);
router.get('/profile', authMiddleware, authController.getProfile);

// Simple routes (no auth required - for testing)
router.post('/profile/simple', authController.getProfileSimple);
router.post('/logout/simple', authController.logoutSimple);

module.exports = router;
