import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Send, AtSign, Phone, Calendar, MapPin, MessageSquare } from 'lucide-react';
import { createPublicSubmission } from '../lib/apiClient';
import CookieBanner from './CookieBanner';
import useSettings from '../hooks/useSettings';
import PublicHeader from './PublicHeader';
import '../Home.css';

const PublicForm = () => {
  const navigate = useNavigate();
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

  return (
    <div className="home-luxury-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicHeader />
      <CookieBanner />
      
      <main style={{ display: 'flex', flex: 1, paddingTop: '75px' }}>
        
        {/* Left Column: Image */}
        <div style={{ 
          flex: 1, 
          backgroundImage: `url(${formImage})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          display: window.innerWidth > 992 ? 'block' : 'none'
        }}>
        </div>

        {/* Right Column: Form */}
        <div style={{ 
          flex: 1, 
          backgroundColor: 'var(--dark-bg)', 
          padding: '4rem 2rem',
          display: 'flex',
          justifyContent: 'center',
          overflowY: 'auto'
        }}>
          <div className="luxury-form-container" style={{ width: '100%', maxWidth: '600px', border: 'none', background: 'transparent' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h1 className="serif-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Solicitar Orçamento</h1>
              <p style={{ color: '#aaa' }}>Preencha seus dados básicos e entraremos em contato para finalizar os detalhes.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="luxury-card" style={{ marginBottom: '2rem' }}>
                <h2 className="serif-title" style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={20} /> Seus Dados
                </h2>
                
                <div className="luxury-form-group">
                  <label>Nome Completo *</label>
                  <input
                    required
                    className="luxury-form-control"
                    placeholder="Seu nome completo"
                    value={formData.contractor.fullName}
                    onChange={(e) => handleChange('contractor', 'fullName', e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="luxury-form-group">
                    <label>WhatsApp / Telefone *</label>
                    <input
                      required
                      className="luxury-form-control"
                      placeholder="(00) 00000-0000"
                      value={formData.contractor.phone1}
                      onChange={(e) => handleChange('contractor', 'phone1', e.target.value)}
                    />
                  </div>
                  
                  <div className="luxury-form-group">
                    <label>E-mail *</label>
                    <input
                      required
                      type="email"
                      className="luxury-form-control"
                      placeholder="exemplo@email.com"
                      value={formData.contractor.email}
                      onChange={(e) => handleChange('contractor', 'email', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="luxury-card" style={{ marginBottom: '2rem' }}>
                <h2 className="serif-title" style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={20} /> O Evento
                </h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="luxury-form-group">
                    <label>Local do Evento *</label>
                    <input
                      required
                      className="luxury-form-control"
                      placeholder="Cidade, Espaço, etc."
                      value={formData.event.location}
                      onChange={(e) => handleChange('event', 'location', e.target.value)}
                    />
                  </div>
                  
                  <div className="luxury-form-group">
                    <label>Data (se definida)</label>
                    <input
                      type="date"
                      className="luxury-form-control"
                      value={formData.event.date}
                      onChange={(e) => handleChange('event', 'date', e.target.value)}
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>
                </div>
              </div>

              <div className="luxury-card" style={{ marginBottom: '2.5rem' }}>
                <h2 className="serif-title" style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MessageSquare size={20} /> Observações
                </h2>
                
                <div className="luxury-form-group">
                  <label>Conte-nos um pouco sobre o que precisa</label>
                  <textarea
                    className="luxury-form-control"
                    placeholder="Tipo de ensaio, dúvidas, desejos especiais..."
                    rows={4}
                    value={formData.important_notes}
                    onChange={(e) => handleChange('root', 'important_notes', e.target.value)}
                  ></textarea>
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="btn-gold" 
                  style={{ width: '100%', padding: '1rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                >
                  {isSubmitting ? 'Enviando...' : (
                    <>Enviar Solicitação <Send size={20} /></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublicForm;
