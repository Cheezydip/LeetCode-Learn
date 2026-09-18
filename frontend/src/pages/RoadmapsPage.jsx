import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProfileStore } from '../store/useProfileStore';

const TOPIC_CATALOG = {
  dp: {
    title: 'Dynamic Programming Intuition Ladder',
    desc: 'Core Invariant: Overlapping subproblems with optimal substructure. Move from 1D memoization array to rolling state variables.',
    elo: '1,850 Elo • 88% AC',
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
    elo: '1,540 Elo • 28% AC (-302 Deficit)',
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
    elo: '1,820 Elo • 79% AC',
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
    elo: '1,910 Elo • 94% AC (Peak Mastery)',
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
    elo: '1,880 Elo • 88% AC',
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
    elo: '1,810 Elo • 82% AC',
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
    elo: '1,820 Elo • 85% AC',
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
    elo: '1,890 Elo • 81% AC',
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
    elo: '1,840 Elo • 83% AC',
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
    elo: '1,810 Elo • 86% AC',
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
};

// Aliases
TOPIC_CATALOG.window = TOPIC_CATALOG['sliding-window'];
TOPIC_CATALOG['monotonic-stack'] = TOPIC_CATALOG.monostack;
TOPIC_CATALOG['dynamic-programming'] = TOPIC_CATALOG.dp;
TOPIC_CATALOG['binary-search'] = TOPIC_CATALOG.binsearch;
TOPIC_CATALOG['heap-priority-queue'] = TOPIC_CATALOG.heaps;
TOPIC_CATALOG['graph'] = TOPIC_CATALOG.graphs;
TOPIC_CATALOG['tree'] = TOPIC_CATALOG.trees;

export const RoadmapsPage = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { selectedTopic, setSelectedTopic, handle, region, syncLeetCode, topicMetrics } = useProfileStore();

  // Auto-sync if profile has stale 8-topic cache
  useEffect(() => {
    if (handle && (!topicMetrics || Object.keys(topicMetrics).length <= 8)) {
      syncLeetCode(handle, region, true);
    }
  }, [handle, topicMetrics, region, syncLeetCode]);

  const activeTopic = topicId && TOPIC_CATALOG[topicId] ? topicId : selectedTopic || 'dp';
  const data = TOPIC_CATALOG[activeTopic] || TOPIC_CATALOG.dp;

  useEffect(() => {
    if (topicId && TOPIC_CATALOG[topicId]) {
      setSelectedTopic(topicId);
    }
  }, [topicId, setSelectedTopic]);

  const handleSelectTopic = (key) => {
    setSelectedTopic(key);
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
    { key: 'graphs', label: 'Graphs & Trees' },
    { key: 'heaps', label: 'Heaps & Hashes' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#21262D] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#161B22] border border-[#21262D] text-[#FF7A00] text-[11px] font-mono mb-2 font-semibold">
            <span>Learning Paths</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono text-[#F0F6FC]">
            Step-by-Step Learning Paths
          </h1>
          <p className="text-xs text-[#8B949E] font-mono mt-1">
            Master foundational invariants before tackling complex multi-state constraints. Sequential unlock hierarchy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded bg-[#FF7A00]/10 text-[#FF7A00] text-xs font-bold border border-[#FF7A00]/30 font-mono">
            {topicsList.length} TRACKS READY
          </span>
        </div>
      </div>

      {/* Topic Switcher Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-[#0D1117] p-1.5 rounded-xl border border-[#21262D]">
        {topicsList.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => handleSelectTopic(t.key)}
            className={`px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTopic === t.key
                ? 'bg-[#FF7A00] text-black shadow-md shadow-[#FF7A00]/20'
                : 'text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22]'
            }`}
          >
            <span>{t.label}</span>
            {t.isDeficit && (
              <span
                className={`text-[9px] px-1 py-0.2 rounded font-bold ${
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

      {/* Active Topic Context Banner */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#0D1117] border border-[#21262D] shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-mono">
        <div className="flex items-start gap-3">
          <span
            className={`size-2.5 rounded-full mt-1 shrink-0 ${
              data.isDeficit ? 'bg-[#F85149] animate-pulse' : 'bg-[#FF7A00]'
            }`}
          />
          <div>
            <h2 className="text-[#F0F6FC] font-bold text-sm sm:text-base">{data.title}</h2>
            <p className="text-[11px] text-[#8B949E] mt-1 leading-relaxed max-w-3xl">{data.desc}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px] shrink-0 border-t md:border-t-0 md:border-l border-[#21262D] pt-3 md:pt-0 md:pl-4 w-full md:w-auto">
          <div>
            <span className="text-[#8B949E] text-[9px] uppercase block tracking-wider font-semibold">
              Competency Elo
            </span>
            <span className="font-bold text-[#F0F6FC]">{data.elo}</span>
          </div>
          <div className="pl-3 border-l border-[#21262D]">
            <span className="text-[#8B949E] text-[9px] uppercase block tracking-wider font-semibold">
              Track Progress
            </span>
            <span className="font-bold text-[#FF7A00]">{data.progress}</span>
          </div>
        </div>
      </div>

      {/* Progressive 4-Step Staircase Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        {data.steps.map((step) => (
          <div
            key={step.lc}
            className={`p-5 rounded-xl bg-[#0D1117] border ${step.borderClass} shadow-2xl flex flex-col justify-between transition-all hover:border-[#FF7A00]/50 hover:-translate-y-0.5`}
          >
            {/* Step Header */}
            <div>
              <div className="flex items-center justify-between mb-3 text-[11px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className={`size-2 rounded-full ${step.dotColor}`} />
                  <span className={`font-semibold ${step.badgeColor}`}>{step.level}</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${step.diffClass}`}>
                  {step.diff}
                </span>
              </div>

              {/* Problem Name & LeetCode ID */}
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="font-bold text-sm text-[#F0F6FC] font-mono">{step.name}</h3>
                <span className="text-[10px] text-[#8B949E] font-mono">{step.lc}</span>
              </div>

              {/* Core Intuition Invariant */}
              <p className="text-xs text-[#8B949E] font-mono leading-relaxed mt-2">
                {step.intuition}
              </p>
            </div>

            {/* Step Footer & Action Link */}
            <div className="mt-5 pt-3 border-t border-[#21262D] flex items-center justify-between text-xs font-mono">
              <span className={`text-[11px] ${step.statusColor}`}>{step.status}</span>
              <a
                href={`https://leetcode.com/problems/${step.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/`}
                target="_blank"
                rel="noreferrer"
                className="text-[#FF7A00] hover:text-[#FFA040] font-semibold flex items-center gap-1 transition-colors"
              >
                <span>{step.actionText}</span>
              </a>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
