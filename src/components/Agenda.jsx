import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import ptBR from 'date-fns/locale/pt-BR';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Loader, RefreshCw, AlertCircle } from 'lucide-react';
import { getBudgets } from '../lib/apiClient';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Agenda.css';

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const Agenda = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchApprovedBudgets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBudgets({ status: 'approved' });
      
      // Parse dates and map to calendar events
      const calendarEvents = data
        .filter(budget => budget.event_date) // Ensure there's a date
        .map(budget => {
          // Assuming event_date is YYYY-MM-DD format
          // If it is in another format, we might need to parse it differently
          const dateStr = budget.event_date;
          // create a new Date. Note: new Date("YYYY-MM-DD") creates UTC midnight
          // Let's create local midnight by splitting
          const [year, month, day] = dateStr.split('-');
          const start = new Date(year, month - 1, day);
          const end = new Date(year, month - 1, day); 

          return {
            id: budget.id,
            title: `${budget.client_name} - ${budget.event_type || 'Evento'}`,
            start,
            end,
            allDay: true,
            resource: budget
          };
        });

      setEvents(calendarEvents);
    } catch (err) {
      console.error('Error fetching budgets for agenda:', err);
      setError('Não foi possível carregar a agenda de eventos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedBudgets();
  }, []);

  const handleSelectEvent = (event) => {
    // Navigate to budget details when clicked
    navigate(`/app/orcamentos/${event.resource.id}`);
  };

  return (
    <div className="dashboard-content fade-in">
      <header className="dashboard-header mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div className="welcome-area">
          <span className="badge badge-accent mb-1">Calendário</span>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Agenda de Eventos</h1>
          <p className="text-muted">Acompanhe todos os orçamentos aprovados e agendados.</p>
        </div>
        <button className="btn btn-ghost" onClick={fetchApprovedBudgets} disabled={loading}>
          <RefreshCw size={18} className={loading ? 'spinning' : ''} />
          Atualizar
        </button>
      </header>

      <div className="card" style={{ padding: '2rem' }}>
        {loading && events.length === 0 ? (
          <div className="empty-state">
            <Loader className="spinner" size={40} style={{ margin: '0 auto', color: 'var(--accent)' }} />
            <p className="text-muted mt-2">Carregando agenda...</p>
          </div>
        ) : error ? (
          <div className="empty-state error">
            <AlertCircle size={40} className="text-muted" style={{ margin: '0 auto', opacity: 0.5 }} />
            <p className="text-muted mt-2">{error}</p>
            <button className="btn btn-primary mt-4" onClick={fetchApprovedBudgets}>Tentar Novamente</button>
          </div>
        ) : (
          <div className="calendar-container">
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}
              onSelectEvent={handleSelectEvent}
              culture="pt-BR"
              messages={{
                next: "Próximo",
                previous: "Anterior",
                today: "Hoje",
                month: "Mês",
                week: "Semana",
                day: "Dia",
                agenda: "Agenda",
                date: "Data",
                time: "Hora",
                event: "Evento",
                noEventsInRange: "Não há eventos programados para este período."
              }}
              popup
              selectable
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Agenda;
