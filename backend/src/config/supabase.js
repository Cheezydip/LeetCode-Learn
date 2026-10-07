const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

const fs = require('fs');

// Search and load .env from backend/.env, root/.env, or cwd
const envCandidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../../.env'),
];

for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isConfigured) {
  console.warn('⚠️ SUPABASE_URL or SUPABASE_ANON_KEY is missing in environment variables. Database features will be in degraded mode.');
}

// Fallback to dummy client if environment variables are not set during initial deploy
const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    })
  : createClient('https://placeholder-project.supabase.co', 'placeholder-anon-key', {
      auth: {
        persistSession: false,
      },
    });

/**
 * Verifies that the Supabase instance is reachable
 * @returns {Promise<{ ok: boolean, message?: string }>}
 */
async function checkSupabaseConnection() {
  if (!isConfigured) {
    return { ok: false, message: 'SUPABASE_URL or SUPABASE_ANON_KEY is not configured in environment variables' };
  }
  try {
    const { error } = await supabase.auth.getSession();
    if (error) {
      return { ok: false, message: error.message };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

module.exports = {
  supabase,
  checkSupabaseConnection,
};
