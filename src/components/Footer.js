import React from 'react';
import { Compass } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Compass size={22} color="#3b82f6" />
          <span style={{ fontWeight: 700, color: 'white', fontSize: '1.05rem' }}>Smart Lost & Found</span>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>| AI-Powered Item Recovery</span>
        </div>

        <div style={{ fontSize: '0.85rem' }}>
          <span>© 2026 Smart Lost & Found Platform. All rights reserved.</span>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
          <a href="/lost-items" style={{ color: '#94a3b8' }}>Browse Lost</a>
          <a href="/found-items" style={{ color: '#94a3b8' }}>Browse Found</a>
          <a href="/map" style={{ color: '#94a3b8' }}>Map View</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
