const fs = require('fs');
const path = require('path');
const { syncCatalogToSupabase } = require('../services/catalogSyncService');

const CATALOG_PATH = path.join(__dirname, '..', 'data', 'cache', 'enrichedCatalog.json');

async function main() {
  console.log('🚀 Running manual problem sync to Supabase...');
  let catalog = null;
  if (fs.existsSync(CATALOG_PATH)) {
    catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  }
  const result = await syncCatalogToSupabase(catalog);
  console.log('Sync result:', result);
}

main().catch((err) => {
  console.error('Fatal seeding error:', err);
  process.exit(1);
});
