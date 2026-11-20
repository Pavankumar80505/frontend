import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, createLostItem } from '../services/itemService';
import { Search, Upload, MapPin } from 'lucide-react';
import AlertMessage from '../components/AlertMessage';

const ReportLostPage = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    item_name: '',
    category: '',
    description: '',
    color: '',
    date_lost: new Date().toISOString().split('T')[0],
    location_name: '',
    latitude: '37.7749000',
    longitude: '-122.4194000',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await getCategories();
        const list = Array.isArray(data) ? data : (data.results || []);
        setCategories(list);
        if (list.length > 0) {
          setFormData((prev) => ({ ...prev, category: list[0].id }));
        }
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };
    fetchCats();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image file size must be less than 10MB.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toFixed(7),
          longitude: pos.coords.longitude.toFixed(7),
        }));
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setLocating(false);
        setError('Could not access current location. Using preset coordinates.');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!imageFile) {
      setError('Please upload a clear photograph of the lost item to enable AI visual matching.');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      data.append('image', imageFile);

      const res = await createLostItem(data);
      navigate(`/items/lost/${res.id}?new=true`);
    } catch (err) {
      console.error('Submission error:', err);
      const respData = err.response?.data;
      if (respData) {
        if (typeof respData === 'string') setError(respData);
        else {
          const firstErr = Object.values(respData)[0];
          setError(Array.isArray(firstErr) ? firstErr[0] : JSON.stringify(firstErr));
        }
      } else {
        setError('Failed to submit report. Please check required fields.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '780px', margin: '1rem auto' }}>
      <div className="card card-body" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#fee2e2', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Search size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Report a Lost Item</h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Provide full item details and photograph. Our AI CLIP engine will immediately scan for matching found items.
            </p>
          </div>
        </div>

        <AlertMessage type="danger" message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit}>
          {/* Item Name & Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Item Name / Title *</label>
              <input
                type="text"
                required
                name="item_name"
                className="form-control"
                placeholder="e.g. Black Leather Fossil Wallet, iPhone 14 Pro"
                value={formData.item_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                name="category"
                className="form-control"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Color & Date Lost */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Primary Color *</label>
              <input
                type="text"
                required
                name="color"
                className="form-control"
                placeholder="e.g. Matte Black, Navy Blue, Red, Silver"
                value={formData.color}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date Lost *</label>
              <input
                type="date"
                required
                name="date_lost"
                className="form-control"
                value={formData.date_lost}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Detailed Description */}
          <div className="form-group">
            <label className="form-label">Detailed Visual Description *</label>
            <textarea
              required
              name="description"
              className="form-control"
              placeholder="Describe physical characteristics, brands, materials, stickers, scratches, case styles, etc."
              value={formData.description}
              onChange={handleChange}
            />
            <span className="form-text">
              Note: Avoid sharing confidential PINs, bank passwords, or sensitive credentials.
            </span>
          </div>

          {/* Location Details */}
          <div className="form-group">
            <label className="form-label">Lost Location Name / Landmark *</label>
            <input
              type="text"
              required
              name="location_name"
              className="form-control"
              placeholder="e.g. Central Library 2nd floor, Metro Line 3, Starbucks Market St"
              value={formData.location_name}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.75rem', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Latitude *</label>
              <input
                type="text"
                required
                name="latitude"
                className="form-control"
                value={formData.latitude}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Longitude *</label>
              <input
                type="text"
                required
                name="longitude"
                className="form-control"
                value={formData.longitude}
                onChange={handleChange}
              />
            </div>

            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={locating}
              className="btn btn-secondary"
              style={{ whiteSpace: 'nowrap', height: '42px' }}
            >
              <MapPin size={16} /> {locating ? 'Detecting...' : 'Detect GPS'}
            </button>
          </div>

          {/* Image Upload & Preview */}
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Item Photograph (Required for AI Matching) *</label>
            <div style={{
              border: '2px dashed #cbd5e1',
              borderRadius: '8px',
              padding: '1.5rem',
              textAlign: 'center',
              backgroundColor: '#f8fafc',
              cursor: 'pointer',
              position: 'relative',
            }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer',
                }}
              />
              {imagePreview ? (
                <div>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '6px', objectFit: 'contain' }}
                  />
                  <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#2563eb', fontWeight: 600 }}>
                    Click to replace photograph
                  </p>
                </div>
              ) : (
                <div>
                  <Upload size={32} color="#94a3b8" style={{ margin: '0 auto 0.5rem' }} />
                  <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>
                    Upload or drag & drop item photograph
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    PNG, JPG, or WEBP up to 10MB
                  </p>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-danger btn-lg"
            >
              {loading ? 'Submitting & Extracting AI Embeddings...' : 'Publish Lost Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportLostPage;
