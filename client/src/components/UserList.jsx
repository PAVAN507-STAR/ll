import React, { useEffect, useState } from 'react';
import { fetchUsers, deleteUser } from '../services/api';
import './UserList.css';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetchUsers();
      setUsers(res.data);
      setError('');
    } catch (err) {
      setError('Error loading users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await deleteUser(id);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Error deleting user');
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="vintage-loader" />
      <p>Loading users...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <p className="error-text">{error}</p>
      <button 
        onClick={loadUsers} 
        className="retry-button"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="users-container">
      <div className="users-header">
        <h1 className="users-title">User Management</h1>
        <button 
          onClick={loadUsers} 
          className="refresh-button"
          title="Refresh users"
        >
          <span>🔄</span>
          <span>Refresh</span>
        </button>
      </div>

      <div className="table-wrapper">
        <table className="vintage-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Age</th>
              <th>Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td data-label="Username">{user.username}</td>
                <td data-label="Name">{user.name}</td>
                <td data-label="Phone">{user.phone}</td>
                <td data-label="Age">{user.age || '-'}</td>
                <td data-label="Balance">
                  <span className={`balance-badge ${user.balance > 0 ? 'positive' : 'negative'}`}>
                    ₹{user.balance?.toFixed(2) || '0.00'}
                  </span>
                </td>
                <td data-label="Actions">
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="delete-button"
                    title="Delete user"
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-message">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;