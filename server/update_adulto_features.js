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

      const replaceArray = (arr) => {
        if (!arr || !Array.isArray(arr)) return arr;
        return arr.map(item => {
          if (typeof item === 'string') return replaceText(item);
          if (typeof item === 'object') {
            const newItem = { ...item };
            for (const key in newItem) {
              if (typeof newItem[key] === 'string') {
                newItem[key] = replaceText(newItem[key]);
              }
            }
            return newItem;
          }
          return item;
        });
      };
      
      const newFeatures = JSON.stringify(replaceArray(pkg.features));
      const newComparisonItems = JSON.stringify(replaceArray(pkg.comparison_items));
      
      const query = `
        UPDATE packages 
        SET 
          features = $1, 
          comparison_items = $2
        WHERE id = $3
      `;
      
      await pool.query(query, [
        newFeatures, 
        newComparisonItems, 
        pkg.id
      ]);
      console.log(`Atualizado features de: ${pkg.name}`);
    }
    
    console.log('Features dos pacotes adulto atualizadas com sucesso!');
  } catch (err) {
    console.error('Erro ao atualizar pacotes:', err);
  } finally {
    await pool.end();
  }
}

run();
