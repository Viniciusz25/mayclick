import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, LogIn, AlertCircle, ArrowLeft, Lock, Mail } from 'lucide-react';
import { login } from '../lib/apiClient';
import '../Home.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      window.location.href = '/app/dashboard';
    } catch (err) {
      console.error('[Login] Error:', {
        status: err.status,
        endpoint: err.endpoint,
      });
      setError(err.message || 'Credenciais inválidas. Verifique seu e-mail e senha.');
    }
  };

  return (
    <div className="home-luxury-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <button 
          onClick={() => navigate('/')} 
          style={{ 
            background: 'none', border: 'none', color: '#aaa', display: 'flex', alignItems: 'center', gap: '0.5rem', 
            marginBottom: '1.5rem', cursor: 'pointer', fontSize: '0.9rem' 
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--gold)'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#aaa'}
        >
          <ArrowLeft size={16} /> Voltar ao site
        </button>

        <div className="luxury-card" style={{ padding: '3rem 2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(197, 160, 89, 0.1)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', margin: '0 auto 1.5rem' 
            }}>
              <Camera size={40} />
            </div>
            <h1 className="serif-title" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Acesso Restrito</h1>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>Área administrativa exclusiva para proprietários.</p>
          </div>

          <form onSubmit={handleLogin}>
            {error && (
              <div style={{ 
                background: 'rgba(255, 107, 107, 0.1)', color: '#ff6b6b', padding: '1rem', 
                borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.75rem', 
                fontSize: '0.875rem', marginBottom: '1.5rem', borderLeft: '4px solid #ff6b6b' 
              }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="luxury-form-group">
              <label>E-mail</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                <input
                  type="email"
                  className="luxury-form-control"
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="admin@mayclick.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="luxury-form-group">
              <label>Senha</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                <input
                  type="password"
                  className="luxury-form-control"
                  style={{ paddingLeft: '2.75rem' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-gold" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <LogIn size={20} /> Entrar no Painel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
