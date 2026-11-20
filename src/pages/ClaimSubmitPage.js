import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFoundItemById } from '../services/itemService';
import { submitClaim } from '../services/claimService';
import { ShieldCheck, Lock, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';

const ClaimSubmitPage = () => {
  const { itemId } = useParams();
  const [foundItem, setFoundItem] = useState(null);
  const [proofDescription, setProofDescription] = useState('');
  const [uniqueIdentifiers, setUniqueIdentifiers] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await getFoundItemById(itemId);
        setFoundItem(data);
      } catch (err) {
        setError('Found item not found or unavailable for claim.');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [itemId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await submitClaim({
        found_item: itemId,
        proof_description: proofDescription,
        unique_identifiers: uniqueIdentifiers,
      });
      navigate('/my-claims?submitted=true');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.non_field_errors?.[0] ||
                  err.response?.data?.detail ||
                  'Failed to submit claim. You may already have a pending claim on this item.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading found item claim details..." />;

  const imageUrl = foundItem?.image
    ? (foundItem.image.startsWith('http') ? foundItem.image : `http://127.0.0.1:8000${foundItem.image}`)
    : 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=300';

  return (
    <div style={{ maxWidth: '720px', margin: '1rem auto' }}>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm">
          <ArrowLeft size={16} /> Back to Item
        </button>
      </div>

      <div className="card card-body" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Submit Ownership Claim</h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Verify your ownership to the finder and system administrators.
            </p>
          </div>
        </div>

        {/* Item Summary Card */}
        {foundItem && (
          <div style={{ display: 'flex', gap: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
            <img src={imageUrl} alt={foundItem.item_name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }} />
            <div>
              <span className="badge badge-found" style={{ fontSize: '0.65rem' }}>TARGET FOUND ITEM</span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0.2rem 0' }}>{foundItem.item_name}</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Found at: {foundItem.location_name} • Category: {foundItem.category_details?.name}
              </p>
            </div>
          </div>
        )}

        <AlertMessage type="danger" message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Proof of Ownership Description *</label>
            <textarea
              required
              className="form-control"
              style={{ minHeight: '110px' }}
              placeholder="Explain how you lost the item, specific timeframe, location context, and visible features only the owner would know."
              value={proofDescription}
              onChange={(e) => setProofDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Lock size={14} color="#059669" />
              Confidential Unique Identifiers (Kept strictly private)
            </label>
            <textarea
              className="form-control"
              style={{ minHeight: '90px' }}
              placeholder="Enter sensitive details that verify your claim without public exposure: serial numbers, IMEI, contents inside pockets/wallet, custom engraving, or specific markings."
              value={uniqueIdentifiers}
              onChange={(e) => setUniqueIdentifiers(e.target.value)}
            />
            <span className="form-text" style={{ color: '#059669', fontWeight: 500 }}>
              🔒 Protected: This confidential field is never shown publicly. Only the finder and administrator can view it to verify your claim.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-lg">
              {submitting ? 'Submitting Verification...' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClaimSubmitPage;
