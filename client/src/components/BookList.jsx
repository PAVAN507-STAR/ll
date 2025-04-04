import React, { useEffect, useState } from 'react';
import { fetchBooks, deleteBook } from '../services/api';
import './BookList.css';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadBooks = async () => {
    try {
      const res = await fetchBooks();
      setBooks(res.data);
    } catch (err) {
      setError('Error loading books');
      console.error('Error fetching books:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    
    try {
      await deleteBook(id);
      loadBooks();
    } catch (err) {
      setError(err.response?.data?.error || 'Error deleting book');
    }
  };

  if (isLoading) return (
    <div className="loading-container">
      <div className="vintage-loader">Loading books...</div>
    </div>
  );

  if (error) return (
    <div className="error-container">{error}</div>
  );

  return (
    <div className="book-list-container">
      <h2 className="book-list-title">Book Inventory</h2>
      {books.length === 0 ? (
        <p className="no-books">No books available</p>
      ) : (
        <div className="books-grid">
          {books.map(book => (
            <div key={book._id} className="book-card">
              <h3 className="book-title">{book.title}</h3>
              <div className="book-details">
                <p><strong>Class:</strong> {book.class}</p>
                <p><strong>Total Copies:</strong> {book.copies}</p>
                <p><strong>Available:</strong> {book.availableCopies}</p>
                <p>
                  <strong>Status:</strong>
                  <span className={`status-badge ${book.status ? 'status-available' : 'status-unavailable'}`}>
                    {book.status ? 'Available' : 'Unavailable'}
                  </span>
                </p>
                <p><strong>Added:</strong> {new Date(book.addedAt).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => handleDelete(book._id)}
                className="delete-button"
                disabled={book.issuedCopies > 0}
                title={book.issuedCopies > 0 ? "Cannot delete while copies are issued" : "Delete book"}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookList;
