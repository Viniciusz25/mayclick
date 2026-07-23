import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Respostas from './components/Respostas';
import SubmissionDetails from './components/SubmissionDetails';
import BusinessSettings from './components/BusinessSettings';
import AccountSettings from './components/AccountSettings';
import ManualBudget from './components/ManualBudget';
import SavedBudgets from './components/SavedBudgets';
import BudgetDetails from './components/BudgetDetails';
import PublicForm from './components/PublicForm';
import Home from './components/Home';
import SuccessPage from './components/SuccessPage';
import ErrorBoundary from './components/ErrorBoundary';
import Agenda from './components/Agenda';
import HomepageSettings from './components/HomepageSettings';
import PortfolioPage from './components/PortfolioPage';
import CategoryGallery from './components/CategoryGallery';
import AlbumGallery from './components/AlbumGallery';
import AboutPage from './components/AboutPage';
import BlogPage from './components/BlogPage';
import BlogPost from './components/BlogPost';
import AdminBlog from './components/AdminBlog';
import CadastroForm from './components/CadastroForm';
import AdminHeroSettings from './components/AdminHeroSettings';
import AdminPortfolio from './components/AdminPortfolio';
import ScrollToTop from './components/ScrollToTop';
import useSettings from './hooks/useSettings';
import {
  LogOut, LayoutDashboard, Settings, User,
  Camera, FileText, Calculator, Menu, X,
  ChevronRight, ExternalLink, Globe, Calendar, Star
} from 'lucide-react';

import DynamicStyles from './components/DynamicStyles';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import FloatingWhatsApp from './components/FloatingWhatsApp';

