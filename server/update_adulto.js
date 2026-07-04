import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    const res = await pool.query("SELECT * FROM packages WHERE category = 'adulto'");
    const adultoPackages = res.rows;
    
    if (adultoPackages.length === 0) {
      console.log('Nenhum pacote adulto encontrado.');
      return;
    }
    
    for (const pkg of adultoPackages) {
      const replaceText = (text) => {
        if (!text || typeof text !== 'string') return text;
        return text.replace(/Infantil/g, 'Adulto').replace(/infantil/g, 'adulto');
      };
      
      const newName = replaceText(pkg.name);
      const newLabel = replaceText(pkg.label);
      const newDesc = replaceText(pkg.description);
      const newDeliveries = replaceText(pkg.deliveries);
      const newDifferential = replaceText(pkg.differential);
      const newObservations = replaceText(pkg.observations);
      
      const query = `
        UPDATE packages 
        SET 
          name = $1, 
          label = $2, 
          description = $3, 
          deliveries = $4, 
          differential = $5, 
          observations = $6
        WHERE id = $7
      `;
      
      await pool.query(query, [
        newName, 
        newLabel, 
        newDesc, 
        newDeliveries, 
        newDifferential, 
        newObservations, 
        pkg.id
      ]);
      console.log(`Atualizado pacote: ${newName}`);
    }
    
    console.log('Todos os pacotes adulto atualizados com sucesso!');
  } catch (err) {
    console.error('Erro ao atualizar pacotes:', err);
  } finally {
    await pool.end();
  }
}

run();
