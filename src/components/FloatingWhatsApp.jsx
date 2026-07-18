import React from 'react';
import { useLocation } from 'react-router-dom';
import useSettings from '../hooks/useSettings';
import './FloatingWhatsApp.css';

const FloatingWhatsApp = () => {
  const location = useLocation();
  const { businessSettings } = useSettings();
  
  // Ocultar no painel administrativo, login, cadastro e páginas similares
  if (
    location.pathname.startsWith('/app') || 
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/cadastro')
  ) {
    return null;
  }

  // O número do whatsapp vem das configurações da empresa (BusinessSettings)
  const whatsappNumber = businessSettings?.contact?.whatsapp || businessSettings?.whatsapp || '';
  
  // Limpar formatação para o link (manter apenas números)
  const cleanNumber = whatsappNumber.replace(/\D/g, '');

  if (!cleanNumber) return null; // Não mostra se não houver número configurado

  const whatsappLink = `https://wa.me/55${cleanNumber.startsWith('55') ? cleanNumber.slice(2) : cleanNumber}`;

  return (
    <a 
      href={whatsappLink}
      target="_blank" 
      rel="noopener noreferrer" 
      className="floating-whatsapp fade-in"
      aria-label="Fale conosco no WhatsApp"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 448 512" 
        fill="currentColor"
      >
        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zM223.9 413.4c-33 0-65.3-8.9-94-25.7l-6.7-4-69.8 18.3L72 334.1l-4.4-7.1c-18.3-29.6-28-64-28-99.3 0-101.4 82.5-183.9 184-183.9 49.2 0 95.4 19.1 130.2 53.9 34.8 34.8 54 81 54 130.2 0 101.4-82.5 183.9-184 183.9zM324.6 270c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
      </svg>
    </a>
  );
};

export default FloatingWhatsApp;
