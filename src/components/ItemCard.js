import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Tag, ShieldCheck } from 'lucide-react';

const ItemCard = ({ item, type = 'lost', onClaimClick }) => {
  const isLost = type === 'lost';
  const itemDate = isLost ? item.date_lost : item.date_found;
  const detailsUrl = `/items/${type}/${item.id}`;

  const statusBadgeClass = {
    ACTIVE: 'badge-active',
    MATCHED: 'badge-matched',
    CLAIMED: 'badge-found',
    RESOLVED: 'badge-resolved',
    CLOSED: 'badge-resolved',
  }[item.status] || 'badge-low';

  // Construct absolute image URL
  const imageUrl = item.image
    ? (item.image.startsWith('http') ? item.image : `http://127.0.0.1:8000${item.image}`)
    : 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400&auto=format&fit=crop&q=60';

  return (
    <div className="card item-card">
      <div className="item-card-image-wrapper">
        <img src={imageUrl} alt={item.item_name} className="item-card-image" />
        <div className="item-card-badge">
          <span className={`badge ${isLost ? 'badge-lost' : 'badge-found'}`}>
            {isLost ? 'LOST' : 'FOUND'}
          </span>
          <span className={`badge ${statusBadgeClass}`} style={{ marginLeft: '0.4rem' }}>
            {item.status}
          </span>
        </div>
        <div className="item-card-date">
          {itemDate}
        </div>
      </div>

      <div className="card-body" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>
          <Link to={detailsUrl} style={{ color: 'inherit' }}>
            {item.item_name}
          </Link>
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
          <Tag size={14} />
          <span>{item.category_details?.name || 'Item'}</span>
          <span>•</span>
          <span style={{ textTransform: 'capitalize' }}>{item.color}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.85rem', marginBottom: '0.8rem' }}>
          <MapPin size={14} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.location_name}
          </span>
          {item.distance_km !== undefined && (
            <span style={{ fontWeight: 600, color: '#2563eb' }}>
              ({item.distance_km} km away)
            </span>
          )}
        </div>

        <p style={{
          color: '#475569',
          fontSize: '0.875rem',
          marginBottom: '1rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          flex: 1
        }}>
          {item.description}
        </p>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
          <Link to={detailsUrl} className="btn btn-outline btn-sm" style={{ flex: 1 }}>
            View Details
          </Link>
          {!isLost && item.status !== 'RESOLVED' && (
            <Link to={`/claims/submit/${item.id}`} className="btn btn-primary btn-sm">
              <ShieldCheck size={14} />
              Claim
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
