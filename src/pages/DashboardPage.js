import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats } from '../services/dashboardService';
import {
  Search,
  PlusCircle,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  MapPin,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Dashboard stats error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner message="Loading user dashboard..." />;

  const summary = stats?.summary || {};

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem',
        backgroundColor: '#ffffff',
        padding: '1.5rem',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            Hello, {user?.first_name || user?.username}! 👋
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Here is what's happening with your reported items, potential AI matches, and ownership claims.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/report-lost" className="btn btn-danger btn-sm">
            <Search size={16} /> Report Lost
          </Link>
          <Link to="/report-found" className="btn btn-success btn-sm">
            <PlusCircle size={16} /> Report Found
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4" style={{ marginBottom: '2.5rem' }}>
        <div className="card card-body" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#fee2e2', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Search size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>My Lost Reports</span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{summary.my_lost_items || 0}</h2>
          </div>
        </div>

        <div className="card card-body" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#ecfdf5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PlusCircle size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>My Found Reports</span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{summary.my_found_items || 0}</h2>
          </div>
        </div>

        <div className="card card-body" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>AI Matches</span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{summary.my_matches || 0}</h2>
          </div>
        </div>

        <div className="card card-body" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Claims Active</span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
              {(summary.claims_submitted || 0) + (summary.claims_received || 0)}
            </h2>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Activity & Quick Navigation */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {/* Recent Items Box */}
        <div className="card card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Your Reported Items</h3>
            <Link to="/my-reports" className="btn btn-outline btn-sm">
              Manage All Reports <ArrowRight size={14} />
            </Link>
          </div>

          {stats?.recent_items?.lost?.length === 0 && stats?.recent_items?.found?.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p style={{ color: '#64748b', marginBottom: '1rem' }}>You haven't reported any lost or found items yet.</p>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <Link to="/report-lost" className="btn btn-danger btn-sm">Report Lost</Link>
                <Link to="/report-found" className="btn btn-success btn-sm">Report Found</Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats?.recent_items?.lost?.map((item) => (
                <div key={`lost-${item.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <span className="badge badge-lost" style={{ fontSize: '0.65rem', marginRight: '0.5rem' }}>LOST</span>
                    <strong style={{ fontSize: '0.95rem' }}>{item.item_name}</strong>
                    <span style={{ color: '#64748b', fontSize: '0.8rem', marginLeft: '0.75rem' }}>
                      Reported {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-active">{item.status}</span>
                    <Link to={`/items/lost/${item.id}`} className="btn btn-outline btn-sm">Details</Link>
                  </div>
                </div>
              ))}

              {stats?.recent_items?.found?.map((item) => (
                <div key={`found-${item.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <span className="badge badge-found" style={{ fontSize: '0.65rem', marginRight: '0.5rem' }}>FOUND</span>
                    <strong style={{ fontSize: '0.95rem' }}>{item.item_name}</strong>
                    <span style={{ color: '#64748b', fontSize: '0.8rem', marginLeft: '0.75rem' }}>
                      Reported {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-found">{item.status}</span>
                    <Link to={`/items/found/${item.id}`} className="btn btn-outline btn-sm">Details</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Tools Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card card-body" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid #bfdbfe' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e40af', marginBottom: '0.5rem' }}>
              <Sparkles size={20} />
              <h4 style={{ fontWeight: 700, fontSize: '1.05rem' }}>AI Matching Engine</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#3b82f6', marginBottom: '1rem' }}>
              Our multimodal CLIP AI compares your item images and geolocations against all submitted records.
            </p>
            <Link to="/matches" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }}>
              View My Matches
            </Link>
          </div>

          <div className="card card-body" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #bbf7d0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534', marginBottom: '0.5rem' }}>
              <ShieldCheck size={20} />
              <h4 style={{ fontWeight: 700, fontSize: '1.05rem' }}>Ownership Claims</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#15803d', marginBottom: '1rem' }}>
              Review claims submitted on items you found or check status of claims you filed.
            </p>
            <Link to="/my-claims" className="btn btn-success btn-sm" style={{ alignSelf: 'flex-start' }}>
              Manage Claims
            </Link>
          </div>

          <div className="card card-body" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155', marginBottom: '0.5rem' }}>
              <MapPin size={20} />
              <h4 style={{ fontWeight: 700, fontSize: '1.05rem' }}>Map Exploration</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
              Locate items near you using radius and coordinate search on OpenStreetMap.
            </p>
            <Link to="/map" className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }}>
              Open Live Map
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
