const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const authMiddleware = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// CRUD routes
router.post('/', couponController.createCoupon);
router.get('/', couponController.getCoupons);
router.put('/:id', couponController.updateCoupon);
router.delete('/:id', couponController.deleteCoupon);

// Validate coupon
router.post('/validate', couponController.validateCoupon);

module.exports = router; 