

import React, { useEffect, useState } from 'react';
import { fetchBalance, fetchUsers } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [balance, setBalance] = useState({ 
    totalIncome: 0, 
    totalExpense: 0, 
    net: 0
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [balanceRes, usersRes] = await Promise.all([
        fetchBalance(),
        fetchUsers()
      ]);

      setBalance(balanceRes.data);
      setUsers(usersRes.data);
      setError('');
    } catch (err) {
      setError('Error loading dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadData();
  }, []);

  // Listen for storage events
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'dashboardUpdate') {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Function to manually trigger refresh
  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    await loadData();
    // Notify other tabs/windows
    localStorage.setItem('dashboardUpdate', Date.now().toString());
  };

  // Make refreshDashboard available globally
  useEffect(() => {
    window.refreshDashboard = handleRefresh;
    return () => {
      delete window.refreshDashboard;
    };
  }, []);

  if (loading && !balance.totalIncome) return (
    <div className="loading-container">
      <div className="vintage-loader" />
      <p className="stat-subtext">Loading dashboard data...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <p className="error-text">{error}</p>
      <button 
        onClick={handleRefresh} 
        className="refresh-button"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Financial Overview</h1>
        {/* <button 
          onClick={handleRefresh} 
          className={`refresh-button ${isRefreshing ? 'refresh-button-disabled' : ''}`}
          disabled={isRefreshing}
          title="Refresh data"
        >
          <span className={`refresh-icon ${isRefreshing ? 'refresh-icon-spinning' : ''}`}>🔄</span>
          <span className="refresh-text">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button> */}
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">📈</span>
            <h3 className="stat-title">Total Income</h3>
          </div>
          <p className="stat-amount">₹{balance.totalIncome.toFixed(2)}</p>
          <p className="stat-subtext">All income including registrations, fines, etc.</p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">📉</span>
            <h3 className="stat-title">Total Expenses</h3>
          </div>
          <p className="stat-amount">₹{balance.totalExpense.toFixed(2)}</p>
          <p className="stat-subtext">All operational expenses</p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">💵</span>
            <h3 className="stat-title">Net Balance</h3>
          </div>
          <p className="stat-amount">₹{balance.net.toFixed(2)}</p>
          <p className="stat-subtext">Income - Expenses</p>
        </div>
      </div>

      <div className="recent-activity">
        <div className="activity-header">
          <h2 className="activity-title">Recent Registrations</h2>
          <p className="stat-subtext">Last 5 registrations</p>
        </div>

        <div className="table-container">
          <div className="table-wrapper">
            <table className="vintage-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Name</th>
                  <th>Balance</th>
                  <th>Registration Date</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(-5).reverse().map(user => (
                  <tr key={user._id}>
                    <td data-label="Username">{user.username}</td>
                    <td data-label="Name">{user.name}</td>
                    <td data-label="Balance">
                      <span className={`balance-badge ${user.balance > 0 ? 'positive' : 'negative'}`}>
                        ₹{user.balance?.toFixed(2) || '0.00'}
                      </span>
                    </td>
                    <td data-label="Registration Date">
                      {new Date(user.membershipStart).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;