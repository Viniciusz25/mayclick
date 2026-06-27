import { execFileSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSeeds() {
  try {
    console.log('Starting seeds...');

    console.log('Seeding admin user...');
    execFileSync(process.execPath, [path.join(__dirname, 'seed-admin.js')], { stdio: 'inherit' });

    console.log('Seeding default settings and packages...');
    execFileSync(process.execPath, [path.join(__dirname, 'seed-default-settings.js')], { stdio: 'inherit' });

    console.log('All seeds completed successfully.');
  } catch (error) {
    console.error('Error running seeds:', error);
    process.exit(1);
  }
}

runSeeds();
