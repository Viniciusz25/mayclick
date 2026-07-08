import { google } from 'googleapis';
import dotenv from 'dotenv';
dotenv.config();

const getAuth = () => {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    return null;
  }

  return new google.auth.JWT(
    clientEmail,
    null,
    privateKey,
    ['https://www.googleapis.com/auth/calendar']
  );
};

export const createCalendarEvent = async (budget) => {
  try {
    const auth = getAuth();
    if (!auth) {
      console.warn('Google Calendar credentials not configured. Skipping event creation.');
      return null;
    }

    const calendar = google.calendar({ version: 'v3', auth });
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    if (!calendarId) {
      console.warn('GOOGLE_CALENDAR_ID not set. Skipping event creation.');
      return null;
    }

    // Prepare date. Assuming budget.event_date is YYYY-MM-DD
    if (!budget.event_date) return null;
    const dateStr = budget.event_date;
    const [year, month, day] = dateStr.split('-');
    
    // Create an all-day event
    const event = {
      summary: `${budget.client_name} - ${budget.event_type || 'Evento'}`,
      location: budget.event_location || '',
      description: `Orçamento: ${budget.budget_number}\nTelefone: ${budget.client_phone || ''}\nEmail: ${budget.client_email || ''}`,
      start: {
        date: `${year}-${month}-${day}`,
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        timeZone: 'America/Sao_Paulo',
      },
    };

    // Calculate next day for end date
    const startDate = new Date(year, month - 1, day);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    const endYear = endDate.getFullYear();
    const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
    const endDay = String(endDate.getDate()).padStart(2, '0');
    
    event.end.date = `${endYear}-${endMonth}-${endDay}`;

    const response = await calendar.events.insert({
      calendarId: calendarId,
      resource: event,
    });

    console.log(`Evento criado no Google Calendar: ${response.data.htmlLink}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar evento no Google Calendar:', error);
    return null;
  }
};

export const getCalendarEvents = async (timeMin, timeMax) => {
  try {
    const auth = getAuth();
    if (!auth) {
      console.warn('Google Calendar credentials not configured. Skipping event fetch.');
      return [];
    }

    const calendar = google.calendar({ version: 'v3', auth });
    const calendarId = process.env.GOOGLE_CALENDAR_ID;

    if (!calendarId) {
      console.warn('GOOGLE_CALENDAR_ID not set. Skipping event fetch.');
      return [];
    }

    // Por padrao, busca eventos a partir de 1 ano atras para não carregar demais,
    // se timeMin não for fornecido.
    let startMin = timeMin;
    if (!startMin) {
      const pastYear = new Date();
      pastYear.setFullYear(pastYear.getFullYear() - 1);
      startMin = pastYear.toISOString();
    }

    const params = {
      calendarId: calendarId,
      timeMin: startMin,
      maxResults: 250,
      singleEvents: true,
      orderBy: 'startTime',
    };

    if (timeMax) {
      params.timeMax = timeMax;
    }

    const response = await calendar.events.list(params);
    return response.data.items || [];
  } catch (error) {
    console.error('Erro ao buscar eventos no Google Calendar:', error);
    return [];
  }
};
