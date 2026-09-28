import blind75Data from './sheets/blind75.json';
import leetcode150Data from './sheets/leetcode150.json';
import maangData from './sheets/maang.json';
import masterDsaData from './sheets/masterDsa.json';
import sqlData from './sheets/sql.json';
import lldData from './sheets/lld.json';
import interviewsData from './sheets/interviews.json';

export const SHEETS_METADATA = [
  {
    key: 'blind75',
    title: 'Blind 75',
    tagline: '2-Week Rapid Sprint',
    description: 'The 75 most essential LeetCode problems covering all fundamental technical interview patterns.',
    totalProblems: blind75Data.totalProblems,
    difficulties: blind75Data.difficulties,
    badge: 'Essential',
    category: 'Interview Sprint',
    icon: 'Zap',
    color: '#FF7A00'
  },
  {
    key: 'leetcode150',
    title: 'LeetCode Top 150',
    tagline: 'Comprehensive Interview Prep',
    description: 'The official top interview 150 study plan covering core algorithmic paradigms and classic problem variations.',
    totalProblems: leetcode150Data.totalProblems,
    difficulties: leetcode150Data.difficulties,
    badge: 'Popular',
    category: 'Interview Sprint',
    icon: 'Target',
    color: '#3FB950'
  },
  {
    key: 'maang',
    title: 'MAANG & Tech Giants',
    tagline: '14 Company Curated Sets',
    description: 'Frequently asked interview problems categorized by Google, Microsoft, Amazon, Meta, Apple, Salesforce, and more.',
    totalProblems: maangData.totalProblems,
    difficulties: maangData.difficulties,
    badge: 'Company Focus',
    category: 'Company Sets',
    icon: 'Building2',
    color: '#58A6FF',
    companies: maangData.companies.map(c => ({
      name: c.company,
      slug: c.slug,
      count: c.problemCount
    }))
  },
  {
    key: 'master-dsa',
    title: 'Master DSA 0-to-Hero',
    tagline: '870+ Deep Curriculum',
    description: 'From school-level fundamentals up to Advanced Segment Trees, Mo’s Algorithm.',
    totalProblems: masterDsaData.totalProblems,
    difficulties: masterDsaData.difficulties,
    badge: 'Comprehensive',
    category: 'Full Curriculum',
    icon: 'GraduationCap',
    color: '#A371F7'
  },
  {
    key: 'sql',
    title: 'SQL & Database Mastery',
    tagline: 'Foundations to Query Tuning',
    description: '189 hands-on SQL problems across DML, Joins, Window Functions, CTEs, and Database Optimization.',
    totalProblems: sqlData.totalProblems,
    difficulties: sqlData.difficulties,
    badge: 'Database Track',
    category: 'Specialized',
    icon: 'Database',
    color: '#F0883E'
  },
  {
    key: 'lld',
    title: 'Low-Level Design (LLD)',
    tagline: 'OOP, Patterns & Machine Coding',
    description: '78 comprehensive modules covering SOLID, Gang of Four patterns, and real-world system implementations.',
    totalProblems: lldData.totalProblems,
    difficulties: lldData.difficulties,
    badge: 'System Design',
    category: 'Specialized',
    icon: 'Cpu',
    color: '#388BFD'
  }
];

export const SHEETS_DATA = {
  blind75: blind75Data,
  leetcode150: leetcode150Data,
  maang: maangData,
  'master-dsa': masterDsaData,
  sql: sqlData,
  lld: lldData,
  interviews: interviewsData
};

/**
 * Get sheet by key
 * @param {string} sheetKey 
 */
export function getSheetData(sheetKey) {
  return SHEETS_DATA[sheetKey] || null;
}

/**
 * Get problems for a specific MAANG company
 * @param {string} companySlug 
 */
