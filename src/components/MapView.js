import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';

// Create SVG colored pins for Lost (red) and Found (green)
const createMarkerIcon = (isLost) => {
  const color = isLost ? '#ef4444' : '#10b981';
  const label = isLost ? 'L' : 'F';
  const svgHtml = `
    <div style="
      background-color: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    ">
      <span style="
        transform: rotate(45deg);
        color: white;
        font-weight: 800;
        font-size: 14px;
        font-family: sans-serif;
      ">${label}</span>
    </div>
  `;
  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const ChangeMapView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

const MapView = ({
  markers = [],
  center = [37.7749, -122.4194],
  zoom = 12,
  height = '550px',
  onMarkerClick
}) => {
  const lostIcon = createMarkerIcon(true);
  const foundIcon = createMarkerIcon(false);

  return (
    <div style={{ height, width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <ChangeMapView center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {markers.map((item) => {
          const isLost = item.item_type === 'lost';
          const lat = parseFloat(item.latitude);
          const lon = parseFloat(item.longitude);
          if (isNaN(lat) || isNaN(lon)) return null;

          const detailsUrl = `/items/${item.item_type || (isLost ? 'lost' : 'found')}/${item.id}`;

          return (
            <Marker
              key={`${item.item_type}-${item.id}`}
              position={[lat, lon]}
              icon={isLost ? lostIcon : foundIcon}
              eventHandlers={{
                click: () => onMarkerClick && onMarkerClick(item),
              }}
            >
              <Popup>
                <div style={{ minWidth: '180px', maxWidth: '240px', padding: '4px' }}>
                  {item.image && (
                    <img
                      src={item.image.startsWith('http') ? item.image : `http://127.0.0.1:8000${item.image}`}
                      alt={item.item_name}
                      style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px', marginBottom: '6px' }}
                    />
                  )}
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: isLost ? '#fee2e2' : '#ecfdf5',
                      color: isLost ? '#b91c1c' : '#047857',
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {isLost ? 'LOST ITEM' : 'FOUND ITEM'}
                  </span>
                  <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700 }}>
                    {item.item_name}
                  </h4>
                  <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#64748b' }}>
                    {item.location_name}
                  </p>
                  <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#475569' }}>
                    {item.category?.name || item.category} • {item.color}
                  </p>
                  <Link
                    to={detailsUrl}
                    style={{
                      display: 'block',
                      textAlign: 'center',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      padding: '5px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    View Details
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
