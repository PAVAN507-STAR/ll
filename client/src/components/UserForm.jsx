import React, { useState, useEffect } from 'react';
import { addUser, validateCoupon } from '../services/api';
import './UserForm.css';

const UserForm = ({ refreshUsers }) => {
  const initialBalance = 100; // Default initial balance
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    phone: '',
    age: ''
  });
  const [couponCode, setCouponCode] = useState('');
  const [error, setError] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [finalBalance, setFinalBalance] = useState(initialBalance);

  // Load saved data when component mounts
  useEffect(() => {
    const savedData = localStorage.getItem('userData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setFormData(parsedData.formData || {});
      setCouponCode(parsedData.couponCode || '');
      setAppliedDiscount(parsedData.appliedDiscount || null);
      setFinalBalance(parsedData.finalBalance || initialBalance);
      setCouponMessage(parsedData.couponMessage || '');
    }
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    const dataToSave = {
      formData,
      couponCode,
      appliedDiscount,
      finalBalance,
      couponMessage
    };
    localStorage.setItem('userData', JSON.stringify(dataToSave));
  }, [formData, couponCode, appliedDiscount, finalBalance, couponMessage]);

  const handleChange = e => {
    setFormData({...formData, [e.target.name]: e.target.value});
    if (error) setError('');
  };

  const handleCouponChange = (e) => {
    setCouponCode(e.target.value);
    setCouponMessage('');
    setAppliedDiscount(null);
    setFinalBalance(initialBalance); // Reset balance when coupon changes
  };

  const handleValidateCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      setCouponMessage('Please enter a coupon code');
      return;
    }
  
    try {
      const response = await validateCoupon(couponCode);
      const discountPercent = response.data.discountPercent;
      setAppliedDiscount(discountPercent);
      // Calculate the discounted amount
      const discountAmount = (discountPercent / 100) * initialBalance;
      // Subtract the discount from initial balance
      const newBalance = initialBalance - discountAmount;
      setFinalBalance(newBalance);
      setCouponMessage(`Coupon applied! ${discountPercent}% discount applied. Saved ₹${discountAmount.toFixed(2)}`);
    } catch (err) {
      setCouponMessage(err.response?.data?.error || 'Invalid coupon');
      setAppliedDiscount(null);
      setFinalBalance(initialBalance);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const userData = {
        ...formData,
        couponCode: appliedDiscount ? couponCode : undefined,
        balance: finalBalance
      };
      await addUser(userData);
      
      // Clear form and localStorage after successful submission
      setFormData({ username: '', password: '', name: '', phone: '', age: '' });
      setCouponCode('');
      setAppliedDiscount(null);
      setCouponMessage('');
      setError('');
      setFinalBalance(initialBalance);
      localStorage.removeItem('userData');
      
      // Refresh the dashboard data
      if (window.refreshDashboard) {
        window.refreshDashboard();
      }
      
      refreshUsers && refreshUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Error adding user. Please try again.');
      console.error('Error adding user:', err);
    }
  };

  return (
    <div className="user-form-container">
      <form onSubmit={handleSubmit}>
        <h2 className="form-title">Add New Reader</h2>
        {error && <div className="error-message">{error}</div>}
        
        <div className="balance-info">
          <div className="initial-balance">
            Initial Balance: ₹{initialBalance}
          </div>
          {appliedDiscount && (
            <>
              <div className="bonus-amount">
                Discount Amount: ₹{(initialBalance - finalBalance).toFixed(2)}
              </div>
              <div className="final-balance">
                Final Balance: ₹{finalBalance.toFixed(2)}
              </div>
            </>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Username:*</label>
          <input 
            type="text" 
            name="username" 
            value={formData.username} 
            onChange={handleChange} 
            required 
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password:*</label>
          <input 
            type="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            required 
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Name:*</label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Phone:*</label>
          <input 
            type="text" 
            name="phone" 
            value={formData.phone} 
            onChange={handleChange} 
            required 
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Age:</label>
          <input 
            type="number" 
            name="age" 
            value={formData.age} 
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Have a coupon?</label>
          <div className="coupon-section">
            <input 
              type="text" 
              value={couponCode} 
              onChange={handleCouponChange}
              placeholder="Enter coupon code"
              className="form-input coupon-input"
            />
            <button 
              onClick={handleValidateCoupon}
              type="button"
              className="validate-button"
            >
              Validate
            </button>
          </div>
          {couponMessage && (
            <div className={`coupon-message ${appliedDiscount ? 'success' : 'error'}`}>
              {couponMessage}
            </div>
          )}
        </div>

        <button type="submit" className="submit-button">
          Add Reader
        </button>
      </form>
    </div>
  );
};

export default UserForm;
