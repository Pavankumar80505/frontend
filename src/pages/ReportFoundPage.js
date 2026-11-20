import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, createFoundItem } from '../services/itemService';
import { PlusCircle, Upload, MapPin, ShieldAlert } from 'lucide-react';
import AlertMessage from '../components/AlertMessage';

const ReportFoundPage = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    item_name: '',
    category: '',
    description: '',
    color: '',
    date_found: new Date().toISOString().split('T')[0],
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
      setError('Please upload a clear photograph of the found item to enable AI visual matching.');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      data.append('image', imageFile);

      const res = await createFoundItem(data);
      navigate(`/items/found/${res.id}?new=true`);
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
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#ecfdf5', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PlusCircle size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Report a Found Item</h1>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
              Thank you for being a good Samaritan! Submit details to help the rightful owner locate their belongings.
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '0.75rem',
          backgroundColor: '#fffbeb',
          border: '1px solid #fef3c7',
          padding: '0.85rem 1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          color: '#92400e'
        }}>
          <ShieldAlert size={20} style={{ flexShrink: 0 }} />
          <div>
            <strong>Verification Protection Tip:</strong> Do not post visible serial numbers, exact secret wallet contents, or specific lockscreen images. Keep these private so claimants must verify them!
          </div>
        </div>

        <AlertMessage type="danger" message={error} onClose={() => setError('')} />

        <form onSubmit={handleSubmit}>
          {/* Item Name & Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Item Name / Summary *</label>
              <input
                type="text"
                required
                name="item_name"
                className="form-control"
                placeholder="e.g. Set of Keys with Green Lanyard, Black Backpack"
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

          {/* Color & Date Found */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Primary Color *</label>
              <input
                type="text"
                required
                name="color"
                className="form-control"
                placeholder="e.g. Navy Blue, Silver, Black, Yellow"
                value={formData.color}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date Found *</label>
              <input
                type="date"
                required
                name="date_found"
                className="form-control"
                value={formData.date_found}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Detailed Description */}
          <div className="form-group">
            <label className="form-label">General Description *</label>
            <textarea
              required
              name="description"
              className="form-control"
              placeholder="Provide a general description of where and how the item was found."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Location Details */}
          <div className="form-group">
            <label className="form-label">Location Found / Landmark *</label>
            <input
              type="text"
              required
              name="location_name"
              className="form-control"
              placeholder="e.g. Bench outside City Hall, Coffee Shop counter"
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
            <label className="form-label">Photograph of Found Item *</label>
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
                  <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#047857', fontWeight: 600 }}>
                    Click to replace photograph
                  </p>
                </div>
              ) : (
                <div>
                  <Upload size={32} color="#94a3b8" style={{ margin: '0 auto 0.5rem' }} />
                  <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>
                    Upload photograph of found item
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Used by AI to identify potential owners
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
              className="btn btn-success btn-lg"
            >
              {loading ? 'Submitting & Extracting AI Embeddings...' : 'Publish Found Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportFoundPage;
