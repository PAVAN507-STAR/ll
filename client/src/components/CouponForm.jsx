import React, { useState } from 'react';
import { addCoupon } from '../services/api';
import './CouponForm.css';

const CouponForm = ({ refreshCoupons }) => {
  const [formData, setFormData] = useState({
    code: '',
    validFrom: '',
    validTo: '',
    usageLimit: '',
    discountPercent: ''
  });
  const [error, setError] = useState('');

  const handleChange = e => {
    setFormData({...formData, [e.target.name]: e.target.value});
    if (error) setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await addCoupon(formData);
      setFormData({
        code: '',
        validFrom: '',
        validTo: '',
        usageLimit: '',
        discountPercent: ''
      });
      setError('');
      refreshCoupons && refreshCoupons();
    } catch (err) {
      setError(err.response?.data?.error || 'Error creating coupon. Please try again.');
      console.error('Error creating coupon:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="coupon-form">
      <h2 className="form-title">Create Coupon</h2>
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label className="form-label">Coupon Code:*</label>
        <input 
          type="text" 
          name="code" 
          value={formData.code} 
          onChange={handleChange} 
          required 
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Valid From:*</label>
        <input 
          type="datetime-local" 
          name="validFrom" 
          value={formData.validFrom} 
          onChange={handleChange} 
          required 
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Valid To:*</label>
        <input 
          type="datetime-local" 
          name="validTo" 
          value={formData.validTo} 
          onChange={handleChange} 
          required 
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Usage Limit:*</label>
        <input 
          type="number" 
          name="usageLimit" 
          value={formData.usageLimit} 
          onChange={handleChange} 
          required 
          min="1"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Discount Percentage:*</label>
        <input 
          type="number" 
          name="discountPercent" 
          value={formData.discountPercent} 
          onChange={handleChange}
          required
          min="0"
          max="100"
          className="form-input"
        />
      </div>

      <button 
        type="submit" 
        className="submit-button"
      >
        Create Coupon
      </button>
    </form>
  );
};

export default CouponForm; 