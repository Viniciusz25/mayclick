import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, LogIn, AlertCircle, ArrowLeft, Lock, Mail } from 'lucide-react';
import { login } from '../lib/apiClient';

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
    <div className="login-page">
      <div className="login-background"></div>

      <div className="login-container fade-in">
        <button className="btn-back-home" onClick={() => navigate('/')}>
          <ArrowLeft size={18} /> Voltar ao site
        </button>

        <div className="login-card shadow-lg">
          <div className="login-header text-center">
            <div className="login-logo">
              <Camera size={40} className="text-accent" />
            </div>
            <h1>Acesso Restrito</h1>
            <p className="text-muted">Área administrativa exclusiva para proprietários.</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            {error && (
              <div className="error-alert">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label>E-mail</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  className="form-control"
                  placeholder="admin@mayclick.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Senha</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full">
              <LogIn size={20} /> Entrar no Painel
            </button>
          </form>

          <div className="login-footer text-center">
            <p className="text-sm text-muted">Mayclick Photography &copy; {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          background-color: var(--bg-page);
          padding: 1.5rem;
        }

        .login-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 40vh;
          background-color: var(--primary);
          z-index: 0;
        }

        .login-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
        }

        .btn-back-home {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          cursor: pointer;
          font-weight: 500;
          transition: var(--transition);
        }

        .btn-back-home:hover {
          color: white;
        }

        .login-card {
          background-color: #fff;
          border-radius: var(--radius);
          padding: 3rem 2.5rem;
          border: 1px solid var(--border);
        }

        .login-logo {
          width: 80px;
          height: 80px;
          background-color: var(--bg-page);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .login-header h1 {
          font-size: 1.75rem;
          margin-bottom: 0.5rem;
        }

        .login-form {
          margin-top: 2rem;
        }

        .error-alert {
          background-color: #FFF5F5;
          color: var(--error);
          padding: 1rem;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
          border-left: 4px solid var(--error);
        }

        .input-with-icon {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .input-with-icon .form-control {
          padding-left: 3rem;
        }

        .btn-full {
          width: 100%;
          padding: 1rem;
          margin-top: 1rem;
        }

        .login-footer {
          margin-top: 2rem;
        }
      `}</style>
    </div>
  );
};

export default Login;
