import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import BookList from './components/BookList';
import BookForm from './components/BookForm';
import IssueReturn from './components/IssueReturn';
import UserList from './components/UserList';
import UserForm from './components/UserForm';
import Dashboard from './components/Dashboard';
import Reminder from './components/Reminder';
import CouponList from './components/CouponList';
import Login from './components/Login';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';
// import './App.css';
// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  if (loading) return null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Public route wrapper
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return children;
};

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return (
      <div style={styles.publicContainer}>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div style={styles.appWrapper}>
      <Navbar />
      <main style={styles.mainContent}>
        <div style={styles.contentWrapper}>
          <Routes>
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/books" element={<ProtectedRoute><BookList /></ProtectedRoute>} />
            <Route path="/add-book" element={<ProtectedRoute><BookForm /></ProtectedRoute>} />
            <Route path="/issue-return" element={<ProtectedRoute><IssueReturn /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute><UserList /></ProtectedRoute>} />
            <Route path="/add-user" element={<ProtectedRoute><UserForm /></ProtectedRoute>} />
            <Route path="/coupons" element={<ProtectedRoute><CouponList /></ProtectedRoute>} />
            <Route path="/reminder" element={<ProtectedRoute><Reminder /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div style={styles.app}>
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
};

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  },
  appWrapper: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh'
  },
  publicContainer: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  mainContent: {
    flex: 1,
    paddingTop: '64px',
    backgroundColor: '#f8fafc'
  },
  contentWrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    '@media (max-width: 768px)': {
      padding: '1rem'
    }
  }
};

// Add global styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f8fafc;
  }

  button {
    font-family: 'Inter', sans-serif;
  }

  input, select, textarea {
    font-family: 'Inter', sans-serif;
  }
`;
document.head.appendChild(styleSheet);

export default App;
