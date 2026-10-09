import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProfileStore } from '../store/useProfileStore';
import { Sparkles, CheckCircle2, GitFork, BookOpen } from 'lucide-react';
import { ROADMAP_DATA } from '../data/roadmapData';
import { RoadmapTree } from '../components/RoadmapTree';
import { CuratedSheetsView } from '../components/CuratedSheetsView';
import { TopicSubtopicsView } from '../components/TopicSubtopicsView';

const TOPIC_CATALOG = {
  dp: {
    title: 'Dynamic Programming Intuition Ladder',
    desc: 'Core Invariant: Overlapping subproblems with optimal substructure. Move from 1D memoization array to rolling state variables.',
    elo: '1,850 Rating • 88% AC',
    progress: '1 / 4 Mastered',
    steps: [
      {
        level: 'Level 1: Foundation',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Climbing Stairs',
        diff: 'Easy',
        diffClass: 'bg-white/10 text-white border border-white/20',
        lc: 'LC #70',
        intuition: '1D memoization. Recognize Fibonacci recurrence f(n) = f(n-1) + f(n-2) and eliminate recursion call stack.',
        status: 'Intuition Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 2: State Min',
        badgeColor: 'text-[#FF7A00]',
        dotColor: 'bg-[#FF7A00]',
        borderClass: 'border-[#FF7A00]/50',
        name: 'Min Cost Stairs',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #746',
        intuition: 'Cost minimization transition. Track running minimum between two prior state decisions with O(1) memory.',
        status: 'Ready to Solve',
        statusColor: 'text-[#FF7A00] font-bold',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 3: Non-Adjacent',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D]',
        name: 'House Robber',
        diff: 'Medium',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #198',
        intuition: 'Mutual exclusion constraint. State decision max(rob[i-1], rob[i-2] + nums[i]) with two tracking registers.',
        status: 'Unlocks on Step 2',
        statusColor: 'text-[#8B949E]',
        actionText: 'View Prereq ->',
      },
      {
        level: 'Level 4: Circular State',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D] opacity-60',
        name: 'House Robber II',
        diff: 'Hard',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #213',
        intuition: 'Circular boundary array. Decompose wrap-around constraint into two linear passes [0, n-2] and [1, n-1].',
        status: 'Prerequisite Required',
        statusColor: 'text-[#8B949E]',
        actionText: 'Locked Barrier',
      },
    ],
  },
  monostack: {
    title: 'Monotonic Stack Intuition Ladder [Deficit Topic]',
    desc: 'Core Invariant: Strictly decreasing/increasing stack elements. Popping an element identifies its nearest geometric boundary.',
    elo: '1,540 Rating • 28% AC (-302 Deficit)',
    progress: '1 / 4 Mastered',
    isDeficit: true,
    steps: [
      {
        level: 'Level 1: Foundation',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Daily Temperatures',
        diff: 'Medium',
        diffClass: 'bg-white/10 text-white border border-white/20',
        lc: 'LC #739',
        intuition: 'Monotonic decreasing stack of day indices. First warmer day pops colder indices to record span distance.',
        status: 'Intuition Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 2: Circular Extent',
        badgeColor: 'text-[#FF7A00]',
        dotColor: 'bg-[#FF7A00]',
        borderClass: 'border-[#FF7A00]/50',
        name: 'Next Greater Element II',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #503',
        intuition: 'Modulo 2n simulated traversal. Loop twice through array to resolve circular wrap-around monotonic lookups.',
        status: 'Ready to Solve',
        statusColor: 'text-[#FF7A00] font-bold',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 3: Triplet Peaks',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D]',
        name: '132 Pattern',
        diff: 'Medium',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #456',
        intuition: 'Reverse traversal with monotonic stack holding candidate "2" while tracking maximum "3" popped.',
        status: 'Unlocks on Step 2',
        statusColor: 'text-[#8B949E]',
        actionText: 'View Prereq ->',
      },
      {
        level: 'Level 4: Geometric Extents',
        badgeColor: 'text-[#FF7A00]',
        dotColor: 'bg-[#FF7A00]',
        borderClass: 'border-[#FF7A00] shadow-lg shadow-[#FF7A00]/10',
        name: 'Largest Rectangle in Histogram',
        diff: 'Hard',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30 font-bold',
        lc: 'LC #84',
        intuition: 'Weak spot problem. Stack of height indices where pops calculate max width between left/right bounds.',
        status: 'Flagged Weak Spot',
        statusColor: 'text-[#FF7A00] font-bold',
        actionText: 'Practice Now ->',
        isWeakSpot: true,
      },
    ],
  },
  graphs: {
    title: 'Graphs & Trees Intuition Ladder',
    desc: 'Core Invariant: State exploration via Breadth-First search levels or Depth-First tree subtrees with cycle prevention.',
    elo: '1,820 Rating • 79% AC',
    progress: '2 / 4 Mastered',
    steps: [
      {
        level: 'Level 1: Grid Connectivity',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Number of Islands',
        diff: 'Medium',
        diffClass: 'bg-white/10 text-white border border-white/20',
        lc: 'LC #200',
        intuition: 'Grid boundary DFS/BFS. Mutate visited land cells in-place to count connected components without extra memory.',
        status: 'Intuition Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 2: Graph Duplication',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Clone Graph',
        diff: 'Medium',
        diffClass: 'bg-white/10 text-white border border-white/20',
        lc: 'LC #133',
        intuition: 'Hash map lookup cache. Store original-to-clone node mappings to terminate cycles in undirected graphs.',
        status: 'Intuition Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 3: Dependency Sort',
        badgeColor: 'text-[#FF7A00]',
        dotColor: 'bg-[#FF7A00]',
        borderClass: 'border-[#FF7A00]/50',
        name: 'Course Schedule II',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #210',
        intuition: 'Kahn algorithm. In-degree array + queue. Push 0-indegree nodes to produce valid topological sequence.',
        status: 'Ready to Solve',
        statusColor: 'text-[#FF7A00] font-bold',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 4: Shortest Word Path',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D] opacity-60',
        name: 'Word Ladder',
        diff: 'Hard',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #127',
        intuition: 'Bidirectional BFS. Alternate expanding search from beginWord and endWord across intermediate wildcards.',
        status: 'Prerequisite Required',
        statusColor: 'text-[#8B949E]',
        actionText: 'Locked Barrier',
      },
    ],
  },
  window: {
    title: 'Sliding Window & Two Pointers Intuition Ladder',
    desc: 'Core Invariant: Monotonic expansion and contraction of subarray bounds [L, R] to achieve O(N) linear execution.',
    elo: '1,910 Rating • 94% AC (Peak Mastery)',
    progress: '3 / 4 Mastered',
    steps: [
      {
        level: 'Level 1: Fixed Span',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Max Average Subarray I',
        diff: 'Easy',
        diffClass: 'bg-white/10 text-white border border-white/20',
        lc: 'LC #643',
        intuition: 'Constant span K. Add nums[R] and subtract nums[L] to maintain running sum in O(1) per step.',
        status: 'Intuition Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 2: Unique Element Window',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Longest Substring No Repeat',
        diff: 'Medium',
        diffClass: 'bg-white/10 text-white border border-white/20',
        lc: 'LC #3',
        intuition: 'Dynamic window. Hash map records last seen char indices; jump left pointer forward on collision.',
        status: 'Intuition Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 3: Frequency Balance',
        badgeColor: 'text-[#FF7A00]',
        dotColor: 'bg-[#FF7A00]',
        borderClass: 'border-[#FF7A00]/50',
        name: 'Minimum Window Substring',
        diff: 'Hard',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #76',
        intuition: 'Character frequency balance. Expand R until all required chars matched, then contract L to find minimum valid.',
        status: 'Ready to Solve',
        statusColor: 'text-[#FF7A00] font-bold',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 4: Extremum Tracking',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D] opacity-60',
        name: 'Sliding Window Maximum',
        diff: 'Hard',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #239',
        intuition: 'Monotonic deque. Evict out-of-bound indices from front and smaller elements from back in O(1) amortized.',
        status: 'Prerequisite Required',
        statusColor: 'text-[#8B949E]',
        actionText: 'Locked Barrier',
      },
    ],
  },
  binsearch: {
    title: 'Binary Search Intuition Ladder',
    desc: 'Core Invariant: Monotonicity of search space or boolean feasibility predicate f(x). Halve candidate space each iteration.',
    elo: '1,880 Rating • 88% AC',
    progress: '2 / 4 Mastered',
    steps: [
      {
        level: 'Level 1: Classical Monotonic',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Binary Search',
        diff: 'Easy',
        diffClass: 'bg-white/10 text-white border border-white/20',
        lc: 'LC #704',
        intuition: 'Classic halving. Invariant mid = L + (R - L) / 2 to prevent overflow; bounds [L, mid-1] or [mid+1, R].',
        status: 'Intuition Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 2: Segment Inflection',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Search Rotated Sorted Array',
        diff: 'Medium',
        diffClass: 'bg-white/10 text-white border border-white/20',
        lc: 'LC #33',
        intuition: 'Inflection check. At least one half [L, mid] or [mid, R] is strictly sorted; test target range boundaries.',
        status: 'Intuition Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 3: Gradient Slope',
        badgeColor: 'text-[#FF7A00]',
        dotColor: 'bg-[#FF7A00]',
        borderClass: 'border-[#FF7A00]/50',
        name: 'Find Peak Element',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #162',
        intuition: 'Slope analysis. If nums[mid] < nums[mid+1], peak is guaranteed in right half; otherwise in left.',
        status: 'Ready to Solve',
        statusColor: 'text-[#FF7A00] font-bold',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 4: Search on Answer',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D] opacity-60',
        name: 'Koko Eating Bananas',
        diff: 'Medium',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #875',
        intuition: 'Monotonic feasibility predicate canFinish(speed). Binary search speed range [1, max(piles)] in O(N log M).',
        status: 'Prerequisite Required',
        statusColor: 'text-[#8B949E]',
        actionText: 'Locked Barrier',
      },
    ],
  },
  heaps: {
    title: 'Heaps & Hash Tables Intuition Ladder',
    desc: 'Core Invariant: Priority queues for dynamic extremum extraction and hash tables for O(1) amortized relational lookups.',
    elo: '1,810 Rating • 82% AC',
    progress: '2 / 4 Mastered',
    steps: [
      {
        level: 'Level 1: Top K Selection',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Kth Largest in an Array',
        diff: 'Medium',
        diffClass: 'bg-white/10 text-white border border-white/20',
        lc: 'LC #215',
        intuition: 'Min-heap of capacity K. Elements smaller than heap top are dropped; heap root is Kth largest in O(N log K).',
        status: 'Intuition Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 2: Frequency Buckets',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Top K Frequent Elements',
        diff: 'Medium',
        diffClass: 'bg-white/10 text-white border border-white/20',
        lc: 'LC #347',
        intuition: 'Frequency count hash map followed by min-heap of size K or O(N) reverse bucket index distribution.',
        status: 'Intuition Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 3: Multi-Way Merge',
        badgeColor: 'text-[#FF7A00]',
        dotColor: 'bg-[#FF7A00]',
        borderClass: 'border-[#FF7A00]/50',
        name: 'Merge k Sorted Lists',
        diff: 'Hard',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #23',
        intuition: 'Min-heap holding current head of all K lists. Constant O(log K) extraction yields sorted combined list.',
        status: 'Ready to Solve',
        statusColor: 'text-[#FF7A00] font-bold',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 4: Running Median',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D] opacity-60',
        name: 'Find Median from Data Stream',
        diff: 'Hard',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #295',
        intuition: 'Dual balancing heaps. Max-heap for lower half and min-heap for upper half, keeping sizes equalized within 1.',
        status: 'Prerequisite Required',
        statusColor: 'text-[#8B949E]',
        actionText: 'Locked Barrier',
      },
    ],
  },
  'two-pointers': {
    title: 'Two Pointers Convergence Ladder',
    desc: 'Core Invariant: Converging or parallel index pointers to search or contract sorted spaces in linear time O(N).',
    elo: '1,820 Rating • 85% AC',
    progress: '2 / 4 Mastered',
    steps: [
      {
        level: 'Level 1: Opposite Ends',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Valid Palindrome',
        diff: 'Easy',
        diffClass: 'bg-white/10 text-white border border-white/20',
        lc: 'LC #125',
        intuition: 'Left/right inward convergence while skipping non-alphanumeric characters with O(1) auxiliary space.',
        status: 'Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 2: Sorted Invariant',
        badgeColor: 'text-[#FF7A00]',
        dotColor: 'bg-[#FF7A00]',
        borderClass: 'border-[#FF7A00]/50',
        name: 'Two Sum II - Input Array Is Sorted',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #167',
        intuition: 'Sorted monotonic sum property. sum < target advances left pointer; sum > target retreats right.',
        status: 'Ready to Solve',
        statusColor: 'text-[#FF7A00] font-bold',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 3: Triplet Reduction',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D]',
        name: '3Sum',
        diff: 'Medium',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #15',
        intuition: 'Fix one element and run two-pointer convergence on sorted remainder, skipping duplicates.',
        status: 'Ready to Solve',
        statusColor: 'text-[#8B949E]',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 4: Geometric Maxima',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D] opacity-60',
        name: 'Container With Most Water',
        diff: 'Medium',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #11',
        intuition: 'Always move the shorter line inward because the width is strictly shrinking and only a taller line can compensate.',
        status: 'Prerequisite Required',
        statusColor: 'text-[#8B949E]',
        actionText: 'Solve Problem ->',
      },
    ],
  },
  'sliding-window': {
    title: 'Sliding Window Invariant Ladder',
    desc: 'Core Invariant: Dynamic expansion and contraction of subarray bounds [L, R] to achieve linear-time range queries.',
    elo: '1,890 Rating • 81% AC',
    progress: '1 / 4 Mastered',
    steps: [
      {
        level: 'Level 1: Fixed Window',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Maximum Average Subarray I',
        diff: 'Easy',
        diffClass: 'bg-white/10 text-white border border-white/20',
        lc: 'LC #643',
        intuition: 'Fixed window size K. Add incoming element nums[R] and subtract outgoing element nums[L] in O(1).',
        status: 'Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 2: Variable Window',
        badgeColor: 'text-[#FF7A00]',
        dotColor: 'bg-[#FF7A00]',
        borderClass: 'border-[#FF7A00]/50',
        name: 'Longest Substring Without Repeating Characters',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #3',
        intuition: 'Expand R to include characters; contract L past the previous occurrence index when duplicate is detected.',
        status: 'Ready to Solve',
        statusColor: 'text-[#FF7A00] font-bold',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 3: Constraint Window',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D]',
        name: 'Minimum Size Subarray Sum',
        diff: 'Medium',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #209',
        intuition: 'Expand R until sum >= target, then greedily shrink L to record minimum valid window length.',
        status: 'Ready to Solve',
        statusColor: 'text-[#8B949E]',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 4: Monotonic Window',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D] opacity-60',
        name: 'Sliding Window Maximum',
        diff: 'Hard',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #239',
        intuition: 'Maintain monotonic decreasing deque of indices so front always holds current window maximum.',
        status: 'Prerequisite Required',
        statusColor: 'text-[#8B949E]',
        actionText: 'Locked Barrier',
      },
    ],
  },
  'prefix-sum': {
    title: 'Prefix Sum & Cumulative Query Ladder',
    desc: 'Core Invariant: Precompute running cumulative totals to convert arbitrary range sum queries into O(1) lookups.',
    elo: '1,840 Rating • 83% AC',
    progress: '2 / 4 Mastered',
    steps: [
      {
        level: 'Level 1: 1D Accumulation',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Running Sum of 1d Array',
        diff: 'Easy',
        diffClass: 'bg-white/10 text-white border border-white/20',
        lc: 'LC #1480',
        intuition: 'In-place accumulation prefix[i] = prefix[i-1] + nums[i] in single linear pass.',
        status: 'Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 2: Hash Map Inversion',
        badgeColor: 'text-[#FF7A00]',
        dotColor: 'bg-[#FF7A00]',
        borderClass: 'border-[#FF7A00]/50',
        name: 'Subarray Sum Equals K',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #560',
        intuition: 'Store prefix sum frequencies in hash map. If prefix - k was seen before, a valid subarray ends here.',
        status: 'Ready to Solve',
        statusColor: 'text-[#FF7A00] font-bold',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 3: Modulo Invariant',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D]',
        name: 'Continuous Subarray Sum',
        diff: 'Medium',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #523',
        intuition: 'If running sum % k repeats at two distinct indices with distance >= 2, the intermediate subarray is a multiple of k.',
        status: 'Ready to Solve',
        statusColor: 'text-[#8B949E]',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 4: 2D Matrix Sum',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D] opacity-60',
        name: 'Range Sum Query 2D - Immutable',
        diff: 'Medium',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #304',
        intuition: '2D inclusion-exclusion principle: sum = T[r2][c2] - T[r1-1][c2] - T[r2][c1-1] + T[r1-1][c1-1].',
        status: 'Ready to Solve',
        statusColor: 'text-[#8B949E]',
        actionText: 'Solve Problem ->',
      },
    ],
  },
  'linked-list': {
    title: 'Linked List Pointer Manipulation Ladder',
    desc: 'Core Invariant: Safe node relinking, pointer chasing, dummy head sentinel nodes, and cycle detection.',
    elo: '1,810 Rating • 86% AC',
    progress: '1 / 4 Mastered',
    steps: [
      {
        level: 'Level 1: Iterative Reversal',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Reverse Linked List',
        diff: 'Easy',
        diffClass: 'bg-white/10 text-white border border-white/20',
        lc: 'LC #206',
        intuition: 'Three pointer sliding frame (prev, curr, nextNode). Reverse curr.next to prev without losing reference to rest of list.',
        status: 'Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 2: Fast & Slow Pointers',
        badgeColor: 'text-[#FF7A00]',
        dotColor: 'bg-[#FF7A00]',
        borderClass: 'border-[#FF7A00]/50',
        name: 'Linked List Cycle II',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #142',
        intuition: 'Floyds cycle detection. Fast travels 2x speed of slow. After meeting, reset slow to head; advancing both by 1 meets at cycle entrance.',
        status: 'Ready to Solve',
        statusColor: 'text-[#FF7A00] font-bold',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 3: Interleaving',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D]',
        name: 'Reorder List',
        diff: 'Medium',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #143',
        intuition: 'Find midpoint, reverse second half in-place, and interleave nodes from first and second halves.',
        status: 'Ready to Solve',
        statusColor: 'text-[#8B949E]',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 4: K-Way Merge',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D] opacity-60',
        name: 'Merge k Sorted Lists',
        diff: 'Hard',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #23',
        intuition: 'Min-heap of k node heads or divide-and-conquer pairwise merge in O(N log k) total time.',
        status: 'Prerequisite Required',
        statusColor: 'text-[#8B949E]',
        actionText: 'Locked Barrier',
      },
    ],
  },
  trees: {
    title: 'Binary Tree & BST Invariant Ladder',
    desc: 'Core Invariant: Recursive structural divide-and-conquer, parent-child state propagation, and BST ordering.',
    elo: '1,830 Rating • 87% AC',
    progress: '2 / 4 Mastered',
    steps: [
      {
        level: 'Level 1: Subtree Recursion',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Maximum Depth of Binary Tree',
        diff: 'Easy',
        diffClass: 'bg-white/10 text-white border border-white/20',
        lc: 'LC #104',
        intuition: 'Post-order DFS: depth = 1 + max(left, right). Subproblem reduction on null base cases.',
        status: 'Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 2: Breadth Level Order',
        badgeColor: 'text-[#FF7A00]',
        dotColor: 'bg-[#FF7A00]',
        borderClass: 'border-[#FF7A00]/50',
        name: 'Binary Tree Level Order Traversal',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #102',
        intuition: 'Queue-based BFS level processing: batch iterate elements matching current queue size.',
        status: 'Ready to Solve',
        statusColor: 'text-[#FF7A00] font-bold',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 3: Lowest Common Ancestor',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D]',
        name: 'Lowest Common Ancestor of a Binary Tree',
        diff: 'Medium',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #236',
        intuition: 'Bottom-up post-order check: if both left and right return non-null matches, current node is LCA.',
        status: 'Ready to Solve',
        statusColor: 'text-[#8B949E]',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 4: Tree Max Path',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D] opacity-60',
        name: 'Binary Tree Maximum Path Sum',
        diff: 'Hard',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #124',
        intuition: 'Track global max split path node.val + max(0, left) + max(0, right); return unbranched branch max.',
        status: 'Prerequisite Required',
        statusColor: 'text-[#8B949E]',
        actionText: 'Locked Barrier',
      },
    ],
  },
  backtracking: {
    title: 'Backtracking & Search Space Ladder',
    desc: 'Core Invariant: DFS candidate exploration with in-place state mutation, condition validation, and branch rollback.',
    elo: '1,860 Rating • 79% AC',
    progress: '1 / 4 Mastered',
    steps: [
      {
        level: 'Level 1: Subset Decision',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Subsets',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #78',
        intuition: 'Binary choice at each index (include / exclude) or looping start index with pop rollback.',
        status: 'Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 2: Combination Target',
        badgeColor: 'text-[#FF7A00]',
        dotColor: 'bg-[#FF7A00]',
        borderClass: 'border-[#FF7A00]/50',
        name: 'Combination Sum',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #39',
        intuition: 'Unlimited choice reuse: branch on current candidate until target decrement falls below zero.',
        status: 'Ready to Solve',
        statusColor: 'text-[#FF7A00] font-bold',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 3: Grid Word Traversal',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D]',
        name: 'Word Search',
        diff: 'Medium',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #79',
        intuition: 'In-place character substitution with # to prevent revisiting, restored upon backtracking.',
        status: 'Ready to Solve',
        statusColor: 'text-[#8B949E]',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 4: Constraint Satisfaction',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D] opacity-60',
        name: 'N-Queens',
        diff: 'Hard',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #51',
        intuition: 'Row-by-row placement with O(1) conflict validation using sets for column, main diagonal (r-c), and anti-diagonal (r+c).',
        status: 'Prerequisite Required',
        statusColor: 'text-[#8B949E]',
        actionText: 'Locked Barrier',
      },
    ],
  },
  trie: {
    title: 'Trie Prefix Invariant Ladder',
    desc: 'Core Invariant: Character-edge multi-branch prefix tree to accelerate dictionary queries and bitwise prefix matching.',
    elo: '1,840 Rating • 83% AC',
    progress: '1 / 4 Mastered',
    steps: [
      {
        level: 'Level 1: Prefix Architecture',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Implement Trie (Prefix Tree)',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #208',
        intuition: 'Node array children[26] and isEnd flag for O(L) insertion and prefix verification.',
        status: 'Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 2: Wildcard Matching',
        badgeColor: 'text-[#FF7A00]',
        dotColor: 'bg-[#FF7A00]',
        borderClass: 'border-[#FF7A00]/50',
        name: 'Design Add and Search Words',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #211',
        intuition: 'DFS fallback on wildcard . branch across all 26 non-null children nodes.',
        status: 'Ready to Solve',
        statusColor: 'text-[#FF7A00] font-bold',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 3: Bitwise Trie XOR',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D]',
        name: 'Maximum XOR of Two Numbers',
        diff: 'Medium',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #421',
        intuition: 'Binary Trie (0/1). For each bit from MSB to LSB, greedily navigate opposite bit branch if present.',
        status: 'Ready to Solve',
        statusColor: 'text-[#8B949E]',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 4: Grid Trie Pruning',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D] opacity-60',
        name: 'Word Search II',
        diff: 'Hard',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #212',
        intuition: 'Store dictionary in Trie. Prune Trie leaf nodes during grid backtracking to prevent redundant visits.',
        status: 'Prerequisite Required',
        statusColor: 'text-[#8B949E]',
        actionText: 'Locked Barrier',
      },
    ],
  },
  'bit-manipulation': {
    title: 'Bit Manipulation Invariant Ladder',
    desc: 'Core Invariant: Low-level bitwise operations, XOR cancellation, binary arithmetic, and compact state representation.',
    elo: '1,800 Rating • 89% AC',
    progress: '2 / 4 Mastered',
    steps: [
      {
        level: 'Level 1: XOR Cancellation',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Single Number',
        diff: 'Easy',
        diffClass: 'bg-white/10 text-white border border-white/20',
        lc: 'LC #136',
        intuition: 'XOR self-inversion x ^ x = 0 leaves the lone unique element with O(1) space.',
        status: 'Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 2: Bit Clearing',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Number of 1 Bits',
        diff: 'Easy',
        diffClass: 'bg-white/10 text-white border border-white/20',
        lc: 'LC #191',
        intuition: 'Brian Kernighan: n &= (n - 1) drops lowest set bit in exactly set-bit iterations.',
        status: 'Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 3: Two Unique Numbers',
        badgeColor: 'text-[#FF7A00]',
        dotColor: 'bg-[#FF7A00]',
        borderClass: 'border-[#FF7A00]/50',
        name: 'Single Number III',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #260',
        intuition: 'Find lowest set bit of (a ^ b) via (diff & -diff) to partition the numbers into two isolated XOR groups.',
        status: 'Ready to Solve',
        statusColor: 'text-[#FF7A00] font-bold',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 4: Bitmask Graph Search',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D] opacity-60',
        name: 'Shortest Path Visiting All Nodes',
        diff: 'Hard',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #847',
        intuition: 'BFS queue state (node, visited_bitmask) to find shortest path reaching mask (1<<n)-1.',
        status: 'Prerequisite Required',
        statusColor: 'text-[#8B949E]',
        actionText: 'Locked Barrier',
      },
    ],
  },
  'union-find': {
    title: 'Disjoint Set Union (DSU) Invariant Ladder',
    desc: 'Core Invariant: Dynamic graph connectivity, equivalence relations, cycle detection, and nearly O(1) amortized operations.',
    elo: '1,850 Rating • 84% AC',
    progress: '1 / 4 Mastered',
    steps: [
      {
        level: 'Level 1: Component Counts',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Number of Provinces',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #547',
        intuition: 'Union connected cities. Total provinces equals count of unique root parents find(x) == x.',
        status: 'Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 2: Cycle Detection',
        badgeColor: 'text-[#FF7A00]',
        dotColor: 'bg-[#FF7A00]',
        borderClass: 'border-[#FF7A00]/50',
        name: 'Redundant Connection',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #684',
        intuition: 'If find(u) == find(v) prior to union, edge (u, v) introduces a cycle in the tree and is redundant.',
        status: 'Ready to Solve',
        statusColor: 'text-[#FF7A00] font-bold',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 3: Entity Merging',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D]',
        name: 'Accounts Merge',
        diff: 'Medium',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #721',
        intuition: 'Map each email to account index, union connected emails, and group under consolidated parent.',
        status: 'Ready to Solve',
        statusColor: 'text-[#8B949E]',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 4: Dynamic Grid Connectivity',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D] opacity-60',
        name: 'Swim in Rising Water',
        diff: 'Hard',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #778',
        intuition: 'Sort cells by elevation, greedily union adjacent open cells until origin and destination connect.',
        status: 'Prerequisite Required',
        statusColor: 'text-[#8B949E]',
        actionText: 'Locked Barrier',
      },
    ],
  },
  greedy: {
    title: 'Greedy & Intervals Invariant Ladder',
    desc: 'Core Invariant: Locally optimal choices yielding global optimum, interval overlap consolidation, and deadline scheduling.',
    elo: '1,820 Rating • 86% AC',
    progress: '2 / 4 Mastered',
    steps: [
      {
        level: 'Level 1: Interval Merging',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Merge Intervals',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #56',
        intuition: 'Sort intervals by start time. Extend previous interval end if current.start <= prev.end.',
        status: 'Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 2: Non-Overlapping Scheduling',
        badgeColor: 'text-[#FF7A00]',
        dotColor: 'bg-[#FF7A00]',
        borderClass: 'border-[#FF7A00]/50',
        name: 'Non-overlapping Intervals',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #435',
        intuition: 'Sort by end time. Greedily preserve interval with earliest termination to maximize available time.',
        status: 'Ready to Solve',
        statusColor: 'text-[#FF7A00] font-bold',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 3: Reachability Bounds',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Jump Game',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #55',
        intuition: 'Track running maximum reachable index max(maxReach, i + nums[i]); fail if index exceeds reach.',
        status: 'Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 4: Bidirectional Slope Greedy',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D] opacity-60',
        name: 'Candy',
        diff: 'Hard',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #135',
        intuition: 'Two-pass scan: left-to-right satisfies left neighbor; right-to-left takes max to satisfy right neighbor.',
        status: 'Prerequisite Required',
        statusColor: 'text-[#8B949E]',
        actionText: 'Locked Barrier',
      },
    ],
  },
  design: {
    title: 'Data Structure Design Invariant Ladder',
    desc: 'Core Invariant: Composite data structure architectures ensuring strict worst-case or amortized O(1) time complexity.',
    elo: '1,870 Rating • 80% AC',
    progress: '1 / 4 Mastered',
    steps: [
      {
        level: 'Level 1: Auxiliary Extremum',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Min Stack',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #155',
        intuition: 'Pair each value with current minimum or maintain shadow min-stack in O(1) lookup.',
        status: 'Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 2: Hash + Doubly Linked List',
        badgeColor: 'text-[#FF7A00]',
        dotColor: 'bg-[#FF7A00]',
        borderClass: 'border-[#FF7A00]/50',
        name: 'LRU Cache',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #146',
        intuition: 'Hash map for O(1) node lookup + DLL with dummy head/tail for O(1) reordering and eviction.',
        status: 'Ready to Solve',
        statusColor: 'text-[#FF7A00] font-bold',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 3: Temporal Key-Value',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D]',
        name: 'Time Based Key-Value Store',
        diff: 'Medium',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #981',
        intuition: 'Hash map of key to timestamp-value vector; binary search rightmost timestamp <= target.',
        status: 'Ready to Solve',
        statusColor: 'text-[#8B949E]',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 4: Frequency Bucket Bucketing',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D] opacity-60',
        name: 'LFU Cache',
        diff: 'Hard',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #460',
        intuition: 'Map key to node and map frequency to DLL; track global minFrequency to achieve strict O(1) eviction.',
        status: 'Prerequisite Required',
        statusColor: 'text-[#8B949E]',
        actionText: 'Locked Barrier',
      },
    ],
  },
  'two-pointers': {
    title: 'Two Pointers & Binary Invariants Ladder',
    desc: 'Core Invariant: Converging or parallel index bounds exploiting sorted arrays or monotonic properties.',
    elo: '1,720 Rating • 91% AC',
    progress: '2 / 4 Mastered',
    steps: [
      {
        level: 'Level 1: Opposing Convergence',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Valid Palindrome',
        diff: 'Easy',
        diffClass: 'bg-white/10 text-white border border-white/20',
        lc: 'LC #125',
        intuition: 'Symmetric inward movement. Filter alphanumeric characters and verify equality while left < right.',
        status: 'Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 2: Sorted Sum Bounds',
        badgeColor: 'text-[#FF7A00]',
        dotColor: 'bg-[#FF7A00]',
        borderClass: 'border-[#FF7A00]/50',
        name: 'Two Sum II - Input Array Is Sorted',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #167',
        intuition: 'Monotonic sum invariant: sum < target increment left; sum > target decrement right.',
        status: 'Ready to Solve',
        statusColor: 'text-[#FF7A00] font-bold',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 3: Fixed Anchor + Pointers',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D]',
        name: '3Sum',
        diff: 'Medium',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #15',
        intuition: 'Sort array, fix first element i, run two-pointer convergence on remaining subarray with duplicate skipping.',
        status: 'Ready to Solve',
        statusColor: 'text-[#8B949E]',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 4: Dynamic Capacity Envelope',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D] opacity-60',
        name: 'Trapping Rain Water',
        diff: 'Hard',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #42',
        intuition: 'Dual tracking of leftMax and rightMax; the smaller height bottleneck strictly dictates trapped volume.',
        status: 'Prerequisite Required',
        statusColor: 'text-[#8B949E]',
        actionText: 'Locked Barrier',
      },
    ],
  },
  'prefix-sum': {
    title: 'Prefix Sum & Difference Array Ladder',
    desc: 'Core Invariant: Precomputed cumulative sums enabling O(1) range sum queries and O(1) interval updates.',
    elo: '1,680 Rating • 89% AC',
    progress: '2 / 4 Mastered',
    steps: [
      {
        level: 'Level 1: Cumulative Offset',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Running Sum of 1d Array',
        diff: 'Easy',
        diffClass: 'bg-white/10 text-white border border-white/20',
        lc: 'LC #1480',
        intuition: 'In-place cumulative accumulation nums[i] += nums[i-1].',
        status: 'Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 2: Target Delta Hash Map',
        badgeColor: 'text-[#FF7A00]',
        dotColor: 'bg-[#FF7A00]',
        borderClass: 'border-[#FF7A00]/50',
        name: 'Subarray Sum Equals K',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #560',
        intuition: 'Prefix sum hash map: count occurrences of (currSum - k) seen prior to index i.',
        status: 'Ready to Solve',
        statusColor: 'text-[#FF7A00] font-bold',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 3: Modular Congruence',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D]',
        name: 'Continuous Subarray Sum',
        diff: 'Medium',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #523',
        intuition: 'Prefix sum modulo k: identical remainder at indices i and j implies subarray sum between them is multiple of k.',
        status: 'Ready to Solve',
        statusColor: 'text-[#8B949E]',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 4: 2D Integral Matrix',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D] opacity-60',
        name: 'Range Sum Query 2D - Immutable',
        diff: 'Medium',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #304',
        intuition: 'Inclusion-exclusion principle: dp[r2][c2] - dp[r1-1][c2] - dp[r2][c1-1] + dp[r1-1][c1-1].',
        status: 'Ready to Solve',
        statusColor: 'text-[#8B949E]',
        actionText: 'Solve Problem ->',
      },
    ],
  },
  'linked-list': {
    title: 'Linked List Structural Pointer Ladder',
    desc: 'Core Invariant: Sequential memory traversal, slow-fast cycle detection, dummy head nodes, and pointer manipulation.',
    elo: '1,650 Rating • 92% AC',
    progress: '2 / 4 Mastered',
    steps: [
      {
        level: 'Level 1: Directional Inversion',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Reverse Linked List',
        diff: 'Easy',
        diffClass: 'bg-white/10 text-white border border-white/20',
        lc: 'LC #206',
        intuition: 'Iterative 3-pointer rewind (prev, curr, nextTemp) in-place without memory allocation.',
        status: 'Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 2: Fast & Slow Cycle',
        badgeColor: 'text-[#FF7A00]',
        dotColor: 'bg-[#FF7A00]',
        borderClass: 'border-[#FF7A00]/50',
        name: 'Linked List Cycle II',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #142',
        intuition: 'Floyd cycle finding: 2x speed meeting point; resetting one pointer to head lands both at cycle entry.',
        status: 'Ready to Solve',
        statusColor: 'text-[#FF7A00] font-bold',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 3: Interleaving Midpoint',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D]',
        name: 'Reorder List',
        diff: 'Medium',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #143',
        intuition: 'Find midpoint via slow-fast, reverse second half in-place, and interleave nodes alternately.',
        status: 'Ready to Solve',
        statusColor: 'text-[#8B949E]',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 4: K-Way Heap Reduction',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D] opacity-60',
        name: 'Merge k Sorted Lists',
        diff: 'Hard',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #23',
        intuition: 'Min-heap of k node heads or divide-and-conquer pairwise merge in O(N log k) total time.',
        status: 'Prerequisite Required',
        statusColor: 'text-[#8B949E]',
        actionText: 'Locked Barrier',
      },
    ],
  },
  'bit-manipulation': {
    title: 'Bit Manipulation Invariant Ladder',
    desc: 'Core Invariant: Low-level bitwise masking, XOR cancellation (x ^ x = 0), and 2s-complement lowbit extraction.',
    elo: '1,810 Rating • 84% AC',
    progress: '2 / 4 Mastered',
    steps: [
      {
        level: 'Level 1: XOR Parity Cancellation',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Single Number',
        diff: 'Easy',
        diffClass: 'bg-white/10 text-white border border-white/20',
        lc: 'LC #136',
        intuition: 'XOR all elements: duplicate pairs cancel to zero, leaving the unique element in O(1) space.',
        status: 'Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 2: Lowest Set Bit Clearing',
        badgeColor: 'text-[#FF7A00]',
        dotColor: 'bg-[#FF7A00]',
        borderClass: 'border-[#FF7A00]/50',
        name: 'Number of 1 Bits',
        diff: 'Easy',
        diffClass: 'bg-white/10 text-white border border-white/20',
        lc: 'LC #191',
        intuition: 'Brian Kernighan algorithm: n = n & (n - 1) clears lowest set bit in iterations equal to set bit count.',
        status: 'Ready to Solve',
        statusColor: 'text-[#FF7A00] font-bold',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 3: Bitmask Subset Traversal',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D]',
        name: 'Counting Bits',
        diff: 'Easy',
        diffClass: 'bg-white/10 text-white border border-white/20',
        lc: 'LC #338',
        intuition: 'DP state transition: ans[i] = ans[i >> 1] + (i & 1) in linear O(N) time.',
        status: 'Ready to Solve',
        statusColor: 'text-[#8B949E]',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 4: Bitmask State DP',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D] opacity-60',
        name: 'Subsets',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #78',
        intuition: 'Loop integer mask from 0 to 2^n - 1; test (mask & (1 << j)) to construct all power set subsets.',
        status: 'Ready to Solve',
        statusColor: 'text-[#8B949E]',
        actionText: 'Solve Problem ->',
      },
    ],
  },
  'union-find': {
    title: 'Disjoint Set Union (DSU) Invariant Ladder',
    desc: 'Core Invariant: Near O(1) amortized connected components via path compression and rank union heuristics.',
    elo: '1,890 Rating • 82% AC',
    progress: '1 / 4 Mastered',
    steps: [
      {
        level: 'Level 1: Redundant Edge Cycle',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Redundant Connection',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #684',
        intuition: 'DSU find cycle: if find(u) == find(v), adding edge (u, v) creates a cycle; return edge.',
        status: 'Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 2: Connected Component Count',
        badgeColor: 'text-[#FF7A00]',
        dotColor: 'bg-[#FF7A00]',
        borderClass: 'border-[#FF7A00]/50',
        name: 'Number of Provinces',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #547',
        intuition: 'Initialize N components. Each successful union decrement component count by 1.',
        status: 'Ready to Solve',
        statusColor: 'text-[#FF7A00] font-bold',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 3: Grid Coordinate Flattening',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D]',
        name: 'Surrounded Regions',
        diff: 'Medium',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #130',
        intuition: 'Virtual dummy node connected to all boundary "O" cells; interior cells not connected to dummy get captured.',
        status: 'Ready to Solve',
        statusColor: 'text-[#8B949E]',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 4: Dynamic Matrix Percolation',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D] opacity-60',
        name: 'Number of Islands II',
        diff: 'Hard',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #305',
        intuition: 'Online grid island queries: add land node, union with up to 4 neighbors, and record running count.',
        status: 'Prerequisite Required',
        statusColor: 'text-[#8B949E]',
        actionText: 'Locked Barrier',
      },
    ],
  },
  strings: {
    title: 'String Algorithms & Pattern Matching Ladder',
    desc: 'Core Invariant: Longest prefix-suffix arrays (KMP failure function), rolling hash polynomials, and palindromic centers.',
    elo: '1,780 Rating • 85% AC',
    progress: '1 / 4 Mastered',
    steps: [
      {
        level: 'Level 1: Prefix Character Invariant',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Longest Common Prefix',
        diff: 'Easy',
        diffClass: 'bg-white/10 text-white border border-white/20',
        lc: 'LC #14',
        intuition: 'Vertical scanning across character index across all strings or horizontal prefix reduction.',
        status: 'Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 2: KMP Prefix-Suffix Table',
        badgeColor: 'text-[#FF7A00]',
        dotColor: 'bg-[#FF7A00]',
        borderClass: 'border-[#FF7A00]/50',
        name: 'Find the Index of the First Occurrence in a String',
        diff: 'Easy',
        diffClass: 'bg-white/10 text-white border border-white/20',
        lc: 'LC #28',
        intuition: 'Knuth-Morris-Pratt failure table (LPS): eliminate backtracking upon mismatch by jumping to longest prefix suffix.',
        status: 'Ready to Solve',
        statusColor: 'text-[#FF7A00] font-bold',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 3: Palindromic Center Expansion',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D]',
        name: 'Longest Palindromic Substring',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #5',
        intuition: 'Expand outward from 2n-1 odd and even centers; update maximum diameter while mirror bounds hold.',
        status: 'Ready to Solve',
        statusColor: 'text-[#8B949E]',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 4: Dynamic Partition Decomposition',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D] opacity-60',
        name: 'Word Break II',
        diff: 'Hard',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #140',
        intuition: 'Memoized DFS with trie prefix lookups to yield all valid space-delimited string segmentations.',
        status: 'Prerequisite Required',
        statusColor: 'text-[#8B949E]',
        actionText: 'Locked Barrier',
      },
    ],
  },
  recursion: {
    title: 'Recursion & Divide-and-Conquer Ladder',
    desc: 'Core Invariant: Self-similar subproblem reduction, base-case guarantees, call stack unwinding, and expression parsing.',
    elo: '1,790 Rating • 86% AC',
    progress: '1 / 4 Mastered',
    steps: [
      {
        level: 'Level 1: Binary Exponentiation',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Pow(x, n)',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #50',
        intuition: 'Divide exponent in half: x^n = (x^2)^(n/2); reduces O(N) multiplication steps to O(log N).',
        status: 'Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 2: Divide-and-Conquer Sort',
        badgeColor: 'text-[#FF7A00]',
        dotColor: 'bg-[#FF7A00]',
        borderClass: 'border-[#FF7A00]/50',
        name: 'Sort an Array',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #912',
        intuition: 'Split problem domain into equal halves, solve recursively, and merge sorted arrays in linear O(N) time.',
        status: 'Ready to Solve',
        statusColor: 'text-[#FF7A00] font-bold',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 3: Recursive Grammar Unrolling',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D]',
        name: 'Flatten Nested List Iterator',
        diff: 'Medium',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #341',
        intuition: 'Recursive generator or stack of list iterators lazily unrolling nested sub-lists.',
        status: 'Ready to Solve',
        statusColor: 'text-[#8B949E]',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 4: Recursive Descent Calculator',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D] opacity-60',
        name: 'Basic Calculator',
        diff: 'Hard',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #224',
        intuition: 'Maintain sign and current term; open parenthesis pushes state onto stack; closing resolves parenthesis scope.',
        status: 'Prerequisite Required',
        statusColor: 'text-[#8B949E]',
        actionText: 'Locked Barrier',
      },
    ],
  },
  sorting: {
    title: 'Sorting Algorithms & Array Partitions Ladder',
    desc: 'Core Invariant: Dutch National Flag partitions, custom comparator transitivity, Quickselect expected O(N) selection.',
    elo: '1,740 Rating • 90% AC',
    progress: '2 / 4 Mastered',
    steps: [
      {
        level: 'Level 1: Dutch 3-Way Partition',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Sort Colors',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #75',
        intuition: 'Dutch National Flag: 3 pointers (low, mid, high) separating 0s, 1s, and 2s in a single in-place pass.',
        status: 'Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 2: Custom String Comparator',
        badgeColor: 'text-[#FF7A00]',
        dotColor: 'bg-[#FF7A00]',
        borderClass: 'border-[#FF7A00]/50',
        name: 'Largest Number',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #179',
        intuition: 'Sort strings using comparator (a + b) > (b + a); verify transitive ordering and edge case zeroes.',
        status: 'Ready to Solve',
        statusColor: 'text-[#FF7A00] font-bold',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 3: Quickselect Expected O(N)',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D]',
        name: 'Kth Largest Element in an Array',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #215',
        intuition: 'Partition array like quicksort; branch only into the partition containing the target rank k.',
        status: 'Ready to Solve',
        statusColor: 'text-[#8B949E]',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 4: Inversion Count Migration',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D] opacity-60',
        name: 'Count of Smaller Numbers After Self',
        diff: 'Hard',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #315',
        intuition: 'Merge sort index tracking or Fenwick tree frequency updates while iterating right-to-left.',
        status: 'Prerequisite Required',
        statusColor: 'text-[#8B949E]',
        actionText: 'Locked Barrier',
      },
    ],
  },
  'fenwick-tree': {
    title: 'Binary Indexed Tree & Segment Tree Ladder',
    desc: 'Core Invariant: Prefix range decomposition via lowest set bit (i & -i), point updates in O(log N), and lazy interval tags.',
    elo: '1,960 Rating • 72% AC',
    progress: '1 / 4 Mastered',
    steps: [
      {
        level: 'Level 1: Point Update & Prefix Query',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Range Sum Query - Mutable',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #307',
        intuition: 'Fenwick Tree using lowbit (i & -i) to propagate updates upward and query prefix sums in O(log N).',
        status: 'Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 2: Coordinate Compression BIT',
        badgeColor: 'text-[#FF7A00]',
        dotColor: 'bg-[#FF7A00]',
        borderClass: 'border-[#FF7A00]/50',
        name: 'Queue Reconstruction by Height',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #406',
        intuition: 'Fenwick tree binary search or segment tree to find the k-th empty slot in O(N log N) total time.',
        status: 'Ready to Solve',
        statusColor: 'text-[#FF7A00] font-bold',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 3: 2D Submatrix Range Query',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D]',
        name: 'Range Sum Query 2D - Mutable',
        diff: 'Hard',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #308',
        intuition: '2D Fenwick tree with nested lowbit loops for point updates and 2D prefix sums.',
        status: 'Ready to Solve',
        statusColor: 'text-[#8B949E]',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 4: Dynamic Segment Tree + Lazy Tags',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D] opacity-60',
        name: 'Falling Squares',
        diff: 'Hard',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #699',
        intuition: 'Segment tree with coordinate compression and lazy propagation tags for interval max height updates.',
        status: 'Prerequisite Required',
        statusColor: 'text-[#8B949E]',
        actionText: 'Locked Barrier',
      },
    ],
  },
  'sweep-line': {
    title: 'Sweep Line & Event Processing Ladder',
    desc: 'Core Invariant: Chronological event point sorting, active boundary tracking, 2D geometry projection, and interval concurrency.',
    elo: '1,920 Rating • 76% AC',
    progress: '1 / 4 Mastered',
    steps: [
      {
        level: 'Level 1: Concurrent Interval Bounds',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Meeting Rooms II',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #253',
        intuition: 'Separate start and end timestamps into sorted arrays; increment room concurrency on start, decrement on end.',
        status: 'Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 2: Active Multiset & Skyline Contour',
        badgeColor: 'text-[#FF7A00]',
        dotColor: 'bg-[#FF7A00]',
        borderClass: 'border-[#FF7A00]/50',
        name: 'The Skyline Problem',
        diff: 'Hard',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #218',
        intuition: 'Sweep vertical line along building edges. Multiset/max-heap of heights emits keypoint on max height transition.',
        status: 'Ready to Solve',
        statusColor: 'text-[#FF7A00] font-bold',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 3: Difference Array on Timeline',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D]',
        name: 'Car Pooling',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #1094',
        intuition: 'Bucket difference array: +passenger at pickup, -passenger at dropoff; verify cumulative load <= capacity.',
        status: 'Ready to Solve',
        statusColor: 'text-[#8B949E]',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 4: 2D Rectangle Area Union',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D] opacity-60',
        name: 'Rectangle Area II',
        diff: 'Hard',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #850',
        intuition: 'Sweep line along X-axis with active Y-intervals merged via segment tree modulo 1e9+7.',
        status: 'Prerequisite Required',
        statusColor: 'text-[#8B949E]',
        actionText: 'Locked Barrier',
      },
    ],
  },
  'monotonic-queue': {
    title: 'Monotonic Queue & Deque Ladder',
    desc: 'Core Invariant: Extremum maintenance in sliding windows, double-ended pruning of dominated candidates, and DP acceleration to O(N).',
    elo: '1,880 Rating • 81% AC',
    progress: '1 / 4 Mastered',
    steps: [
      {
        level: 'Level 1: Double-Ended Window Maxima',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Sliding Window Maximum',
        diff: 'Hard',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #239',
        intuition: 'Monotonic decreasing deque of indices: evict expired left indices and pop smaller tail items to maintain max at front.',
        status: 'Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 2: Dual Deque Limit Range',
        badgeColor: 'text-[#FF7A00]',
        dotColor: 'bg-[#FF7A00]',
        borderClass: 'border-[#FF7A00]/50',
        name: 'Longest Continuous Subarray With Absolute Diff Less Than or Equal to Limit',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #1438',
        intuition: 'Two monotonic deques (one min, one max); slide left window pointer when maxDeque.front - minDeque.front > limit.',
        status: 'Ready to Solve',
        statusColor: 'text-[#FF7A00] font-bold',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 3: DP Transition Acceleration',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D]',
        name: 'Jump Game VI',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #1696',
        intuition: 'DP state dp[i] = nums[i] + max(dp[i-k..i-1]) accelerated from O(Nk) to linear O(N) using max-deque.',
        status: 'Ready to Solve',
        statusColor: 'text-[#8B949E]',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 4: Prefix Sum Monotonic Deque',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D] opacity-60',
        name: 'Shortest Subarray with Sum at Least K',
        diff: 'Hard',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #862',
        intuition: 'Monotonic increasing deque of prefix sum indices: pop front when prefix[i] - prefix[front] >= k.',
        status: 'Prerequisite Required',
        statusColor: 'text-[#8B949E]',
        actionText: 'Locked Barrier',
      },
    ],
  },
  math: {
    title: 'Math & Number Theory Ladder',
    desc: 'Core Invariant: Prime sieving (Eratosthenes), Euclidean GCD & Bezout identity, modular exponentiation, and combinatorial counting.',
    elo: '1,750 Rating • 88% AC',
    progress: '2 / 4 Mastered',
    steps: [
      {
        level: 'Level 1: Prime Sieve Invariant',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Count Primes',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #204',
        intuition: 'Sieve of Eratosthenes: mark composite multiples of primes up to sqrt(n) in O(N log log N).',
        status: 'Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 2: Euclidean GCD & Bezout',
        badgeColor: 'text-[#FF7A00]',
        dotColor: 'bg-[#FF7A00]',
        borderClass: 'border-[#FF7A00]/50',
        name: 'Water and Jug Problem',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #365',
        intuition: 'Bezout identity: target can be measured if and only if target <= x + y and target is divisible by gcd(x, y).',
        status: 'Ready to Solve',
        statusColor: 'text-[#FF7A00] font-bold',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 3: Modular Exponentiation Recursion',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D]',
        name: 'Super Pow',
        diff: 'Medium',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #372',
        intuition: 'a^[b1,b2,b3] = (a^[b1,b2])^10 * a^b3 mod 1337 evaluated via recursion.',
        status: 'Ready to Solve',
        statusColor: 'text-[#8B949E]',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 4: Place Value Digit Counting',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D] opacity-60',
        name: 'Number of Digit One',
        diff: 'Hard',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #233',
        intuition: 'Count occurrences of digit 1 at each place value (units, tens, hundreds) via high/curr/low digit arithmetic.',
        status: 'Prerequisite Required',
        statusColor: 'text-[#8B949E]',
        actionText: 'Locked Barrier',
      },
    ],
  },
  geometry: {
    title: 'Computational Geometry & Vectors Ladder',
    desc: 'Core Invariant: Normalized slope rational hashing, 2D vector cross product orientation, and Monotone Chain convex hull.',
    elo: '1,940 Rating • 73% AC',
    progress: '1 / 4 Mastered',
    steps: [
      {
        level: 'Level 1: Coordinate Distance Invariant',
        badgeColor: 'text-white',
        dotColor: 'bg-white',
        borderClass: 'border-white/30',
        name: 'Valid Square',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #593',
        intuition: 'Compute all 6 pairwise distances; square requires 4 equal sides and 2 equal diagonals > 0.',
        status: 'Mastered',
        statusColor: 'text-white',
        actionText: 'Review Notes ->',
      },
      {
        level: 'Level 2: Collinear Slope Rational Hash',
        badgeColor: 'text-[#FF7A00]',
        dotColor: 'bg-[#FF7A00]',
        borderClass: 'border-[#FF7A00]/50',
        name: 'Max Points on a Line',
        diff: 'Hard',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #149',
        intuition: 'For each anchor point, compute normalized rational slope dy/dx using gcd into hash map to prevent floating inaccuracy.',
        status: 'Ready to Solve',
        statusColor: 'text-[#FF7A00] font-bold',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 3: Diagonal Pair Hash Lookup',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D]',
        name: 'Minimum Area Rectangle',
        diff: 'Medium',
        diffClass: 'bg-[#FF7A00]/10 text-[#FF7A00] border border-[#FF7A00]/30',
        lc: 'LC #939',
        intuition: 'Iterate diagonal pairs (x1, y1) and (x2, y2); check if points (x1, y2) and (x2, y1) exist in hash set.',
        status: 'Ready to Solve',
        statusColor: 'text-[#8B949E]',
        actionText: 'Solve Problem ->',
      },
      {
        level: 'Level 4: Monotone Chain Convex Hull',
        badgeColor: 'text-[#8B949E]',
        dotColor: 'bg-[#30363D]',
        borderClass: 'border-[#21262D] opacity-60',
        name: 'Erect the Fence',
        diff: 'Hard',
        diffClass: 'bg-[#161B22] text-[#8B949E] border border-[#21262D]',
        lc: 'LC #587',
        intuition: 'Sort points, construct lower and upper hulls using 2D cross-product orientation test (clockwise vs counter-clockwise).',
        status: 'Prerequisite Required',
        statusColor: 'text-[#8B949E]',
        actionText: 'Locked Barrier',
      },
    ],
  },

};


