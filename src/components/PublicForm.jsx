import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Send, AtSign, Phone, Calendar } from 'lucide-react';
import { createPublicSubmission } from '../lib/apiClient';
import PublicFooter from './PublicFooter';
import CookieBanner from './CookieBanner';

const PublicForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    contractor: { fullName: '', phone1: '', email: '' },
    event: { type: '' }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
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
        important_notes: '',
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

  return (
    <div className="public-form-page">
      <CookieBanner />
      <header className="form-header">
        <div className="container header-inner">
          <button className="btn-back" onClick={() => navigate('/')} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600 }}>
            <ArrowLeft size={20} />
            <span>Voltar ao Início</span>
          </button>
          <div className="brand">
            <span className="brand-name">Mayclick Photography</span>
          </div>
        </div>
      </header>

      <main className="form-content">
        <div className="container-narrow">
          <div className="text-center mb-5 fade-in">
            <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '1rem' }}>Solicitar Orçamento</h1>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>Preencha seus dados básicos e entraremos em contato para finalizar os detalhes e apresentar as melhores propostas para o seu evento!</p>
          </div>

          <form onSubmit={handleSubmit} className="fade-in" style={{ animationDelay: '0.1s' }}>
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
              
              <div className="form-group">
                <label>Qual o tipo de evento? *</label>
                <select
                  required
                  className="form-control"
                  value={formData.event.type}
                  onChange={(e) => handleChange('event', 'type', e.target.value)}
                  style={{ paddingLeft: '1.125rem' }}
                >
                  <option value="" disabled>Selecione uma opção...</option>
                  <option value="Casamento">Casamento</option>
                  <option value="Pré-Wedding">Pré-Wedding</option>
                  <option value="Aniversário Infantil">Aniversário Infantil</option>
                  <option value="15 Anos">15 Anos</option>
                  <option value="Formatura">Formatura</option>
                  <option value="Gestante">Ensaio Gestante</option>
                  <option value="Batizado">Batizado</option>
                  <option value="Corporativo">Evento Corporativo</option>
                  <option value="Outro">Outro (A definir)</option>
                </select>
              </div>
            </section>

            <div className="form-submit-area text-center" style={{ padding: '2rem', background: 'transparent', marginTop: '1rem' }}>
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
      </main>

      <PublicFooter />

      <style>{`
        .public-form-page { background-color: var(--bg-page); min-height: 100vh; }
        .form-header { background-color: #fff; border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100; }
        .header-inner { height: 70px; display: flex; justify-content: space-between; align-items: center; }
        .brand { display: flex; align-items: center; gap: 0.875rem; }
        .brand-name { font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.1rem; color: var(--primary); }
        .form-content { padding: 4rem 0; }
        .container-narrow { max-width: 840px; margin: 0 auto; padding: 0 1.5rem; }
        .form-card-block { background-color: #fff; border-radius: var(--radius); padding: 3rem; margin-bottom: 2.5rem; border: 1px solid var(--border); box-shadow: var(--shadow-sm); }
        .section-title { font-size: 1.25rem; font-weight: 800; margin-bottom: 2rem; display: flex; align-items: center; gap: 0.75rem; color: var(--primary); }
        .grid { display: grid; gap: 1.25rem; }
        .grid-2 { grid-template-columns: 1fr 1fr; }
        .form-group { margin-bottom: 1.25rem; }
        .form-group label { display: block; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.5rem; letter-spacing: 0.5px; }
        .form-control { width: 100%; padding: 0.875rem 1.125rem; border-radius: var(--radius-sm); border: 1.5px solid var(--border); font-size: 1rem; transition: var(--transition); background-color: var(--bg-page); }
        .form-control:focus { outline: none; border-color: var(--accent); background-color: #fff; box-shadow: 0 0 0 4px var(--accent-light); }
        .input-with-icon { position: relative; }
        .input-icon { position: absolute; left: 1.125rem; top: 50%; transform: translateY(-50%); color: var(--text-soft); pointer-events: none; }
        .input-with-icon .form-control { padding-left: 3.25rem; }
        .btn-full { width: 100%; }
        @media (max-width: 600px) {
          .grid-2 { grid-template-columns: 1fr; }
          .form-card-block { padding: 1.5rem; }
        }
      `}</style>
    </div>
  );
};

export default PublicForm;
