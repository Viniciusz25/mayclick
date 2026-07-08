import { getCalendarEvents } from '../lib/googleCalendar.js';

export const getEvents = async (req, res) => {
  try {
    const { timeMin, timeMax } = req.query;
    const events = await getCalendarEvents(timeMin, timeMax);
    res.json(events);
  } catch (error) {
    console.error('Error in getEvents controller:', error);
    res.status(500).json({ error: 'Erro ao buscar eventos do Google Calendar' });
  }
};
