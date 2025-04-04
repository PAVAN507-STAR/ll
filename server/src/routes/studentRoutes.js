const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { authMiddleware } = require('../middleware/authMiddleware');

// Search students by name
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { name } = req.query;
    
    if (!name) {
      return res.status(400).json({ error: 'Name query is required' });
    }

    // Search using case-insensitive regex
    const students = await Student.find({
      name: { $regex: name, $options: 'i' }
    })
    .limit(5) // Limit results to prevent overwhelming response
    .select('name class phone'); // Only send necessary fields

    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new student
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, phone, class: studentClass } = req.body;

    const student = new Student({
      name,
      phone,
      class: studentClass
    });

    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all students
router.get('/', authMiddleware, async (req, res) => {
  try {
    const students = await Student.find().select('-__v');
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 