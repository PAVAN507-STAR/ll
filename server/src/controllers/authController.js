const jwt = require('jsonwebtoken');
const config = require('../config/config');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check admin credentials
    if (username !== config.ADMIN_USERNAME || password !== config.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { username: config.ADMIN_USERNAME, isAdmin: true },
      config.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        username: config.ADMIN_USERNAME,
        isAdmin: true
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};