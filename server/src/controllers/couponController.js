const Coupon = require('../models/Coupon');

// Create new coupon
exports.createCoupon = async (req, res) => {
    try {
        const { code, validFrom, validTo, usageLimit, discountPercent } = req.body;

        // Validate required fields
        if (!code || !validFrom || !validTo || !usageLimit || !discountPercent) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Validate dates
        const fromDate = new Date(validFrom);
        const toDate = new Date(validTo);
        if (fromDate >= toDate) {
            return res.status(400).json({ error: 'Valid from date must be before valid to date' });
        }

        // Create coupon
        const coupon = new Coupon({
            code,
            validFrom: fromDate,
            validTo: toDate,
            usageLimit,
            discountPercent
        });

        await coupon.save();
        res.status(201).json(coupon);
    } catch (error) {
        if (error.code === 11000) { // Duplicate code error
            return res.status(400).json({ error: 'Coupon code already exists' });
        }
        res.status(500).json({ error: error.message });
    }
};

// Get all coupons
exports.getCoupons = async (req, res) => {
    console.log('reached couppouns')
    try {
        const coupons = (await Coupon.find().lean()).sort((a, b) => b.createdAt - a.createdAt); 
        // Sort by createdAt in descending order
        console.log('reached couppouns2')
        res.json(coupons);
        

    } catch (error) {
        console.log(error.message)
        res.status(500).json({ error: error.message });

    }
};

// Update coupon
exports.updateCoupon = async (req, res) => {
    try {
        const { status, usageLimit, validTo, discountPercent } = req.body;
        const coupon = await Coupon.findById(req.params.id);

        if (!coupon) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        // Only allow updating specific fields
        if (status !== undefined) coupon.status = status;
        if (usageLimit) coupon.usageLimit = usageLimit;
        if (validTo) coupon.validTo = new Date(validTo);
        if (discountPercent) coupon.discountPercent = discountPercent;

        await coupon.save();
        res.json(coupon);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete coupon
exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        
        if (!coupon) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        if (coupon.usageCount > 0) {
            return res.status(400).json({ error: 'Cannot delete coupon that has been used' });
        }

        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Validate coupon
exports.validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const coupon = await Coupon.findOne({ code });

        if (!coupon) {
            return res.status(404).json({ error: 'Coupon not found' });
        }

        const now = new Date();
        if (now < coupon.validFrom || now > coupon.validTo) {
            return res.status(400).json({ error: 'Coupon is not valid at this time' });
        }

        if (!coupon.status) {
            return res.status(400).json({ error: 'Coupon is inactive' });
        }

        if (coupon.usageCount >= coupon.usageLimit) {
            return res.status(400).json({ error: 'Coupon usage limit reached' });
        }

        res.json({
            valid: true,
            discountPercent: coupon.discountPercent
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 