import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PROJECT_REF = 'ubmqsexkgvdcjswhvitj';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVibXFzZXhrZ3ZkY2pzd2h2aXRqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjk0NzE4NCwiZXhwIjoyMDk4NTIzMTg0fQ.MvdSkBGjT7a9rryGawle5cNGcd0mjFOrIeRlpg6tBUw';

const schemaSQL = readFileSync(join(__dirname, 'migration_telegram_system.sql'), 'utf-8');

const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;

async function runSQL(sql) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });
  
  if (!response.ok) {
    const err = await response.text();
    console.error('Error executing SQL:', err);
  } else {
    console.log('Migration executed successfully!');
  }
}

// execute
runSQL(schemaSQL).catch(console.error);
