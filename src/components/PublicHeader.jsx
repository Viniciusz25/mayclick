import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useSettings from '../hooks/useSettings';
import '../Home.css';

const PublicHeader = () => {
  const navigate = useNavigate();
  const { businessSettings } = useSettings();

  return (
    <header className="luxury-header" style={{ position: 'relative', background: '#050505', borderBottom: '1px solid #222' }}>
      <div className="luxury-logo">
        {businessSettings?.logo_url ? (
          <img src={businessSettings.logo_url} alt="MayClick Photography" style={{height: '40px'}} />
        ) : (
          <div style={{color: '#c5a059', fontSize: '24px', fontFamily: 'Playfair Display'}}>M</div>
        )}
        <span>MayClick</span>
      </div>
      <nav className="luxury-nav">
        <Link to="/">INÍCIO</Link>
        <Link to="/sobre">SOBRE</Link>
        <Link to="/formulario">ORÇAMENTOS</Link>
        <Link to="/portfolio">PORTFÓLIO</Link>
      </nav>
      <button className="btn-outline-gold" onClick={() => navigate('/formulario')}>Orçamento</button>
    </header>
  );
};

export default PublicHeader;
