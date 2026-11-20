import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock } from 'lucide-react';
import AlertMessage from '../components/AlertMessage';

const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuth();

  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone_number: user?.phone_number || '',
  });

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: '',
  });

  const [profileAlert, setProfileAlert] = useState(null);
  const [passwordAlert, setPasswordAlert] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileAlert(null);
    setProfileLoading(true);
    try {
      await updateProfile(profileData);
      setProfileAlert({ type: 'success', message: 'Profile updated successfully.' });
    } catch (err) {
      setProfileAlert({ type: 'danger', message: 'Failed to update profile details.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordAlert(null);

    if (passwordData.new_password !== passwordData.new_password_confirm) {
      setPasswordAlert({ type: 'danger', message: 'New passwords do not match.' });
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(passwordData);
      setPasswordAlert({ type: 'success', message: 'Password updated successfully.' });
      setPasswordData({ old_password: '', new_password: '', new_password_confirm: '' });
    } catch (err) {
      const msg = err.response?.data?.old_password?.[0] ||
                  err.response?.data?.detail ||
                  'Failed to change password. Please verify your current password.';
      setPasswordAlert({ type: 'danger', message: msg });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
        Profile & Account Settings
      </h1>
      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
        Manage your contact details, security credentials, and platform preferences.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Profile Information Card */}
        <div className="card card-body">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={20} color="#2563eb" /> Profile Details
          </h2>

          <AlertMessage type={profileAlert?.type} message={profileAlert?.message} onClose={() => setProfileAlert(null)} />

          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                disabled
                className="form-control"
                value={user?.username || ''}
                style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
              />
              <span className="form-text">User handle cannot be changed.</span>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                disabled
                className="form-control"
                value={user?.email || ''}
                style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileData.first_name}
                  onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileData.last_name}
                  onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                value={profileData.phone_number}
                onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })}
              />
            </div>

            <button type="submit" disabled={profileLoading} className="btn btn-primary" style={{ width: '100%' }}>
              {profileLoading ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="card card-body">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={20} color="#2563eb" /> Security & Password
          </h2>

          <AlertMessage type={passwordAlert?.type} message={passwordAlert?.message} onClose={() => setPasswordAlert(null)} />

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="form-label">Current Password *</label>
              <input
                type="password"
                required
                className="form-control"
                value={passwordData.old_password}
                onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password *</label>
              <input
                type="password"
                required
                minLength={6}
                className="form-control"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
              />
              <span className="form-text">Minimum 6 characters.</span>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password *</label>
              <input
                type="password"
                required
                minLength={6}
                className="form-control"
                value={passwordData.new_password_confirm}
                onChange={(e) => setPasswordData({ ...passwordData, new_password_confirm: e.target.value })}
              />
            </div>

            <button type="submit" disabled={passwordLoading} className="btn btn-secondary" style={{ width: '100%' }}>
              {passwordLoading ? 'Updating...' : 'Change Password'}
            </button>
          </form>

          <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>Account Role</h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Assigned role: <strong style={{ textTransform: 'uppercase', color: '#2563eb' }}>{user?.role}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
