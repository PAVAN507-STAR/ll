import React, { useState, useEffect } from 'react';
import { fetchBooks, fetchUsers, issueBook, returnBook } from '../services/api';
import './IssueReturn.css';

const IssueReturn = () => {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [operation, setOperation] = useState('issue');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [booksRes, usersRes] = await Promise.all([
        fetchBooks(),
        fetchUsers()
      ]);
      setBooks(booksRes.data);
      setUsers(usersRes.data);
      setError('');
    } catch (err) {
      setError('Error loading data');
    }
  };

  const getAvailableBooks = () => {
    if (operation === 'issue') {
      return books.filter(book => book.availableCopies > 0);
    } else {
      if (!selectedUser) return [];
      const user = users.find(u => u._id === selectedUser);
      if (!user || !user.borrowedBooks) return [];
      
      return user.borrowedBooks.map(borrowed => {
        const book = books.find(b => b._id === borrowed.book);
        return {
          ...book,
          borrowedQuantity: borrowed.quantity
        };
      }).filter(Boolean);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const book = books.find(b => b._id === selectedBook);
      const user = users.find(u => u._id === selectedUser);

      if (!book || !user) {
        setError('Please select both book and user');
        return;
      }

      if (operation === 'issue') {
        if (book.availableCopies < quantity) {
          setError(`Only ${book.availableCopies} copies available`);
          return;
        }
        await issueBook({ 
          bookId: selectedBook, 
          userId: selectedUser, 
          quantity 
        });
        setSuccess(`Successfully issued ${quantity} copy(s) of "${book.title}" to ${user.name}`);
      } else {
        await returnBook({ 
          bookId: selectedBook, 
          userId: selectedUser, 
          quantity 
        });
        setSuccess(`Successfully returned ${quantity} copy(s) of "${book.title}" from ${user.name}`);
      }

      // Reload data to get updated state
      loadData();
      
      // Reset form
      setSelectedBook('');
      setSelectedUser('');
      setQuantity(1);
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="issue-return-container">
      <h2 className="form-title">
        {operation === 'issue' ? 'Issue Book' : 'Return Book'}
      </h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="operation-toggle">
        <button 
          className={`toggle-button ${operation === 'issue' ? 'active' : ''}`}
          onClick={() => setOperation('issue')}
        >
          Issue
        </button>
        <button 
          className={`toggle-button ${operation === 'return' ? 'active' : ''}`}
          onClick={() => setOperation('return')}
        >
          Return
        </button>
      </div>

      <form onSubmit={handleSubmit} className="issue-return-form">
        <div className="form-group">
          <label>Select User:</label>
          <select
            value={selectedUser}
            onChange={(e) => {
              setSelectedUser(e.target.value);
              setSelectedBook('');
            }}
            required
            disabled={isLoading}
          >
            <option value="">Choose a user...</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.username})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Select Book:</label>
          <select
            value={selectedBook}
            onChange={(e) => setSelectedBook(e.target.value)}
            required
            disabled={isLoading || !selectedUser}
          >
            <option value="">Choose a book...</option>
            {getAvailableBooks().map(book => (
              <option 
                key={book._id} 
                value={book._id}
              >
                {book.title} 
                {operation === 'issue' 
                  ? ` (${book.availableCopies} available)`
                  : ` (${book.borrowedQuantity} borrowed)`}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Quantity:</label>
          <input
            type="number"
            min="1"
            max={operation === 'issue' 
              ? books.find(b => b._id === selectedBook)?.availableCopies 
              : getAvailableBooks().find(b => b._id === selectedBook)?.borrowedQuantity}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            required
            disabled={isLoading || !selectedBook}
          />
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : operation === 'issue' ? 'Issue Book' : 'Return Book'}
        </button>
      </form>

      {selectedUser && (
        <div className="borrowed-books-section">
          <h3>Currently Borrowed Books</h3>
          {users.find(u => u._id === selectedUser)?.borrowedBooks?.length > 0 ? (
            <ul className="borrowed-books-list">
              {users.find(u => u._id === selectedUser).borrowedBooks.map(borrowed => {
                const book = books.find(b => b._id === borrowed.book);
                return book ? (
                  <li key={book._id} className="borrowed-book-item">
                    <span className="book-title">{book.title}</span>
                    <span className="book-quantity">Quantity: {borrowed.quantity}</span>
                    <span className="issue-date">
                      Issued: {new Date(borrowed.issueDate).toLocaleDateString()}
                    </span>
                  </li>
                ) : null;
              })}
            </ul>
          ) : (
            <p className="no-books-message">No books currently borrowed</p>
          )}
        </div>
      )}
    </div>
  );
};

export default IssueReturn;
