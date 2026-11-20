import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getClaims, updateClaimStatus } from '../services/claimService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import { ShieldCheck, Check, X, Lock } from 'lucide-react';

const MyClaimsPage = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('received'); // 'received' or 'submitted'
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(
    searchParams.get('submitted') === 'true'
      ? { type: 'success', message: 'Ownership claim successfully submitted! The finder has been notified.' }
      : null
  );
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const { user } = useAuth();

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const data = await getClaims();
      setClaims(data.results || (Array.isArray(data) ? data : []));
    } catch (err) {
      console.error("Claims error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const submittedClaims = claims.filter((c) => c.claimant?.id === user?.id);
  const receivedClaims = claims.filter((c) => c.found_item_details?.user?.id === user?.id);

  const displayedClaims = activeTab === 'submitted' ? submittedClaims : receivedClaims;

  const handleDecision = async (claimId, newStatus) => {
    setActionLoading(true);
    try {
      await updateClaimStatus(claimId, newStatus, { finder_notes: reviewNotes });
      setAlert({ type: 'success', message: `Claim marked as ${newStatus}. Claimant has been notified.` });
      setSelectedClaim(null);
      setReviewNotes('');
      fetchClaims();
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to update claim status.' });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (st) => {
    const map = {
      PENDING: 'badge-matched',
      UNDER_REVIEW: 'badge-active',
      APPROVED: 'badge-high',
      REJECTED: 'badge-lost',
      COMPLETED: 'badge-resolved',
    };
    return <span className={`badge ${map[st] || 'badge-low'}`}>{st}</span>;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck size={26} color="#059669" /> Ownership Verification & Claims
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Verify ownership claims on items you found, or track the progress of claims you filed.
          </p>
        </div>
      </div>

      <AlertMessage type={alert?.type} message={alert?.message} onClose={() => setAlert(null)} />

      {/* Tabs */}
      <div className="tabs">
        <button
          onClick={() => setActiveTab('received')}
          className={`tab-btn ${activeTab === 'received' ? 'active' : ''}`}
        >
          Claims on Items I Found ({receivedClaims.length})
        </button>
        <button
          onClick={() => setActiveTab('submitted')}
          className={`tab-btn ${activeTab === 'submitted' ? 'active' : ''}`}
        >
          Claims I Submitted ({submittedClaims.length})
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading claims..." />
      ) : displayedClaims.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {displayedClaims.map((claim) => (
            <div key={claim.id} className="card card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Claim #{claim.id}</span>
                    {getStatusBadge(claim.status)}
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      • {new Date(claim.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                    Target Item: {claim.found_item_details?.item_name}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Found at: {claim.found_item_details?.location_name} • Claimant:{' '}
                    <strong>{claim.claimant?.username}</strong>
                  </p>
                </div>

                {activeTab === 'received' && claim.status === 'PENDING' && (
                  <button
                    onClick={() => {
                      setSelectedClaim(claim);
                      setReviewNotes(claim.finder_notes || '');
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    Review & Decide Claim
                  </button>
                )}
              </div>

              {/* Proof Description */}
              <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '0.75rem' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>
                  CLAIMANT'S VERIFICATION STATEMENT:
                </p>
                <p style={{ fontSize: '0.9rem', color: '#1e293b', whiteSpace: 'pre-line' }}>
                  {claim.proof_description}
                </p>
              </div>

              {/* Confidential Identifiers (visible to finder & claimant) */}
              {claim.unique_identifiers && (
                <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '0.75rem' }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#065f46', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                    <Lock size={14} /> CONFIDENTIAL VERIFICATION DATA:
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#047857' }}>
                    {claim.unique_identifiers}
                  </p>
                </div>
              )}

              {/* Finder Notes if present */}
              {claim.finder_notes && (
                <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.5rem', fontStyle: 'italic' }}>
                  <strong>Finder Note:</strong> "{claim.finder_notes}"
                </div>
              )}

              {/* Decision Dialog Modal inline */}
              {selectedClaim?.id === claim.id && (
                <div style={{ marginTop: '1rem', padding: '1.25rem', backgroundColor: '#ffffff', border: '2px solid #2563eb', borderRadius: '8px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Make a Verification Decision for Claim #{claim.id}
                  </h4>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Finder Feedback Note to Claimant (Optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Identity verified. Let's arrange pickup at Central Station."
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleDecision(claim.id, 'APPROVED')}
                      disabled={actionLoading}
                      className="btn btn-success btn-sm"
                    >
                      <Check size={16} /> Approve Claim (Ownership Verified)
                    </button>
                    <button
                      onClick={() => handleDecision(claim.id, 'REJECTED')}
                      disabled={actionLoading}
                      className="btn btn-danger btn-sm"
                    >
                      <X size={16} /> Reject Claim (Insufficient Proof)
                    </button>
                    <button
                      onClick={() => setSelectedClaim(null)}
                      className="btn btn-secondary btn-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <ShieldCheck size={40} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
            {activeTab === 'received' ? 'No Claims on Items You Found' : 'You Haven\'t Filed Any Claims'}
          </h3>
          <p style={{ color: '#64748b' }}>
            {activeTab === 'received'
              ? 'When someone claims an item you reported finding, their verification will show up here.'
              : 'Browse found items to submit a claim if your lost property is located.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default MyClaimsPage;