// Aliases
TOPIC_CATALOG['sliding-window'] = TOPIC_CATALOG.window;
TOPIC_CATALOG['dynamic-programming'] = TOPIC_CATALOG.dp;
TOPIC_CATALOG['monotonic-stack'] = TOPIC_CATALOG.monostack;
TOPIC_CATALOG['binary-search'] = TOPIC_CATALOG.binsearch;
TOPIC_CATALOG['heap-priority-queue'] = TOPIC_CATALOG.heaps;
TOPIC_CATALOG['heap'] = TOPIC_CATALOG.heaps;
TOPIC_CATALOG['graph'] = TOPIC_CATALOG.graphs;
TOPIC_CATALOG['tree'] = TOPIC_CATALOG.trees;
TOPIC_CATALOG['binary-tree'] = TOPIC_CATALOG.trees;
TOPIC_CATALOG['binarytree'] = TOPIC_CATALOG.trees;
TOPIC_CATALOG['twopointers'] = TOPIC_CATALOG['two-pointers'];
TOPIC_CATALOG['prefixsum'] = TOPIC_CATALOG['prefix-sum'];
TOPIC_CATALOG['linkedlist'] = TOPIC_CATALOG['linked-list'];
TOPIC_CATALOG['dsu'] = TOPIC_CATALOG['union-find'];
TOPIC_CATALOG['unionfind'] = TOPIC_CATALOG['union-find'];
TOPIC_CATALOG['bitmanipulation'] = TOPIC_CATALOG['bit-manipulation'];
TOPIC_CATALOG['tries'] = TOPIC_CATALOG.trie;
TOPIC_CATALOG['intervals'] = TOPIC_CATALOG.greedy;
TOPIC_CATALOG['string'] = TOPIC_CATALOG.strings;
TOPIC_CATALOG['kmp'] = TOPIC_CATALOG.strings;
TOPIC_CATALOG['segment-tree'] = TOPIC_CATALOG['fenwick-tree'];
TOPIC_CATALOG['binary-indexed-tree'] = TOPIC_CATALOG['fenwick-tree'];
TOPIC_CATALOG['sweepline'] = TOPIC_CATALOG['sweep-line'];
TOPIC_CATALOG['queue'] = TOPIC_CATALOG['monotonic-queue'];
TOPIC_CATALOG['deque'] = TOPIC_CATALOG['monotonic-queue'];
TOPIC_CATALOG['number-theory'] = TOPIC_CATALOG.math;


