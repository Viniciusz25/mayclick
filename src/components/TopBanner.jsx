import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import '../Home.css';

const TopBanner = () => {
  const navigate = useNavigate();

  return (
    <div className="top-promo-banner">
      <span className="promo-text">
        ✨ <strong>AGENDA 2026 QUASE LOTADA!</strong> Garanta sua data realizando seu cadastro de reserva agora mesmo.
      </span>
      <button className="btn-promo-action" onClick={() => navigate('/cadastro')}>
        <Calendar size={16} /> Cadastro de Reserva
      </button>
    </div>
  );
};

export default TopBanner;
