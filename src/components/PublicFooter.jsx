import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Phone, MapPin, Mail, ShieldCheck } from 'lucide-react';
import useSettings from '../hooks/useSettings';
import '../Home.css';

const PublicFooter = () => {
  const { businessSettings } = useSettings();
  const businessName = businessSettings?.name || 'Mayclick Photography';

  return (
    <footer id="contato" className="public-footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* BRAND */}
          <div className="footer-brand">
            <img src="/logo.jpg" alt={`${businessName} Logo`} className="footer-logo" />
            <h3 className="serif-title">{businessName}</h3>
            <p className="tagline">"Nos permita registrar sua história!"</p>
          </div>

          {/* NAVEGAÇÃO */}
          <div className="footer-section">
            <h4>Navegação</h4>
            <ul className="footer-links">
              <li><Link to="/">Início</Link></li>
              <li><Link to="/sobre">Quem Somos</Link></li>
              <li><Link to="/formulario">Orçamentos</Link></li>
              <li><Link to="/portfolio">Portfólio</Link></li>
              <li><Link to="/blog">Blog</Link></li>
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
          background-color: var(--dark-bg, #050505);
          color: #fff;
          padding: 4rem 0 2rem 0;
          margin-top: 0;
          border-top: 1px solid #222;
          font-family: 'Inter', sans-serif;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr;
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .footer-brand {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .footer-logo {
          height: 60px;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .footer-brand h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          color: var(--gold, #c5a059);
        }

        .tagline {
          font-size: 0.95rem;
          color: #a0a0a0;
          font-style: italic;
        }

        .footer-section h4 {
          font-size: 1rem;
          margin-bottom: 1.5rem;
          color: var(--gold, #c5a059);
          font-family: 'Playfair Display', serif;
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-links li {
          margin-bottom: 0.8rem;
        }

        .footer-links a,
        .footer-links span {
          color: #ccc;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          transition: color 0.2s ease;
        }

        .footer-links a:hover {
          color: var(--gold, #c5a059);
        }

        .legal-notice {
          color: #888;
          font-size: 0.85rem;
        }

        .footer-bottom {
          text-align: center;
          padding-top: 2rem;
          border-top: 1px solid #222;
          color: #666;
        }

        .footer-bottom p {
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }

        .disclaimer {
          font-size: 0.75rem;
          color: #555;
        }

        @media (max-width: 992px) {
          .footer-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .footer-brand {
            grid-column: span 3;
            align-items: center;
            text-align: center;
            margin-bottom: 2rem;
          }
        }

        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 576px) {
          .footer-grid {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .footer-links a,
          .footer-links span {
            justify-content: center;
          }
        }
      `}</style>
    </footer>
  );
};

export default PublicFooter;
