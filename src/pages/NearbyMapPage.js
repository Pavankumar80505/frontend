import React, { useState, useEffect } from 'react';
import { getNearbyItems, getMapMarkers } from '../services/locationService';
import { getCategories } from '../services/itemService';
import MapView from '../components/MapView';
import ItemCard from '../components/ItemCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { MapPin, Navigation } from 'lucide-react';

const NearbyMapPage = () => {
  const [center, setCenter] = useState([37.7749, -122.4194]);
  const [radius, setRadius] = useState(25);
  const [itemType, setItemType] = useState('all');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [nearbyItems, setNearbyItems] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await getCategories();
        setCategories(Array.isArray(data) ? data : (data.results || []));
      } catch (e) {
        console.error("Categories fetch error:", e);
      }
    };
    fetchCats();
  }, []);

  const fetchNearbyData = async () => {
    setLoading(true);
    try {
      const [nearbyData, mapData] = await Promise.all([
        getNearbyItems(center[0], center[1], radius, itemType, category),
        getMapMarkers(itemType, category)
      ]);
      setNearbyItems(nearbyData.results || []);
      setMarkers(mapData.markers || []);
    } catch (err) {
      console.error("Location search error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNearbyData();
  }, [center, radius, itemType, category]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
      },
      (err) => {
        alert("Unable to retrieve your current location.");
        setLocating(false);
      }
    );
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={24} color="#2563eb" /> Geographic Proximity Search
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Find lost and found items within a geographical radius using exact Haversine distance.
          </p>
        </div>

        <button
          onClick={handleUseCurrentLocation}
          disabled={locating}
          className="btn btn-primary btn-sm"
        >
          <Navigation size={16} />
          {locating ? 'Detecting Location...' : 'Use My Current Location'}
        </button>
      </div>

      {/* Control Bar */}
      <div className="card card-body" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'center' }}>
          {/* Item Type filter */}
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Display Type</label>
            <select
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
              className="form-control"
            >
              <option value="all">All Items (Lost & Found)</option>
              <option value="lost">Lost Items Only (Red Pins)</option>
              <option value="found">Found Items Only (Green Pins)</option>
            </select>
          </div>

          {/* Category filter */}
          <div>
            <label className="form-label" style={{ fontSize: '0.8rem' }}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="form-control"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Radius Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.3rem' }}>
              <span>Search Radius:</span>
              <span style={{ color: '#2563eb' }}>{radius} km</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: '#2563eb' }}
            />
          </div>
        </div>
      </div>

      {/* Interactive Map */}
      <div style={{ marginBottom: '2.5rem' }}>
        <MapView
          markers={markers}
          center={center}
          zoom={12}
          height="520px"
        />
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.8rem', color: '#64748b', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }} /> Lost Item Pin
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981' }} /> Found Item Pin
          </span>
          <span>Center: [{center[0].toFixed(4)}, {center[1].toFixed(4)}]</span>
        </div>
      </div>

      {/* Nearby Items List sorted by distance */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
            Items Within {radius} km ({nearbyItems.length})
          </h2>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Sorted from nearest to farthest
          </span>
        </div>

        {loading ? (
          <LoadingSpinner message="Calculating nearby item distances..." />
        ) : nearbyItems.length > 0 ? (
          <div className="grid grid-cols-4">
            {nearbyItems.map((item) => (
              <ItemCard
                key={`${item.item_type}-${item.id}`}
                item={item}
                type={item.item_type}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p style={{ color: '#64748b' }}>No items found within {radius} km of selected center. Try expanding your search radius.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NearbyMapPage;
