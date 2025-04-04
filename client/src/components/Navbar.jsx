import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const menuRef = useRef(null);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { 
      label: 'Books', 
      icon: '📚',
      submenu: [
        { path: '/books', label: 'View Books' },
        { path: '/add-book', label: 'Add Book' },
      ]
    },
    { path: '/issue-return', label: 'Issue/Return', icon: '🔄' },
    { 
      label: 'Users', 
      icon: '👥',
      submenu: [
        { path: '/users', label: 'View Users' },
        { path: '/add-user', label: 'Add User' },
      ]
    },
    { path: '/coupons', label: 'Coupons', icon: '🎟️' },
    { path: '/reminder', label: 'Reminder', icon: '⏰' }
  ];

  // Handle click outside to close dropdown and mobile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setExpandedMenu(null);
        
        // Also close the entire mobile menu when clicking outside
        if (isOpen) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]); // Added isOpen to dependency array

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSubmenu = (label) => {
    if (expandedMenu === label) {
      setExpandedMenu(null);
    } else {
      setExpandedMenu(label);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isSubmenuActive = (submenu) => {
    // Check if submenu exists before calling .some()
    return submenu && submenu.some(item => location.pathname === item.path);
  };

  return (
    <>
      {/* Add overlay div for mobile */}
      <div 
        className={`nav-overlay ${isOpen ? 'open' : ''}`} 
        onClick={() => setIsOpen(false)}
      />
      
      <nav className="navbar">
        <div className="nav-content">
          <Link to="/dashboard" className="logo">
            <span className="logo-icon">📚</span>
            <span className="logo-text">Little Library</span>
          </Link>

          <button 
            className="menu-button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <div className="menu-icon">
              <span className={`menu-bar ${isOpen ? 'hidden' : ''}`} />
              <span className={`menu-bar ${isOpen ? 'hidden' : ''}`} />
              <span className={`menu-bar ${isOpen ? 'hidden' : ''}`} />
            </div>
          </button>

          <div className={`nav-links ${isOpen ? 'open' : 'closed'}`} ref={menuRef}>
            <div className="mobile-close">
              <button 
                className="close-button"
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            <div className="link-group">
              {navItems.map((item) => (
                <div key={item.label} className={`nav-item-container ${item.submenu && isSubmenuActive(item.submenu) ? 'active-container' : ''}`}>
                  {item.submenu ? (
                    <>
                      <button 
                        className={`nav-link has-submenu ${isSubmenuActive(item.submenu) ? 'active' : ''}`}
                        onClick={() => toggleSubmenu(item.label)}
                      >
                        <div className="nav-link-content">
                          <span className="nav-icon">{item.icon}</span>
                          <span className="nav-label">{item.label}</span>
                        </div>
                        <span className="dropdown-arrow">
                          {expandedMenu === item.label ? '▼' : '▶'}
                        </span>
                      </button>
                      <div className={`submenu ${expandedMenu === item.label ? 'expanded' : ''}`}>
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className={`submenu-link ${isActive(subItem.path) ? 'active' : ''}`}
                            onClick={() => {
                              setIsOpen(false);
                              setExpandedMenu(null);
                            }}
                          >
                            <span className="submenu-label">{subItem.label}</span>
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    <Link
                      to={item.path}
                      className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="nav-link-content">
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                      </div>
                    </Link>
                  )}
                </div>
              ))}
            </div>
            <button 
              onClick={handleLogout}
              className="logout-button"
            >
              <span className="logout-icon">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>
      <div className="nav-spacer" />
    </>
  );
};

export default Navbar;