const CURATED_SHEET_KEYS = ['blind75', 'leetcode150', 'maang', 'master-dsa', 'sql', 'lld'];

export const RoadmapsPage = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { 
    selectedTopic, 
    setSelectedTopic, 
    handle, 
    region, 
    syncLeetCode, 
    topicMetrics,
    solvedSlugs,
    isProblemSolved,
    setSyncModalOpen
  } = useProfileStore();

  const isDirectSheet = topicId && CURATED_SHEET_KEYS.includes(topicId);
  const [viewCategory, setViewCategory] = useState(isDirectSheet ? 'sheets' : 'patterns');
  const [selectedSheetKey, setSelectedSheetKey] = useState(isDirectSheet ? topicId : 'master-dsa');

  // Auto-sync if profile has stale 8-topic cache
  useEffect(() => {
    if (handle && (!topicMetrics || Object.keys(topicMetrics).length <= 8)) {
      syncLeetCode(handle, region, true);
    }
  }, [handle, topicMetrics, region, syncLeetCode]);

  useEffect(() => {
    if (topicId) {
      if (CURATED_SHEET_KEYS.includes(topicId)) {
        setViewCategory('sheets');
        setSelectedSheetKey(topicId);
      } else if (TOPIC_CATALOG[topicId]) {
        setViewCategory('patterns');
        setSelectedTopic(topicId);
      }
    }
  }, [topicId, setSelectedTopic]);

  const activeTopic = topicId && TOPIC_CATALOG[topicId] ? topicId : selectedTopic || 'dp';
  const data = TOPIC_CATALOG[activeTopic] || TOPIC_CATALOG.dp;
  const roadmapData = ROADMAP_DATA[activeTopic] || ROADMAP_DATA.dp;

  const handleSelectTopic = (key) => {
    setSelectedTopic(key);
    navigate(`/paths/${key}`);
  };

  const handleSelectSheet = (key) => {
    setSelectedSheetKey(key);
    navigate(`/paths/${key}`);
  };

  const topicsList = [
    { key: 'sliding-window', label: 'Sliding Window' },
    { key: 'two-pointers', label: 'Two Pointers' },
    { key: 'prefix-sum', label: 'Prefix Sum' },
    { key: 'linked-list', label: 'Linked List' },
    { key: 'dynamic-programming', label: 'Dynamic Programming' },
    { key: 'monotonic-stack', label: 'Monotonic Stack', isDeficit: true },
    { key: 'binary-search', label: 'Binary Search' },
    { key: 'trees', label: 'Binary Trees & BST' },
    { key: 'graphs', label: 'Graph Theory' },
    { key: 'heaps', label: 'Heaps & Hashes' },
    { key: 'backtracking', label: 'Backtracking' },
    { key: 'trie', label: 'Trie (Prefix Trees)' },
    { key: 'bit-manipulation', label: 'Bit Manipulation' },
    { key: 'union-find', label: 'Union-Find (DSU)' },
    { key: 'greedy', label: 'Greedy & Intervals' },
    { key: 'design', label: 'Data Structure Design' },
    { key: 'strings', label: 'Strings & KMP' },
    { key: 'recursion', label: 'Recursion & D&C' },
    { key: 'sorting', label: 'Sorting & Partitions' },
    { key: 'fenwick-tree', label: 'Segment & Fenwick Tree' },
    { key: 'sweep-line', label: 'Sweep Line' },
    { key: 'monotonic-queue', label: 'Monotonic Queue' },
    { key: 'math', label: 'Math & Number Theory' },
    { key: 'geometry', label: 'Geometry' },
  ];

  // Count total problems from roadmap tree data
  let roadmapTotalProblems = 0;
  let roadmapSolvedCount = 0;
  if (roadmapData && roadmapData.tiers) {
    ['easy', 'medium', 'hard'].forEach(key => {
      const tier = roadmapData.tiers[key];
      if (!tier) return;
      tier.groups.forEach(g => {
        g.problems.forEach(p => {
          roadmapTotalProblems++;
          const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          if (isProblemSolved(slug)) roadmapSolvedCount++;
        });
      });
    });
  }

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#21262D] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#161B22] border border-[#21262D] text-[#FF7A00] text-[11px] font-mono mb-2 font-semibold">
            <span>Learning Paths & Interview Sheets</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F0F6FC] animate-heading-reveal">
            Step-by-Step Roadmaps & Curated Sheets
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSyncModalOpen(true, 'past')}
            className="px-2.5 py-1 rounded bg-[#161B22] hover:bg-[#21262D] text-[#FF7A00] hover:text-[#FFA040] text-xs font-bold border border-[#FF7A00]/30 font-mono flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Sparkles className="size-3.5" />
            <span>Import Past Solved ({solvedSlugs.length})</span>
          </button>
          <span className="px-2.5 py-1 rounded bg-[#FF7A00]/10 text-[#FF7A00] text-xs font-bold border border-[#FF7A00]/30 font-mono flex items-center gap-1.5 flex-wrap">
            <span>24 Pattern Trees</span>
            <span className="text-[#484F58]">•</span>
            <span>6 Curated Sheets</span>
          </span>
        </div>
      </div>

      {/* Primary Roadmap Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-2 rounded-2xl bg-[#0D1117]/90 backdrop-blur border border-[#21262D] shadow-lg shadow-black/20">
        
        {/* Segmented Control Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-center gap-1.5 p-1 rounded-xl bg-[#161B22]/80 border border-[#21262D] shadow-inner w-full sm:w-auto">
          
          {/* Pattern Ladders Mode */}
          <button
            type="button"
            onClick={() => {
              setViewCategory('patterns');
              navigate(`/paths/${activeTopic || 'dp'}`);
            }}
            className={`group relative px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs font-mono font-bold transition-colors duration-150 flex items-center justify-between sm:justify-start gap-2.5 cursor-pointer ${
              viewCategory === 'patterns'
                ? 'bg-gradient-to-r from-[#FF7A00] to-[#FFA040] text-black shadow-md shadow-[#FF7A00]/25'
                : 'text-[#8B949E] hover:text-white hover:bg-[#21262D]/60'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <GitFork className={`size-4 shrink-0 ${viewCategory === 'patterns' ? 'text-black stroke-[2.5]' : 'text-[#FF7A00]'}`} />
              <span className="truncate">Pattern Ladders</span>
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold uppercase tracking-wider border transition-colors shrink-0 ${
                viewCategory === 'patterns'
                  ? 'bg-black/20 text-black border-transparent'
                  : 'bg-[#FF7A00]/10 text-[#FF7A00] border-[#FF7A00]/20'
              }`}
            >
              24 Trees
            </span>
          </button>

          {/* Curated Sheets & DSA Mode */}
          <button
            type="button"
            onClick={() => {
              setViewCategory('sheets');
              const target = selectedSheetKey || 'blind75';
              setSelectedSheetKey(target);
              navigate(`/paths/${target}`);
            }}
            className={`group relative px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs font-mono font-bold transition-colors duration-150 flex items-center justify-between sm:justify-start gap-2.5 cursor-pointer ${
              viewCategory === 'sheets'
                ? 'bg-gradient-to-r from-[#8A46FF] to-[#A371F7] text-white shadow-md shadow-[#A371F7]/25'
                : 'text-[#8B949E] hover:text-white hover:bg-[#21262D]/60'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className={`size-4 shrink-0 ${viewCategory === 'sheets' ? 'text-white stroke-[2.5]' : 'text-[#A371F7]'}`} />
              <span className="truncate">Curated Sheets & DSA</span>
            </div>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold uppercase tracking-wider border transition-colors shrink-0 ${
                viewCategory === 'sheets'
                  ? 'bg-white/20 text-white border-transparent'
                  : 'bg-[#A371F7]/10 text-[#A371F7] border-[#A371F7]/20'
              }`}
            >
              6 Sheets
            </span>
          </button>

        </div>

        {/* Dynamic Context Track Descriptor */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-[#161B22]/60 border border-[#21262D]/60 text-xs font-mono text-[#8B949E] shrink-0">
          {viewCategory === 'patterns' ? (
            <>
              <span className="size-2 rounded-full bg-[#FF7A00] animate-pulse shrink-0" />
              <span>Skill Tree:</span>
              <span className="text-white font-semibold capitalize whitespace-nowrap">
                {activeTopic ? (TOPIC_CATALOG[activeTopic]?.title?.split(' Intuition')[0] || activeTopic) : 'Dynamic Programming'}
              </span>
              <span className="text-[#484F58]">•</span>
              <span className="text-[#FF7A00] whitespace-nowrap">24 Visual Paths</span>
            </>
          ) : (
            <>
              <span className="size-2 rounded-full bg-[#A371F7] animate-pulse shrink-0" />
              <span>Curated Track:</span>
              <span className="text-white font-semibold capitalize whitespace-nowrap">
                {selectedSheetKey === 'blind75' ? 'Blind 75' :
                 selectedSheetKey === 'sql' ? 'SQL 50 & Mastery' :
                 selectedSheetKey === 'leetcode150' ? 'LeetCode Top 150' :
                 selectedSheetKey === 'lld' ? 'Low-Level Design' :
                 selectedSheetKey === 'maang' ? 'MAANG Companies' : 'Master DSA'}
              </span>
              <span className="text-[#484F58]">•</span>
              <span className="text-[#A371F7] whitespace-nowrap">6 Tracks</span>
            </>
          )}
        </div>

      </div>

      {/* RENDER CATEGORY: PATTERN TREES */}
      {viewCategory === 'patterns' && (
        <div className="space-y-6">
          
          {/* Topic Switcher Bar */}
          <div className="relative">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1 bg-[#0D1117] rounded-xl border border-[#21262D] scrollbar-none">
              {topicsList.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => handleSelectTopic(t.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                    activeTopic === t.key
                      ? 'bg-[#FF7A00] text-black shadow-md shadow-[#FF7A00]/20'
                      : 'bg-[#161B22] text-[#8B949E] hover:text-white border border-[#21262D] hover:border-[#30363D]'
                  }`}
                >
                  <span>{t.label}</span>
                  {t.isDeficit && (
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase tracking-wider ${
                        activeTopic === t.key
                          ? 'bg-black text-[#FF7A00]'
                          : 'bg-[#FF7A00]/20 text-[#FF7A00]'
                      }`}
                    >
                      Deficit
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0D1117] to-transparent rounded-r-xl" />
          </div>

          {/* DSA Skill Tree for Active Topic */}
          <TopicSubtopicsView 
            topicKey={activeTopic}
            topicTitle={data.title}
            topicDesc={data.desc}
            onSwitchToMasterDsa={() => {
              setViewCategory('sheets');
              setSelectedSheetKey('master-dsa');
              navigate('/paths/master-dsa');
            }}
          />

        </div>
      )}

      {/* RENDER CATEGORY: CURATED & COMPANY SHEETS */}
      {viewCategory === 'sheets' && (
        <CuratedSheetsView 
          initialSheetKey={selectedSheetKey || 'blind75'} 
          onSheetChange={handleSelectSheet}
        />
      )}

    </div>
  );
};
