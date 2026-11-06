import jwt from 'jsonwebtoken';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_CALENDAR_BASE_URL = 'https://www.googleapis.com/calendar/v3/calendars';
const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar';

const getAccessToken = async () => {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  const assertion = jwt.sign(
    {
      iss: clientEmail,
      scope: CALENDAR_SCOPE,
      aud: GOOGLE_TOKEN_URL,
      iat: now,
      exp: now + 3600,
    },
    privateKey,
    { algorithm: 'RS256' }
  );

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }).toString(),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Failed to obtain Google OAuth token (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.access_token || null;
};

export const createCalendarEvent = async (budget) => {
  try {
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    if (!calendarId) {
      console.warn('GOOGLE_CALENDAR_ID not set. Skipping event creation.');
      return null;
    }

    const accessToken = await getAccessToken();
    if (!accessToken) {
      console.warn('Google Calendar credentials not configured. Skipping event creation.');
      return null;
    }

    if (!budget.event_date) return null;
    const dateStr = String(budget.event_date).slice(0, 10);
    const [year, month, day] = dateStr.split('-').map(Number);

    const startDate = new Date(year, month - 1, day);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    const endYear = endDate.getFullYear();
    const endMonth = String(endDate.getMonth() + 1).padStart(2, '0');
    const endDay = String(endDate.getDate()).padStart(2, '0');

    const event = {
      summary: `${budget.client_name} - ${budget.event_type || 'Evento'}`,
      location: budget.event_location || '',
      description: `Orçamento: ${budget.budget_number}\nTelefone: ${budget.client_phone || ''}\nEmail: ${budget.client_email || ''}`,
      start: {
        date: `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        date: `${endYear}-${endMonth}-${endDay}`,
        timeZone: 'America/Sao_Paulo',
      },
    };

    const url = `${GOOGLE_CALENDAR_BASE_URL}/${encodeURIComponent(calendarId)}/events`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Google Calendar insert failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    console.log(`Evento criado no Google Calendar: ${data.htmlLink}`);
    return data;
  } catch (error) {
    console.error('Erro ao criar evento no Google Calendar:', error);
    return null;
  }
};

export const getCalendarEvents = async (timeMin, timeMax) => {
  try {
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    if (!calendarId) {
      console.warn('GOOGLE_CALENDAR_ID not set. Skipping event fetch.');
      return [];
    }

    const accessToken = await getAccessToken();
    if (!accessToken) {
      console.warn('Google Calendar credentials not configured. Skipping event fetch.');
      return [];
    }

    let startMin = timeMin;
    if (!startMin) {
      const pastYear = new Date();
      pastYear.setFullYear(pastYear.getFullYear() - 1);
      startMin = pastYear.toISOString();
    }

    const query = new URLSearchParams({
      timeMin: startMin,
      maxResults: '250',
      singleEvents: 'true',
      orderBy: 'startTime',
    });

    if (timeMax) {
      query.set('timeMax', timeMax);
    }

    const url = `${GOOGLE_CALENDAR_BASE_URL}/${encodeURIComponent(calendarId)}/events?${query.toString()}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`Google Calendar list failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Erro ao buscar eventos no Google Calendar:', error);
    return [];
  }
};
