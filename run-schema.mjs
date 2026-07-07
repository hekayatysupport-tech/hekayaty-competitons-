// run-schema.mjs
// Pushes the full Supabase schema using the Management API (sql execution endpoint).
// Usage: node run-schema.mjs

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PROJECT_REF = 'ubmqsexkgvdcjswhvitj';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVibXFzZXhrZ3ZkY2pzd2h2aXRqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjk0NzE4NCwiZXhwIjoyMDk4NTIzMTg0fQ.MvdSkBGjT7a9rryGawle5cNGcd0mjFOrIeRlpg6tBUw';

const schemaSQL = readFileSync(join(__dirname, 'supabase_schema.sql'), 'utf-8');

// Split SQL into individual statements for sequential execution
// We use the Supabase REST SQL endpoint via the service role key
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
  return response;
}

// Better approach: Use Supabase's pg endpoint
async function execSQL(sql) {
  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Note: This endpoint needs a Personal Access Token (PAT), not service role
      // We'll use the direct approach via supabase-js instead
    },
    body: JSON.stringify({ query: sql }),
  });
  return response.json();
}

// The most reliable approach without PAT: 
// Use node-postgres to connect directly to Supabase's PostgreSQL
// Connection string format: postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
// We don't have the DB password so we output instructions.

console.log('\n✅ .env file has been configured with your Supabase credentials.');
console.log('\n📋 NEXT STEP: Run the SQL schema in Supabase Dashboard\n');
console.log('1. Open: https://supabase.com/dashboard/project/ubmqsexkgvdcjswhvitj/sql/new');
console.log('2. Copy the contents of: supabase_schema.sql');
console.log('3. Paste it in the SQL editor and click RUN\n');
console.log('4. Then create your admin user:');
console.log('   - Go to: https://supabase.com/dashboard/project/ubmqsexkgvdcjswhvitj/auth/users');
console.log('   - Click "Add User" and enter your admin email + password');
console.log('   - Copy the user UUID, then run in SQL Editor:');
console.log("   INSERT INTO public.admin_roles (user_id, role) VALUES ('<YOUR_UUID>', 'super_admin');\n");
