const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    validFrom: {
        type: Date,
        required: true,
    },
    validTo: {
        type: Date,
        required: true,
    },
    usageLimit: {
        type: Number,
        required: true,
    },
    usageCount: {
        type: Number,
        default: 0
    },
    status: {
        type: Boolean,
        default: true,
    },
    tempHolds: { type: Number, default: 0 },
    discountPercent: {
        type: Number,
        required: true,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Coupon", couponSchema); 