
import React, { useState, useEffect } from 'react';
import { fetchCoupons, deleteCoupon, updateCoupon } from '../services/api';
import CouponForm from './CouponForm';
import './CouponList.css';

const CouponList = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedCoupon, setExpandedCoupon] = useState(null);

  const loadCoupons = async () => {
    try {
      const response = await fetchCoupons();
      setCoupons(response.data);
    } catch (err) {
      setError('Failed to load coupons');
      console.error('Error loading coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleDelete = async (id, event) => {
    if (event) {
      event.stopPropagation();
    }
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    
    try {
      await deleteCoupon(id);
      await loadCoupons();
    } catch (err) {
      setError(err.response?.data?.error || 'Error deleting coupon');
    }
  };

  const handleToggleStatus = async (coupon, event) => {
    if (event) {
      event.stopPropagation();
    }
    try {
      await updateCoupon(coupon._id, { status: !coupon.status });
      await loadCoupons();
    } catch (err) {
      setError(err.response?.data?.error || 'Error updating coupon');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const toggleExpand = (id) => {
    setExpandedCoupon(expandedCoupon === id ? null : id);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="vintage-loader">Loading coupons...</div>
      </div>
    );
  }

  return (
    <div className="coupon-container">
      <h2 className="page-title">Coupon Management</h2>
      
      <div className="form-section">
        <CouponForm refreshCoupons={loadCoupons} />
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Desktop view */}
      <div className="desktop-view">
        <div className="table-wrapper">
          <table className="vintage-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Valid From</th>
                <th>Valid To</th>
                <th>Usage</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(coupon => (
                <tr key={coupon._id}>
                  <td>{coupon.code}</td>
                  <td>{coupon.discountPercent}%</td>
                  <td>{formatDate(coupon.validFrom)}</td>
                  <td>{formatDate(coupon.validTo)}</td>
                  <td>{coupon.usageCount} / {coupon.usageLimit}</td>
                  <td>
                    <span className={`status-badge ${coupon.status ? 'status-active' : 'status-inactive'}`}>
                      {coupon.status ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button
                      onClick={(e) => handleToggleStatus(coupon, e)}
                      className={`btn ${coupon.status ? 'btn-deactivate' : 'btn-activate'}`}
                    >
                      {coupon.status ? 'Deactivate' : 'Activate'}
                    </button>
                    {coupon.usageCount === 0 && (
                      <button
                        onClick={(e) => handleDelete(coupon._id, e)}
                        className="btn btn-delete"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile view */}
      <div className="mobile-view">
        <div className="coupon-cards">
          {coupons.map(coupon => (
            <div 
              key={coupon._id} 
              className="coupon-card"
              onClick={() => toggleExpand(coupon._id)}
            >
              <div className="coupon-header">
                <div className="coupon-main-info">
                  <div className="coupon-code">{coupon.code}</div>
                  <div className="coupon-discount">{coupon.discountPercent}%</div>
                </div>
                <div className="coupon-status">
                  <span className={`status-badge ${coupon.status ? 'status-active' : 'status-inactive'}`}>
                    {coupon.status ? 'Active' : 'Inactive'}
                  </span>
                  <span className="expand-icon">{expandedCoupon === coupon._id ? '▼' : '▶'}</span>
                </div>
              </div>
              
              {expandedCoupon === coupon._id && (
                <div className="coupon-details">
                  <div className="coupon-detail">
                    <span className="detail-label">Valid From:</span>
                    <span className="detail-value">{formatDate(coupon.validFrom)}</span>
                  </div>
                  <div className="coupon-detail">
                    <span className="detail-label">Valid To:</span>
                    <span className="detail-value">{formatDate(coupon.validTo)}</span>
                  </div>
                  <div className="coupon-detail">
                    <span className="detail-label">Usage:</span>
                    <span className="detail-value">{coupon.usageCount} / {coupon.usageLimit}</span>
                  </div>
                  <div className="coupon-actions">
                    <button
                      onClick={(e) => handleToggleStatus(coupon, e)}
                      className={`btn ${coupon.status ? 'btn-deactivate' : 'btn-activate'}`}
                    >
                      {coupon.status ? 'Deactivate' : 'Activate'}
                    </button>
                    {coupon.usageCount === 0 && (
                      <button
                        onClick={(e) => handleDelete(coupon._id, e)}
                        className="btn btn-delete"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CouponList;