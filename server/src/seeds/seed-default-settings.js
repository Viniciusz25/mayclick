import pool from '../db.js';
import { LEGACY_GENERIC_PACKAGE_KEYS, OFFICIAL_PACKAGES } from '../data/official-packages.js';

async function seedDefaults() {
  try {
    const settingsCheck = await pool.query('SELECT id FROM business_settings LIMIT 1');
    if (settingsCheck.rows.length === 0) {
      await pool.query(`
        INSERT INTO business_settings
        (company_name, trade_name, cnpj, phone, email, site, instagram, address, budget_validity_days, payment_terms)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          'Mayra Mayclick Photography',
          'Mayclick Photography',
          '37.816.268/0001-06',
          '+55 11 96303-1814',
          'admin@mayclick.com.br',
          'www.mayfotosefilmagens.com.br',
          '@mayclick_fotos',
          'Mogi das Cruzes - SP',
          5,
          '50% de entrada para reserva de data e 50% até o dia do evento.',
        ]
      );
      console.log('Business settings seeded.');
    }

    let insertedPackages = 0;
    let updatedPackages = 0;

    for (const pkg of OFFICIAL_PACKAGES) {
      const existing = await pool.query(
        `
          SELECT id
          FROM packages
          WHERE lower(category) = lower($1) AND lower(name) = lower($2)
          ORDER BY created_at ASC NULLS LAST, id ASC
        `,
        [pkg.category, pkg.name]
      );

      if (existing.rows.length > 0) {
        await pool.query(
          `
            UPDATE packages
            SET
              category = $1,
              name = $2,
              label = $3,
              package_number = $4,
              installment_text = $5,
              price = $6,
              description = $7,
              features = $8::jsonb,
              comparison_items = $9::jsonb,
              coverage_time = $10,
              team = $11,
              deliveries = $12,
              differential = $13,
              observations = $14,
              sort_order = $15,
              active = true,
              updated_at = CURRENT_TIMESTAMP
            WHERE id = $16
          `,
          [
            pkg.category,
            pkg.name,
            pkg.label,
            pkg.packageNumber,
            pkg.installmentText,
            pkg.price,
            pkg.description,
            JSON.stringify(pkg.features),
            JSON.stringify(pkg.features),
            pkg.coverageTime,
            pkg.team,
            pkg.deliveries,
            pkg.differential,
            pkg.observations,
            pkg.sortOrder,
            existing.rows[0].id,
          ]
        );

        if (existing.rows.length > 1) {
          await pool.query(
            `
              UPDATE packages
              SET active = false, updated_at = CURRENT_TIMESTAMP
              WHERE id = ANY($1::uuid[])
            `,
            [existing.rows.slice(1).map(({ id }) => id)]
          );
        }

        updatedPackages += 1;
        continue;
      }

      await pool.query(
        `
          INSERT INTO packages
          (category, name, label, package_number, installment_text, price, description, features, comparison_items,
           coverage_time, team, deliveries, differential, observations, sort_order, active)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::jsonb, $10, $11, $12, $13, $14, $15, true)
        `,
        [
          pkg.category,
          pkg.name,
          pkg.label,
          pkg.packageNumber,
          pkg.installmentText,
          pkg.price,
          pkg.description,
          JSON.stringify(pkg.features),
          JSON.stringify(pkg.features),
          pkg.coverageTime,
          pkg.team,
          pkg.deliveries,
          pkg.differential,
          pkg.observations,
          pkg.sortOrder,
        ]
      );
      insertedPackages += 1;
    }

    const genericPackageConditions = LEGACY_GENERIC_PACKAGE_KEYS
      .map((key, index) => {
        const [category, name] = key.split('::');
        return `(lower(category) = lower($${index * 2 + 1}) AND lower(name) = lower($${index * 2 + 2}))`;
      })
      .join(' OR ');

    if (genericPackageConditions) {
      const genericParams = LEGACY_GENERIC_PACKAGE_KEYS.flatMap((key) => key.split('::'));
      await pool.query(
        `
          UPDATE packages
          SET active = false, updated_at = CURRENT_TIMESTAMP
          WHERE ${genericPackageConditions}
        `,
        genericParams
      );
    }

    console.log(`Default packages seed completed. Inserted: ${insertedPackages}. Updated/confirmed: ${updatedPackages}.`);
  } catch (error) {
    console.error('Error seeding defaults:', {
      message: error.message,
      code: error.code,
    });
    process.exitCode = 1;
  } finally {
    process.exit();
  }
}

seedDefaults();
