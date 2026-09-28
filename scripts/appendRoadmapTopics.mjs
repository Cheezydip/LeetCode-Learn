import fs from 'fs';
import path from 'path';

const filePath = path.resolve('frontend/src/data/roadmapData.js');
let content = fs.readFileSync(filePath, 'utf8');

const newTopicsCode = `
  // ═══════════════════════════════════════════════════════════════════
  // 17. STRINGS & KMP
  // ═══════════════════════════════════════════════════════════════════
  strings: {
    title: 'String Algorithms & Pattern Matching',
    desc: 'String search invariants, longest prefix-suffix tables (KMP), rolling polynomial hash (Rabin-Karp), and palindromic centers.',
    tiers: {
      easy: {
        label: 'Foundation',
        groups: [
          {
            name: 'Prefix & Anagram Matching',
            problems: [
              { name: 'Longest Common Prefix', lcId: 14, intuition: 'Vertical scan across character indices or horizontal prefix reduction.' },
              { name: 'Valid Anagram', lcId: 242, intuition: 'Array of 26 character frequencies; net delta must equal zero across both strings.' },
              { name: 'Group Anagrams', lcId: 49, intuition: 'Categorize by sorted string or 26-character tuple frequency key.' },
            ],
          },
        ],
      },
      medium: {
        label: 'Core Patterns',
        groups: [
          {
            name: 'LPS Table & Center Expansion',
            problems: [
              { name: 'Find the Index of the First Occurrence in a String', lcId: 28, intuition: 'Knuth-Morris-Pratt (KMP) failure table. Avoid rollback on mismatch via longest prefix-suffix length.' },
              { name: 'Longest Palindromic Substring', lcId: 5, intuition: 'Expand outward from each of the 2n-1 odd and even center candidates.' },
              { name: 'Palindromic Substrings', lcId: 647, intuition: 'Count all valid palindromic expansions around every center.' },
              { name: 'Repeated DNA Sequences', lcId: 187, intuition: 'Rolling hash on 10-character substrings with bitmask encoding (2 bits per nucleotide).' },
            ],
          },
        ],
      },
      hard: {
        label: 'Advanced',
        groups: [
          {
            name: 'Complex Automata & Partitions',
            problems: [
              { name: 'Shortest Palindrome', lcId: 214, intuition: 'Compute KMP LPS on s + # + rev(s) to find longest palindromic prefix.' },
              { name: 'Word Break II', lcId: 140, intuition: 'Memoized DFS with suffix trie pruning to yield all space-delimited decompositions.' },
              { name: 'Distinct Subsequences', lcId: 115, intuition: '2D DP counting ways s matches prefix of t: dp[i][j] = dp[i-1][j] + (s[i-1]==t[j-1] ? dp[i-1][j-1] : 0).' },
            ],
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 18. RECURSION & DIVIDE-AND-CONQUER
  // ═══════════════════════════════════════════════════════════════════
  recursion: {
    title: 'Recursion & Divide-and-Conquer',
    desc: 'Problem reduction to self-similar subproblems, call stack unwinding, binary exponentiation, and recursive descent parsing.',
    tiers: {
      easy: {
        label: 'Foundation',
        groups: [
          {
            name: 'Base Cases & Stack Invariants',
            problems: [
              { name: 'Pow(x, n)', lcId: 50, intuition: 'Binary exponentiation: x^n = (x^2)^(n/2). Handle negative powers and odd n.' },
              { name: 'Reverse Linked List', lcId: 206, intuition: 'Head.next.next = head recursively unwinds pointers from tail back to head.' },
              { name: 'Swap Nodes in Pairs', lcId: 24, intuition: 'Swap first pair, connect to recursive result of third node.' },
            ],
          },
        ],
      },
      medium: {
        label: 'Core Patterns',
        groups: [
          {
            name: 'Divide & Conquer Partitions',
            problems: [
              { name: 'Sort an Array', lcId: 912, intuition: 'Merge sort or 3-way quicksort: partition domain into halves and merge in O(N).' },
              { name: 'K-th Symbol in Grammar', lcId: 779, intuition: 'Bit inversion recursion: if k is in right half of row, flip parent bit.' },
              { name: 'Flatten Nested List Iterator', lcId: 341, intuition: 'Recursive unrolling or stack holding list iterators.' },
            ],
          },
        ],
      },
      hard: {
        label: 'Advanced',
        groups: [
          {
            name: 'Grammar & Expression Evaluation',
            problems: [
              { name: 'Basic Calculator', lcId: 224, intuition: 'Recursive descent parser: parentheses push running result and sign onto stack.' },
              { name: 'Expression Add Operators', lcId: 282, intuition: 'Backtracking recursion tracking previous operand for multiplication precedence.' },
              { name: 'Parse Lisp Expression', lcId: 736, intuition: 'Recursive scope environment map passed through nested expression evaluations.' },
            ],
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 19. SORTING & PARTITIONS
  // ═══════════════════════════════════════════════════════════════════
  sorting: {
    title: 'Sorting & Array Partitions',
    desc: 'Dutch National Flag partitions, custom comparator transitivity, Quickselect expected O(N) selection, and inversion counting.',
    tiers: {
      easy: {
        label: 'Foundation',
        groups: [
          {
            name: 'Counting & Multi-Pointer Partition',
            problems: [
              { name: 'Sort Colors', lcId: 75, intuition: 'Dutch National Flag: 3 pointers (low, mid, high) separating 0s, 1s, and 2s in single pass.' },
              { name: 'Majority Element', lcId: 169, intuition: 'Boyer-Moore voting: increment on majority candidate match, decrement otherwise.' },
              { name: 'Contains Duplicate', lcId: 217, intuition: 'Sort array to check adjacent items or use hash set in O(N).' },
            ],
          },
        ],
      },
      medium: {
        label: 'Core Patterns',
        groups: [
          {
            name: 'Custom Ordering & Quickselect',
            problems: [
              { name: 'Largest Number', lcId: 179, intuition: 'Sort strings with comparator (a + b) > (b + a). Handle leading zeroes.' },
              { name: 'Kth Largest Element in an Array', lcId: 215, intuition: 'Quickselect algorithm: partition array until pivot index equals target rank.' },
              { name: 'Sort Characters By Frequency', lcId: 451, intuition: 'Bucket sort on frequencies or max-heap of character counts.' },
            ],
          },
        ],
      },
      hard: {
        label: 'Advanced',
        groups: [
          {
            name: 'Inversion Counting & Bucket Distribution',
            problems: [
              { name: 'Count of Smaller Numbers After Self', lcId: 315, intuition: 'Modified merge sort tracking index migrations or Fenwick Tree frequency count.' },
              { name: 'Reverse Pairs', lcId: 493, intuition: 'Merge sort counting step: count j where nums[i] > 2 * nums[j] before merging.' },
              { name: 'Maximum Gap', lcId: 164, intuition: 'Pigeonhole bucket sort: gap between adjacent buckets must exceed (max-min)/(n-1).' },
            ],
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 20. FENWICK & SEGMENT TREES
  // ═══════════════════════════════════════════════════════════════════
  'fenwick-tree': {
    title: 'Binary Indexed Tree & Segment Trees',
    desc: 'Prefix range invariants, lowest set bit (i & -i) tree traversal, point updates in O(log N), and lazy propagation interval tags.',
    tiers: {
      easy: {
        label: 'Foundation',
        groups: [
          {
            name: 'Prefix Sum Invariants',
            problems: [
              { name: 'Range Sum Query - Immutable', lcId: 303, intuition: 'Prefix sum array: sumRange(i, j) = prefix[j+1] - prefix[i].' },
              { name: 'Range Sum Query - Mutable', lcId: 307, intuition: 'Binary Indexed Tree (Fenwick Tree) using lowbit i & -i for O(log N) updates and queries.' },
            ],
          },
        ],
      },
      medium: {
        label: 'Core Patterns',
        groups: [
          {
            name: 'Coordinate Compression & Inversions',
            problems: [
              { name: 'Queue Reconstruction by Height', lcId: 406, intuition: 'Sort by height desc, k asc. Segment tree or Fenwick tree to place in k-th empty slot.' },
              { name: 'My Calendar I', lcId: 729, intuition: 'TreeMap or segment tree checking overlapping intervals in O(log N).' },
              { name: 'My Calendar II', lcId: 731, intuition: 'Sweep line difference map or segment tree tracking max overlap < 3.' },
            ],
          },
        ],
      },
      hard: {
        label: 'Advanced',
        groups: [
          {
            name: 'Dynamic Segment Trees & Lazy Tags',
            problems: [
              { name: 'Range Sum Query 2D - Mutable', lcId: 308, intuition: '2D Fenwick tree with nested lowbit loops for submatrix queries.' },
              { name: 'Falling Squares', lcId: 699, intuition: 'Dynamic segment tree with coordinate compression and lazy max-height updates.' },
              { name: 'Range Module', lcId: 715, intuition: 'Segment tree or disjoint interval set supporting range addition and removal.' },
            ],
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 21. SWEEP LINE
  // ═══════════════════════════════════════════════════════════════════
  'sweep-line': {
    title: 'Sweep Line & Event Processing',
    desc: 'Chronological event point sorting, active boundary tracking, 2D geometry projection, and rectangle intersection unions.',
    tiers: {
      easy: {
        label: 'Foundation',
        groups: [
          {
            name: 'Interval Overlaps & Concurrency',
            problems: [
              { name: 'Meeting Rooms', lcId: 252, intuition: 'Sort by start time; verify interval[i].end <= interval[i+1].start.' },
              { name: 'Meeting Rooms II', lcId: 253, intuition: 'Separate start and end times into sorted arrays; count active meetings.' },
            ],
          },
        ],
      },
      medium: {
        label: 'Core Patterns',
        groups: [
          {
            name: 'Active Event Multiset & Heights',
            problems: [
              { name: 'The Skyline Problem', lcId: 218, intuition: 'Sweep vertical line across building edges. Max-heap of heights emits keypoint on max change.' },
              { name: 'Interval List Intersections', lcId: 986, intuition: 'Two-pointer sweep: overlap is [max(start1, start2), min(end1, end2)]. Advance smaller end.' },
              { name: 'Car Pooling', lcId: 1094, intuition: 'Bucket difference array: increment at pickup, decrement at dropoff, verify capacity.' },
            ],
          },
        ],
      },
      hard: {
        label: 'Advanced',
        groups: [
          {
            name: '2D Area Union & Contour Checking',
            problems: [
              { name: 'Rectangle Area II', lcId: 850, intuition: 'Sweep line along X-axis with active Y-intervals merged via segment tree modulo 1e9+7.' },
              { name: 'Perfect Rectangle', lcId: 391, intuition: 'Verify sum of small rectangle areas equals bounding box area and corner point parity.' },
              { name: 'Number of Flowers in Full Bloom', lcId: 2251, intuition: 'Binary search on sorted start times minus binary search on sorted end times.' },
            ],
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 22. MONOTONIC QUEUE & DEQUE
  // ═══════════════════════════════════════════════════════════════════
  'monotonic-queue': {
    title: 'Monotonic Queue & Deque',
    desc: 'Extremum maintenance in sliding windows, double-ended pruning of dominated candidates, and DP acceleration to O(N).',
    tiers: {
      easy: {
        label: 'Foundation',
        groups: [
          {
            name: 'Queue Construction & FIFO Extent',
            problems: [
              { name: 'Implement Queue using Stacks', lcId: 232, intuition: 'Two stacks (in and out). Amortized O(1) push and pop.' },
              { name: 'Design Circular Queue', lcId: 622, intuition: 'Array with front and rear pointers updated via modulo capacity.' },
            ],
          },
        ],
      },
      medium: {
        label: 'Core Patterns',
        groups: [
          {
            name: 'Window Maxima & Limit Checks',
            problems: [
              { name: 'Sliding Window Maximum', lcId: 239, intuition: 'Monotonic decreasing deque storing indices. Remove elements outside window and pop smaller tail items.' },
              { name: 'Longest Continuous Subarray With Absolute Diff Less Than or Equal to Limit', lcId: 1438, intuition: 'Two deques (one min, one max). Slide left pointer when maxDeque.front - minDeque.front > limit.' },
              { name: 'Jump Game VI', lcId: 1696, intuition: 'DP state dp[i] = nums[i] + max(dp[i-k..i-1]) accelerated from O(Nk) to O(N) with max-deque.' },
            ],
          },
        ],
      },
      hard: {
        label: 'Advanced',
        groups: [
          {
            name: 'Shortest Bounds & Prefix Optimizations',
            problems: [
              { name: 'Shortest Subarray with Sum at Least K', lcId: 862, intuition: 'Monotonic deque of prefix sum indices: pop front when prefix[i] - prefix[front] >= k.' },
              { name: 'Constrained Subsequence Sum', lcId: 1425, intuition: 'DP with max-deque: dp[i] = nums[i] + max(0, deque.front). Evict front when index diff > k.' },
              { name: 'Max Value of Equation', lcId: 1499, intuition: 'Maximize (yi - xi) + (yj + xj). Max-deque storing (yj - xj) with xi - xj <= k.' },
            ],
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 23. MATH & NUMBER THEORY
  // ═══════════════════════════════════════════════════════════════════
  math: {
    title: 'Math & Number Theory',
    desc: 'Prime sieving (Eratosthenes), Euclidean GCD & Bezout identity, modular exponentiation, and combinatorial digit counting.',
    tiers: {
      easy: {
        label: 'Foundation',
        groups: [
          {
            name: 'Primes & Integer Digits',
            problems: [
              { name: 'Count Primes', lcId: 204, intuition: 'Sieve of Eratosthenes: mark multiples of primes up to sqrt(n) in O(N log log N).' },
              { name: 'Reverse Integer', lcId: 7, intuition: 'Pop digits via modulo 10; check 32-bit signed overflow bounds before multiplying by 10.' },
              { name: 'Palindrome Number', lcId: 9, intuition: 'Revert only the second half of the number to avoid 32-bit overflow.' },
            ],
          },
        ],
      },
      medium: {
        label: 'Core Patterns',
        groups: [
          {
            name: 'Modular Arithmetic & Matrix Rotation',
            problems: [
              { name: 'Super Pow', lcId: 372, intuition: 'a^[b1,b2,b3] = (a^[b1,b2])^10 * a^b3 mod 1337 via recursion.' },
              { name: 'Water and Jug Problem', lcId: 365, intuition: 'Bezout identity: target must be <= x + y and divisible by gcd(x, y).' },
              { name: 'Rotate Image', lcId: 48, intuition: 'Transpose matrix across main diagonal, then reverse each row.' },
            ],
          },
        ],
      },
      hard: {
        label: 'Advanced',
        groups: [
          {
            name: 'Digit Counting & Combinatorics',
            problems: [
              { name: 'Number of Digit One', lcId: 233, intuition: 'Count occurrences of digit 1 at each place value (units, tens, hundreds) via integer division.' },
              { name: 'Poor Pigs', lcId: 458, intuition: 'Information theory: (tests + 1)^pigs >= buckets.' },
              { name: 'Consecutive Numbers Sum', lcId: 829, intuition: 'Express N as k consecutive integers: (2N - k(k-1)) must be divisible by 2k.' },
            ],
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 24. COMPUTATIONAL GEOMETRY
  // ═══════════════════════════════════════════════════════════════════
  geometry: {
    title: 'Computational Geometry & Vectors',
    desc: 'Normalized slope rational hashing, 2D vector cross product orientation, Monotone Chain convex hull, and polygon ray casting.',
    tiers: {
      easy: {
        label: 'Foundation',
        groups: [
          {
            name: 'Coordinate Invariants & Projections',
            problems: [
              { name: 'Valid Square', lcId: 593, intuition: 'Compute all 6 pairwise distances: 4 equal sides and 2 equal diagonal lengths > 0.' },
              { name: 'Projection Area of 3D Shapes', lcId: 883, intuition: 'Top view: grid[i][j] > 0; Front view: max of columns; Side view: max of rows.' },
            ],
          },
        ],
      },
      medium: {
        label: 'Core Patterns',
        groups: [
          {
            name: 'Collinearity & Rectangle Points',
            problems: [
              { name: 'Max Points on a Line', lcId: 149, intuition: 'For each anchor point, compute dy/dx reduced by gcd(dy, dx) into hash map.' },
              { name: 'Minimum Area Rectangle', lcId: 939, intuition: 'Iterate diagonal pairs (x1, y1) and (x2, y2). Check if (x1, y2) and (x2, y1) exist in point set.' },
              { name: 'Mirror Reflection', lcId: 858, intuition: 'Ray reflection equivalence: p * m = q * n. Corner hit parity determined by m and n.' },
            ],
          },
        ],
      },
      hard: {
        label: 'Advanced',
        groups: [
          {
            name: 'Convex Hull & Intersections',
            problems: [
              { name: 'Erect the Fence', lcId: 587, intuition: 'Monotone Chain convex hull: sort points, build lower and upper hulls using cross-product orientation test.' },
              { name: 'Self Crossing', lcId: 335, intuition: 'Check geometric segment intersection across 4-step, 5-step, and 6-step loop patterns.' },
              { name: 'Minimum Area Rectangle II', lcId: 963, intuition: 'Hash rectangle diagonals by center midpoint (cx, cy) and length squared.' },
            ],
          },
        ],
      },
    },
  },
`;

const aliasInsert = `
ROADMAP_DATA['string'] = ROADMAP_DATA.strings;
ROADMAP_DATA['kmp'] = ROADMAP_DATA.strings;
ROADMAP_DATA['segment-tree'] = ROADMAP_DATA['fenwick-tree'];
ROADMAP_DATA['binary-indexed-tree'] = ROADMAP_DATA['fenwick-tree'];
ROADMAP_DATA['sweepline'] = ROADMAP_DATA['sweep-line'];
ROADMAP_DATA['queue'] = ROADMAP_DATA['monotonic-queue'];
ROADMAP_DATA['deque'] = ROADMAP_DATA['monotonic-queue'];
ROADMAP_DATA['number-theory'] = ROADMAP_DATA.math;
`;

const splitTarget = "\n};\n\n// ─── Aliases ──";
if (!content.includes(splitTarget)) {
  console.error("Could not find split target in roadmapData.js!");
  process.exit(1);
}

const parts = content.split(splitTarget);
const updated = parts[0] + newTopicsCode + "\n};\n\n// ─── Aliases ──" + parts[1] + aliasInsert;
fs.writeFileSync(filePath, updated, 'utf8');
console.log("Successfully appended 8 new topics and aliases to roadmapData.js!");
