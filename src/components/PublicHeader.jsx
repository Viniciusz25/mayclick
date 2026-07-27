import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useSettings from '../hooks/useSettings';
import TopBanner from './TopBanner';
import '../Home.css';

const PublicHeader = () => {
  const navigate = useNavigate();
  const { businessSettings } = useSettings();

  return (
    <>
      <TopBanner />
      <header className="luxury-header" style={{ position: 'relative', background: '#050505', borderBottom: '1px solid #222' }}>
      <div className="luxury-logo">
        <img src="/logo-nova.png" alt="MayClick Photography Logo" className="header-logo" style={{height: '130px', width: 'auto', margin: '-20px 0'}} />
      </div>
      <nav className="luxury-nav">
        <Link to="/">INÍCIO</Link>
        <Link to="/sobre">SOBRE</Link>
        <Link to="/formulario">ORÇAMENTOS</Link>
        <Link to="/portfolio">PORTFÓLIO</Link>
      </nav>
      <button className="btn-outline-gold" onClick={() => navigate('/formulario')}>Orçamento</button>
    </header>
    </>
  );
};

export default PublicHeader;
