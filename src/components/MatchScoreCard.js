import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Check, X, ChevronDown, ChevronUp, MapPin, ShieldCheck } from 'lucide-react';

const MatchScoreCard = ({ match, onRespond, currentUser }) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [responding, setResponding] = useState(false);

  const scorePct = Math.round(match.overall_score * 100);
  const confidenceBadge = {
    HIGH: 'badge-high',
    MEDIUM: 'badge-medium',
    LOW: 'badge-low',
  }[match.confidence_level] || 'badge-low';

  const lostImg = match.lost_item_details?.image
    ? (match.lost_item_details.image.startsWith('http') ? match.lost_item_details.image : `http://127.0.0.1:8000${match.lost_item_details.image}`)
    : 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=200';

  const foundImg = match.found_item_details?.image
    ? (match.found_item_details.image.startsWith('http') ? match.found_item_details.image : `http://127.0.0.1:8000${match.found_item_details.image}`)
    : 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=200';

  const handleAction = async (action) => {
    setResponding(true);
    try {
      await onRespond(match.id, action);
    } finally {
      setResponding(false);
    }
  };

  const isLostOwner = currentUser?.id === match.lost_item_details?.user?.id;
  const isFoundOwner = currentUser?.id === match.found_item_details?.user?.id;
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.is_staff;

  const breakdown = match.explanation?.breakdown || {};

  return (
    <div className="card match-card" style={{ marginBottom: '1.5rem' }}>
      <div className="card-body">
        {/* Header: Score and Confidence */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: scorePct >= 70 ? '#dcfce7' : (scorePct >= 45 ? '#fef9c3' : '#f1f5f9'),
                color: scorePct >= 70 ? '#15803d' : (scorePct >= 45 ? '#a16207' : '#475569'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.15rem',
                border: '2px solid currentColor',
              }}
            >
              {scorePct}%
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={`badge ${confidenceBadge}`}>{match.confidence_level} CONFIDENCE</span>
                <span className="badge badge-resolved">{match.status}</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                AI Model: CLIP ViT-B/32 Cosine Similarity + Multi-Factor Proximity
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {match.status === 'PENDING' && (isLostOwner || isFoundOwner || isAdmin) && (
              <>
                <button
                  onClick={() => handleAction('ACCEPTED')}
                  disabled={responding}
                  className="btn btn-success btn-sm"
                >
                  <Check size={16} /> Accept Match
                </button>
                <button
                  onClick={() => handleAction('REJECTED')}
                  disabled={responding}
                  className="btn btn-danger btn-sm"
                >
                  <X size={16} /> Reject
                </button>
              </>
            )}

            {isLostOwner && (
              <Link to={`/claims/submit/${match.found_item}`} className="btn btn-primary btn-sm">
                <ShieldCheck size={16} /> File Claim
              </Link>
            )}
          </div>
        </div>

        {/* Comparison grid: Lost Item vs Found Item */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          {/* Lost Item Column */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <img src={lostImg} alt="Lost" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }} />
            <div>
              <span className="badge badge-lost" style={{ fontSize: '0.65rem' }}>REPORTED LOST</span>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0.2rem 0' }}>
                <Link to={`/items/lost/${match.lost_item_details?.id}`}>
                  {match.lost_item_details?.item_name}
                </Link>
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                <MapPin size={12} style={{ display: 'inline', marginRight: '2px' }} />
                {match.lost_item_details?.location_name}
              </p>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Color: {match.lost_item_details?.color} • Category: {match.lost_item_details?.category_details?.name}
              </p>
            </div>
          </div>

          {/* Found Item Column */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <img src={foundImg} alt="Found" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }} />
            <div>
              <span className="badge badge-found" style={{ fontSize: '0.65rem' }}>REPORTED FOUND</span>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0.2rem 0' }}>
                <Link to={`/items/found/${match.found_item_details?.id}`}>
                  {match.found_item_details?.item_name}
                </Link>
              </h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                <MapPin size={12} style={{ display: 'inline', marginRight: '2px' }} />
                {match.found_item_details?.location_name}
              </p>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Color: {match.found_item_details?.color} • Category: {match.found_item_details?.category_details?.name}
              </p>
            </div>
          </div>
        </div>

        {/* Explainable AI Score Breakdown Toggle */}
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="btn btn-outline btn-sm"
          style={{ width: '100%', justifyContent: 'space-between', marginTop: '0.5rem' }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Sparkles size={14} color="#2563eb" />
            AI Match Score Explainability Breakdown
          </span>
          {showExplanation ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showExplanation && (
          <div style={{ marginTop: '0.75rem', padding: '1rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>IMAGE VISUAL SIMILARITY (60%)</p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#2563eb' }}>
                  {Math.round((match.image_similarity || 0) * 100)}%
                </p>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {breakdown.image_similarity?.detail || 'CLIP visual embedding comparison'}
                </p>
              </div>

              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>CATEGORY MATCH (15%)</p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#2563eb' }}>
                  {Math.round((match.category_score || 0) * 100)}%
                </p>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {breakdown.category_match?.detail || 'Category consistency check'}
                </p>
              </div>

              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>COLOR MATCH (10%)</p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#2563eb' }}>
                  {Math.round((match.color_score || 0) * 100)}%
                </p>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {breakdown.color_similarity?.detail || 'Color descriptor comparison'}
                </p>
              </div>

              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>DESCRIPTION & TEXT (10%)</p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#2563eb' }}>
                  {Math.round((match.description_score || 0) * 100)}%
                </p>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {breakdown.text_similarity?.detail || 'Keyword overlap'}
                </p>
              </div>

              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>LOCATION PROXIMITY (5%)</p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#2563eb' }}>
                  {Math.round((match.location_proximity || 0) * 100)}%
                </p>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {breakdown.location_proximity?.detail || 'Haversine distance proximity'}
                </p>
              </div>
            </div>
            <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
              Note: AI match scores represent probabilistic visual and feature similarity, not legal proof of ownership.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchScoreCard;
