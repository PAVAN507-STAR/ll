import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addBook } from '../services/api';
import './BookForm.css';

const BookForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    class: '',
    copies: 1
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'copies' ? parseInt(value) || '' : value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await addBook(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error adding book');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="book-form-container">
      <h2 className="form-title">Add New Book</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="book-form">
        <div className="form-group">
          <label className="form-label">Title:</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="form-input"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Class:</label>
          <input
            type="text"
            name="class"
            value={formData.class}
            onChange={handleChange}
            required
            className="form-input"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Number of Copies:</label>
          <input
            type="number"
            name="copies"
            value={formData.copies}
            onChange={handleChange}
            required
            min="1"
            className="form-input"
            disabled={isLoading}
          />
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={isLoading}
        >
          {isLoading ? 'Adding...' : 'Add Book'}
        </button>
      </form>
    </div>
  );
};

export default BookForm;
