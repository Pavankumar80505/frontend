import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getNotifications, markAsRead, markAllAsRead } from '../services/notificationService';
import LoadingSpinner from '../components/LoadingSpinner';
import { Bell, CheckCheck, Sparkles, ShieldCheck, Info } from 'lucide-react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filterUnread, setFilterUnread] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const params = filterUnread ? { is_read: 'false' } : {};
      const data = await getNotifications(params);
      setNotifications(data.results || (Array.isArray(data) ? data : []));
    } catch (err) {
      console.error("Notifications fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [filterUnread]);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'MATCH_FOUND':
        return <Sparkles size={20} color="#2563eb" />;
      case 'CLAIM_RECEIVED':
      case 'CLAIM_APPROVED':
      case 'CLAIM_REJECTED':
        return <ShieldCheck size={20} color="#059669" />;
      default:
        return <Info size={20} color="#64748b" />;
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Bell size={24} color="#2563eb" /> Notifications & Alerts
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Stay updated on potential AI image matches, ownership claims, and report status changes.
          </p>
        </div>

        <button onClick={handleMarkAllRead} className="btn btn-outline btn-sm">
          <CheckCheck size={16} /> Mark All as Read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="tabs">
        <button
          onClick={() => setFilterUnread(false)}
          className={`tab-btn ${!filterUnread ? 'active' : ''}`}
        >
          All Notifications
        </button>
        <button
          onClick={() => setFilterUnread(true)}
          className={`tab-btn ${filterUnread ? 'active' : ''}`}
        >
          Unread Only
        </button>
      </div>

      {/* List */}
      {loading ? (
        <LoadingSpinner message="Loading notifications..." />
      ) : notifications.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              className="card card-body"
              style={{
                display: 'flex',
                gap: '1rem',
                backgroundColor: n.is_read ? '#ffffff' : '#f0f9ff',
                borderLeft: n.is_read ? '1px solid #e2e8f0' : '4px solid #2563eb',
                transition: 'background-color 0.15s ease',
              }}
            >
              <div style={{ flexShrink: 0, marginTop: '2px' }}>
                {getNotificationIcon(n.notification_type)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: n.is_read ? 600 : 700 }}>
                    {n.title}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>

                <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '0.75rem' }}>
                  {n.message}
                </p>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {n.related_match_id && (
                    <Link to="/matches" className="btn btn-outline btn-sm">
                      View AI Match
                    </Link>
                  )}
                  {n.related_claim_id && (
                    <Link to="/my-claims" className="btn btn-outline btn-sm">
                      View Claim
                    </Link>
                  )}
                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(n.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem' }}
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Bell size={40} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>No Notifications</h3>
          <p style={{ color: '#64748b' }}>You are completely caught up!</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
