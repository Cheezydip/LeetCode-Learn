const { checkSupabaseConnection } = require('./src/config/supabase');

async function testConnection() {
  console.log('Connecting to Supabase...');
  try {
    const result = await checkSupabaseConnection();
    if (!result.ok) {
      console.error('❌ Supabase connection error:', result.message);
      process.exit(1);
    }
    console.log('✅ Supabase connected successfully! Auth service is responsive.');
  } catch (err) {
    console.error('❌ Failed to connect:', err.message);
    process.exit(1);
  }
}

testConnection();
