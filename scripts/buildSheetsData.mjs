import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '..', 'frontend', 'src', 'data', 'sheets');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function extractSlug(url, label) {
  if (!url) {
    return (label || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  const lcMatch = url.match(/leetcode\.com\/problems\/([^/?#]+)/i);
  if (lcMatch && lcMatch[1]) {
    return lcMatch[1].toLowerCase();
  }
  const gfgMatch = url.match(/geeksforgeeks\.org\/([^/?#]+)/i);
  if (gfgMatch && gfgMatch[1]) {
    return gfgMatch[1].toLowerCase();
  }
  const hrMatch = url.match(/hackerrank\.com\/challenges\/([^/?#]+)/i);
  if (hrMatch && hrMatch[1]) {
    return hrMatch[1].toLowerCase();
  }
  return (label || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function normalizeDifficulty(diff) {
  if (!diff) return 'Medium';
  const d = diff.toString().trim().toLowerCase();
  if (d === 'easy') return 'Easy';
  if (d === 'medium') return 'Medium';
  if (d === 'hard') return 'Hard';
  return 'Medium';
}

function normalizeProblem(p, defaultId) {
  const title = (p.label || p.title || p.name || 'Untitled').trim();
  const url = p.question || p.link || p.url || '';
  const slug = extractSlug(url, title);
  const difficulty = normalizeDifficulty(p.difficulty || p.diff);
  const solution = p.solution && p.solution !== '-' ? p.solution : null;
  const solutions = Array.isArray(p.solutions) ? p.solutions : (solution ? [{ title: 'Solution', url: solution }] : []);
  const youtube = p.youtube ? (Array.isArray(p.youtube) ? p.youtube : [{ title: 'Video Solution', url: p.youtube }]) : [];

  let platform = 'Other';
  if (url.includes('leetcode.com')) platform = 'LeetCode';
  else if (url.includes('geeksforgeeks.org')) platform = 'GeeksforGeeks';
  else if (url.includes('hackerrank.com')) platform = 'HackerRank';
  else if (url.includes('educative.io')) platform = 'Educative';

  return {
    id: p.id !== undefined ? p.id : defaultId,
    title,
    slug,
    url,
    difficulty,
    platform,
    solution,
    solutions,
    youtube,
    important: !!(p.important || p.mustdo || p.mustDo)
  };
}

async function fetchJSON(url) {
  console.log(`Fetching ${url}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json();
}

async function buildAll() {
  console.log('--- Starting AlgoTracker Data Extraction ---');

  // 1. Blind 75
  {
    const raw = await fetchJSON('https://www.algotracker.in/blind75-problems.json');
    let totalProblems = 0;
    let counts = { Easy: 0, Medium: 0, Hard: 0 };
    let idCounter = 3001;

    const sections = (raw.sections || []).map(sec => {
      const problems = (sec.problems || []).map(p => {
        const item = normalizeProblem(p, idCounter++);
        counts[item.difficulty] = (counts[item.difficulty] || 0) + 1;
        totalProblems++;
        return item;
      });
      return {
        title: sec.title,
        problemCount: problems.length,
        problems
      };
    });

    const output = {
      key: 'blind75',
      name: 'Blind 75',
      description: 'The definitive 75 LeetCode problems to master essential technical interview patterns in 2-3 weeks.',
      badge: '2-Week Sprint',
      totalProblems,
      difficulties: counts,
      sections
    };
    fs.writeFileSync(path.join(OUTPUT_DIR, 'blind75.json'), JSON.stringify(output, null, 2));
    console.log(`✓ Blind 75: ${totalProblems} problems written`);
  }

  // 2. LeetCode Top 150
  {
    const raw = await fetchJSON('https://www.algotracker.in/leetcode150-problems.json');
    let totalProblems = 0;
    let counts = { Easy: 0, Medium: 0, Hard: 0 };
    let idCounter = 4001;

    const sections = (raw.sections || []).map(sec => {
      const problems = (sec.problems || []).map(p => {
        const item = normalizeProblem(p, idCounter++);
        counts[item.difficulty] = (counts[item.difficulty] || 0) + 1;
        totalProblems++;
        return item;
      });
      return {
        title: sec.title,
        problemCount: problems.length,
        problems
      };
    });

    const output = {
      key: 'leetcode150',
      name: 'LeetCode Top Interview 150',
      description: 'Comprehensive 150 interview questions covering all core data structures, algorithms, and common variations.',
      badge: 'Interview Ready',
      totalProblems,
      difficulties: counts,
      sections
    };
    fs.writeFileSync(path.join(OUTPUT_DIR, 'leetcode150.json'), JSON.stringify(output, null, 2));
    console.log(`✓ LeetCode Top 150: ${totalProblems} problems written`);
  }

  // 3. MAANG Company-wise
  {
    const raw = await fetchJSON('https://www.algotracker.in/maang-problems.json');
    let totalProblems = 0;
    let counts = { Easy: 0, Medium: 0, Hard: 0 };
    let idCounter = 2001;

    const companies = (raw.sections || []).map(sec => {
      const problems = (sec.problems || []).map(p => {
        const item = normalizeProblem(p, idCounter++);
        counts[item.difficulty] = (counts[item.difficulty] || 0) + 1;
        totalProblems++;
        return item;
      });
      return {
        company: sec.title,
        slug: sec.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        problemCount: problems.length,
        problems
      };
    });

    const output = {
      key: 'maang',
      name: 'MAANG & Top Tech Company Questions',
      description: 'Frequently asked interview problems for Google, Microsoft, Amazon, Meta, Apple, Salesforce, and top tier firms.',
      badge: 'Company Focused',
      totalProblems,
      difficulties: counts,
      companies
    };
    fs.writeFileSync(path.join(OUTPUT_DIR, 'maang.json'), JSON.stringify(output, null, 2));
    console.log(`✓ MAANG: ${companies.length} companies, ${totalProblems} problems written`);
  }

  // 4. Master DSA Sheet
  {
    const raw = await fetchJSON('https://www.algotracker.in/dsaWithId-problems.json');
    let totalProblems = 0;
    let counts = { Easy: 0, Medium: 0, Hard: 0 };
    let idCounter = 1001;

    const sections = (raw.sections || []).map(sec => {
      let directProblems = (sec.problems || []).map(p => {
        const item = normalizeProblem(p, idCounter++);
        counts[item.difficulty] = (counts[item.difficulty] || 0) + 1;
        totalProblems++;
        return item;
      });

      let subsections = [];
      if (sec.subsections) {
        subsections = sec.subsections.map(sub => {
          const subProblems = (sub.problems || []).map(p => {
            const item = normalizeProblem(p, idCounter++);
            counts[item.difficulty] = (counts[item.difficulty] || 0) + 1;
            totalProblems++;
            return item;
          });
          return {
            title: sub.title,
            problemCount: subProblems.length,
            problems: subProblems
          };
        });
      }

      return {
        title: sec.title,
        problemCount: directProblems.length + subsections.reduce((acc, s) => acc + s.problemCount, 0),
        problems: directProblems,
        subsections
      };
    });

    const output = {
      key: 'master-dsa',
      name: 'Zero to Hero Master DSA Sheet',
      description: '870+ structured problems covering foundational basics to advanced competition algorithms with C++ solutions.',
      badge: 'Comprehensive Curriculum',
      totalProblems,
      difficulties: counts,
      sections
    };
    fs.writeFileSync(path.join(OUTPUT_DIR, 'masterDsa.json'), JSON.stringify(output, null, 2));
    console.log(`✓ Master DSA: ${sections.length} topics, ${totalProblems} problems written`);
  }

  // 5. SQL Practice Sheet
  {
    const raw = await fetchJSON('https://www.algotracker.in/sql-problems.json');
    let totalProblems = 0;
    let counts = { Easy: 0, Medium: 0, Hard: 0 };
    let idCounter = 5001;

    const sections = (raw.sections || []).map(sec => {
      let directProblems = (sec.problems || []).map(p => {
        const item = normalizeProblem(p, idCounter++);
        counts[item.difficulty] = (counts[item.difficulty] || 0) + 1;
        totalProblems++;
        return item;
      });

      let subsections = [];
      if (sec.subsections) {
        subsections = sec.subsections.map(sub => {
          const subProblems = (sub.problems || []).map(p => {
            const item = normalizeProblem(p, idCounter++);
            counts[item.difficulty] = (counts[item.difficulty] || 0) + 1;
            totalProblems++;
            return item;
          });
          return {
            title: sub.title,
            problemCount: subProblems.length,
            problems: subProblems
          };
        });
      }

      return {
        title: sec.title,
        problemCount: directProblems.length + subsections.reduce((acc, s) => acc + s.problemCount, 0),
        problems: directProblems,
        subsections
      };
    });

    const output = {
      key: 'sql',
      name: 'SQL & Database Mastery',
      description: '180+ SQL interview challenges ranging from foundational DML/Joins to Window Functions, CTEs, and query optimization.',
      badge: 'Database Track',
      totalProblems,
      difficulties: counts,
      sections
    };
    fs.writeFileSync(path.join(OUTPUT_DIR, 'sql.json'), JSON.stringify(output, null, 2));
    console.log(`✓ SQL Sheet: ${sections.length} tiers, ${totalProblems} problems written`);
  }

  // 6. Low Level Design (LLD)
  {
    const raw = await fetchJSON('https://www.algotracker.in/lld-problems.json');
    let totalProblems = 0;
    let counts = { Easy: 0, Medium: 0, Hard: 0 };
    let idCounter = 6001;

    const sections = (raw.sections || []).map(sec => {
      let subsections = [];
      if (sec.subsections) {
        subsections = sec.subsections.map(sub => {
          const subProblems = (sub.problems || []).map(p => {
            const item = normalizeProblem(p, idCounter++);
            counts[item.difficulty] = (counts[item.difficulty] || 0) + 1;
            totalProblems++;
            return item;
          });
          return {
            title: sub.title,
            problemCount: subProblems.length,
            problems: subProblems
          };
        });
      }

      return {
        title: sec.title,
        problemCount: subsections.reduce((acc, s) => acc + s.problemCount, 0),
        subsections
      };
    });

    const output = {
      key: 'lld',
      name: 'Low-Level Design & Machine Coding',
      description: 'Object-Oriented Programming, SOLID principles, 22 Gang of Four design patterns, and 38+ real-world machine coding scenarios.',
      badge: 'System Architecture',
      totalProblems,
      difficulties: counts,
      sections
    };
    fs.writeFileSync(path.join(OUTPUT_DIR, 'lld.json'), JSON.stringify(output, null, 2));
    console.log(`✓ LLD Sheet: ${sections.length} tracks, ${totalProblems} problems written`);
  }

  // 7. Interviews & Compensation
  {
    const raw = await fetchJSON('https://www.algotracker.in/interviews.json');
    fs.writeFileSync(path.join(OUTPUT_DIR, 'interviews.json'), JSON.stringify(raw, null, 2));
    console.log(`✓ Interviews dataset written`);
  }

  console.log('All AlgoTracker datasets successfully built and saved in frontend/src/data/sheets/!');
}

buildAll().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
