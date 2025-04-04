const Book = require('../models/Book');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { sendReminder } = require('../utils/whatsappService');
const Student = require('../models/Student');

// CRUD Operations
exports.addBook = async (req, res) => {
  try {
    const { title, class: bookClass, copies } = req.body;

    // Validate required fields
    if (!title || !bookClass || !copies) {
      return res.status(400).json({ error: 'Title, class, and copies are required' });
    }

    const book = new Book({
      title,
      class: bookClass,
      copies,
      status: true,
      issuedCopies: 0
    });

    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { title, class: bookClass, copies } = req.body;
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Don't allow copies to be less than issued copies
    if (copies && copies < book.issuedCopies) {
      return res.status(400).json({ 
        error: 'Cannot reduce copies below number of issued copies' 
      });
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { 
        title: title || book.title,
        class: bookClass || book.class,
        copies: copies || book.copies
      },
      { new: true }
    );

    res.json(updatedBook);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (book.issuedCopies > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete book while copies are issued' 
      });
    }

    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Issue and Return Operations
exports.issueBook = async (req, res) => {
  try {
    const { bookId, userId, quantity = 1 } = req.body;
    
    // Validate required fields
    if (!bookId || !userId) {
      return res.status(400).json({ error: 'Book ID and User ID are required' });
    }

    const [book, user] = await Promise.all([
      Book.findById(bookId),
      User.findById(userId)
    ]);

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!book.status) {
      return res.status(400).json({ error: 'Book is not available for issue' });
    }

    if (book.availableCopies < quantity) {
      return res.status(400).json({ error: 'Not enough copies available' });
    }

    // Update book's issuedTo array
    book.issuedTo.push({
      user: userId,
      quantity,
      issueDate: new Date()
    });
    book.issuedCopies += quantity;

    // Update user's borrowedBooks array
    user.borrowedBooks.push({
      book: bookId,
      quantity,
      issueDate: new Date()
    });

    if (book.issuedCopies === book.copies) {
      book.status = false;
    }

    // Save both documents
    await Promise.all([
      book.save(),
      user.save()
    ]);

    // Populate the book's issuedTo array with user details
    await book.populate('issuedTo.user');

    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.returnBook = async (req, res) => {
  try {
    const { bookId, userId, quantity = 1 } = req.body;

    if (!bookId || !userId) {
      return res.status(400).json({ error: 'Book ID and User ID are required' });
    }

    const [book, user] = await Promise.all([
      Book.findById(bookId),
      User.findById(userId)
    ]);

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find the issue record in book's issuedTo array
    const bookIssueIndex = book.issuedTo.findIndex(
      issue => issue.user.toString() === userId
    );

    if (bookIssueIndex === -1) {
      return res.status(404).json({ error: 'No active issue found for this book and user' });
    }

    // Find the issue record in user's borrowedBooks array
    const userBookIndex = user.borrowedBooks.findIndex(
      borrowed => borrowed.book.toString() === bookId
    );

    // Remove the issue records
    book.issuedTo.splice(bookIssueIndex, 1);
    user.borrowedBooks.splice(userBookIndex, 1);

    // Update book copies
    book.issuedCopies -= quantity;
    book.status = true;

    await Promise.all([
      book.save(),
      user.save()
    ]);

    res.json({ book, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send Reminder via WhatsApp for delayed returns
exports.sendReturnReminder = async (req, res) => {
  try {
    console.log('Received request body:', req.body); // Log entire request body
    const { bookId, studentName, phoneNo } = req.body; // Added phone field

    // Validate input
    if (!bookId) {
      return res.status(400).json({ error: 'Book ID is required' });
    }

    if (!studentName || typeof studentName !== 'string' || !studentName.trim()) {
      return res.status(400).json({ 
        error: 'Valid student name is required',
        received: {
          studentName,
          type: typeof studentName
        }
      });
    }

    // Find the book
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (book.issuedCopies === 0) {
      return res.status(400).json({ error: 'Book has no issued copies' });
    }

    // Find student in the database
    const student = await User.findOne({ 
      // name: { $regex: new RegExp(studentName.trim(), 'i') },
      name:studentName,
      // phone: phoneNo// Ensure phone number matches as well
    });

    if (!student) {
      return res.status(404).json({ 
        error: 'Student not found',
        searchedName: studentName
      });
    }

    // Construct and send message
    const message = `Hi ${student.name}, please return the book "${book.title}". Thank you!`;
    
    try {
      await sendReminder(student.phone, message);
    } catch (whatsappError) {
      console.error('WhatsApp reminder error:', whatsappError);
      return res.status(500).json({ 
        error: 'Failed to send WhatsApp reminder',
        details: whatsappError.message
      });
    }

    // Success response
    res.json({ 
      message: 'Reminder sent successfully',
      studentDetails: {
        name: student.name,
        phone: student.phone
      }
    });
  } catch (error) {
    console.error('Send reminder error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message
    });
  }
};
