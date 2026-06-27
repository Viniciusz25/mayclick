import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, X } from 'lucide-react';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('mayclick_cookie_consent');
    if (!consent) {
      // Delay to show smoothly
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const preferences = {
      essential: true,
      analytics: true,
      marketing: true,
      thirdParty: true,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('mayclick_cookie_consent', JSON.stringify(preferences));
    setIsVisible(false);
  };

  const handleDeclineAll = () => {
    const preferences = {
      essential: true,
      analytics: false,
      marketing: false,
      thirdParty: false,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('mayclick_cookie_consent', JSON.stringify(preferences));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner fade-in-up">
      <div className="cookie-container">
        <div className="cookie-content">
          <div className="cookie-icon">
            <Shield size={24} />
          </div>
          <div className="cookie-text">
            <p>
              Usamos cookies para melhorar sua experiência, analisar o uso do site e, quando autorizado, personalizar conteúdos e anúncios.
              Você pode aceitar todos, recusar cookies não essenciais ou configurar suas <Link to="/preferencias-cookies">preferências</Link>.
            </p>
          </div>
        </div>
        <div className="cookie-actions">
          <button className="btn btn-ghost btn-sm" onClick={handleDeclineAll}>
            Recusar não essenciais
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => setIsVisible(false)}>
            <Link to="/preferencias-cookies" style={{color: 'inherit', textDecoration: 'none'}}>Configurar</Link>
          </button>
          <button className="btn btn-accent btn-sm" onClick={handleAcceptAll}>
            Aceitar todos
          </button>
        </div>
      </div>

      <style>{`
        .cookie-banner {
          position: fixed;
          bottom: 2rem;
          left: 2rem;
          right: 2rem;
          background-color: #fff;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          z-index: 9999;
          border: 1px solid var(--border);
          padding: 1.5rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .cookie-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }

        .cookie-content {
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
          flex: 1;
        }

        .cookie-icon {
          background-color: var(--accent-light);
          color: var(--accent);
          padding: 0.75rem;
          border-radius: 12px;
          flex-shrink: 0;
        }

        .cookie-text p {
          margin: 0;
          font-size: 0.875rem;
          line-height: 1.5;
          color: var(--text-main);
        }

        .cookie-text a {
          color: var(--accent);
          font-weight: 700;
          text-decoration: underline;
        }

        .cookie-actions {
          display: flex;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        @media (max-width: 992px) {
          .cookie-container {
            flex-direction: column;
            gap: 1.5rem;
            align-items: stretch;
          }
          .cookie-actions {
            justify-content: flex-end;
          }
          .cookie-banner {
            bottom: 1rem;
            left: 1rem;
            right: 1rem;
            padding: 1.25rem;
          }
        }

        @media (max-width: 600px) {
          .cookie-actions {
            flex-direction: column;
          }
          .cookie-actions button {
            width: 100%;
          }
        }

        .fade-in-up {
          animation: fadeInUp 0.5s ease-out;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default CookieBanner;
