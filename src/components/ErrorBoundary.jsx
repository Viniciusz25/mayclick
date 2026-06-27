import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      return (
        <div className="auth-container" style={{padding: '2rem'}}>
          <div className="auth-card" style={{maxWidth: '800px', width: '100%'}}>
            <div className="text-center">
              <AlertTriangle size={48} color="var(--error)" className="mb-4" />
              <h2 className="mb-2">Algo deu errado nesta seção.</h2>
              <p className="mb-4" style={{color: 'var(--text-muted)'}}>
                Ocorreu um erro inesperado ao carregar esta página.
              </p>
            </div>

            {isDev && this.state.error && (
              <div style={{
                marginTop: '2rem',
                padding: '1rem',
                backgroundColor: '#f8f8f8',
                borderRadius: '8px',
                textAlign: 'left',
                overflow: 'auto',
                fontSize: '0.875rem',
                borderLeft: '4px solid var(--error)'
              }}>
                <p style={{fontWeight: 'bold', color: 'var(--error)', marginBottom: '0.5rem'}}>
                  Erro (Apenas Localhost):
                </p>
                <code style={{display: 'block', whiteSpace: 'pre-wrap', marginBottom: '1rem'}}>
                  {this.state.error.toString()}
                </code>
                {this.state.errorInfo && (
                  <details>
                    <summary style={{cursor: 'pointer', marginBottom: '0.5rem'}}>Component Stack Trace</summary>
                    <pre style={{fontSize: '0.75rem', opacity: 0.8}}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="text-center mt-4">
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                  window.location.href = '/';
                }}
              >
                <RotateCcw size={18} />
                Voltar ao Painel
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
