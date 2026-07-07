// migrate.mjs  
// Runs the full Supabase schema using node-postgres (pg)
// Usage: node migrate.mjs

import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const { Client } = pg;

const PROJECT_REF = 'ubmqsexkgvdcjswhvitj';
// Supabase DB password is the same as the service role key for direct connections
// Connection: postgresql://postgres.[ref]:[service_key]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVibXFzZXhrZ3ZkY2pzd2h2aXRqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjk0NzE4NCwiZXhwIjoyMDk4NTIzMTg0fQ.MvdSkBGjT7a9rryGawle5cNGcd0mjFOrIeRlpg6tBUw';

// Supabase connection pooler (Session mode, port 5432)
const connectionString = `postgresql://postgres.${PROJECT_REF}:${SERVICE_ROLE_KEY}@aws-0-eu-central-1.pooler.supabase.com:5432/postgres`;

const schemaSQL = readFileSync(join(__dirname, 'supabase_schema.sql'), 'utf-8');

async function runMigration() {
  console.log('🚀 Connecting to Supabase...');
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  
  try {
    await client.connect();
    console.log('✅ Connected to database!');
    
    console.log('⏳ Running schema migration...');
    await client.query(schemaSQL);
    console.log('✅ Schema migration completed successfully!');
    console.log('');
    console.log('📋 Tables created:');
    const result = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    result.rows.forEach(r => console.log('   -', r.table_name));
    
    console.log('');
    console.log('🎉 Your Supabase database is ready!');
    console.log('');
    console.log('Next step: Create an admin user at:');
    console.log(`https://supabase.com/dashboard/project/${PROJECT_REF}/auth/users`);
    
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    if (err.message.includes('password authentication failed') || err.message.includes('Connection refused')) {
      console.log('');
      console.log('💡 Hint: The direct DB connection may need your Supabase DB password.');
      console.log('   Go to: Project Settings → Database → Database password');
      console.log('   Then update the connectionString in this file.');
    }
  } finally {
    await client.end();
  }
}

runMigration();
