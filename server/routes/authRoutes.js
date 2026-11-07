const express = require('express');
const router = express.Router();
const {
  loginWorker,
  getMe,
  registerCustomer,
  loginCustomer,
  getCustomerProfile,
  updateCustomerProfile,
  requestPasswordResetOtp,
  resetPasswordWithOtp,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Worker / Partner
router.post('/login', loginWorker);
router.get('/me', protect, getMe);

// Customer
router.post('/customer/register', registerCustomer);
router.post('/customer/login', loginCustomer);
router.get('/customer/:id', getCustomerProfile);
router.put('/customer/:id', updateCustomerProfile);

// Unified Forgot & Reset Password
router.post('/forgot-password/request-otp', requestPasswordResetOtp);
router.post('/forgot-password/reset', resetPasswordWithOtp);

module.exports = router;
