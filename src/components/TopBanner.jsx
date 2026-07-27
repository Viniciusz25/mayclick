import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import '../Home.css';
import useSettings from '../hooks/useSettings';

const TopBanner = () => {
  const navigate = useNavigate();
  const { businessSettings } = useSettings();

  if (businessSettings?.hide_promo_banner) {
    return null;
  }

  return (
    <div className="top-promo-banner">
      <span className="promo-text">
         <strong>AGENDA 2026 QUASE LOTADA!</strong> Garanta sua data realizando seu cadastro de reserva agora mesmo.
      </span>
      <button className="btn-promo-action" onClick={() => navigate('/cadastro')}>
        <Calendar size={16} /> Cadastro de Reserva
      </button>
    </div>
  );
};

export default TopBanner;
