import dotenv from 'dotenv';
import { supabase } from './src/lib/supabase.js';

dotenv.config();

async function fixTransport() {
  console.log('Fetching business settings...');
  const { data, error } = await supabase.from('business_settings').select('*').single();
  if (error) {
    console.error('Error fetching:', error);
    process.exit(1);
  }

  const settings = data.settings || {};
  if (!settings.pricing) settings.pricing = {};
  
  settings.pricing.transport = [
    { id: 'isento', name: 'Sem deslocamento', price: 0 },
    { id: 'travel-1', name: 'Deslocamento ida e volta', price: 120.00 },
    { id: 'travel-2', name: 'Deslocamento ida e volta', price: 150.00 },
    { id: 'travel-3', name: 'Deslocamento ida e volta', price: 190.00 }
  ];

  console.log('Updating database with original transport values...');
  const { error: updateError } = await supabase
    .from('business_settings')
    .update({ settings })
    .eq('id', data.id);

  if (updateError) {
    console.error('Error updating:', updateError);
    process.exit(1);
  }

  console.log('Successfully reverted transport values in DB!');
  process.exit(0);
}

fixTransport();
