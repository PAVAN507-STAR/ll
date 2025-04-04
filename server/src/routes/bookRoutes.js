const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

// Book CRUD Routes
router.post('/', bookController.addBook);       // Add a book
router.get('/', bookController.getBooks);       // Get all books
router.put('/:id', bookController.updateBook);  // Update book details
router.delete('/:id', bookController.deleteBook); // Delete a book

// Book Issue, Return, and Reminder Routes
router.post('/issue', bookController.issueBook);      // Issue a book
router.post('/return', bookController.returnBook);    // Return a book
router.post('/reminder', bookController.sendReturnReminder); // Send return reminder

module.exports = router;
