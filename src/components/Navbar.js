import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUnreadCount } from '../services/notificationService';
import {
  Compass,
  Search,
  PlusCircle,
  Bell,
  Sparkles,
  MapPin,
  ShieldCheck,
  User,
  LogOut,
  FileText
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    const fetchUnread = async () => {
      if (isAuthenticated) {
        try {
          const res = await getUnreadCount();
          if (isMounted) setUnreadCount(res.unread_count);
        } catch (e) {
          // Silent ignore
        }
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // 30s polling for new notifications
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isAuthenticated, location]);

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <Compass size={28} />
          <span>SmartLost</span>
        </Link>

        {/* Desktop Navigation Links */}
        <ul className="navbar-nav" style={{ display: 'flex' }}>
          <li>
            <Link to="/lost-items" className={`nav-link ${location.pathname === '/lost-items' ? 'active' : ''}`}>
              <Search size={16} />
              <span>Lost Items</span>
            </Link>
          </li>
          <li>
            <Link to="/found-items" className={`nav-link ${location.pathname === '/found-items' ? 'active' : ''}`}>
              <PlusCircle size={16} />
              <span>Found Items</span>
            </Link>
          </li>
          <li>
            <Link to="/map" className={`nav-link ${location.pathname === '/map' ? 'active' : ''}`}>
              <MapPin size={16} />
              <span>Map Search</span>
            </Link>
          </li>

          {isAuthenticated && (
            <>
              <li>
                <Link to="/matches" className={`nav-link ${location.pathname === '/matches' ? 'active' : ''}`}>
                  <Sparkles size={16} />
                  <span>AI Matches</span>
                </Link>
              </li>
              <li>
                <Link to="/my-claims" className={`nav-link ${location.pathname === '/my-claims' ? 'active' : ''}`}>
                  <ShieldCheck size={16} />
                  <span>Claims</span>
                </Link>
              </li>
              <li>
                <Link to="/notifications" className={`nav-link ${location.pathname === '/notifications' ? 'active' : ''}`}>
                  <Bell size={16} />
                  <span>Notifications</span>
                  {unreadCount > 0 && <span className="badge-counter">{unreadCount}</span>}
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* Action Buttons / User Menu */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                  }}
                >
                  {user.first_name ? user.first_name[0].toUpperCase() : user.username[0].toUpperCase()}
                </div>
                <span>{user.username}</span>
                {isAdmin && <span className="badge badge-high" style={{ fontSize: '0.65rem' }}>Admin</span>}
              </button>

              {userDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '120%',
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    width: '200px',
                    zIndex: 1001,
                    overflow: 'hidden',
                  }}
                >
                  <Link
                    to="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1rem', fontSize: '0.9rem' }}
                    className="nav-link"
                  >
                    <Compass size={16} /> Dashboard
                  </Link>
                  <Link
                    to="/my-reports"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1rem', fontSize: '0.9rem' }}
                    className="nav-link"
                  >
                    <FileText size={16} /> My Reports
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1rem', fontSize: '0.9rem' }}
                    className="nav-link"
                  >
                    <User size={16} /> Profile Settings
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin-dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 1rem', fontSize: '0.9rem', color: '#b91c1c' }}
                      className="nav-link"
                    >
                      <ShieldCheck size={16} /> Admin Console
                    </Link>
                  )}
                  <div style={{ borderTop: '1px solid #e2e8f0' }} />
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.75rem 1rem',
                      fontSize: '0.9rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#ef4444',
                    }}
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/login" className="btn btn-outline btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}

          {/* Quick Report Buttons */}
          <Link to="/report-lost" className="btn btn-danger btn-sm" style={{ display: 'none', sm: 'inline-flex' }}>
            Report Lost
          </Link>
          <Link to="/report-found" className="btn btn-success btn-sm" style={{ display: 'none', sm: 'inline-flex' }}>
            Report Found
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
