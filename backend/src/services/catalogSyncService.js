const fs = require('fs');
const path = require('path');
const { supabase } = require('../config/supabase');

const SHEETS_DIR = path.join(__dirname, '..', '..', '..', 'frontend', 'src', 'data', 'sheets');
const BATCH_SIZE = 100;

function safeParseInt(val) {
  if (!val) return null;
  const num = parseInt(val, 10);
  return Number.isNaN(num) ? null : num;
}

/**
 * Merge catalog data with curated sheets and format for Supabase problems table
 */
function consolidateProblems(catalog) {
  const problemsBySlug = new Map();

  function getOrCreate(slug, defaultTitle) {
    if (!slug) return null;
    const cleanSlug = slug.trim().toLowerCase();
    if (!problemsBySlug.has(cleanSlug)) {
      problemsBySlug.set(cleanSlug, {
        title_slug: cleanSlug,
        title: defaultTitle || cleanSlug,
        frontend_id: null,
        difficulty: 'Medium',
        category: 'General',
        ac_rate: null,
        leetcode_url: `https://leetcode.com/problems/${cleanSlug}/`,
        topic_tags: new Set(),
        sheet_tags: new Set(),
        company_tags: new Set(),
        solutions: [],
        youtube: [],
      });
    }
    return problemsBySlug.get(cleanSlug);
  }

  // 1. Ingest Catalog Topics & Problems
  if (catalog && Array.isArray(catalog.topics)) {
    for (const topic of catalog.topics) {
      for (const p of topic.problems || []) {
        const entry = getOrCreate(p.titleSlug, p.title);
        if (!entry) continue;

        if (p.title) entry.title = p.title;
        if (p.questionId && !entry.frontend_id) entry.frontend_id = safeParseInt(p.questionId);
        if (p.difficulty) entry.difficulty = p.difficulty;
        if (p.acRate != null) entry.ac_rate = Number(p.acRate);
        if (p.url) entry.leetcode_url = p.url;
        if (topic.name) entry.topic_tags.add(topic.name);
        if (Array.isArray(p.tags)) {
          p.tags.forEach((tag) => entry.topic_tags.add(tag));
        }
      }
    }
  }

  // 2. Ingest Curated Sheets from frontend
  if (fs.existsSync(SHEETS_DIR)) {
    const sheetFiles = fs.readdirSync(SHEETS_DIR).filter((f) => f.endsWith('.json'));

    for (const file of sheetFiles) {
      const sheetKey = file.replace('.json', '');
      const filePath = path.join(SHEETS_DIR, file);
      try {
        const sheetData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const effectiveKey = sheetData.key || sheetKey;

        const problemList = [];
        if (Array.isArray(sheetData.sections)) {
          for (const sec of sheetData.sections) {
            for (const p of sec.problems || []) {
              problemList.push({ ...p, sectionTitle: sec.title });
            }
          }
        }
        if (Array.isArray(sheetData.companies)) {
          for (const comp of sheetData.companies) {
            for (const p of comp.problems || []) {
              problemList.push({
                ...p,
                companyName: comp.company,
                companySlug: comp.slug || comp.company.toLowerCase(),
              });
            }
          }
        }

        for (const p of problemList) {
          const slug = p.slug || p.titleSlug;
          if (!slug) continue;

          const entry = getOrCreate(slug, p.title);
          if (!entry) continue;

          if (p.title) entry.title = p.title;
          if (p.id && !entry.frontend_id) entry.frontend_id = safeParseInt(p.id);
          if (p.difficulty) entry.difficulty = p.difficulty;
          if (p.url) entry.leetcode_url = p.url;

          entry.sheet_tags.add(effectiveKey);

          if (p.companySlug) entry.company_tags.add(p.companySlug);
          if (p.companyName) entry.company_tags.add(p.companyName.toLowerCase());
          if (p.sectionTitle) entry.topic_tags.add(p.sectionTitle);

          if (Array.isArray(p.solutions) && p.solutions.length > 0) {
            entry.solutions = [...entry.solutions, ...p.solutions];
          } else if (p.solution) {
            entry.solutions.push({ title: 'Editorial', url: p.solution });
          }
          if (Array.isArray(p.youtube) && p.youtube.length > 0) {
            entry.youtube = [...entry.youtube, ...p.youtube];
          }
        }
      } catch (err) {
        console.warn(`[CatalogSync] Could not read sheet ${file}:`, err.message);
      }
    }
  }

  // Convert sets to arrays
  const result = [];
  for (const item of problemsBySlug.values()) {
    const topicArray = Array.from(item.topic_tags);
    result.push({
      frontend_id: item.frontend_id,
      title: item.title,
      title_slug: item.title_slug,
      difficulty: item.difficulty,
      category: topicArray[0] || item.category || 'General',
      ac_rate: item.ac_rate,
      leetcode_url: item.leetcode_url,
      topic_tags: topicArray,
      sheet_tags: Array.from(item.sheet_tags),
      company_tags: Array.from(item.company_tags),
      solutions: item.solutions,
      youtube: item.youtube,
      updated_at: new Date().toISOString(),
    });
  }

  return result;
}

/**
 * Batch sync consolidated catalog to Supabase problems table
 */
async function syncCatalogToSupabase(catalog) {
  try {
    const allProblems = consolidateProblems(catalog);
    if (!allProblems || allProblems.length === 0) return { success: false, synced: 0 };

    console.log(`[CatalogSync] 🚀 Auto-syncing ${allProblems.length} problems to Supabase...`);

    let successCount = 0;
    for (let i = 0; i < allProblems.length; i += BATCH_SIZE) {
      const chunk = allProblems.slice(i, i + BATCH_SIZE);
      const { error } = await supabase
        .from('problems')
        .upsert(chunk, { onConflict: 'title_slug' });

      if (error) {
        console.error(`[CatalogSync] Batch error at ${i}:`, error.message);
      } else {
        successCount += chunk.length;
      }
    }

    console.log(`[CatalogSync] ✅ Successfully synced ${successCount}/${allProblems.length} problems to Supabase!`);
    return { success: true, synced: successCount, total: allProblems.length };
  } catch (err) {
    console.error('[CatalogSync] ❌ Sync failed:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  consolidateProblems,
  syncCatalogToSupabase,
};
