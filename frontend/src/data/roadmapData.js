// ─── Roadmap Problem Data ───────────────────────────────────────────
// Each topic has tiers: easy, medium, hard
// Each tier has groups of similar problems
// Problems within a group share the same core pattern/technique

export const ROADMAP_DATA = {
  // ═══════════════════════════════════════════════════════════════════
  // 1. DYNAMIC PROGRAMMING
  // ═══════════════════════════════════════════════════════════════════
  dp: {
    title: 'Dynamic Programming',
    desc: 'Overlapping subproblems with optimal substructure. Build solutions from smaller solved subproblems.',
    tiers: {
      easy: {
        label: 'Foundation',
        groups: [
          {
            name: '1D Linear DP',
            problems: [
              { name: 'Climbing Stairs', lcId: 70, intuition: 'Fibonacci recurrence f(n) = f(n-1) + f(n-2). Base cases f(1)=1, f(2)=2.' },
              { name: 'Min Cost Climbing Stairs', lcId: 746, intuition: 'Cost minimization: dp[i] = cost[i] + min(dp[i-1], dp[i-2]).' },
              { name: 'N-th Tribonacci Number', lcId: 1137, intuition: 'Tribonacci: T(n) = T(n-1) + T(n-2) + T(n-3) with rolling variables.' },
              { name: 'Fibonacci Number', lcId: 509, intuition: 'Classic bottom-up: F(n) = F(n-1) + F(n-2). Use two rolling vars.' },
            ],
          },
          {
            name: 'Decision DP',
            problems: [
              { name: "Pascal's Triangle", lcId: 118, intuition: 'Each cell is sum of two parents: dp[i][j] = dp[i-1][j-1] + dp[i-1][j].' },
              { name: "Pascal's Triangle II", lcId: 119, intuition: 'Single row in O(k) space by iterating backwards within the row.' },
              { name: 'Get Maximum in Generated Array', lcId: 1646, intuition: 'Generate array by rules and track max. Direct simulation DP.' },
            ],
          },
        ],
      },
      medium: {
        label: 'Core Patterns',
        groups: [
          {
            name: 'House Robber Pattern',
            problems: [
              { name: 'House Robber', lcId: 198, intuition: 'Non-adjacent selection: dp[i] = max(dp[i-1], dp[i-2] + nums[i]).' },
              { name: 'House Robber II', lcId: 213, intuition: 'Circular array: run House Robber on [0..n-2] and [1..n-1], take max.' },
              { name: 'Delete and Earn', lcId: 740, intuition: "Reduce to House Robber: earning points[x] means you can't earn points[x-1]." },
            ],
          },
          {
            name: 'Subsequence DP',
            problems: [
              { name: 'Longest Increasing Subsequence', lcId: 300, intuition: 'dp[i] = max length ending at i. Binary search patience sorting for O(n log n).' },
              { name: 'Number of Longest Increasing Subsequence', lcId: 673, intuition: 'Track both length[] and count[] arrays. Combine when lengths match.' },
              { name: 'Longest Common Subsequence', lcId: 1143, intuition: '2D DP: if chars match, dp[i][j] = dp[i-1][j-1]+1; else max of skip either.' },
              { name: 'Uncrossed Lines', lcId: 1035, intuition: "Identical to LCS. Lines that don't cross = longest common subsequence." },
              { name: 'Maximum Length of Repeated Subarray', lcId: 718, intuition: 'DP table where dp[i][j] = dp[i-1][j-1]+1 if match, else 0. Track global max.' },
            ],
          },
          {
            name: 'Grid / Path DP',
            problems: [
              { name: 'Unique Paths', lcId: 62, intuition: 'dp[i][j] = dp[i-1][j] + dp[i][j-1]. Only come from top or left.' },
              { name: 'Unique Paths II', lcId: 63, intuition: 'Same as Unique Paths but obstacles set dp[i][j] = 0.' },
              { name: 'Minimum Path Sum', lcId: 64, intuition: 'dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1]).' },
              { name: 'Triangle', lcId: 120, intuition: 'Bottom-up: dp[j] = triangle[i][j] + min(dp[j], dp[j+1]).' },
              { name: 'Minimum Falling Path Sum', lcId: 931, intuition: 'Each cell picks min of 3 parents above: dp[i][j] = matrix[i][j] + min neighbors.' },
            ],
          },
          {
            name: 'Knapsack / Subset Sum',
            problems: [
              { name: 'Partition Equal Subset Sum', lcId: 416, intuition: 'Find if subset sums to total/2. 0-1 knapsack with boolean DP.' },
              { name: 'Target Sum', lcId: 494, intuition: 'Count subsets summing to (total+target)/2. Knapsack counting variant.' },
              { name: 'Coin Change', lcId: 322, intuition: 'Unbounded knapsack: dp[amount] = min(dp[amount], dp[amount-coin]+1).' },
              { name: 'Coin Change II', lcId: 518, intuition: 'Count combinations: iterate coins outer, amounts inner to avoid duplicates.' },
              { name: 'Ones and Zeroes', lcId: 474, intuition: '2D knapsack: dp[i][j] = max items fitting i zeros and j ones.' },
            ],
          },
          {
            name: 'String DP',
            problems: [
              { name: 'Word Break', lcId: 139, intuition: 'dp[i] = true if s[0..i] can be segmented. Check all dict words ending at i.' },
              { name: 'Palindromic Substrings', lcId: 647, intuition: 'Expand around center. Or dp[i][j] = (s[i]==s[j]) && dp[i+1][j-1].' },
              { name: 'Longest Palindromic Substring', lcId: 5, intuition: 'Expand around center for odd/even lengths. O(n^2) time, O(1) space.' },
              { name: 'Decode Ways', lcId: 91, intuition: 'dp[i] depends on 1-digit and 2-digit decodings. Handle zeros carefully.' },
              { name: 'Interleaving String', lcId: 97, intuition: '2D DP: dp[i][j] = can s3[0..i+j] be formed by interleaving s1[0..i] and s2[0..j].' },
            ],
          },
          {
            name: 'Stock Trading',
            problems: [
              { name: 'Best Time to Buy and Sell Stock II', lcId: 122, intuition: 'Greedy: add all positive differences. Or state DP with hold/not-hold.' },
              { name: 'Best Time to Buy and Sell Stock with Cooldown', lcId: 309, intuition: '3-state DP: hold, sold, rest. Sold transitions to rest (cooldown).' },
              { name: 'Best Time to Buy and Sell Stock with Transaction Fee', lcId: 714, intuition: '2-state: hold[i] = max(hold[i-1], cash[i-1]-price), cash[i] = max(cash[i-1], hold[i-1]+price-fee).' },
            ],
          },
          {
            name: 'Interval DP',
            problems: [
              { name: 'Longest Palindromic Subsequence', lcId: 516, intuition: 'dp[i][j] = longest palindromic subseq in s[i..j]. Expand from length 1 upward.' },
              { name: 'Predict the Winner', lcId: 486, intuition: 'Minimax interval DP. Player picks from ends: dp[i][j] = max(nums[i]-dp[i+1][j], nums[j]-dp[i][j-1]).' },
              { name: 'Stone Game', lcId: 877, intuition: 'Interval DP game theory. First player always wins with even-length piles.' },
            ],
          },
        ],
      },
      hard: {
        label: 'Advanced',
        groups: [
          {
            name: 'Advanced String DP',
            problems: [
              { name: 'Edit Distance', lcId: 72, intuition: '2D DP: insert/delete/replace operations. dp[i][j] = min of 3 transitions.' },
              { name: 'Distinct Subsequences', lcId: 115, intuition: 'Count ways t appears as subsequence of s. dp[i][j] = dp[i-1][j] + (match ? dp[i-1][j-1] : 0).' },
              { name: 'Regular Expression Matching', lcId: 10, intuition: "dp[i][j] = does s[0..i] match p[0..j]. Handle '.' and '*' transitions." },
              { name: 'Wildcard Matching', lcId: 44, intuition: "Similar to regex but '?' matches one, '*' matches any sequence." },
            ],
          },
          {
            name: 'Multi-Dimensional DP',
            problems: [
              { name: 'Best Time to Buy and Sell Stock III', lcId: 123, intuition: 'At most 2 transactions. Track buy1, sell1, buy2, sell2 running states.' },
              { name: 'Best Time to Buy and Sell Stock IV', lcId: 188, intuition: 'Generalize to k transactions. dp[k][i] with state optimization.' },
              { name: 'Cherry Pickup', lcId: 741, intuition: 'Two people traverse grid simultaneously. 3D DP on (r1, c1, r2).' },
              { name: 'Cherry Pickup II', lcId: 1463, intuition: 'Two robots from top corners. 3D DP: dp[row][col1][col2].' },
            ],
          },
          {
            name: 'Bitmask DP',
            problems: [
              { name: 'Partition to K Equal Sum Subsets', lcId: 698, intuition: 'Bitmask DP tracking which elements are used. State = subset mask.' },
              { name: 'Shortest Path Visiting All Nodes', lcId: 847, intuition: 'BFS + bitmask: state = (current_node, visited_mask). Find min steps.' },
            ],
          },
          {
            name: 'Advanced Sequence DP',
            problems: [
              { name: 'Burst Balloons', lcId: 312, intuition: 'Interval DP: dp[i][j] = max coins bursting between i and j. Pick last burst.' },
              { name: 'Longest Valid Parentheses', lcId: 32, intuition: 'dp[i] = length of longest valid ending at i. Stack-based or DP approach.' },
              { name: 'Maximal Rectangle', lcId: 85, intuition: 'Build histogram per row, apply largest rectangle in histogram to each.' },
              { name: 'Russian Doll Envelopes', lcId: 354, intuition: 'Sort by width asc, height desc. LIS on heights gives answer.' },
            ],
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 2. MONOTONIC STACK
  // ═══════════════════════════════════════════════════════════════════
  monostack: {
    title: 'Monotonic Stack',
    desc: 'Maintain a stack with strictly increasing or decreasing order to find nearest greater/smaller elements.',
    isDeficit: true,
    tiers: {
      easy: {
        label: 'Foundation',
        groups: [
          {
            name: 'Next Greater Element',
            problems: [
              { name: 'Next Greater Element I', lcId: 496, intuition: 'Monotonic decreasing stack + hash map for mapping nums1 to next greater in nums2.' },
            ],
          },
        ],
      },
      medium: {
        label: 'Core Patterns',
        groups: [
          {
            name: 'Temperature / Span',
            problems: [
              { name: 'Daily Temperatures', lcId: 739, intuition: 'Decreasing stack of indices. Pop when current temp > stack top; record distance.' },
              { name: 'Online Stock Span', lcId: 901, intuition: 'Monotonic decreasing stack of (price, span) pairs. Pop and accumulate spans.' },
              { name: 'Next Greater Element II', lcId: 503, intuition: 'Circular array: iterate 2n with modulo. Same monotonic stack logic.' },
            ],
          },
          {
            name: 'Pattern Matching',
            problems: [
              { name: '132 Pattern', lcId: 456, intuition: 'Reverse traversal. Stack holds candidates for "2". Track max popped as "3".' },
              { name: 'Remove K Digits', lcId: 402, intuition: 'Greedy monotonic increasing stack. Remove digits that create a dip.' },
              { name: 'Remove Duplicate Letters', lcId: 316, intuition: 'Monotonic increasing stack with frequency tracking. Smallest lexicographic result.' },
            ],
          },
          {
            name: 'Subarray Boundaries',
            problems: [
              { name: 'Sum of Subarray Minimums', lcId: 907, intuition: "For each element, find range where it's minimum using PLE/NLE stacks." },
              { name: 'Sum of Subarray Ranges', lcId: 2104, intuition: 'Sum of maxes - sum of mins. Use monotonic stacks for both.' },
              { name: 'Asteroid Collision', lcId: 735, intuition: 'Stack simulation: positive goes right, negative left. Resolve collisions on push.' },
            ],
          },
        ],
      },
      hard: {
        label: 'Advanced',
        groups: [
          {
            name: 'Histogram / Rectangle',
            problems: [
              { name: 'Largest Rectangle in Histogram', lcId: 84, intuition: 'Stack of heights. Pop calculates rectangle width between left/right bounds.' },
              { name: 'Maximal Rectangle', lcId: 85, intuition: 'Build histogram per row. Apply largest rectangle in histogram to each row.' },
              { name: 'Trapping Rain Water', lcId: 42, intuition: 'Monotonic decreasing stack. Pop computes water trapped between boundaries.' },
            ],
          },
          {
            name: 'Advanced Monotonic',
            problems: [
              { name: 'Maximum Width Ramp', lcId: 962, intuition: 'Build decreasing stack of candidates. Scan right-to-left for maximum width.' },
              { name: 'Shortest Subarray with Sum at Least K', lcId: 862, intuition: 'Monotonic deque on prefix sums. Remove non-useful candidates.' },
              { name: 'Number of Visible People in a Queue', lcId: 1944, intuition: 'Decreasing stack from right. Count pops + check if taller exists beyond.' },
            ],
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 3. GRAPHS & TREES
  // ═══════════════════════════════════════════════════════════════════
  graphs: {
    title: 'Graphs & Trees',
    desc: 'State exploration via BFS/DFS with cycle prevention, topological ordering, and tree traversals.',
    tiers: {
      easy: {
        label: 'Foundation',
        groups: [
          {
            name: 'Tree Traversal',
            problems: [
              { name: 'Binary Tree Inorder Traversal', lcId: 94, intuition: 'Left, Root, Right. Iterative with stack or Morris traversal.' },
              { name: 'Binary Tree Preorder Traversal', lcId: 144, intuition: 'Root, Left, Right. Stack: push right first, then left.' },
              { name: 'Binary Tree Postorder Traversal', lcId: 145, intuition: 'Left, Right, Root. Reverse of modified preorder or two-stack.' },
            ],
          },
          {
            name: 'Tree Properties',
            problems: [
              { name: 'Maximum Depth of Binary Tree', lcId: 104, intuition: 'DFS: return 1 + max(left, right). Base: null returns 0.' },
              { name: 'Same Tree', lcId: 100, intuition: 'Simultaneous DFS on both trees. Compare structure and values.' },
              { name: 'Symmetric Tree', lcId: 101, intuition: 'Mirror check: left.left matches right.right, left.right matches right.left.' },
              { name: 'Invert Binary Tree', lcId: 226, intuition: 'Swap left and right children recursively at every node.' },
              { name: 'Balanced Binary Tree', lcId: 110, intuition: 'DFS returns height. If |left-right| > 1, return -1 (unbalanced).' },
              { name: 'Diameter of Binary Tree', lcId: 543, intuition: 'At each node, diameter = leftHeight + rightHeight. Track global max.' },
              { name: 'Subtree of Another Tree', lcId: 572, intuition: 'At each node check subtree match. Combine with Same Tree.' },
            ],
          },
          {
            name: 'Simple Graph',
            problems: [
              { name: 'Flood Fill', lcId: 733, intuition: 'DFS/BFS from start pixel. Change color and recurse to 4-neighbors.' },
              { name: 'Island Perimeter', lcId: 463, intuition: 'Count land * 4 minus shared edges * 2. Or count boundary sides.' },
            ],
          },
        ],
      },
      medium: {
        label: 'Core Patterns',
        groups: [
          {
            name: 'BFS / Level Order',
            problems: [
              { name: 'Binary Tree Level Order Traversal', lcId: 102, intuition: 'Queue BFS. Process level by level using queue size.' },
              { name: 'Binary Tree Right Side View', lcId: 199, intuition: 'BFS, take last of each level. Or DFS right-first.' },
              { name: 'Rotting Oranges', lcId: 994, intuition: 'Multi-source BFS from all rotten. Count minutes until all rotten.' },
              { name: 'Shortest Path in Binary Matrix', lcId: 1091, intuition: 'BFS from (0,0) to (n-1,n-1) through 8-connected cells.' },
            ],
          },
          {
            name: 'DFS / Components',
            problems: [
              { name: 'Number of Islands', lcId: 200, intuition: 'DFS/BFS from each unvisited land. Each search = one island.' },
              { name: 'Clone Graph', lcId: 133, intuition: 'DFS with hash map original to clone. Avoid cycles via lookup.' },
              { name: 'Number of Provinces', lcId: 547, intuition: 'Adjacency matrix DFS/Union-Find. Count connected components.' },
              { name: 'Pacific Atlantic Water Flow', lcId: 417, intuition: 'Reverse DFS from each ocean border. Find cells reachable from both.' },
              { name: 'Surrounded Regions', lcId: 130, intuition: 'DFS from border O cells (mark safe). Flip remaining O to X.' },
              { name: 'Max Area of Island', lcId: 695, intuition: 'DFS from each land cell, count area. Track global maximum.' },
            ],
          },
          {
            name: 'Topological Sort',
            problems: [
              { name: 'Course Schedule', lcId: 207, intuition: 'Detect cycle in directed graph. BFS Kahn or DFS 3-color.' },
              { name: 'Course Schedule II', lcId: 210, intuition: "Kahn's algorithm: process zero in-degree. Output = topo order." },
            ],
          },
          {
            name: 'BST Operations',
            problems: [
              { name: 'Validate Binary Search Tree', lcId: 98, intuition: 'Inorder must be strictly increasing. Or pass (min, max) bounds.' },
              { name: 'Kth Smallest Element in a BST', lcId: 230, intuition: 'Inorder traversal, decrement k at each visit. Stop at k=0.' },
              { name: 'Lowest Common Ancestor of a BST', lcId: 235, intuition: 'Both < root go left, both > root go right, else root is LCA.' },
              { name: 'Lowest Common Ancestor of a Binary Tree', lcId: 236, intuition: 'Post-order DFS. If left and right both non-null, current is LCA.' },
              { name: 'Construct Binary Tree from Preorder and Inorder', lcId: 105, intuition: 'Preorder first = root. Find in inorder to split subtrees.' },
            ],
          },
          {
            name: 'Graph Algorithms',
            problems: [
              { name: 'Network Delay Time', lcId: 743, intuition: 'Dijkstra from source. Answer = max distance to any reachable node.' },
              { name: 'Redundant Connection', lcId: 684, intuition: 'Union-Find: edge creating a cycle is the answer.' },
              { name: 'Evaluate Division', lcId: 399, intuition: 'Weighted graph. DFS from numerator to denominator, multiply weights.' },
            ],
          },
          {
            name: 'Tree Path Problems',
            problems: [
              { name: 'Path Sum', lcId: 112, intuition: 'DFS subtracting node values. At leaf, check if remaining = 0.' },
              { name: 'Path Sum II', lcId: 113, intuition: 'Backtracking DFS collecting paths. Add to result when leaf matches.' },
              { name: 'Path Sum III', lcId: 437, intuition: 'Prefix sum hash map during DFS. Count paths with target sum.' },
              { name: 'Binary Tree Maximum Path Sum', lcId: 124, intuition: 'At each node, max through it = node + max(0,left) + max(0,right). Track global max.' },
            ],
          },
        ],
      },
      hard: {
        label: 'Advanced',
        groups: [
          {
            name: 'Advanced BFS',
            problems: [
              { name: 'Word Ladder', lcId: 127, intuition: 'BFS level by level. Generate all 1-char mutations. Bidirectional for speed.' },
              { name: 'Sliding Puzzle', lcId: 773, intuition: 'BFS on board states. State = serialized board. Find shortest swaps.' },
            ],
          },
          {
            name: 'Tree Serialization',
            problems: [
              { name: 'Serialize and Deserialize Binary Tree', lcId: 297, intuition: 'BFS or preorder with null markers. Reconstruct using queue/recursion.' },
            ],
          },
          {
            name: 'Advanced Graph',
            problems: [
              { name: 'Swim in Rising Water', lcId: 778, intuition: 'Binary search + BFS, or Dijkstra: min-max elevation path.' },
              { name: 'Cheapest Flights Within K Stops', lcId: 787, intuition: 'BFS with level limit k, or Bellman-Ford for k+1 iterations.' },
              { name: 'Reconstruct Itinerary', lcId: 332, intuition: "Hierholzer's for Eulerian path. DFS with sorted adjacency." },
              { name: 'Critical Connections in a Network', lcId: 1192, intuition: "Tarjan's bridge-finding. Track discovery time and low-link." },
            ],
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 4. TWO POINTERS
  // ═══════════════════════════════════════════════════════════════════
  'two-pointers': {
    title: 'Two Pointers',
    desc: 'Converging or parallel index pointers to search sorted spaces in linear time.',
    tiers: {
      easy: {
        label: 'Foundation',
        groups: [
          {
            name: 'Opposite Ends',
            problems: [
              { name: 'Valid Palindrome', lcId: 125, intuition: 'Left/right converge, skip non-alphanumeric, compare chars.' },
              { name: 'Two Sum II - Input Array Is Sorted', lcId: 167, intuition: 'L and R converge. sum < target: L++; sum > target: R--.' },
              { name: 'Reverse String', lcId: 344, intuition: 'Swap s[L] and s[R], then L++, R--. In-place O(1) space.' },
              { name: 'Squares of a Sorted Array', lcId: 977, intuition: 'Two pointers from ends. Compare abs values, fill result from back.' },
            ],
          },
          {
            name: 'Merge Pattern',
            problems: [
              { name: 'Merge Sorted Array', lcId: 88, intuition: 'Fill from back. Compare nums1[i] and nums2[j], place larger at end.' },
              { name: 'Intersection of Two Arrays II', lcId: 350, intuition: 'Sort both, advance the smaller pointer. Collect matches.' },
            ],
          },
        ],
      },
      medium: {
        label: 'Core Patterns',
        groups: [
          {
            name: 'Sum Problems',
            problems: [
              { name: '3Sum', lcId: 15, intuition: 'Sort. Fix one element, two-pointer on rest. Skip duplicates.' },
              { name: '3Sum Closest', lcId: 16, intuition: 'Sort. Fix one, two-pointer for closest sum. Track min diff.' },
              { name: '4Sum', lcId: 18, intuition: 'Two nested loops + two-pointer inner. Skip duplicates at each level.' },
            ],
          },
          {
            name: 'Container / Area',
            problems: [
              { name: 'Container With Most Water', lcId: 11, intuition: 'Move shorter line inward. Width shrinks, only taller improves area.' },
              { name: 'Sort Colors', lcId: 75, intuition: 'Dutch National Flag: three pointers (low, mid, high) partition 0s/1s/2s.' },
            ],
          },
          {
            name: 'Fast & Slow',
            problems: [
              { name: 'Remove Duplicates from Sorted Array', lcId: 26, intuition: 'Slow marks insert position. Fast scans for new unique values.' },
              { name: 'Remove Duplicates from Sorted Array II', lcId: 80, intuition: 'Allow at most 2 duplicates. Compare with nums[slow-2].' },
              { name: 'Move Zeroes', lcId: 283, intuition: 'Slow tracks next non-zero position. Fast finds non-zeros to swap.' },
              { name: 'Remove Element', lcId: 27, intuition: 'Slow pointer tracks valid position. Skip elements equal to val.' },
            ],
          },
          {
            name: 'String Two Pointers',
            problems: [
              { name: 'Valid Palindrome II', lcId: 680, intuition: 'On mismatch, try skipping left or right. Check if remainder is palindrome.' },
              { name: 'Reverse Words in a String', lcId: 151, intuition: 'Reverse entire string, then reverse each word.' },
              { name: 'String Compression', lcId: 443, intuition: 'Read pointer scans groups, write pointer compresses in-place.' },
            ],
          },
        ],
      },
      hard: {
        label: 'Advanced',
        groups: [
          {
            name: 'Advanced Two Pointers',
            problems: [
              { name: 'Trapping Rain Water', lcId: 42, intuition: 'Two pointers from edges. Water = min(leftMax, rightMax) - height.' },
              { name: 'Shortest Unsorted Continuous Subarray', lcId: 581, intuition: 'Find rightmost out-of-order from left, leftmost from right.' },
            ],
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 5. SLIDING WINDOW
  // ═══════════════════════════════════════════════════════════════════
  'sliding-window': {
    title: 'Sliding Window',
    desc: 'Expand and contract subarray bounds [L, R] for O(N) linear time range queries.',
    tiers: {
      easy: {
        label: 'Foundation',
        groups: [
          {
            name: 'Fixed Window',
            problems: [
              { name: 'Maximum Average Subarray I', lcId: 643, intuition: 'Fixed window size k. Add nums[R], subtract nums[L] for running sum.' },
              { name: 'Contains Duplicate II', lcId: 219, intuition: 'Sliding window of size k with hash set. Check membership before add.' },
            ],
          },
        ],
      },
      medium: {
        label: 'Core Patterns',
        groups: [
          {
            name: 'Variable Window (Longest)',
            problems: [
              { name: 'Longest Substring Without Repeating Characters', lcId: 3, intuition: 'Expand R, on duplicate move L past last occurrence. Hash map tracks indices.' },
              { name: 'Longest Repeating Character Replacement', lcId: 424, intuition: 'Valid when windowLen - maxFreq <= k. Shrink L when invalid.' },
              { name: 'Max Consecutive Ones III', lcId: 1004, intuition: 'Window with at most k zeros. Shrink L when zero count exceeds k.' },
              { name: 'Fruit Into Baskets', lcId: 904, intuition: 'Longest subarray with at most 2 distinct. Shrink on 3rd type.' },
              { name: "Longest Subarray of 1's After Deleting One Element", lcId: 1493, intuition: 'Window with at most 1 zero. Track length minus 1.' },
            ],
          },
          {
            name: 'Variable Window (Shortest)',
            problems: [
              { name: 'Minimum Size Subarray Sum', lcId: 209, intuition: 'Expand R until sum >= target, shrink L to find minimum valid window.' },
              { name: 'Subarray Product Less Than K', lcId: 713, intuition: 'Expand R multiply. Shrink L divide until product < k. Count subarrays.' },
            ],
          },
          {
            name: 'Frequency Window',
            problems: [
              { name: 'Permutation in String', lcId: 567, intuition: 'Fixed window = len(s1). Compare frequency maps. Slide and update.' },
              { name: 'Find All Anagrams in a String', lcId: 438, intuition: 'Same as permutation but collect all starting indices where freqs match.' },
              { name: 'Maximum Number of Vowels in a Substring of Given Length', lcId: 1456, intuition: 'Fixed window of size k. Track vowel count, update on slide.' },
            ],
          },
        ],
      },
      hard: {
        label: 'Advanced',
        groups: [
          {
            name: 'Complex Constraint Windows',
            problems: [
              { name: 'Minimum Window Substring', lcId: 76, intuition: 'Expand R to include all chars of t. Shrink L to find min valid window.' },
              { name: 'Sliding Window Maximum', lcId: 239, intuition: 'Monotonic decreasing deque. Front = window max. Evict out-of-bounds.' },
              { name: 'Substring with Concatenation of All Words', lcId: 30, intuition: 'Fixed window = totalLen. Check all word-sized offsets. Frequency map.' },
            ],
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 6. BINARY SEARCH
  // ═══════════════════════════════════════════════════════════════════
  binsearch: {
    title: 'Binary Search',
    desc: 'Halve search space using monotonicity or boolean predicates for O(log N) solutions.',
    tiers: {
      easy: {
        label: 'Foundation',
        groups: [
          {
            name: 'Classic Binary Search',
            problems: [
              { name: 'Binary Search', lcId: 704, intuition: 'Standard halving. mid = L + (R-L)/2. Adjust L or R.' },
              { name: 'Search Insert Position', lcId: 35, intuition: 'Binary search for target or insertion point. Return L when not found.' },
              { name: 'First Bad Version', lcId: 278, intuition: 'Binary search on boolean predicate isBadVersion(). Find leftmost true.' },
              { name: 'Guess Number Higher or Lower', lcId: 374, intuition: 'Binary search with 3-way comparison. Narrow based on guess.' },
              { name: 'Sqrt(x)', lcId: 69, intuition: 'Binary search [0, x]. Find largest n where n*n <= x.' },
            ],
          },
        ],
      },
      medium: {
        label: 'Core Patterns',
        groups: [
          {
            name: 'Rotated Array',
            problems: [
              { name: 'Search in Rotated Sorted Array', lcId: 33, intuition: 'One half always sorted. Check if target is in sorted half.' },
              { name: 'Search in Rotated Sorted Array II', lcId: 81, intuition: 'Duplicates: when nums[L]==nums[mid]==nums[R], shrink both.' },
              { name: 'Find Minimum in Rotated Sorted Array', lcId: 153, intuition: 'Compare mid with right. If mid > right, min is in right half.' },
            ],
          },
          {
            name: 'Search on Answer',
            problems: [
              { name: 'Koko Eating Bananas', lcId: 875, intuition: 'Binary search speed [1, max]. Feasibility: can finish in h hours.' },
              { name: 'Capacity To Ship Packages Within D Days', lcId: 1011, intuition: 'Binary search capacity. Feasibility: greedily pack into d days.' },
              { name: 'Split Array Largest Sum', lcId: 410, intuition: 'Binary search max subarray sum. Feasibility: split into <= k parts.' },
              { name: 'Magnetic Force Between Two Balls', lcId: 1552, intuition: 'Binary search min distance. Feasibility: place m balls with gap.' },
            ],
          },
          {
            name: 'Matrix / 2D Search',
            problems: [
              { name: 'Search a 2D Matrix', lcId: 74, intuition: 'Treat as sorted 1D. row = mid/cols, col = mid%cols.' },
              { name: 'Search a 2D Matrix II', lcId: 240, intuition: 'Start top-right. < go left; > go down. O(m+n).' },
              { name: 'Find Peak Element', lcId: 162, intuition: 'If nums[mid] < nums[mid+1], peak right. Gradient binary search.' },
            ],
          },
          {
            name: 'Boundary Finding',
            problems: [
              { name: 'Find First and Last Position of Element in Sorted Array', lcId: 34, intuition: 'Two binary searches: leftmost and rightmost occurrence.' },
              { name: 'Time Based Key-Value Store', lcId: 981, intuition: 'Hash map + binary search on timestamps. Find largest <= query.' },
            ],
          },
        ],
      },
      hard: {
        label: 'Advanced',
        groups: [
          {
            name: 'Advanced Binary Search',
            problems: [
              { name: 'Median of Two Sorted Arrays', lcId: 4, intuition: 'Binary search partition in smaller array. Balance left/right halves.' },
              { name: 'Find in Mountain Array', lcId: 1095, intuition: 'Find peak, then binary search ascending and descending halves.' },
            ],
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 7. HEAPS & HASH TABLES
  // ═══════════════════════════════════════════════════════════════════
  heaps: {
    title: 'Heaps & Hash Tables',
    desc: 'Priority queues for dynamic extremum extraction. Hash tables for O(1) lookups.',
    tiers: {
      easy: {
        label: 'Foundation',
        groups: [
          {
            name: 'Hash Map Basics',
            problems: [
              { name: 'Two Sum', lcId: 1, intuition: 'Hash map: store complement. One pass check target-num exists.' },
              { name: 'Valid Anagram', lcId: 242, intuition: 'Frequency array of 26 chars. Compare counts.' },
              { name: 'Contains Duplicate', lcId: 217, intuition: 'Hash set: if element exists, return true.' },
              { name: 'Ransom Note', lcId: 383, intuition: 'Frequency count of magazine. Check ransom can be built.' },
              { name: 'Isomorphic Strings', lcId: 205, intuition: 'Two hash maps for bidirectional char mapping. Check consistency.' },
              { name: 'Word Pattern', lcId: 290, intuition: 'Bijection between pattern chars and words. Two maps.' },
            ],
          },
          {
            name: 'Hash Set',
            problems: [
              { name: 'Happy Number', lcId: 202, intuition: "Floyd's cycle detection or hash set on digit-square sums." },
              { name: 'Intersection of Two Arrays', lcId: 349, intuition: 'Hash set of first array. Filter second by membership.' },
              { name: 'Longest Consecutive Sequence', lcId: 128, intuition: 'Hash set. For each start (no num-1), count consecutive length.' },
            ],
          },
        ],
      },
      medium: {
        label: 'Core Patterns',
        groups: [
          {
            name: 'Top K / Frequency',
            problems: [
              { name: 'Kth Largest Element in an Array', lcId: 215, intuition: 'Min-heap of size k. Root = kth largest.' },
              { name: 'Top K Frequent Elements', lcId: 347, intuition: 'Frequency map + min-heap of size k. Or bucket sort.' },
              { name: 'Sort Characters By Frequency', lcId: 451, intuition: 'Frequency map + max-heap or bucket sort.' },
              { name: 'K Closest Points to Origin', lcId: 973, intuition: 'Max-heap of size k by distance. Or quickselect.' },
              { name: 'Task Scheduler', lcId: 621, intuition: 'Max-heap of frequencies. Schedule most frequent first with cooldown.' },
            ],
          },
          {
            name: 'Two Heaps',
            problems: [
              { name: 'Find Median from Data Stream', lcId: 295, intuition: 'Max-heap lower + min-heap upper. Balance sizes. Median from tops.' },
              { name: 'IPO', lcId: 502, intuition: 'Min-heap by capital, max-heap by profit. Greedily pick best affordable.' },
            ],
          },
          {
            name: 'Multi-Way Merge',
            problems: [
              { name: 'Merge k Sorted Lists', lcId: 23, intuition: 'Min-heap of k heads. Pop min, push its next.' },
              { name: 'Kth Smallest Element in a Sorted Matrix', lcId: 378, intuition: 'Min-heap of (val, row, col). Pop k times.' },
            ],
          },
          {
            name: 'Hash Map Patterns',
            problems: [
              { name: 'Group Anagrams', lcId: 49, intuition: 'Hash map with sorted-word key. Group by same key.' },
              { name: 'Subarray Sum Equals K', lcId: 560, intuition: 'Prefix sum + hash map. Count where current - k was seen.' },
              { name: 'LRU Cache', lcId: 146, intuition: 'Hash map + doubly-linked list. O(1) get/put with eviction.' },
            ],
          },
        ],
      },
      hard: {
        label: 'Advanced',
        groups: [
          {
            name: 'Advanced Heap',
            problems: [
              { name: 'Sliding Window Median', lcId: 480, intuition: 'Two heaps or sorted set with lazy deletion for sliding window.' },
              { name: 'Trapping Rain Water II', lcId: 407, intuition: 'Min-heap BFS from border inward. Process lowest boundary first.' },
              { name: 'Reorganize String', lcId: 767, intuition: 'Max-heap by frequency. Alternate placing most frequent char.' },
            ],
          },
          {
            name: 'Advanced Hash',
            problems: [
              { name: 'LFU Cache', lcId: 460, intuition: 'Hash map + frequency buckets (DLL per frequency). Track min freq.' },
              { name: 'Minimum Window Substring', lcId: 76, intuition: 'Hash map frequency matching. Expand R, shrink L to minimize.' },
            ],
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 8. PREFIX SUM
  // ═══════════════════════════════════════════════════════════════════
  'prefix-sum': {
    title: 'Prefix Sum & Cumulative Query',
    desc: 'Precompute running totals for O(1) arbitrary range sum queries.',
    tiers: {
      easy: {
        label: 'Foundation',
        groups: [
          {
            name: '1D Prefix Sum',
            problems: [
              { name: 'Running Sum of 1d Array', lcId: 1480, intuition: 'In-place: prefix[i] = prefix[i-1] + nums[i].' },
              { name: 'Find Pivot Index', lcId: 724, intuition: 'Total - leftSum - nums[i] = leftSum. Scan for condition.' },
              { name: 'Range Sum Query - Immutable', lcId: 303, intuition: 'Prefix sum. sumRange(l,r) = prefix[r+1] - prefix[l].' },
            ],
          },
        ],
      },
      medium: {
        label: 'Core Patterns',
        groups: [
          {
            name: 'Hash Map + Prefix Sum',
            problems: [
              { name: 'Subarray Sum Equals K', lcId: 560, intuition: 'Hash map of prefix frequencies. If prefix-k was seen, valid subarray.' },
              { name: 'Continuous Subarray Sum', lcId: 523, intuition: 'Prefix mod k. Same remainder at indices >= 2 apart returns true.' },
              { name: 'Subarray Sums Divisible by K', lcId: 974, intuition: 'Count prefix remainders mod k. Pairs with same remainder are valid.' },
              { name: 'Binary Subarrays With Sum', lcId: 930, intuition: 'Prefix sum hash map. Count pairs where prefix[j] - prefix[i] = goal.' },
            ],
          },
          {
            name: 'Difference Array',
            problems: [
              { name: 'Car Pooling', lcId: 1094, intuition: 'Difference array over stops. Add at pickup, remove at dropoff.' },
              { name: 'Corporate Flight Bookings', lcId: 1109, intuition: 'Difference array: +seats at first, -seats at last+1. Prefix sum.' },
            ],
          },
          {
            name: '2D Prefix Sum',
            problems: [
              { name: 'Range Sum Query 2D - Immutable', lcId: 304, intuition: 'Inclusion-exclusion: sum = dp[r2][c2] - dp[r1-1][c2] - dp[r2][c1-1] + dp[r1-1][c1-1].' },
              { name: 'Matrix Block Sum', lcId: 1314, intuition: '2D prefix sum + bounded query for each cell k-radius.' },
            ],
          },
        ],
      },
      hard: {
        label: 'Advanced',
        groups: [
          {
            name: 'Advanced Prefix Sum',
            problems: [
              { name: 'Count of Range Sum', lcId: 327, intuition: 'Merge sort on prefix sums. Count pairs in [lower, upper] range.' },
              { name: 'Maximum Sum of 3 Non-Overlapping Subarrays', lcId: 689, intuition: 'Prefix sums + track best left/right positions. DP on 3 segments.' },
              { name: 'Number of Submatrices That Sum to Target', lcId: 1074, intuition: 'Fix top/bottom rows, compress to 1D prefix + hash map.' },
            ],
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 9. LINKED LIST
  // ═══════════════════════════════════════════════════════════════════
  'linked-list': {
    title: 'Linked List',
    desc: 'Pointer manipulation, dummy sentinels, fast/slow runners, and in-place node relinking.',
    tiers: {
      easy: {
        label: 'Foundation',
        groups: [
          {
            name: 'Basic Operations',
            problems: [
              { name: 'Reverse Linked List', lcId: 206, intuition: 'Three pointers: prev, curr, next. Reverse curr.next to prev.' },
              { name: 'Merge Two Sorted Lists', lcId: 21, intuition: 'Dummy head + compare. Attach smaller, advance pointer.' },
              { name: 'Linked List Cycle', lcId: 141, intuition: 'Fast 2x, slow 1x. If they meet, cycle exists.' },
              { name: 'Remove Duplicates from Sorted List', lcId: 83, intuition: 'Compare current with next. Skip if duplicate.' },
              { name: 'Palindrome Linked List', lcId: 234, intuition: 'Find mid, reverse second half, compare halves.' },
              { name: 'Middle of the Linked List', lcId: 876, intuition: 'Fast 2x, slow 1x. When fast ends, slow is at middle.' },
              { name: 'Remove Linked List Elements', lcId: 203, intuition: 'Dummy head handles removing head. Skip matching nodes.' },
              { name: 'Intersection of Two Linked Lists', lcId: 160, intuition: 'Two pointers redirect to other head at end. Meet at intersection.' },
            ],
          },
        ],
      },
      medium: {
        label: 'Core Patterns',
        groups: [
          {
            name: 'Reversal Variants',
            problems: [
              { name: 'Reverse Linked List II', lcId: 92, intuition: 'Navigate to left-1. Reverse sublist. Reconnect.' },
              { name: 'Swap Nodes in Pairs', lcId: 24, intuition: 'Dummy head. Swap adjacent pairs by pointer manipulation.' },
              { name: 'Rotate List', lcId: 61, intuition: 'Find length, make circular. Break at len - k%len.' },
              { name: 'Reorder List', lcId: 143, intuition: 'Find mid, reverse second half, interleave both.' },
            ],
          },
          {
            name: 'Fast & Slow / Cycle',
            problems: [
              { name: 'Linked List Cycle II', lcId: 142, intuition: "Floyd's: meet point, reset slow to head, advance both by 1." },
              { name: 'Remove Nth Node From End of List', lcId: 19, intuition: 'Fast leads by n. When fast ends, slow is at target-1.' },
              { name: 'Sort List', lcId: 148, intuition: 'Merge sort. Split with fast/slow, merge halves recursively.' },
              { name: 'Odd Even Linked List', lcId: 328, intuition: 'Separate odd/even indexed into two lists, then connect.' },
            ],
          },
          {
            name: 'Construction',
            problems: [
              { name: 'Add Two Numbers', lcId: 2, intuition: 'Digit-by-digit addition with carry. Build result list.' },
              { name: 'Add Two Numbers II', lcId: 445, intuition: 'Reverse both (or stacks), add digit by digit.' },
              { name: 'Partition List', lcId: 86, intuition: 'Two dummy heads: < x and >= x. Concatenate.' },
              { name: 'Copy List with Random Pointer', lcId: 138, intuition: 'Hash map old to new. Two passes: create, then wire.' },
              { name: 'Flatten a Multilevel Doubly Linked List', lcId: 430, intuition: 'DFS with stack. Push next when child exists, process child.' },
            ],
          },
        ],
      },
      hard: {
        label: 'Advanced',
        groups: [
          {
            name: 'Advanced Operations',
            problems: [
              { name: 'Merge k Sorted Lists', lcId: 23, intuition: 'Min-heap of k heads. Or divide-and-conquer pairwise merge.' },
              { name: 'Reverse Nodes in k-Group', lcId: 25, intuition: 'Count k ahead. Reverse k-group in-place. Recurse rest.' },
            ],
          },
          {
            name: 'Complex Manipulation',
            problems: [
              { name: 'LRU Cache', lcId: 146, intuition: 'DLL + hash map. Move accessed to front, evict from tail.' },
              { name: 'LFU Cache', lcId: 460, intuition: 'Hash map + freq buckets (DLL per freq). Track min frequency.' },
            ],
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 10. BINARY TREES & BST
  // ═══════════════════════════════════════════════════════════════════
  trees: {
    title: 'Binary Tree & BST',
    desc: 'Hierarchical node traversal, recursive subproblem decomposition, binary search tree ordering, and structural invariants.',
    tiers: {
      easy: {
        label: 'Foundation',
        groups: [
          {
            name: 'Basic Traversals & Properties',
            problems: [
              { name: 'Maximum Depth of Binary Tree', lcId: 104, intuition: 'Post-order DFS: depth = 1 + max(left, right). Base case root == null returns 0.' },
              { name: 'Invert Binary Tree', lcId: 226, intuition: 'Swap left and right children recursively for every node.' },
              { name: 'Same Tree', lcId: 100, intuition: 'Structural equality: compare values and recurse on both subtrees.' },
              { name: 'Symmetric Tree', lcId: 101, intuition: 'Mirror check: t1.left matches t2.right and t1.right matches t2.left.' },
              { name: 'Diameter of Binary Tree', lcId: 543, intuition: 'At each node, update max diameter with leftDepth + rightDepth; return depth.' },
            ],
          },
        ],
      },
      medium: {
        label: 'Core Patterns',
        groups: [
          {
            name: 'Level Order & Views',
            problems: [
              { name: 'Binary Tree Level Order Traversal', lcId: 102, intuition: 'Queue BFS: process nodes in batch of queue.size() per level.' },
              { name: 'Binary Tree Right Side View', lcId: 199, intuition: 'Level order BFS taking the last element of each queue level.' },
              { name: 'Binary Tree Zigzag Level Order Traversal', lcId: 103, intuition: 'BFS level order with alternating reverse on odd levels.' },
            ],
          },
          {
            name: 'LCA & Path Sums',
            problems: [
              { name: 'Lowest Common Ancestor of a Binary Tree', lcId: 236, intuition: 'Post-order DFS: if root matches p or q, return root; if both subtrees return non-null, root is LCA.' },
              { name: 'Path Sum II', lcId: 113, intuition: 'DFS backtracking with running path and target sum decrement.' },
              { name: 'Path Sum III', lcId: 437, intuition: 'Prefix sum hash map on tree paths. Check count of (currSum - target).' },
            ],
          },
          {
            name: 'BST Invariant',
            problems: [
              { name: 'Validate Binary Search Tree', lcId: 98, intuition: 'In-order traversal is strictly increasing, or pass valid (min, max) bounds.' },
              { name: 'Kth Smallest Element in a BST', lcId: 230, intuition: 'In-order traversal visits BST elements in ascending sorted order.' },
              { name: 'Lowest Common Ancestor of a BST', lcId: 235, intuition: 'If both p, q < root go left; if both > root go right; else split point is LCA.' },
            ],
          },
          {
            name: 'Construction',
            problems: [
              { name: 'Construct Binary Tree from Preorder and Inorder Traversal', lcId: 105, intuition: 'Preorder root, locate in inorder hash map to partition left/right subtrees.' },
            ],
          },
        ],
      },
      hard: {
        label: 'Advanced',
        groups: [
          {
            name: 'Tree Extremum & Serialization',
            problems: [
              { name: 'Binary Tree Maximum Path Sum', lcId: 124, intuition: 'Post-order: max gain = node.val + max(0, left) + max(0, right). Global max track.' },
              { name: 'Serialize and Deserialize Binary Tree', lcId: 297, intuition: 'Preorder DFS with delimiter and sentinel null values (#).' },
              { name: 'Recover Binary Search Tree', lcId: 99, intuition: 'In-order traversal to locate the two out-of-order swapped nodes, swap values.' },
            ],
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 11. BACKTRACKING
  // ═══════════════════════════════════════════════════════════════════
  backtracking: {
    title: 'Backtracking',
    desc: 'Systematic exploration of decision trees with state pruning, candidate branch rollbacks, and constraint satisfaction.',
    tiers: {
      easy: {
        label: 'Foundation',
        groups: [
          {
            name: 'State Rollback Basics',
            problems: [
              { name: 'Subsets', lcId: 78, intuition: 'Choose or skip decision at each index, or iterate branching from startIndex.' },
              { name: 'Combinations', lcId: 77, intuition: 'Pick k elements from 1..n. Prune loop if remaining candidates < required.' },
            ],
          },
        ],
      },
      medium: {
        label: 'Core Patterns',
        groups: [
          {
            name: 'Permutations & Sums',
            problems: [
              { name: 'Permutations', lcId: 46, intuition: 'Track used elements with boolean visited array or swap elements in-place.' },
              { name: 'Combination Sum', lcId: 39, intuition: 'Unlimited reuse of candidates: recurse on same index after choosing candidate.' },
              { name: 'Combination Sum II', lcId: 40, intuition: 'Sort candidates. Skip duplicates at same recursion depth: if (i > start && nums[i] == nums[i-1]) continue.' },
            ],
          },
          {
            name: 'Grid & String Backtracking',
            problems: [
              { name: 'Word Search', lcId: 79, intuition: 'Grid DFS with mark visited in-place (board[r][c] = #) and revert on backtrack.' },
              { name: 'Palindrome Partitioning', lcId: 131, intuition: 'Explore prefix substrings. If palindrome, recurse on remainder.' },
              { name: 'Generate Parentheses', lcId: 22, intuition: 'Add ( if open < n; add ) if close < open. Stop when length reaches 2n.' },
            ],
          },
        ],
      },
      hard: {
        label: 'Advanced',
        groups: [
          {
            name: 'Constraint Satisfaction',
            problems: [
              { name: 'N-Queens', lcId: 51, intuition: 'Place queen row by row. Track column, main diagonal (r-c), and anti-diagonal (r+c) sets.' },
              { name: 'Sudoku Solver', lcId: 37, intuition: 'Find empty cell, try digits 1..9 matching row, col, and 3x3 box bitmasks.' },
              { name: 'Word Search II', lcId: 212, intuition: 'Trie prefix tree combined with grid DFS backtracking for multi-word search.' },
            ],
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 12. TRIE (PREFIX TREE)
  // ═══════════════════════════════════════════════════════════════════
  trie: {
    title: 'Trie (Prefix Tree)',
    desc: 'Multi-branch tree optimized for prefix queries, dictionary lookups, autocomplete, and bitwise XOR maximization.',
    tiers: {
      easy: {
        label: 'Foundation',
        groups: [
          {
            name: 'Basic Trie Node Operations',
            problems: [
              { name: 'Implement Trie (Prefix Tree)', lcId: 208, intuition: 'Array children[26] and isEnd flag. Insert char by char; search prefix in O(L).' },
            ],
          },
        ],
      },
      medium: {
        label: 'Core Patterns',
        groups: [
          {
            name: 'Wildcard & Dictionary Patterns',
            problems: [
              { name: 'Design Add and Search Words Data Structure', lcId: 211, intuition: 'DFS on dot wildcard: for . child, recurse through all 26 non-null branches.' },
              { name: 'Replace Words', lcId: 648, intuition: 'Insert dictionary roots into Trie. For each word, find shortest root prefix.' },
              { name: 'Longest Word in Dictionary', lcId: 720, intuition: 'Build Trie, find longest word formed by nodes that all have isEnd == true.' },
            ],
          },
        ],
      },
      hard: {
        label: 'Advanced',
        groups: [
          {
            name: 'Bitwise XOR & Multi-Word Search',
            problems: [
              { name: 'Maximum XOR of Two Numbers in an Array', lcId: 421, intuition: 'Binary bitwise Trie (0/1 branches). For each bit, greedily match opposite bit.' },
              { name: 'Word Search II', lcId: 212, intuition: 'Store words in Trie. Prune Trie leaves during grid search to eliminate dead ends.' },
              { name: 'Maximum Genetic Difference Query', lcId: 1938, intuition: 'Offline queries with tree DFS + persistent binary Trie insertions/removals.' },
            ],
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 13. BIT MANIPULATION
  // ═══════════════════════════════════════════════════════════════════
  'bit-manipulation': {
    title: 'Bit Manipulation',
    desc: 'Compact binary representation, bitwise arithmetic, XOR cancellation, and state compression with bitmasks.',
    tiers: {
      easy: {
        label: 'Foundation',
        groups: [
          {
            name: 'Bitwise Fundamentals',
            problems: [
              { name: 'Single Number', lcId: 136, intuition: 'XOR property: x ^ x = 0 and x ^ 0 = x. Running XOR cancels all paired numbers.' },
              { name: 'Number of 1 Bits', lcId: 191, intuition: 'Brian Kernighan: n &= (n - 1) clears lowest set bit in O(count of 1s).' },
              { name: 'Counting Bits', lcId: 338, intuition: 'dp[i] = dp[i >> 1] + (i & 1). Bit count is parent shifted right plus last bit.' },
              { name: 'Reverse Bits', lcId: 190, intuition: 'Iterate 32 bits: result = (result << 1) | (n & 1); n >>= 1.' },
            ],
          },
        ],
      },
      medium: {
        label: 'Core Patterns',
        groups: [
          {
            name: 'Bitmask Subsets & Cancellations',
            problems: [
              { name: 'Subsets', lcId: 78, intuition: 'Bitmask iteration 0..(1<<n)-1. If (mask & (1<<j)), include nums[j].' },
              { name: 'Single Number II', lcId: 137, intuition: 'Count bit sum modulo 3 across all numbers for each of 32 bits.' },
              { name: 'Single Number III', lcId: 260, intuition: 'XOR sum = a ^ b. Find lowest set bit (xor & -xor) to partition array into two groups.' },
              { name: 'Bitwise AND of Numbers Range', lcId: 201, intuition: 'Find common prefix of binary representations of left and right.' },
            ],
          },
        ],
      },
      hard: {
        label: 'Advanced',
        groups: [
          {
            name: 'Bitmask DP & Optimization',
            problems: [
              { name: 'Maximum Product of Word Lengths', lcId: 318, intuition: 'Precompute 26-bit mask for each word. (maskA & maskB) == 0 means disjoint.' },
              { name: 'Shortest Path Visiting All Nodes', lcId: 847, intuition: 'BFS on state (node, visited_bitmask) to find minimum steps to (1<<n)-1.' },
            ],
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 14. UNION-FIND (DISJOINT SET UNION)
  // ═══════════════════════════════════════════════════════════════════
  'union-find': {
    title: 'Union-Find (DSU)',
    desc: 'Dynamic connectivity, connected component merging, cycle detection in undirected graphs, and rank/path compression.',
    tiers: {
      easy: {
        label: 'Foundation',
        groups: [
          {
            name: 'Component Connectivity',
            problems: [
              { name: 'Number of Provinces', lcId: 547, intuition: 'DSU over matrix: union connected cities. Total provinces = distinct root parents.' },
            ],
          },
        ],
      },
      medium: {
        label: 'Core Patterns',
        groups: [
          {
            name: 'Cycle Detection & Merging',
            problems: [
              { name: 'Redundant Connection', lcId: 684, intuition: 'If find(u) == find(v), edge (u, v) creates a cycle and is redundant.' },
              { name: 'Accounts Merge', lcId: 721, intuition: 'Map email to ID. Union emails under same account. Group emails by parent ID.' },
              { name: 'Number of Connected Components in an Undirected Graph', lcId: 323, intuition: 'Initialize count = n. Each successful union(u, v) decrements count by 1.' },
              { name: 'Satisfiability of Equality Equations', lcId: 990, intuition: 'Union all == equations first. Then verify no != equation has find(a) == find(b).' },
            ],
          },
        ],
      },
      hard: {
        label: 'Advanced',
        groups: [
          {
            name: 'Grid & MST Transformations',
            problems: [
              { name: 'Swim in Rising Water', lcId: 778, intuition: 'Sort cells by elevation. Greedily union adjacent cells until (0,0) and (n-1,n-1) connect.' },
              { name: 'Min Cost to Connect All Points', lcId: 1584, intuition: 'Kruskal algorithm: sort all edges by Manhattan distance, union points without cycle.' },
              { name: 'Longest Consecutive Sequence', lcId: 128, intuition: 'Union adjacent integers (x, x+1) using hash map DSU or hash set lookahead.' },
            ],
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 15. GREEDY & INTERVALS
  // ═══════════════════════════════════════════════════════════════════
  greedy: {
    title: 'Greedy & Intervals',
    desc: 'Locally optimal decisions leading to global optimum, interval merging, sweep line scheduling, and resource allocation.',
    tiers: {
      easy: {
        label: 'Foundation',
        groups: [
          {
            name: 'Interval Sorting Basics',
            problems: [
              { name: 'Assign Cookies', lcId: 455, intuition: 'Sort children greed and cookies. Greedily satisfy smallest greed with smallest cookie.' },
              { name: 'Lemonade Change', lcId: 860, intuition: 'Track count of 5 and 10 bills. Greedily give $10+$5 change for $20 bill.' },
            ],
          },
        ],
      },
      medium: {
        label: 'Core Patterns',
        groups: [
          {
            name: 'Interval Consolidation',
            problems: [
              { name: 'Merge Intervals', lcId: 56, intuition: 'Sort by start time. If current.start <= prev.end, merge; else push new.' },
              { name: 'Insert Interval', lcId: 57, intuition: 'Add non-overlapping before, merge overlapping in middle, add remainder.' },
              { name: 'Non-overlapping Intervals', lcId: 435, intuition: 'Sort by end time. Greedily keep interval with earliest end to maximize room.' },
              { name: 'Meeting Rooms II', lcId: 253, intuition: 'Min-heap of meeting end times, or sweep line chronological events.' },
            ],
          },
          {
            name: 'Reachability & Fueling',
            problems: [
              { name: 'Jump Game', lcId: 55, intuition: 'Track max reachable index. If current index > maxReach, unreachable.' },
              { name: 'Jump Game II', lcId: 45, intuition: 'Track current jump boundary and farthest reachable. Step when reaching boundary.' },
              { name: 'Gas Station', lcId: 134, intuition: 'If total gas < total cost, impossible. If running tank < 0, reset start to next station.' },
              { name: 'Task Scheduler', lcId: 621, intuition: 'Max frequency element determines idle slot frames: max(tasks.length, (maxFreq-1)*(n+1)+countMax).' },
            ],
          },
        ],
      },
      hard: {
        label: 'Advanced',
        groups: [
          {
            name: 'Complex Scheduling',
            problems: [
              { name: 'Candy', lcId: 135, intuition: 'Two passes: left-to-right to satisfy left neighbor, right-to-left for right neighbor.' },
              { name: 'Meeting Rooms III', lcId: 2402, intuition: 'Two heaps: free rooms (min-heap of room index) and busy rooms (min-heap of endTime).' },
            ],
          },
        ],
      },
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // 16. DATA STRUCTURE DESIGN
  // ═══════════════════════════════════════════════════════════════════
  design: {
    title: 'Data Structure Design',
    desc: 'Architecting custom data structures with strict time/space complexity guarantees through composite primitives.',
    tiers: {
      easy: {
        label: 'Foundation',
        groups: [
          {
            name: 'Adapter Patterns',
            problems: [
              { name: 'Implement Queue using Stacks', lcId: 232, intuition: 'Two stacks: inStack for push, outStack for pop/peek. Amortized O(1).' },
              { name: 'Implement Stack using Queues', lcId: 225, intuition: 'Single queue: on push, rotate elements by queue.size()-1 to place new item at front.' },
            ],
          },
        ],
      },
      medium: {
        label: 'Core Patterns',
        groups: [
          {
            name: 'Fast Relational Retrieval',
            problems: [
              { name: 'Min Stack', lcId: 155, intuition: 'Track running minimum either by pairing (val, min) on stack or secondary min-stack.' },
              { name: 'LRU Cache', lcId: 146, intuition: 'Hash map + doubly linked list. Move accessed node to head; evict from tail.' },
              { name: 'Time Based Key-Value Store', lcId: 981, intuition: 'Hash map of key to sorted array of (timestamp, value). Binary search on timestamp.' },
              { name: 'Design Twitter', lcId: 355, intuition: 'User follow set + tweet lists. Feed generation via max-heap K-way merge of tweets.' },
            ],
          },
        ],
      },
      hard: {
        label: 'Advanced',
        groups: [
          {
            name: 'Strict O(1) Composite Structures',
            problems: [
              { name: 'LFU Cache', lcId: 460, intuition: 'Map key to node, and map frequency to doubly linked list. Track minFreq for O(1) eviction.' },
              { name: 'All O`one Data Structure', lcId: 432, intuition: 'Doubly linked list of frequency buckets, each containing a hash set of keys.' },
              { name: 'Design In-Memory File System', lcId: 588, intuition: 'Trie-like directory tree with node children hash map and file content buffer.' },
            ],
          },
        ],
      },
    },
  },
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

};

// ─── Aliases ────────────────────────────────────────────────────────
ROADMAP_DATA['dynamic-programming'] = ROADMAP_DATA.dp;
ROADMAP_DATA['monotonic-stack'] = ROADMAP_DATA.monostack;
ROADMAP_DATA['binary-search'] = ROADMAP_DATA.binsearch;
ROADMAP_DATA['heap-priority-queue'] = ROADMAP_DATA.heaps;
ROADMAP_DATA['graph'] = ROADMAP_DATA.graphs;
ROADMAP_DATA['tree'] = ROADMAP_DATA.trees;
ROADMAP_DATA['trees'] = ROADMAP_DATA.trees;
ROADMAP_DATA['binary-tree'] = ROADMAP_DATA.trees;
ROADMAP_DATA['binarytree'] = ROADMAP_DATA.trees;
ROADMAP_DATA['window'] = ROADMAP_DATA['sliding-window'];
ROADMAP_DATA['slidingwindow'] = ROADMAP_DATA['sliding-window'];
ROADMAP_DATA['twopointers'] = ROADMAP_DATA['two-pointers'];
ROADMAP_DATA['prefixsum'] = ROADMAP_DATA['prefix-sum'];
ROADMAP_DATA['linkedlist'] = ROADMAP_DATA['linked-list'];
ROADMAP_DATA['dsu'] = ROADMAP_DATA['union-find'];
ROADMAP_DATA['unionfind'] = ROADMAP_DATA['union-find'];
ROADMAP_DATA['bitmanipulation'] = ROADMAP_DATA['bit-manipulation'];
ROADMAP_DATA['bit-manipulation'] = ROADMAP_DATA['bit-manipulation'];
ROADMAP_DATA['tries'] = ROADMAP_DATA.trie;
ROADMAP_DATA['intervals'] = ROADMAP_DATA.greedy;

ROADMAP_DATA['string'] = ROADMAP_DATA.strings;
ROADMAP_DATA['kmp'] = ROADMAP_DATA.strings;
ROADMAP_DATA['segment-tree'] = ROADMAP_DATA['fenwick-tree'];
ROADMAP_DATA['binary-indexed-tree'] = ROADMAP_DATA['fenwick-tree'];
ROADMAP_DATA['sweepline'] = ROADMAP_DATA['sweep-line'];
ROADMAP_DATA['queue'] = ROADMAP_DATA['monotonic-queue'];
ROADMAP_DATA['deque'] = ROADMAP_DATA['monotonic-queue'];
ROADMAP_DATA['number-theory'] = ROADMAP_DATA.math;
