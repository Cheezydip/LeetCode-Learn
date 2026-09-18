const app = require('./app');
const { checkSupabaseConnection } = require('./config/supabase');
const { initEnrichment } = require('./services/problemEnrichmentService');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`🚀 LeetCode-Learn API server running on http://localhost:${PORT}`);
  console.log(`📡 Checking Supabase connection...`);

  const supabaseStatus = await checkSupabaseConnection();
  if (supabaseStatus.ok) {
    console.log(`✅ Successfully connected to Supabase!`);
  } else {
    console.warn(`⚠️ Supabase connection issue: ${supabaseStatus.message}`);
  }

  // Initialize problem catalog enrichment (background fetch from LeetCode API)
  console.log(`📚 Initializing problem catalog enrichment...`);
  initEnrichment();
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server.');
  server.close(() => {
    console.log('HTTP server closed.');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received. Closing HTTP server.');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});
