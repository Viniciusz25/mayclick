import { createClient } from '@supabase/supabase-js';

let cachedClient = null;
let cachedUrl = null;
let cachedKey = null;

const getSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ SUPABASE_URL e/ou SUPABASE_SERVICE_KEY não estão definidos no ambiente.');
  }

  if (!cachedClient || cachedUrl !== supabaseUrl || cachedKey !== supabaseKey) {
    cachedUrl = supabaseUrl;
    cachedKey = supabaseKey;
    cachedClient = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder', {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }

  return cachedClient;
};

export const supabase = new Proxy({}, {
  get(_, prop) {
    const client = getSupabaseClient();
    const value = client[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
