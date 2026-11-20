import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getLostItemById, getFoundItemById, deleteLostItem, deleteFoundItem } from '../services/itemService';
import { getMatches, respondToMatch } from '../services/matchingService';
import { useAuth } from '../context/AuthContext';
import MapView from '../components/MapView';
import MatchScoreCard from '../components/MatchScoreCard';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import {
  Tag,
  MapPin,
  Calendar,
  User,
  ShieldCheck,
  Trash2,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

const ItemDetailPage = () => {
  const { type, id } = useParams();
  const [searchParams] = useSearchParams();
  const isNew = searchParams.get('new') === 'true';

  const [item, setItem] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(isNew ? 'Report published successfully! AI visual scan completed.' : '');
  const { user } = useAuth();
  const navigate = useNavigate();

  const isLost = type === 'lost';

  const fetchItemAndMatches = async () => {
    setLoading(true);
    try {
      const itemData = isLost ? await getLostItemById(id) : await getFoundItemById(id);
      setItem(itemData);

      // Fetch matching items
      const matchParams = isLost ? { lost_item: id } : { found_item: id };
      const matchesData = await getMatches(matchParams);
      setMatches(matchesData.results || (Array.isArray(matchesData) ? matchesData : []));
    } catch (err) {
      console.error("Error loading item details:", err);
      setError('Item not found or failed to load details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemAndMatches();
  }, [type, id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this report? This action cannot be undone.")) return;
    try {
      if (isLost) await deleteLostItem(id);
      else await deleteFoundItem(id);
      navigate(isLost ? '/lost-items' : '/found-items');
    } catch (err) {
      alert("Failed to delete report.");
    }
  };

  const handleMatchRespond = async (matchId, action) => {
    await respondToMatch(matchId, action);
    fetchItemAndMatches();
  };

  if (loading) return <LoadingSpinner message="Loading report and AI match candidates..." />;
  if (error || !item) {
    return (
      <div className="card card-body" style={{ textAlign: 'center', padding: '3rem' }}>
        <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Report Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>The requested item report does not exist or was removed.</p>
        <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex' }}>
          Back to Home
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === item.user?.id;
  const isAdmin = user?.role === 'ADMIN' || user?.is_staff;
  const imageUrl = item.image
    ? (item.image.startsWith('http') ? item.image : `http://127.0.0.1:8000${item.image}`)
    : 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600';

  const lat = parseFloat(item.latitude);
  const lon = parseFloat(item.longitude);

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <AlertMessage type="success" message={successMsg} onClose={() => setSuccessMsg('')} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Left Column: Photograph */}
        <div>
          <div className="card" style={{ overflow: 'hidden' }}>
            <img
              src={imageUrl}
              alt={item.item_name}
              style={{ width: '100%', height: '420px', objectFit: 'contain', backgroundColor: '#0f172a' }}
            />
          </div>

          {/* Mini Leaflet Map */}
          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={16} color="#2563eb" /> Geographic Location
            </h3>
            <MapView
              markers={[{
                id: item.id,
                item_name: item.item_name,
                item_type: type,
                latitude: lat,
                longitude: lon,
                location_name: item.location_name,
                category: item.category_details?.name,
                color: item.color,
                image: item.image,
              }]}
              center={[lat, lon]}
              zoom={14}
              height="240px"
            />
          </div>
        </div>

        {/* Right Column: Information & Actions */}
        <div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'center' }}>
            <span className={`badge ${isLost ? 'badge-lost' : 'badge-found'}`}>
              {isLost ? 'LOST ITEM REPORT' : 'FOUND ITEM REPORT'}
            </span>
            <span className="badge badge-active">{item.status}</span>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: '#0f172a' }}>
            {item.item_name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Tag size={16} /> {item.category_details?.name || 'Category'}
            </span>
            <span>•</span>
            <span style={{ textTransform: 'capitalize' }}>Color: {item.color}</span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Calendar size={16} /> {isLost ? `Lost: ${item.date_lost}` : `Found: ${item.date_found}`}
            </span>
          </div>

          <div className="card card-body" style={{ marginBottom: '1.5rem', backgroundColor: '#f8fafc' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
              Reported Description
            </h3>
            <p style={{ color: '#475569', fontSize: '0.95rem', whiteSpace: 'pre-line' }}>
              {item.description}
            </p>
          </div>

          <div className="card card-body" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
              Location & Coordinates
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>
              {item.location_name}
            </p>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Latitude: {lat.toFixed(6)} • Longitude: {lon.toFixed(6)}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', padding: '0.75rem 1rem', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
            <User size={18} color="#64748b" />
            <div style={{ fontSize: '0.85rem' }}>
              <span>Reported by <strong>{item.user?.username}</strong></span>
              <span style={{ color: '#64748b', marginLeft: '0.5rem' }}>
                on {new Date(item.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {!isLost && !isOwner && item.status !== 'RESOLVED' && (
              <Link to={`/claims/submit/${item.id}`} className="btn btn-primary btn-lg" style={{ flex: 1 }}>
                <ShieldCheck size={18} /> Submit Ownership Claim
              </Link>
            )}

            {(isOwner || isAdmin) && (
              <button onClick={handleDelete} className="btn btn-danger">
                <Trash2 size={16} /> Delete Report
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI Matches Section for this specific item */}
      <section style={{ marginTop: '3rem', borderTop: '1px solid #e2e8f0', paddingTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={22} color="#2563eb" /> Potential AI Matches ({matches.length})
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Calculated using CLIP multimodal neural embeddings and multi-factor location proximity.
            </p>
          </div>
        </div>

        {matches.length > 0 ? (
          <div>
            {matches.map((m) => (
              <MatchScoreCard
                key={m.id}
                match={m}
                onRespond={handleMatchRespond}
                currentUser={user}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Sparkles size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>No High-Confidence Matches Found Yet</h3>
            <p style={{ color: '#64748b', maxWidth: '500px', margin: '0.25rem auto' }}>
              Our AI engine continuously analyzes incoming reports. You will receive an instant notification when a matching item is submitted.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ItemDetailPage;
