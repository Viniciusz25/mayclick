import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Phone, MapPin, Mail, ShieldCheck } from 'lucide-react';
import useSettings from '../hooks/useSettings';

const PublicFooter = () => {
  const { businessSettings } = useSettings();
  const businessName = businessSettings?.name || 'Mayclick Photography';

  return (
    <footer className="public-footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* BRAND */}
          <div className="footer-brand">
            <img src="/logo.jpg" alt={`${businessName} Logo`} className="footer-logo" />
            <h3>{businessName}</h3>
            <p className="tagline">"Nos permita registrar sua história!"</p>
          </div>

          {/* NAVEGAÇÃO */}
          <div className="footer-section">
            <h4>Navegação</h4>
            <ul className="footer-links">
              <li><Link to="/">Início</Link></li>
              <li><Link to="/sobre">Quem Somos</Link></li>
              <li><Link to="/formulario">Orçamentos</Link></li>
            </ul>
          </div>

          {/* CONTACT */}
          <div className="footer-section">
            <h4>Contato</h4>
            <ul className="footer-links">
              <li>
                <a href="https://instagram.com/mayclick_fotos" target="_blank" rel="noopener noreferrer">
                  <Camera size={18} /> @mayclick_fotos
                </a>
              </li>
              <li>
                <a href="https://wa.me/5511963031814" target="_blank" rel="noopener noreferrer">
                  <Phone size={18} /> 11 96303-1814
                </a>
              </li>
              <li>
                <span><MapPin size={18} /> Mogi das Cruzes / SP</span>
              </li>
            </ul>
          </div>

          {/* LEGAL */}
          <div className="footer-section">
            <h4>Legal</h4>
            <ul className="footer-links">
              <li><Link to="/termos-de-uso">Termos de Uso</Link></li>
              <li><Link to="/politica-de-privacidade">Política de Privacidade</Link></li>
              <li><Link to="/politica-de-cookies">Política de Cookies</Link></li>
              <li><Link to="/preferencias-de-cookies">Preferências de Cookies</Link></li>
            </ul>
          </div>

          {/* POLICIES */}
          <div className="footer-section">
            <h4>Políticas</h4>
            <ul className="footer-links">
              <li><Link to="/politica-de-pagamento">Política de Pagamento</Link></li>
              <li><Link to="/cancelamento-e-reembolso">Cancelamento e Reembolso</Link></li>
              <li>
                <span className="legal-notice">
                  <ShieldCheck size={14} /> Canal de Privacidade
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} {businessName}. Todos os direitos reservados.</p>
          <p className="disclaimer">As informações legais aqui contidas são bases informativas para uso da plataforma.</p>
        </div>
      </div>

      <style>{`
        .public-footer {
          background-color: var(--primary);
          color: #fff;
          padding: 4rem 0 2rem 0;
          margin-top: 4rem;
          border-top: 4px solid var(--accent);
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr 1fr;
          gap: 3rem;
          margin-bottom: 3rem;
        }

        .footer-logo {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 2px solid var(--accent);
          margin-bottom: 1rem;
        }

        .footer-brand h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          color: var(--accent);
        }

        .tagline {
          font-style: italic;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.875rem;
        }

        .footer-section h4 {
          color: var(--accent);
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 1.5rem;
          font-weight: 800;
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .footer-links li a,
        .footer-links li span {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-size: 0.9375rem;
          display: flex;
          align-items: center;
          gap: 0.625rem;
          transition: var(--transition);
        }

        .footer-links li a:hover {
          color: var(--accent);
          transform: translateX(4px);
        }

        .legal-notice {
          font-size: 0.75rem !important;
          color: rgba(255, 255, 255, 0.4) !important;
          margin-top: 0.5rem;
        }

        .footer-bottom {
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
        }

        .footer-bottom p {
          font-size: 0.8125rem;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 0.5rem;
        }

        .disclaimer {
          font-size: 0.7rem !important;
          opacity: 0.6;
        }

        @media (max-width: 992px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
          }
        }

        @media (max-width: 600px) {
          .footer-grid {
            grid-template-columns: 1fr;
          }
          .public-footer {
            padding: 3rem 0 1.5rem 0;
          }
        }
      `}</style>
    </footer>
  );
};

export default PublicFooter;
