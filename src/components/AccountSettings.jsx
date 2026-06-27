import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, User, Lock, Mail, 
  Shield, CheckCircle, AlertCircle 
} from 'lucide-react';

const AccountSettings = () => {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  
  // Dados simulados
  const [userData, setUserData] = useState({
    name: 'Administrador',
    email: 'admin@mayclick.com.br',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="account-page fade-in">
      <header className="page-header mb-4">
        <span className="badge badge-accent mb-1">Administrativo</span>
        <h1>Minha Conta</h1>
        <p className="text-muted">Gerencie suas informações de acesso e segurança.</p>
      </header>

      <div className="account-layout">
        <div className="main-form">
          {/* PROFILE DATA */}
          <section className="card mb-4">
            <h2 className="section-title"><User size={20} className="text-accent" /> Perfil de Acesso</h2>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Nome do Usuário</label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input 
                    className="form-control" 
                    value={userData.name} 
                    onChange={e => setUserData({...userData, name: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>E-mail de Acesso</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input 
                    type="email"
                    className="form-control" 
                    value={userData.email} 
                    onChange={e => setUserData({...userData, email: e.target.value})}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">
                <Save size={18} /> Salvar Alterações de Perfil
              </button>
            </form>
          </section>

          {/* SECURITY DATA */}
          <section className="card">
            <h2 className="section-title"><Shield size={20} className="text-accent" /> Segurança e Senha</h2>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Senha Atual</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input 
                    type="password"
                    className="form-control" 
                    placeholder="••••••••"
                    value={userData.currentPassword}
                    onChange={e => setUserData({...userData, currentPassword: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-2">
                <div className="form-group">
                  <label>Nova Senha</label>
                  <input 
                    type="password"
                    className="form-control" 
                    placeholder="Nova senha"
                    value={userData.newPassword}
                    onChange={e => setUserData({...userData, newPassword: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Confirmar Nova Senha</label>
                  <input 
                    type="password"
                    className="form-control" 
                    placeholder="Confirmar senha"
                    value={userData.confirmPassword}
                    onChange={e => setUserData({...userData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-outline">
                <Lock size={18} /> Alterar Senha
              </button>
            </form>
          </section>
        </div>

        <aside className="info-sidebar">
          <div className="card bg-accent-light">
            <h3 className="flex items-center gap-2 mb-2">
              <AlertCircle size={20} className="text-accent" /> 
              Informações Importantes
            </h3>
            <ul className="text-sm text-muted" style={{paddingLeft: '1rem', listStyle: 'disc'}}>
              <li className="mb-2">Sua senha deve conter pelo menos 8 caracteres.</li>
              <li className="mb-2">O e-mail de acesso é o mesmo utilizado para login.</li>
              <li>Mantenha seus dados sempre atualizados para sua segurança.</li>
            </ul>
          </div>
        </aside>
      </div>

      {saved && (
        <div className="save-toast">
          <CheckCircle size={18} /> Dados atualizados com sucesso!
        </div>
      )}

      <style>{`
        .account-layout { display: grid; grid-template-columns: 1fr 300px; gap: 2rem; align-items: start; }
        
        .input-with-icon { position: relative; }
        .input-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
        .input-with-icon .form-control { padding-left: 3rem; }
        
        .bg-accent-light { background-color: var(--accent-light); border: 1px solid var(--accent); }
        
        .save-toast {
          position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
          background-color: var(--success); color: #fff; padding: 1rem 2rem; border-radius: 50px;
          display: flex; align-items: center; gap: 0.75rem; font-weight: 700; box-shadow: var(--shadow-lg); z-index: 1000;
        }
        
        @media (max-width: 768px) { .account-layout { grid-template-columns: 1fr; } .info-sidebar { order: -1; } }
      `}</style>
    </div>
  );
};

export default AccountSettings;
