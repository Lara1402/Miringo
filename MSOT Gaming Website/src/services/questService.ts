import type { QuestSector, QuizQuestion } from '../types/quest';

const STORAGE_KEY = 'msot_quest_bank_v1';

const INITIAL_SECTORS: QuestSector[] = [
  {
    id: 'node-1',
    title: 'Safehouse Alpha: Intro to Big-O',
    type: 'safehouse',
    topic: 'Time & Space Complexity',
    xpReward: 30,
    status: 'completed',
    description: 'Mastered asymptotic analysis, omega, theta, and runtime profiling.',
    timeLimitSeconds: 180,
    questions: [
      {
        id: 'q1-1',
        prompt: 'What is the worst-case time complexity of the following nested loop?',
        codeSnippet: `for (int i = 1; i <= n; i *= 2) {
    for (int j = 0; j < n; j++) {
        // Constant time operation
        sum += i * j;
    }
}`,
        options: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(log n)'],
        correctAnswerIndex: 1,
        explanation: 'The outer loop multiplies i by 2 each step, taking O(log n) iterations. The inner loop runs n times for each outer loop step. Therefore, total complexity is O(n log n).',
        category: 'CODE_ANALYSIS',
        difficulty: 'EASY',
      },
      {
        id: 'q1-2',
        prompt: 'What is the auxiliary space complexity of the naive recursive Fibonacci algorithm fib(n) = fib(n-1) + fib(n-2)?',
        options: ['O(1)', 'O(n)', 'O(2^n)', 'O(log n)'],
        correctAnswerIndex: 1,
        explanation: 'Although the call tree has O(2^n) total calls, the maximum depth of the runtime recursion call stack at any point is n, making space complexity O(n).',
        category: 'MCQ',
        difficulty: 'MEDIUM',
      },
      {
        id: 'q1-3',
        prompt: 'What is the amortized time complexity of inserting an element into a dynamic array (like std::vector or ArrayList) that doubles capacity when full?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctAnswerIndex: 0,
        explanation: 'While doubling the capacity costs O(n), it occurs rarely (after n/2 inserts). Averaged across all insertions, each push has an amortized cost of O(1).',
        category: 'MCQ',
        difficulty: 'EASY',
      },
    ],
  },
  {
    id: 'node-2',
    title: 'Ammu-Nation: Recursion Armory',
    type: 'gun_store',
    topic: 'Divide & Conquer & Backtracking',
    xpReward: 40,
    status: 'in_progress',
    description: 'Solve verified recursive backtracking problems with zero stack overflow exceptions.',
    timeLimitSeconds: 240,
    questions: [
      {
        id: 'q2-1',
        prompt: 'Which recurrence relation accurately models the runtime of the standard Divide & Conquer MergeSort algorithm?',
        options: [
          'T(n) = T(n-1) + O(1)',
          'T(n) = 2T(n/2) + O(n)',
          'T(n) = 2T(n/2) + O(1)',
          'T(n) = T(n/2) + O(n)',
        ],
        correctAnswerIndex: 1,
        explanation: 'MergeSort divides the array into 2 halves (2T(n/2)) and then merges the sorted halves in linear time O(n). By Master Theorem, this evaluates to O(n log n).',
        category: 'MCQ',
        difficulty: 'MEDIUM',
      },
      {
        id: 'q2-2',
        prompt: 'In recursive backtracking (e.g., solving N-Queens or Sudoku), what step is strictly required immediately after an explored recursive branch returns false?',
        options: [
          'Terminate the application process',
          'Undo the tentative move / restore state (Backtrack)',
          'Double the allocation size of the board',
          'Sort the candidate array in ascending order',
        ],
        correctAnswerIndex: 1,
        explanation: 'Backtracking requires reverting the cell or board mutation (undo move) before the loop advances to try the next candidate branch.',
        category: 'MCQ',
        difficulty: 'EASY',
      },
      {
        id: 'q2-3',
        prompt: 'Analyze this recursive function. What does mystery(4, 3) return?',
        codeSnippet: `int mystery(int a, int b) {
    if (b == 0) return 0;
    if (b % 2 == 0) return mystery(a + a, b / 2);
    return mystery(a + a, b / 2) + a;
}`,
        options: ['7', '12', '64', '0'],
        correctAnswerIndex: 1,
        explanation: 'This is Russian Peasant multiplication. mystery(a, b) calculates a * b in O(log b) time. 4 * 3 = 12.',
        category: 'CODE_ANALYSIS',
        difficulty: 'MEDIUM',
      },
      {
        id: 'q2-4',
        prompt: 'What causes a StackOverflowError in recursive algorithms?',
        options: [
          'The CPU instruction pipeline stalls',
          'The call stack exceeds its allocated memory limit due to missing or invalid base conditions',
          'Too many heap objects are garbage collected simultaneously',
          'The return type is void rather than an int',
        ],
        correctAnswerIndex: 1,
        explanation: 'Each recursive call pushes an activation record onto the call stack. Without a valid base case, calls chain endlessly until the call stack memory is exhausted.',
        category: 'BUG_HUNT',
        difficulty: 'EASY',
      },
    ],
  },
  {
    id: 'node-3',
    title: 'Ammu-Nation: Dynamic Programming Weapons',
    type: 'gun_store',
    topic: 'Memoization & Tabulation',
    xpReward: 50,
    status: 'in_progress',
    description: 'Knapsack 0/1, Longest Common Subsequence, and state transition planning.',
    timeLimitSeconds: 240,
    questions: [
      {
        id: 'q3-1',
        prompt: 'What are the two core prerequisites for a problem to be solvable via Dynamic Programming?',
        options: [
          'Optimal Substructure and Overlapping Subproblems',
          'Greedy Choice Property and Infinite Memory',
          'Sorted Input Arrays and Monotonicity',
          'Asymmetric Key Exchange and Divide & Conquer',
        ],
        correctAnswerIndex: 0,
        explanation: 'Dynamic Programming requires that optimal solutions to subproblems compose the global optimal solution (Optimal Substructure) and that the same subproblems are solved repeatedly (Overlapping Subproblems).',
        category: 'MCQ',
        difficulty: 'EASY',
      },
      {
        id: 'q3-2',
        prompt: 'In the 0/1 Knapsack Problem with weight capacity W and item i with weight wt[i] and value val[i], what is the state transition when weight wt[i] <= w?',
        options: [
          'dp[i][w] = dp[i-1][w] + val[i]',
          'dp[i][w] = max(dp[i-1][w], val[i] + dp[i-1][w - wt[i]])',
          'dp[i][w] = min(dp[i-1][w], dp[i][w - wt[i]])',
          'dp[i][w] = dp[i-1][w / 2]',
        ],
        correctAnswerIndex: 1,
        explanation: 'We choose the maximum between omitting the item (dp[i-1][w]) and including the item (val[i] + dp[i-1][w - wt[i]]).',
        category: 'CODE_ANALYSIS',
        difficulty: 'MEDIUM',
      },
      {
        id: 'q3-3',
        prompt: 'How can the space complexity of the Tabulated Fibonacci algorithm be reduced from O(n) to O(1)?',
        options: [
          'By using a Hash Table with open addressing',
          'By retaining only the previous two computed values (prev1, prev2) instead of an entire array',
          'By switching from C++ to Python',
          'By executing the algorithm on GPU tensor cores',
        ],
        correctAnswerIndex: 1,
        explanation: 'Since computing fib(i) only depends on fib(i-1) and fib(i-2), keeping two rolling variables achieves O(1) space.',
        category: 'BUG_HUNT',
        difficulty: 'EASY',
      },
    ],
  },
  {
    id: 'node-4',
    title: 'Strangers & Freaks: Graph Traversals (?)',
    type: 'fog_of_war',
    topic: 'BFS, DFS & Dijkstra Shortest Path',
    xpReward: 45,
    status: 'locked',
    description: 'Unlocks in Week 7 after completing mid-term prep micro-challenges.',
    timeLimitSeconds: 240,
    questions: [
      {
        id: 'q4-1',
        prompt: 'Which data structure is primarily utilized in Breadth-First Search (BFS) to discover vertices level by level?',
        options: ['Stack (LIFO)', 'Queue (FIFO)', 'Max-Heap', 'Disjoint Set Union'],
        correctAnswerIndex: 1,
        explanation: 'BFS uses a FIFO Queue so vertices are visited in order of their edge distance from the source root.',
        category: 'MCQ',
        difficulty: 'EASY',
      },
      {
        id: 'q4-2',
        prompt: 'Under what condition does Dijkstra\'s Shortest Path algorithm fail to yield correct results?',
        options: [
          'When the graph contains cycles',
          'When the graph contains negative edge weights',
          'When the graph is directed',
          'When the graph has more than 100 vertices',
        ],
        correctAnswerIndex: 1,
        explanation: 'Dijkstra greedily assumes once a node is settled its distance is minimized. Negative edges violate this greedy assumption. Bellman-Ford must be used instead.',
        category: 'BUG_HUNT',
        difficulty: 'MEDIUM',
      },
      {
        id: 'q4-3',
        prompt: 'What is the time complexity of Breadth-First Search on an adjacency list representation with V vertices and E edges?',
        options: ['O(V^2)', 'O(V + E)', 'O(E log V)', 'O(V * E)'],
        correctAnswerIndex: 1,
        explanation: 'Each vertex is enqueued once O(V), and each outgoing edge is examined once O(E), yielding O(V + E).',
        category: 'MCQ',
        difficulty: 'MEDIUM',
      },
    ],
  },
  {
    id: 'node-5',
    title: 'Mount Chiliad Fortress: Mid-Term Boss Battle',
    type: 'boss_battle',
    topic: 'Timed Comprehensive Exam Simulation',
    xpReward: 150,
    status: 'locked',
    description: 'High-stakes timed revision trial 1 week before the university mid-term exams.',
    timeLimitSeconds: 300,
    questions: [
      {
        id: 'q5-1',
        prompt: 'Using the Master Theorem, what is the asymptotic solution to T(n) = 8T(n/2) + O(n^2)?',
        options: ['O(n^2)', 'O(n^3)', 'O(n^2 log n)', 'O(n log n)'],
        correctAnswerIndex: 1,
        explanation: 'a = 8, b = 2, f(n) = O(n^2). log_b(a) = log_2(8) = 3. Since f(n) = O(n^2) is polynomially smaller than n^3, Case 1 applies, yielding T(n) = Θ(n^3).',
        category: 'CODE_ANALYSIS',
        difficulty: 'HARD',
      },
      {
        id: 'q5-2',
        prompt: 'What is the minimum height of a self-balancing AVL binary search tree with N nodes?',
        options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
        correctAnswerIndex: 1,
        explanation: 'An AVL tree strictly maintains height balance with a balance factor of -1, 0, or 1, guaranteeing logarithmic height O(log N).',
        category: 'MCQ',
        difficulty: 'MEDIUM',
      },
      {
        id: 'q5-3',
        prompt: 'In Kruskal\'s Minimum Spanning Tree algorithm, which data structure provides near constant-time cycle detection when adding edges?',
        options: [
          'Binary Search Tree',
          'Disjoint Set Union (Union-Find with Path Compression)',
          'Adjacency Matrix',
          'Trie',
        ],
        correctAnswerIndex: 1,
        explanation: 'Union-Find with rank and path compression checks whether two vertices belong to the same connected component in nearly O(1) amortized time (inverse Ackermann function).',
        category: 'MCQ',
        difficulty: 'HARD',
      },
      {
        id: 'q5-4',
        prompt: 'What bitwise trick finds the unique non-duplicate number in an array where every other number appears exactly twice?',
        options: [
          'AND (&) all elements together',
          'XOR (^) all elements together',
          'OR (|) all elements together',
          'Invert (~) each element',
        ],
        correctAnswerIndex: 1,
        explanation: 'Because x ^ x = 0 and x ^ 0 = x, XOR is commutative and associative. XORing all elements cancels identical pairs, leaving only the unique element.',
        category: 'BUG_HUNT',
        difficulty: 'MEDIUM',
      },
    ],
  },
  {
    id: 'node-leetcode',
    title: 'LeetCode Algorithm Armory',
    type: 'gun_store',
    topic: 'Two Pointers, Trees & DP Patterns',
    xpReward: 50,
    status: 'in_progress',
    description: 'High-frequency LeetCode algorithmic challenges: Two Sum, Invert Binary Tree, Reverse Linked List, and Valid Parentheses.',
    timeLimitSeconds: 300,
    questions: [
      {
        id: 'lc-1',
        prompt: 'In the classic LeetCode #1 "Two Sum" problem, what data structure achieves O(n) runtime complexity to find the indices of two numbers that sum to the target?',
        options: ['Binary Search Tree', 'Hash Map (Dictionary)', 'Priority Queue / Min-Heap', 'Disjoint Set Union'],
        correctAnswerIndex: 1,
        explanation: 'By storing the complement (target - num) in a Hash Map as we iterate, we can check for its existence in O(1) average time, yielding O(n) overall runtime.',
        category: 'MCQ',
        difficulty: 'EASY',
      },
      {
        id: 'lc-2',
        prompt: 'In LeetCode #20 "Valid Parentheses", what data structure is best suited to match opening and closing brackets?',
        options: ['Queue (FIFO)', 'Stack (LIFO)', 'Circular Buffer', 'Prefix Tree (Trie)'],
        correctAnswerIndex: 1,
        explanation: 'A Stack (LIFO) ensures that the most recently opened bracket is matched first when an incoming closing bracket is encountered.',
        category: 'MCQ',
        difficulty: 'EASY',
      },
      {
        id: 'lc-3',
        prompt: 'Analyze this LeetCode tree inversion algorithm. What is its time complexity on a binary tree with N nodes?',
        codeSnippet: `TreeNode* invertTree(TreeNode* root) {
    if (!root) return nullptr;
    TreeNode* temp = root->left;
    root->left = invertTree(root->right);
    root->right = invertTree(temp);
    return root;
}`,
        options: ['O(log N)', 'O(N)', 'O(N log N)', 'O(N^2)'],
        correctAnswerIndex: 1,
        explanation: 'Since each node in the tree is visited exactly once, the time complexity is strictly linear O(N).',
        category: 'CODE_ANALYSIS',
        difficulty: 'MEDIUM',
      },
      {
        id: 'lc-4',
        prompt: 'In LeetCode #70 "Climbing Stairs", if you can climb either 1 or 2 steps each time, what mathematical sequence models the number of distinct ways to reach the top?',
        options: ['Catalan Numbers', 'Fibonacci Sequence', 'Harmonic Series', 'Factorial Sequence'],
        correctAnswerIndex: 1,
        explanation: 'ways(n) = ways(n-1) + ways(n-2), which is identical to the Fibonacci sequence with base cases ways(1) = 1, ways(2) = 2.',
        category: 'MCQ',
        difficulty: 'EASY',
      },
    ],
  },
];

