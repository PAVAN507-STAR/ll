const User = require('../models/User');
const Coupon = require('../models/Coupon');
const Transaction = require('../models/Transaction');

// CRUD for Users
exports.addUser = async (req, res) => {
  try {
    const { couponCode, ...userData } = req.body;
    let initialBalance = 100; // Default initial balance

    // If coupon code is provided, validate and apply it
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode });
      
      if (!coupon) {
        return res.status(400).json({ error: 'Invalid coupon code' });
      }

      const now = new Date();
      if (now < coupon.validFrom || now > coupon.validTo) {
        return res.status(400).json({ error: 'Coupon is not valid at this time' });
      }

      if (!coupon.status) {
        return res.status(400).json({ error: 'Coupon is inactive' });
      }

    // Final check for usage limit
    if (coupon.usageCount >= coupon.usageLimit) {
      // Release temporary hold
      await Coupon.findByIdAndUpdate(coupon._id, {
          $inc: { tempHolds: -1 }
      });
      return res.status(400).json({ error: 'Coupon usage limit reached' });
    }
      // Apply discount to initial balance
      const discount = (coupon.discountPercent / 100) * initialBalance;
      initialBalance -= discount;

      // Update coupon usage and remove temporary hold
      await Coupon.findByIdAndUpdate(coupon._id, {
        $inc: { 
            usageCount: 1,
            tempHolds: -1
        }
    });

      // Increment coupon usage
      coupon.usageCount += 1;
      await coupon.save();
    }

    const user = new User({
      ...userData,
      balance: initialBalance
    });

    // Create a transaction record for the registration fee
    const transaction = new Transaction({
      type: 'income',
      category: 'registration',
      amount: initialBalance,
      description: `Registration fee for user ${userData.username}`
    });

    // Save both user and transaction
    await Promise.all([
      user.save(),
      transaction.save()
    ]);

    res.status(201).json(user);
  } catch (error) {
    // If there's an error, release the temporary hold
    if (req.body.couponCode) {
      await Coupon.findOneAndUpdate(
          { code: req.body.couponCode },
          { $inc: { tempHolds: -1 } }
      );
    }
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(400).json({ error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
