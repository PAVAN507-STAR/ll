import React, { useState, useEffect } from 'react';
import { fetchBooks, sendReminder } from '../services/api';
import './Reminder.css';

const Reminders = () => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [reminderData, setReminderData] = useState({
    userName: '',
    phone: ''
  });
  const [isSendingReminder, setIsSendingReminder] = useState(false);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const res = await fetchBooks();
      // Filter only books with issued copies
      const issuedBooks = res.data.filter(book => book.issuedCopies > 0);
      setBooks(issuedBooks);
    } catch (err) {
      setError('Error loading books');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReminder = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSendingReminder(true);

    try {
      if (!selectedBook) {
        setError('Please select a book');
        return;
      }

      if (!reminderData.userName || !reminderData.phone) {
        setError('Please provide both name and phone number');
        return;
      }

      await sendReminder({
        bookId: selectedBook._id,
        userName: reminderData.userName,
        phone: reminderData.phone
      });

      setSuccess(`Reminder sent successfully to ${reminderData.userName} for "${selectedBook.title}"`);
      setReminderData({ userName: '', phone: '' });
      setSelectedBook(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reminder');
    } finally {
      setIsSendingReminder(false);
    }
  };

  if (isLoading) return (
    <div className="loading-container">
      <div className="vintage-loader" />
      <p>Loading books...</p>
    </div>
  );

  return (
    <div className="reminder-container">
      <h2 className="reminder-title">Book Return Reminders</h2>
      
      {error && <div className="message error">{error}</div>}
      {success && <div className="message success">{success}</div>}

      {books.length === 0 ? (
        <div className="message">No books currently issued</div>
      ) : (
        <div className="reminder-content">
          <div className="books-list">
            <h3 className="form-title">Books with Issued Copies</h3>
            <div className="books-grid">
              {books.map(book => (
                <div 
                  key={book._id} 
                  className={`book-card ${selectedBook?._id === book._id ? 'selected' : ''}`}
                  onClick={() => setSelectedBook(book)}
                >
                  <h4 className="book-title">{book.title}</h4>
                  <p><strong>Class:</strong> {book.class}</p>
                  <p><strong>Issued Copies:</strong> {book.issuedCopies}</p>
                  <p><strong>Total Copies:</strong> {book.copies}</p>
                  <div className="card-footer">
                    <span>
                      {book.issuedCopies} of {book.copies} copies issued
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedBook && (
            <div className="reminder-form">
              <h3 className="form-title">Send Reminder for "{selectedBook.title}"</h3>
              <form onSubmit={handleSendReminder}>
                <div className="input-group">
                  <label className="form-label">Student Name:</label>
                  <input
                    type="text"
                    value={reminderData.userName}
                    onChange={(e) => setReminderData(prev => ({ ...prev, userName: e.target.value }))}
                    required
                    className="form-input"
                    disabled={isSendingReminder}
                    placeholder="Enter student name"
                  />
                </div>
                <div className="input-group">
                  <label className="form-label">Phone Number:</label>
                  <input
                    type="tel"
                    value={reminderData.phone}
                    onChange={(e) => setReminderData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                    className="form-input"
                    disabled={isSendingReminder}
                    placeholder="Enter phone number"
                    pattern="[0-9]+"
                  />
                  <small className="form-hint">Enter phone number without spaces or special characters</small>
                </div>
                <div className="button-group">
                  <button
                    type="submit"
                    className={`btn btn-primary ${isSendingReminder ? 'disabled' : ''}`}
                    disabled={isSendingReminder}
                  >
                    {isSendingReminder ? 'Sending...' : 'Send Reminder'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setSelectedBook(null);
                      setReminderData({ userName: '', phone: '' });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reminders; 