export function getMaangCompany(companySlug) {
  const normSlug = (companySlug || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return maangData.companies.find(c => c.slug === normSlug || c.company.toLowerCase() === companySlug.toLowerCase()) || null;
}

/**
 * Get all available MAANG companies
 */
export function getMaangCompaniesList() {
  return maangData.companies.map(c => ({
    name: c.company,
    slug: c.slug,
    count: c.problemCount
  }));
}

/**
 * Mapping from Roadmap Topic Key to Master DSA Section Titles
 */
export const TOPIC_TO_MASTER_DSA_MAP = {
  'dp': ['Dynamic Programming'],
  'dynamic-programming': ['Dynamic Programming'],
  'monostack': ['Monotonic Stack', 'Stack'],
  'monotonic-stack': ['Monotonic Stack', 'Stack'],
  'graphs': ['Graph'],
  'graph': ['Graph'],
  'sliding-window': ['Fixed Size Sliding Window', 'Dynamic Sliding Window', 'Sliding Window Over Interval'],
  'window': ['Fixed Size Sliding Window', 'Dynamic Sliding Window', 'Sliding Window Over Interval'],
  'slidingwindow': ['Fixed Size Sliding Window', 'Dynamic Sliding Window', 'Sliding Window Over Interval'],
  'two-pointers': ['Two Pointers'],
  'twopointers': ['Two Pointers'],
  'binsearch': ['Binary Search', 'Answer on Binary Search'],
  'binary-search': ['Binary Search', 'Answer on Binary Search'],
  'heaps': ['Heap ( Priority Queue )', 'HashSet / HashMap'],
  'heap': ['Heap ( Priority Queue )', 'HashSet / HashMap'],
  'heap-priority-queue': ['Heap ( Priority Queue )', 'HashSet / HashMap'],
  'prefix-sum': ['Prefix Sum / Difference Array', "Subarray Sum (Kadane's Algorithm)"],
  'prefixsum': ['Prefix Sum / Difference Array', "Subarray Sum (Kadane's Algorithm)"],
  'linked-list': ['Linked List'],
  'linkedlist': ['Linked List'],
  'trees': ['Binary Tree / Binary Search Tree'],
  'tree': ['Binary Tree / Binary Search Tree'],
  'binary-tree': ['Binary Tree / Binary Search Tree'],
  'binarytree': ['Binary Tree / Binary Search Tree'],
  'backtracking': ['Backtracking'],
  'trie': ['Tries'],
  'tries': ['Tries'],
  'bit-manipulation': ['Bit Manipulation'],
  'bitmanipulation': ['Bit Manipulation'],
  'union-find': ['Disjoint Set Unions'],
  'unionfind': ['Disjoint Set Unions'],
  'dsu': ['Disjoint Set Unions'],
  'greedy': ['Sorting', 'Sweep Line'],
  'intervals': ['Sorting', 'Sweep Line'],
  'design': ['Design'],
  'strings': ['String'],
  'string': ['String'],
  'recursion': ['Recursion'],
  'sorting': ['Sorting'],
  'fenwick-tree': ['Binary Index Tree (FenWick Tree)'],
  'segment-tree': ['Binary Index Tree (FenWick Tree)'],
  'binary-indexed-tree': ['Binary Index Tree (FenWick Tree)'],
  'sweep-line': ['Sweep Line'],
  'sweepline': ['Sweep Line'],
  'monotonic-queue': ['Queue'],
  'queue': ['Queue'],
  'deque': ['Queue'],
  'math': ['Math'],
  'geometry': ['Geometry']
};

/**
 * Get all Master DSA sections, subtopics, and problems associated with a roadmap topic
 * @param {string} topicKey 
 */
export function getMasterDsaProblemsForTopic(topicKey) {
  if (!topicKey) return [];
  const normKey = topicKey.toLowerCase().trim();
  const targetTitles = TOPIC_TO_MASTER_DSA_MAP[normKey] || [];

  if (targetTitles.length === 0) {
    // If no direct mapping, try loose matching with master sections
    const match = masterDsaData.sections.filter(s =>
      s.title.toLowerCase().includes(normKey.replace(/-/g, ' ')) ||
      normKey.includes(s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
    );
    return match;
  }

  return masterDsaData.sections.filter(s => targetTitles.includes(s.title));
}
