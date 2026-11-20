import React, { useState, useEffect } from 'react';
import { getDashboardStats, getAdminUsers, updateAdminUser } from '../services/dashboardService';
import { getClaims, updateClaimStatus } from '../services/claimService';
import { generateMatches } from '../services/matchingService';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import {
  Users,
  Search,
  PlusCircle,
  Sparkles,
  CheckCircle,
  XCircle,
  RefreshCw,
  Lock,
  Layers,
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [alert, setAlert] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'users', 'claims'

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, claimsData] = await Promise.all([
        getDashboardStats(),
        getAdminUsers(),
        getClaims(),
      ]);
      setStats(statsData);
      setUsers(usersData.results || (Array.isArray(usersData) ? usersData : []));
      setClaims(claimsData.results || (Array.isArray(claimsData) ? claimsData : []));
    } catch (err) {
      console.error("Admin data error:", err);
      setAlert({ type: 'danger', message: 'Failed to load administrative analytics.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleTriggerRescan = async () => {
    setScanning(true);
    try {
      const res = await generateMatches();
      setAlert({ type: 'success', message: `${res.message} Processed ${res.matches_found_or_updated} match comparisons across platform.` });
      fetchAdminData();
    } catch (e) {
      setAlert({ type: 'danger', message: 'Failed to trigger batch AI match scan.' });
    } finally {
      setScanning(false);
    }
  };

  const handleToggleUserActive = async (targetUser) => {
    try {
      await updateAdminUser(targetUser.id, { is_active: !targetUser.is_active });
      setAlert({ type: 'success', message: `User '${targetUser.username}' status updated.` });
      fetchAdminData();
    } catch (e) {
      setAlert({ type: 'danger', message: 'Failed to update user status.' });
    }
  };

  const handleClaimDecision = async (claimId, newStatus) => {
    try {
      await updateClaimStatus(claimId, newStatus, { admin_notes: 'Decision finalized by Administrator.' });
      setAlert({ type: 'success', message: `Claim #${claimId} marked as ${newStatus}.` });
      fetchAdminData();
    } catch (e) {
      setAlert({ type: 'danger', message: 'Failed to update claim.' });
    }
  };

  if (loading) return <LoadingSpinner message="Loading administrative intelligence dashboard..." />;

  const summary = stats?.summary || {};
  const breakdown = stats?.matches_breakdown || {};
  const categories = stats?.categories || [];

  return (
    <div>
      {/* Admin Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span className="badge badge-high">System Control Center</span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Admin Privileges Active</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Platform Administrator Dashboard</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Comprehensive analytics, user lifecycle administration, AI matching telemetry, and dispute arbitration.
          </p>
        </div>

        <button
          onClick={handleTriggerRescan}
          disabled={scanning}
          className="btn btn-primary btn-sm"
        >
          <RefreshCw size={16} className={scanning ? 'animate-spin' : ''} />
          {scanning ? 'Computing Global AI Embeddings...' : 'Batch AI Match Re-Scan'}
        </button>
      </div>

      <AlertMessage type={alert?.type} message={alert?.message} onClose={() => setAlert(null)} />

      {/* Tabs */}
      <div className="tabs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
        >
          Platform Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
        >
          User Management ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('claims')}
          className={`tab-btn ${activeTab === 'claims' ? 'active' : ''}`}
        >
          Ownership Claims & Disputes ({claims.length})
        </button>
      </div>

      {activeTab === 'overview' && (
        <div>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
            <div className="card card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Users size={20} color="#2563eb" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>TOTAL USERS</span>
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>{summary.total_users || 0}</h2>
              <span style={{ fontSize: '0.8rem', color: '#059669' }}>{summary.active_users || 0} active accounts</span>
            </div>

            <div className="card card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Search size={20} color="#b91c1c" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>LOST REPORTS</span>
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>{summary.total_lost_items || 0}</h2>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{summary.active_lost_items || 0} active search</span>
            </div>

            <div className="card card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <PlusCircle size={20} color="#047857" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>FOUND REPORTS</span>
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>{summary.total_found_items || 0}</h2>
              <span style={{ fontSize: '0.8rem', color: '#047857' }}>{summary.resolved_found_items || 0} returned to owners</span>
            </div>

            <div className="card card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <Sparkles size={20} color="#d97706" />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>AI MATCHES</span>
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>{summary.total_matches || 0}</h2>
              <span style={{ fontSize: '0.8rem', color: '#d97706' }}>{summary.accepted_matches || 0} accepted by users</span>
            </div>
          </div>

          {/* AI Telemetry Breakdown & Category Distribution */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <div className="card card-body">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} color="#2563eb" /> AI Matching Engine Metrics
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.75rem', backgroundColor: '#f0fdf4', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#166534' }}>High Confidence Matches (>= 70%)</span>
                  <strong>{breakdown.high || 0}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.75rem', backgroundColor: '#fefce8', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#854d0e' }}>Medium Confidence Matches (45% - 69%)</span>
                  <strong>{breakdown.medium || 0}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#475569' }}>Low Confidence Candidates (&lt; 45%)</span>
                  <strong>{breakdown.low || 0}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.75rem', backgroundColor: '#eff6ff', borderRadius: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#1e40af' }}>Mutually Accepted Matches</span>
                  <strong>{breakdown.accepted || 0}</strong>
                </div>
              </div>
            </div>

            <div className="card card-body">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={18} color="#2563eb" /> Category Volume Distribution
              </h3>
              <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                {categories.map((cat) => (
                  <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{cat.name}</span>
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem' }}>
                      <span className="badge badge-lost">{cat.lost_count} lost</span>
                      <span className="badge badge-found">{cat.found_count} found</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card card-body">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>Registered Users</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '0.75rem' }}>User</th>
                  <th style={{ padding: '0.75rem' }}>Email</th>
                  <th style={{ padding: '0.75rem' }}>Role</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem' }}>Joined</th>
                  <th style={{ padding: '0.75rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>
                      {u.username}
                      {u.first_name && <span style={{ color: '#64748b', fontWeight: 400, marginLeft: '4px' }}>({u.first_name} {u.last_name})</span>}
                    </td>
                    <td style={{ padding: '0.75rem' }}>{u.email}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`badge ${u.role === 'ADMIN' ? 'badge-high' : 'badge-low'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className={`badge ${u.is_active ? 'badge-active' : 'badge-lost'}`}>
                        {u.is_active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', color: '#64748b' }}>
                      {new Date(u.date_joined).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <button
                        onClick={() => handleToggleUserActive(u)}
                        className={`btn btn-${u.is_active ? 'danger' : 'success'} btn-sm`}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'claims' && (
        <div className="card card-body">
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>Disputed & Pending Claims</h3>
          {claims.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {claims.map((claim) => (
                <div key={claim.id} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div>
                      <strong style={{ fontSize: '1rem' }}>Claim #{claim.id} on '{claim.found_item_details?.item_name}'</strong>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', marginLeft: '0.75rem' }}>
                        Claimant: <strong>{claim.claimant?.username}</strong> ({claim.claimant?.email})
                      </span>
                    </div>
                    <span className="badge badge-active">{claim.status}</span>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: '#334155', marginBottom: '0.5rem' }}>
                    <strong>Proof Statement:</strong> {claim.proof_description}
                  </p>

                  {claim.unique_identifiers && (
                    <p style={{ fontSize: '0.85rem', color: '#047857', backgroundColor: '#ecfdf5', padding: '0.4rem 0.6rem', borderRadius: '4px', marginBottom: '0.75rem' }}>
                      <Lock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      <strong>Confidential Identifiers:</strong> {claim.unique_identifiers}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {claim.status !== 'APPROVED' && (
                      <button
                        onClick={() => handleClaimDecision(claim.id, 'APPROVED')}
                        className="btn btn-success btn-sm"
                      >
                        <CheckCircle size={14} /> Admin Approve
                      </button>
                    )}
                    {claim.status !== 'REJECTED' && (
                      <button
                        onClick={() => handleClaimDecision(claim.id, 'REJECTED')}
                        className="btn btn-danger btn-sm"
                      >
                        <XCircle size={14} /> Admin Reject
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#64748b' }}>No claims currently on record.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
