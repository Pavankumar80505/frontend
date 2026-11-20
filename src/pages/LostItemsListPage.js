import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getLostItems, getCategories } from '../services/itemService';
import ItemCard from '../components/ItemCard';
import MapView from '../components/MapView';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, Grid, MapPin, Plus, RotateCcw } from 'lucide-react';

const LostItemsListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [color, setColor] = useState(searchParams.get('color') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

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

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (search) params.search = search;
      if (category) params.category = category;
      if (color) params.color = color;
      if (status) params.status = status;
      if (city) params.city = city;

      const data = await getLostItems(params);
      if (data.results) {
        setItems(data.results);
        setTotalCount(data.count || data.results.length);
      } else if (Array.isArray(data)) {
        setItems(data);
        setTotalCount(data.length);
      }
    } catch (err) {
      console.error("Error fetching lost items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [category, status, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchItems();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setColor('');
    setStatus('');
    setCity('');
    setPage(1);
    setSearchParams({});
    setTimeout(fetchItems, 0);
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Lost Items Directory</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Browse reports of lost belongings or search specifically for missing items.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.5rem 0.85rem',
                border: 'none',
                background: viewMode === 'grid' ? '#2563eb' : 'white',
                color: viewMode === 'grid' ? 'white' : '#475569',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              <Grid size={16} /> Grid
            </button>
            <button
              onClick={() => setViewMode('map')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.5rem 0.85rem',
                border: 'none',
                background: viewMode === 'map' ? '#2563eb' : 'white',
                color: viewMode === 'map' ? 'white' : '#475569',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              <MapPin size={16} /> Map
            </button>
          </div>

          <Link to="/report-lost" className="btn btn-danger btn-sm">
            <Plus size={16} /> Report Lost
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card card-body" style={{ marginBottom: '2rem', padding: '1rem 1.25rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', alignItems: 'center' }}>
          <div>
            <input
              type="text"
              placeholder="Search title, keyword..."
              className="form-control"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div>
            <select
              className="form-control"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <input
              type="text"
              placeholder="Color (e.g. Black, Red)"
              className="form-control"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="City / Area / Landmark"
              className="form-control"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div>
            <select
              className="form-control"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="MATCHED">Matched</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
              <Search size={14} /> Filter
            </button>
            <button type="button" onClick={handleResetFilters} className="btn btn-outline btn-sm" title="Reset Filters">
              <RotateCcw size={14} />
            </button>
          </div>
        </form>
      </div>

      {/* Content Area */}
      {loading ? (
        <LoadingSpinner message="Searching lost items database..." />
      ) : viewMode === 'map' ? (
        <MapView
          markers={items.map((it) => ({ ...it, item_type: 'lost' }))}
          height="600px"
        />
      ) : items.length > 0 ? (
        <>
          <div className="grid grid-cols-4">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} type="lost" />
            ))}
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2.5rem' }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="btn btn-secondary btn-sm"
            >
              Previous
            </button>
            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
              Page {page} ({totalCount} items)
            </span>
            <button
              disabled={items.length < 12}
              onClick={() => setPage(page + 1)}
              className="btn btn-secondary btn-sm"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
            No lost item reports match your criteria.
          </p>
          <p style={{ color: '#64748b', marginBottom: '1.25rem' }}>
            Try adjusting your search terms or filters.
          </p>
          <Link to="/report-lost" className="btn btn-danger btn-sm">
            Report a Lost Item
          </Link>
        </div>
      )}
    </div>
  );
};

export default LostItemsListPage;
