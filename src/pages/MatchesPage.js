import React, { useState, useEffect } from 'react';
import { getMatches, respondToMatch, generateMatches } from '../services/matchingService';
import { useAuth } from '../context/AuthContext';
import MatchScoreCard from '../components/MatchScoreCard';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import { Sparkles, RefreshCw, Filter } from 'lucide-react';

const MatchesPage = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [confidenceFilter, setConfidenceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [alert, setAlert] = useState(null);
  const { user } = useAuth();

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const params = {};
      if (confidenceFilter) params.confidence = confidenceFilter;
      if (statusFilter) params.status = statusFilter;
      const data = await getMatches(params);
      setMatches(data.results || (Array.isArray(data) ? data : []));
    } catch (err) {
      console.error("Error fetching matches:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [confidenceFilter, statusFilter]);

  const handleTriggerScan = async () => {
    setScanning(true);
    setAlert(null);
    try {
      const res = await generateMatches();
      setAlert({
        type: 'success',
        message: `${res.message} Processed ${res.matches_found_or_updated} match comparisons.`
      });
      fetchMatches();
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to complete AI matching scan.' });
    } finally {
      setScanning(false);
    }
  };

  const handleRespond = async (matchId, action) => {
    try {
      await respondToMatch(matchId, action);
      setAlert({ type: 'success', message: `Match successfully marked as ${action}.` });
      fetchMatches();
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to update match decision.' });
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={24} color="#2563eb" /> AI Matching Results
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Multimodal CLIP visual embeddings combined with category, color, text similarity, and geographic proximity.
          </p>
        </div>

        <button
          onClick={handleTriggerScan}
          disabled={scanning}
          className="btn btn-primary btn-sm"
        >
          <RefreshCw size={16} className={scanning ? 'animate-spin' : ''} />
          {scanning ? 'Running AI Scan...' : 'Trigger Instant AI Scan'}
        </button>
      </div>

      <AlertMessage type={alert?.type} message={alert?.message} onClose={() => setAlert(null)} />

      {/* Filter Tabs */}
      <div className="card card-body" style={{ marginBottom: '2rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="#64748b" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Confidence:</span>
            <select
              value={confidenceFilter}
              onChange={(e) => setConfidenceFilter(e.target.value)}
              className="form-control"
              style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
            >
              <option value="">All Confidence Levels</option>
              <option value="HIGH">High (>= 70%)</option>
              <option value="MEDIUM">Medium (45% - 69%)</option>
              <option value="LOW">Low (&lt; 45%)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Decision Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-control"
              style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#64748b' }}>
            Showing <strong>{matches.length}</strong> AI matches
          </div>
        </div>
      </div>

      {/* Matches List */}
      {loading ? (
        <LoadingSpinner message="Calculating and retrieving AI matches..." />
      ) : matches.length > 0 ? (
        <div>
          {matches.map((m) => (
            <MatchScoreCard
              key={m.id}
              match={m}
              onRespond={handleRespond}
              currentUser={user}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Sparkles size={40} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>No AI Matches Found</h3>
          <p style={{ color: '#64748b', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
            No corresponding lost or found records currently match your filter criteria with sufficient similarity score.
          </p>
          <button onClick={handleTriggerScan} className="btn btn-outline btn-sm">
            Run AI Matching Scan Now
          </button>
        </div>
      )}
    </div>
  );
};

export default MatchesPage;
