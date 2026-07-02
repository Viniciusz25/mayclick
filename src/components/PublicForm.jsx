import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Send, AtSign, Phone, Calendar, Sun, Moon, MapPin, MessageSquare } from 'lucide-react';
import { createPublicSubmission } from '../lib/apiClient';
import CookieBanner from './CookieBanner';
import { useTheme } from '../context/ThemeContext';
import useSettings from '../hooks/useSettings';

const PublicForm = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { businessSettings } = useSettings();
  
  const [formData, setFormData] = useState({
    contractor: { fullName: '', phone1: '', email: '' },
    event: { location: '', date: '' },
    important_notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (section, field, value) => {
    if (section === 'root') {
      setFormData(prev => ({ ...prev, [field]: value }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: value }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        contractor_data: formData.contractor,
        event_data: formData.event,
        witness_data: { name: '', cpf: '' },
        selected_package_id: 'simplified',
        selected_package_name: 'Pacote a definir',
        payment: {},
        payment_method: 'A definir',
        contractual_consent: false,
        important_notes: formData.important_notes,
        extras_data: [],
      };

      await createPublicSubmission(payload);
      alert("Cadastro enviado com sucesso! Entraremos em contato em breve.");
      navigate('/obrigado');
    } catch (error) {
      console.error('[PublicForm] Submission failed', error);
      alert("Erro ao enviar o formulário. Por favor, tente novamente ou entre em contato via WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formImage = businessSettings?.form_page_image_url || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1920&q=80';
  const businessName = businessSettings?.name || 'Mayclick Photography';

  return (
    <div className="public-form-page">
      <CookieBanner />
      
      <div className="split-container">
        
        {/* Left Column: Image */}
        <div className="split-image" style={{ backgroundImage: `url(${formImage})` }}>
          <header className="split-header">
            <button className="btn-back" onClick={() => navigate('/')}>
              <ArrowLeft size={20} color="#fff" />
              <span>Voltar ao Início</span>
            </button>
            <div className="header-actions">
              <button onClick={toggleTheme} className="theme-btn">
                {theme === 'dark' ? <Sun size={20} color="#fff" /> : <Moon size={20} color="#fff" />}
              </button>
              <div className="brand">
                <span className="brand-name">{businessName}</span>
              </div>
            </div>
          </header>
        </div>

        {/* Right Column: Form */}
        <div className="split-content">
          <div className="form-container fade-in">
            <div className="text-center mb-5">
              <h1 className="form-title">Solicitar Orçamento</h1>
              <p className="form-subtitle">Preencha seus dados básicos e entraremos em contato para finalizar os detalhes.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ animationDelay: '0.1s' }}>
              <section className="form-card-block">
                <h2 className="section-title"><User size={22} className="text-accent" /> 1. Seus Dados</h2>
                
                <div className="form-group">
                  <label>Nome Completo *</label>
                  <div className="input-with-icon">
                    <User size={18} className="input-icon" />
                    <input
                      required
                      className="form-control"
                      placeholder="Seu nome completo"
                      value={formData.contractor.fullName}
                      onChange={(e) => handleChange('contractor', 'fullName', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-2">
                  <div className="form-group">
                    <label>WhatsApp / Telefone *</label>
                    <div className="input-with-icon">
                      <Phone size={18} className="input-icon" />
                      <input
                        required
                        className="form-control"
                        placeholder="(00) 00000-0000"
                        value={formData.contractor.phone1}
                        onChange={(e) => handleChange('contractor', 'phone1', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>E-mail *</label>
                    <div className="input-with-icon">
                      <AtSign size={18} className="input-icon" />
                      <input
                        required
                        type="email"
                        className="form-control"
                        placeholder="exemplo@email.com"
                        value={formData.contractor.email}
                        onChange={(e) => handleChange('contractor', 'email', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="form-card-block">
                <h2 className="section-title"><Calendar size={22} className="text-accent" /> 2. O Evento</h2>
                
                <div className="grid grid-2">
                  <div className="form-group">
                    <label>Local do Evento *</label>
                    <div className="input-with-icon">
                      <MapPin size={18} className="input-icon" />
                      <input
                        required
                        className="form-control"
                        placeholder="Ex: Mogi das Cruzes, SP"
                        value={formData.event.location}
                        onChange={(e) => handleChange('event', 'location', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Data e Hora *</label>
                    <div className="input-with-icon">
                      <Calendar size={18} className="input-icon" />
                      <input
                        required
                        className="form-control"
                        placeholder="Ex: 15/10/2026 às 19h"
                        value={formData.event.date}
                        onChange={(e) => handleChange('event', 'date', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="form-card-block">
                <h2 className="section-title"><MessageSquare size={22} className="text-accent" /> 3. O que você precisa?</h2>
                <div className="form-group">
                  <label>Conte-nos um pouco sobre a sua necessidade</label>
                  <textarea
                    className="form-control"
                    placeholder="Ex: Preciso de cobertura fotográfica para um casamento ao ar livre..."
                    rows={4}
                    value={formData.important_notes}
                    onChange={(e) => handleChange('root', 'important_notes', e.target.value)}
                    style={{ paddingLeft: '1.125rem' }}
                  ></textarea>
                </div>
              </section>

              <div className="form-submit-area text-center" style={{ marginTop: '1rem' }}>
                <button
                  type="submit"
                  className="btn btn-accent btn-full"
                  disabled={isSubmitting}
                  style={{ fontSize: '1.25rem', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
                >
                  <Send size={24} />
                  {isSubmitting ? 'Enviando...' : 'Enviar Solicitação de Orçamento'}
                </button>
                <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
                  Nossa equipe entrará em contato com você o mais rápido possível!
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        /* Global Reset */
        html, body { margin: 0; padding: 0; overflow: hidden; }
        
        .public-form-page {
          height: 100vh; width: 100vw;
          background-color: var(--bg-page);
          overflow: hidden;
        }

        .split-container {
          display: flex; height: 100vh; width: 100%;
        }

        .split-image {
          flex: 1;
          background-size: cover; background-position: center;
          position: relative;
        }
        
        .split-image::after {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 150px;
          background: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%);
          pointer-events: none;
        }

        .split-header {
          position: absolute; top: 0; left: 0; width: 100%;
          padding: 2rem; display: flex; justify-content: space-between; align-items: center;
          z-index: 10;
        }

        .btn-back {
          background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(4px);
          cursor: pointer; padding: 0.5rem 1rem; display: flex; align-items: center; gap: 0.5rem;
          border-radius: var(--radius-sm); color: #fff; font-weight: 600; transition: all 0.3s ease;
        }
        .btn-back:hover { background: rgba(0,0,0,0.6); }

        .header-actions { display: flex; align-items: center; gap: 1rem; }
        .theme-btn { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(4px); padding: 0.5rem; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
        .theme-btn:hover { background: rgba(0,0,0,0.6); }

        .brand-name { font-family: var(--font-heading); font-weight: 700; font-size: 1.2rem; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }

        .split-content {
          flex: 1.2;
          display: flex; flex-direction: column; justify-content: flex-start;
          background-color: var(--bg-page);
          overflow-y: auto;
          padding: 4rem 2rem;
        }

        .form-container {
          max-width: 680px; width: 100%; margin: 0 auto;
        }

        .form-title { font-size: 2.5rem; color: var(--primary); margin-bottom: 0.5rem; font-family: var(--font-heading); font-weight: 800; }
        .form-subtitle { font-size: 1.1rem; color: var(--text-muted); }

        .form-card-block { background-color: var(--bg-surface); border-radius: var(--radius); padding: 2rem; margin-bottom: 1.5rem; border: 1px solid var(--border); box-shadow: var(--shadow-sm); }
        .section-title { font-size: 1.25rem; font-weight: 800; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem; color: var(--primary); }
        
        .grid { display: grid; gap: 1.25rem; }
        .grid-2 { grid-template-columns: 1fr 1fr; }
        
        .form-group { margin-bottom: 1.25rem; }
        .form-group label { display: block; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.5rem; letter-spacing: 0.5px; }
        
        .form-control { width: 100%; padding: 0.875rem 1.125rem; border-radius: var(--radius-sm); border: 1.5px solid var(--border); font-size: 1rem; transition: var(--transition); background-color: var(--bg-page); color: var(--text-main); }
        .form-control:focus { outline: none; border-color: var(--accent); background-color: var(--bg-surface); box-shadow: 0 0 0 4px var(--accent-light); }
        
        .input-with-icon { position: relative; }
        .input-icon { position: absolute; left: 1.125rem; top: 1rem; color: var(--text-soft); pointer-events: none; }
        .input-with-icon input.form-control, .input-with-icon textarea.form-control { padding-left: 3.25rem; }
        .btn-full { width: 100%; }

        @media (max-width: 992px) {
          .split-container { flex-direction: column; }
          .split-image { flex: 0 0 35vh; }
          .split-content { flex: 1; padding: 2rem 1rem; }
          html, body, .public-form-page { overflow: auto; height: auto; min-height: 100vh; }
          .form-card-block { padding: 1.5rem; }
          .grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default PublicForm;