const AdminLayout = ({ children, handleLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { setForcedTheme } = useTheme();

  useEffect(() => {
    // Força o tema claro no painel administrativo de forma segura
    setForcedTheme('light');
    
    // Restaura o tema preferido ao sair do painel
    return () => {
      setForcedTheme(null);
    };
  }, [setForcedTheme]);

  const menuItems = [
    { path: '/app/dashboard', label: 'Painel', icon: <LayoutDashboard size={20} /> },
    { path: '/app/orcamentos', label: 'Orçamentos', icon: <Calculator size={20} /> },
    { path: '/app/respostas', label: 'Respostas', icon: <FileText size={20} /> },
    { path: '/app/agenda', label: 'Agenda', icon: <Calendar size={20} /> },
    { path: '/app/blog', label: 'Blog', icon: <FileText size={20} /> },
    { path: '/app/hero', label: 'Hero Principal', icon: <Star size={20} /> },
    { path: '/app/portfolio', label: 'Portfólio', icon: <Camera size={20} /> },
    { path: '/app/configuracoes-pagina-inicial', label: 'Página Inicial', icon: <Globe size={20} /> },
    { path: '/app/configuracoes-negocio', label: 'Negócio', icon: <Settings size={20} /> },
    { path: '/app/configuracoes-conta', label: 'Minha Conta', icon: <User size={20} /> },
  ];

  const currentLabel = menuItems.find(item => location.pathname.startsWith(item.path))?.label || 'Detalhes';

  return (
    <div className="admin-container">
      {/* MOBILE HEADER */}
      <header className="mobile-header">
        <div className="brand">
          <img src="/logo.jpg" alt="Logo" className="brand-logo-small" />
          <span>Admin</span>
        </div>
        <button className="menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      <div className="admin-wrapper">
        {/* SIDEBAR */}
        <aside className={`admin-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="brand">
              <img src="/logo.jpg" alt="Logo" className="brand-logo-sidebar" />
              <span>Mayclick <small>Admin</small></span>
            </div>
          </div>

          <nav className="sidebar-nav">
            {menuItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
                {location.pathname.startsWith(item.path) && <ChevronRight size={16} className="active-arrow" />}
              </Link>
            ))}
          </nav>

          <div className="sidebar-footer">
            <Link to="/" className="nav-link site-link" target="_blank">
              <ExternalLink size={18} />
              <span>Ver Site Público</span>
            </Link>
            <button className="nav-link logout-btn" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Sair do Painel</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="admin-main">
          <div className="admin-page-header">
            <h2 className="admin-page-title">{currentLabel}</h2>
            <div className="admin-user-badge">
              <span className="user-name">Administrador</span>
            </div>
          </div>
          <div className="admin-content-inner">
            {children}
          </div>
        </main>
      </div>

      <style>{`
        .admin-container {
          min-height: 100vh;
          background-color: var(--bg-page);
          width: 100%;
          overflow-x: hidden;
        }

        .admin-wrapper {
          display: flex;
          min-height: 100vh;
          width: 100%;
          max-width: 100vw;
          overflow-x: hidden;
        }

        /* Sidebar */
        .admin-sidebar {
          width: clamp(240px, 20vw, 290px);
          flex: 0 0 clamp(240px, 20vw, 290px);
          background-color: var(--primary);
          color: #fff;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          z-index: 1000;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 10px 0 30px rgba(0,0,0,0.1);
        }

        .sidebar-header {
          padding: 3rem 2.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
        }

        .sidebar-header .brand {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          font-size: 1.375rem;
          letter-spacing: -0.02em;
        }

        .brand-logo-sidebar {
          width: 40px;
          height: 40px;
          object-fit: cover;
          border-radius: 50%;
          border: 2px solid var(--accent);
        }

        .brand-logo-small {
          width: 32px;
          height: 32px;
          object-fit: cover;
          border-radius: 50%;
          border: 1.5px solid var(--accent);
        }

        .sidebar-header .brand small {
          font-size: 0.625rem;
          text-transform: uppercase;
          background-color: var(--accent);
          padding: 3px 8px;
          border-radius: 6px;
          margin-left: 6px;
          color: var(--primary);
          font-weight: 900;
          letter-spacing: 0.05em;
        }

        .sidebar-nav {
          flex: 1;
          padding: 2.5rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 1.125rem;
          padding: 1rem 1.25rem;
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.9375rem;
          transition: var(--transition);
          position: relative;
        }

        .nav-link:hover {
          color: #fff;
          background-color: rgba(255, 255, 255, 0.04);
        }

        .nav-link.active {
          color: #fff;
          background-color: rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .nav-link.active svg {
          color: var(--accent);
        }

        .active-arrow {
          position: absolute;
          right: 1.25rem;
          color: var(--accent);
          opacity: 0.5;
        }

        .sidebar-footer {
          padding: 2.5rem 1.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .site-link {
          color: var(--accent) !important;
          background-color: rgba(212, 175, 55, 0.05);
        }

        .site-link:hover {
          background-color: rgba(212, 175, 55, 0.1);
        }

        .logout-btn {
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          color: #FF8A8A !important;
          cursor: pointer;
        }

        .logout-btn:hover {
          background-color: rgba(255, 138, 138, 0.05);
        }

        /* Main Content */
        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          width: 100%;
          overflow-x: hidden;
        }

        .admin-page-header {
          height: 90px;
          background-color: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 3.5rem;
          position: sticky;
          top: 0;
          z-index: 100;
          min-width: 0;
        }

        .admin-page-title {
          font-size: 1.25rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--primary);
        }

        .admin-user-badge {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          padding: 0.625rem 1.25rem;
          border-radius: var(--radius-full);
          background-color: var(--bg-page);
          border: 1.5px solid var(--border);
          transition: var(--transition);
        }

        .admin-user-badge:hover {
          border-color: var(--accent);
          background-color: #fff;
        }

        .user-name {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--primary);
        }

        .admin-content-inner {
          padding: clamp(1.75rem, 3vw, 3.5rem);
          flex: 1;
          max-width: min(100%, 1400px);
          margin: 0 auto;
          width: 100%;
          min-width: 0;
          overflow-x: hidden;
        }

        /* Mobile Elements */
        .mobile-header {
          display: none;
          height: 60px;
          background-color: var(--primary);
          color: #fff;
          padding: 0 max(1rem, env(safe-area-inset-left)) 0 max(1rem, env(safe-area-inset-right));
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 1100;
        }

        @media (max-width: 992px) {
          .mobile-header { display: flex; }
          .admin-wrapper {
            display: block;
            min-width: 0;
          }
          .admin-sidebar {
            position: fixed;
            left: 0;
            top: 60px;
            height: calc(100vh - 60px);
            width: min(86vw, 290px);
            max-width: 290px;
            flex-basis: auto;
            transform: translateX(-100%);
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
          }
          .admin-sidebar.open { transform: translateX(0); }
          .admin-page-header { display: none; }
          .admin-main {
            width: 100%;
          }
          .admin-content-inner {
            padding: 1.5rem;
            padding-left: max(1rem, env(safe-area-inset-left));
            padding-right: max(1rem, env(safe-area-inset-right));
          }
        }

        @media (max-width: 640px) {
          .admin-content-inner {
            padding-top: 1rem;
            padding-bottom: 1.5rem;
          }
          .sidebar-header {
            padding: 2rem 1.25rem;
          }
          .sidebar-nav,
          .sidebar-footer {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

// Legal Pages
import PrivacyPolicy from './components/legal/PrivacyPolicy';
import TermsOfUse from './components/legal/TermsOfUse';
import CookiePolicy from './components/legal/CookiePolicy';
import CookiePreferencesPage from './components/legal/CookiePreferencesPage';
import PaymentPolicy from './components/legal/PaymentPolicy';
import CancellationPolicy from './components/legal/CancellationPolicy';

function App() {
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem('mayclick_auth_token');
    return token ? { authenticated: true } : null;
  });
  const { businessSettings } = useSettings();

  useEffect(() => {
    const syncSession = () => {
      const token = localStorage.getItem('mayclick_auth_token');
      setSession(token ? { authenticated: true } : null);
    };

    syncSession();
    window.addEventListener('storage', syncSession);

    return () => {
      window.removeEventListener('storage', syncSession);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('mayclick_auth_token');
    setSession(null);
  };

  const PrivateRoute = ({ children }) => {
    return session ? (
      <AdminLayout handleLogout={handleLogout}>
        {children}
      </AdminLayout>
    ) : <Navigate to="/login" />;
  };

  return (
    <ThemeProvider>
      <Router>
        <DynamicStyles settings={businessSettings} />
        <ScrollToTop />
        <FloatingWhatsApp />
        <ErrorBoundary>
          <Routes>
            {/* ROTAS PÚBLICAS */}
            <Route path="/" element={<Home />} />
            <Route path="/sobre" element={<AboutPage />} />
            <Route path="/formulario" element={<PublicForm />} />
            <Route path="/cadastro" element={<CadastroForm />} />
            <Route path="/login" element={!session ? <Login /> : <Navigate to="/app/dashboard" />} />
            <Route path="/obrigado" element={<SuccessPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/portfolio/:slug" element={<CategoryGallery />} />
            <Route path="/portfolio/:catSlug/:albumSlug" element={<AlbumGallery />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPost />} />

            {/* ROTAS LEGAIS */}
            <Route path="/politica-de-privacidade" element={<PrivacyPolicy />} />
            <Route path="/termos-de-uso" element={<TermsOfUse />} />
            <Route path="/politica-de-cookies" element={<CookiePolicy />} />
            <Route path="/preferencias-de-cookies" element={<CookiePreferencesPage />} />
            <Route path="/politica-de-pagamento" element={<PaymentPolicy />} />
            <Route path="/cancelamento-e-reembolso" element={<CancellationPolicy />} />

            {/* ROTAS PRIVADAS */}
            <Route path="/app" element={<Navigate to="/app/dashboard" />} />
            <Route path="/app/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/app/orcamentos" element={<PrivateRoute><SavedBudgets /></PrivateRoute>} />
            <Route path="/app/orcamentos/novo" element={<PrivateRoute><ManualBudget /></PrivateRoute>} />
            <Route path="/app/orcamentos/:id" element={<PrivateRoute><BudgetDetails /></PrivateRoute>} />
            <Route path="/app/agenda" element={<PrivateRoute><Agenda /></PrivateRoute>} />
            <Route path="/app/respostas" element={<PrivateRoute><Respostas /></PrivateRoute>} />
            <Route path="/app/respostas/:id" element={<PrivateRoute><SubmissionDetails /></PrivateRoute>} />
            <Route path="/app/blog" element={<PrivateRoute><AdminBlog /></PrivateRoute>} />
            <Route path="/app/hero" element={<PrivateRoute><AdminHeroSettings /></PrivateRoute>} />
            <Route path="/app/portfolio" element={<PrivateRoute><AdminPortfolio /></PrivateRoute>} />
            <Route path="/app/configuracoes-pagina-inicial" element={<PrivateRoute><HomepageSettings /></PrivateRoute>} />
            <Route path="/app/configuracoes-negocio" element={<PrivateRoute><BusinessSettings /></PrivateRoute>} />
            <Route path="/app/configuracoes-conta" element={<PrivateRoute><AccountSettings /></PrivateRoute>} />

            {/* FALLBACK */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </ErrorBoundary>
      </Router>
    </ThemeProvider>
  );
}

export default App;
