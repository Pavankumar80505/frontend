import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, PlusCircle, MapPin, Sparkles, ShieldCheck, ArrowRight, Compass } from 'lucide-react';
import { getLostItems, getFoundItems, getCategories } from '../services/itemService';
import ItemCard from '../components/ItemCard';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [recentLost, setRecentLost] = useState([]);
  const [recentFound, setRecentFound] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [catsRes, lostRes, foundRes] = await Promise.all([
          getCategories(),
          getLostItems({ page_size: 4 }),
          getFoundItems({ page_size: 4 })
        ]);
        setCategories(Array.isArray(catsRes) ? catsRes : (catsRes.results || []));
        setRecentLost(lostRes.results || (Array.isArray(lostRes) ? lostRes.slice(0, 4) : []));
        setRecentFound(foundRes.results || (Array.isArray(foundRes) ? foundRes.slice(0, 4) : []));
      } catch (err) {
        console.error("Error loading home data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedCategory) params.append('category', selectedCategory);
    navigate(`/lost-items?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
        color: 'white',
        borderRadius: '16px',
        padding: '3.5rem 2rem',
        marginBottom: '3rem',
        boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.3)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(4px)',
            padding: '0.4rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: 600,
            marginBottom: '1.25rem'
          }}>
            <Sparkles size={16} /> CLIP Vision AI & Proximity Geolocation
          </div>

          <h1 style={{ fontSize: '2.75rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>
            Find What You Lost. Return What You Found.
          </h1>

          <p style={{ fontSize: '1.15rem', opacity: 0.9, marginBottom: '2rem', maxWidth: '650px', margin: '0 auto 2rem' }}>
            Next-generation lost & found matching engine powered by deep visual image embeddings, multi-factor ranking, and interactive OpenStreetMap geolocation.
          </p>

          {/* Quick Search Form */}
          <form onSubmit={handleSearchSubmit} style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            backgroundColor: 'white',
            padding: '0.6rem',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)',
            maxWidth: '680px',
            margin: '0 auto 2rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', flex: 2, minWidth: '200px', padding: '0 0.5rem' }}>
              <Search size={20} color="#64748b" style={{ marginRight: '0.5rem' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by item name, color, landmark..."
                style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.95rem', color: '#0f172a' }}
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                flex: 1,
                minWidth: '150px',
                border: 'none',
                borderLeft: '1px solid #e2e8f0',
                padding: '0 0.75rem',
                fontSize: '0.9rem',
                color: '#475569',
                outline: 'none',
                backgroundColor: 'transparent'
              }}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <button type="submit" className="btn btn-primary" style={{ padding: '0.7rem 1.4rem' }}>
              Search Items
            </button>
          </form>

          {/* Action CTAs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/report-lost" className="btn btn-danger btn-lg">
              <Search size={18} /> I Lost Something
            </Link>
            <Link to="/report-found" className="btn btn-success btn-lg">
              <PlusCircle size={18} /> I Found Something
            </Link>
            <Link to="/map" className="btn btn-secondary btn-lg" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)' }}>
              <MapPin size={18} /> Map View
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>How Smart Lost & Found Works</h2>
          <p style={{ color: '#64748b' }}>Three automated steps to reunite people with their belongings.</p>
        </div>

        <div className="grid grid-cols-3">
          <div className="card card-body" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <PlusCircle size={28} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>1. Post a Report</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Upload item photographs, choose the category, provide key descriptions, and pin the exact location on the map.
            </p>
          </div>

          <div className="card card-body" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Sparkles size={28} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>2. AI Visual Matching</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Our CLIP neural engine extracts high-dimensional image embeddings and calculates cosine similarity across opposite reports.
            </p>
          </div>

          <div className="card card-body" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <ShieldCheck size={28} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>3. Verified Claim & Return</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Potential owners submit private verification proofs (serial numbers, hidden marks) that only the finder can verify.
            </p>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Explore by Category</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Browse cataloged lost and found items by category taxonomy.</p>
          </div>
        </div>

        <div className="grid grid-cols-4">
          {categories.slice(0, 8).map((cat) => (
            <Link
              key={cat.id}
              to={`/lost-items?category=${cat.id}`}
              className="card card-body"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'border-color 0.15s ease',
              }}
            >
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}>
                <Compass size={22} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{cat.name}</h4>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{cat.items_count || 0} active items</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Lost Items */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Recently Reported Lost</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Have you seen any of these items recently?</p>
          </div>
          <Link to="/lost-items" className="btn btn-outline btn-sm">
            View All Lost <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : recentLost.length > 0 ? (
          <div className="grid grid-cols-4">
            {recentLost.map((item) => (
              <ItemCard key={item.id} item={item} type="lost" />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p style={{ color: '#64748b' }}>No active lost item reports yet. Be the first to report!</p>
          </div>
        )}
      </section>

      {/* Recent Found Items */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Recently Reported Found</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Check if someone found an item belonging to you.</p>
          </div>
          <Link to="/found-items" className="btn btn-outline btn-sm">
            View All Found <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : recentFound.length > 0 ? (
          <div className="grid grid-cols-4">
            {recentFound.map((item) => (
              <ItemCard key={item.id} item={item} type="found" />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p style={{ color: '#64748b' }}>No active found item reports yet.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
