import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyLostItems, getMyFoundItems } from '../services/itemService';
import ItemCard from '../components/ItemCard';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import { FileText, Plus, Search } from 'lucide-react';

const MyReportsPage = () => {
  const [activeTab, setActiveTab] = useState('lost');
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lostRes, foundRes] = await Promise.all([
        getMyLostItems(),
        getMyFoundItems(),
      ]);
      setLostItems(lostRes.results || (Array.isArray(lostRes) ? lostRes : []));
      setFoundItems(foundRes.results || (Array.isArray(foundRes) ? foundRes : []));
    } catch (err) {
      console.error("Error loading reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const displayedItems = activeTab === 'lost' ? lostItems : foundItems;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileText size={26} color="#2563eb" /> My Reports
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Manage the reports you've published for lost belongings and found items.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/report-lost" className="btn btn-danger btn-sm">
            <Search size={16} /> Report Lost Item
          </Link>
          <Link to="/report-found" className="btn btn-success btn-sm">
            <Plus size={16} /> Report Found Item
          </Link>
        </div>
      </div>

      <AlertMessage type={alert?.type} message={alert?.message} onClose={() => setAlert(null)} />

      {/* Tabs */}
      <div className="tabs">
        <button
          onClick={() => setActiveTab('lost')}
          className={`tab-btn ${activeTab === 'lost' ? 'active' : ''}`}
        >
          My Lost Reports ({lostItems.length})
        </button>
        <button
          onClick={() => setActiveTab('found')}
          className={`tab-btn ${activeTab === 'found' ? 'active' : ''}`}
        >
          My Found Reports ({foundItems.length})
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading your reports..." />
      ) : displayedItems.length > 0 ? (
        <div className="grid grid-cols-4">
          {displayedItems.map((item) => (
            <ItemCard key={item.id} item={item} type={activeTab} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <FileText size={40} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
            No {activeTab === 'lost' ? 'Lost' : 'Found'} Reports
          </h3>
          <p style={{ color: '#64748b', marginBottom: '1rem' }}>
            You haven't reported any {activeTab === 'lost' ? 'lost items' : 'found items'} yet.
          </p>
          <Link
            to={activeTab === 'lost' ? '/report-lost' : '/report-found'}
            className={`btn btn-${activeTab === 'lost' ? 'danger' : 'success'} btn-sm`}
          >
            Create Report Now
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyReportsPage;