export const questService = {
  getAllSectors(): QuestSector[] {
    if (typeof window === 'undefined') return INITIAL_SECTORS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored quest bank:', e);
    }
    return INITIAL_SECTORS;
  },

  getSector(nodeId: string): QuestSector | undefined {
    const sectors = this.getAllSectors();
    return sectors.find((s) => s.id === nodeId) || sectors[0];
  },

  saveSectors(sectors: QuestSector[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sectors));
    } catch (e) {
      console.error('Failed to save quest bank:', e);
    }
  },

  updateSectorQuestions(nodeId: string, questions: QuizQuestion[]): void {
    const sectors = this.getAllSectors();
    const target = sectors.find((s) => s.id === nodeId);
    if (target) {
      target.questions = questions;
      this.saveSectors(sectors);
    }
  },

  addQuestion(nodeId: string, newQ: Omit<QuizQuestion, 'id'>): QuizQuestion {
    const sectors = this.getAllSectors();
    const target = sectors.find((s) => s.id === nodeId);
    const id = `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const fullQuestion: QuizQuestion = { ...newQ, id };

    if (target) {
      target.questions.push(fullQuestion);
      this.saveSectors(sectors);
    }
    return fullQuestion;
  },

  updateQuestion(nodeId: string, updatedQ: QuizQuestion): void {
    const sectors = this.getAllSectors();
    const target = sectors.find((s) => s.id === nodeId);
    if (target) {
      target.questions = target.questions.map((q) => (q.id === updatedQ.id ? updatedQ : q));
      this.saveSectors(sectors);
    }
  },

  deleteQuestion(nodeId: string, questionId: string): void {
    const sectors = this.getAllSectors();
    const target = sectors.find((s) => s.id === nodeId);
    if (target) {
      target.questions = target.questions.filter((q) => q.id !== questionId);
      this.saveSectors(sectors);
    }
  },

  resetToDefaultBank(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  },

  importQuestionsFromJson(nodeId: string, jsonString: string): { success: boolean; count: number; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) {
        return { success: false, count: 0, error: 'JSON payload must be an array of question objects.' };
      }
      const validated: QuizQuestion[] = parsed.map((item, idx) => ({
        id: item.id || `q-import-${Date.now()}-${idx}`,
        prompt: item.prompt || 'Untitled Question',
        options: Array.isArray(item.options) && item.options.length >= 2 ? item.options : ['Option A', 'Option B'],
        correctAnswerIndex: typeof item.correctAnswerIndex === 'number' ? item.correctAnswerIndex : 0,
        explanation: item.explanation || 'No explanation provided.',
        codeSnippet: item.codeSnippet,
        category: item.category || 'MCQ',
        difficulty: item.difficulty || 'MEDIUM',
      }));

      const sectors = this.getAllSectors();
      const target = sectors.find((s) => s.id === nodeId);
      if (target) {
        target.questions = [...target.questions, ...validated];
        this.saveSectors(sectors);
        return { success: true, count: validated.length };
      }
      return { success: false, count: 0, error: `Sector ${nodeId} not found.` };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Invalid JSON format';
      return { success: false, count: 0, error: msg };
    }
  },
};
