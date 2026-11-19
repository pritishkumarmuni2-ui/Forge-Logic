import type { CodeInspection, TopicId } from '../types/interview';

/** Fixed interview order — the defense always walks this arc. */
export const TOPIC_FLOW: TopicId[] = [
  'loop-choice',
  'termination',
  'complexity',
  'edge-cases',
  'tradeoffs',
];

export type ProbeKind = 'shallow' | 'partial' | 'confused' | 'unclear' | 'alternative';

export interface TopicConfig {
  id: TopicId;
  label: string;
  stage: string;
  /** Builds the opening question, grounded in what the static inspector saw. */
  opening: (inspection: CodeInspection) => string;
  hint: string;
  probes: Record<ProbeKind, string>;
  /** Acknowledgement appended when the candidate clears this stage. */
  success: string;
}

export const CLOSING_MESSAGE =
  "That's everything I need from you. Give me a moment — I'm compiling your defense review.";

export const TOPIC_CONFIG: Record<TopicId, TopicConfig> = {
  'loop-choice': {
    id: 'loop-choice',
    label: 'Loop selection & rationale',
    stage: 'Q1',
    opening: (inspection) => {
      if (inspection.usesNestedLoops && inspection.usesWhileLoop) {
        return "I see a mix of loop constructs in your solution. Walk me through why you reached for nested iteration there — and why a `while` in one of those spots instead of a `for`?";
      }
      if (inspection.usesNestedLoops) {
        return 'I see nested `for` loops in your solution. Walk me through why you chose nested iteration here — and why a `for` loop rather than a `while`? What is the loop variable actually tracking?';
      }
      if (inspection.usesWhileLoop) {
        return 'You reached for a `while` loop. What made `while` the right call instead of a `for`? What invariant does its condition test, and who maintains the counter?';
      }
      if (inspection.usesHashStructure) {
        return 'You built a hash-based structure. Before we dig into it — why did you pair it with this loop shape instead of a different traversal? What is the loop responsible for, and what is the hash for?';
      }
      return "I can't fully classify the control flow in your submission yet. Walk me through how your code iterates over the input — which construct did you choose, and why that one?";
    },
    hint: 'Hint: the iteration bounds are known before the loop starts — `i` begins at 0 and the range is fixed by `nums.length`. A `for` header binds initialization, condition, and increment in one place, which is exactly the contract when the bounds are known up front. A `while` leaves all three to your discipline.',
    probes: {
      shallow: 'That is the usual answer — now push further. What does the loop condition guarantee at the top of every iteration, and what would change if the input length were unknown or streamed?',
      partial: "You're circling it. Name the three clauses of the loop header and say what each one is responsible for — or tell me what happens the very first time the condition is evaluated.",
      confused: "Careful — an uncontrolled loop variable would indeed never terminate, but that's not what this construct buys you. Tell me again: what exactly does `i < nums.length` prove at the moment it is evaluated?",
      unclear: "Let's slow down. One or two sentences: why this loop and not a `while`? What do you, the programmer, have to maintain by hand in a `while` that a `for` keeps in one place?",
      alternative: 'Interesting — a `while` works too, fair. Then defend the trade: what does the `for` header give you that `while` leaves to discipline, and under what input shape would `while` genuinely win?',
    },
    success: "Good — the loop contract is clear. Let's trace what actually happens at runtime.",
  },

  termination: {
    id: 'termination',
    label: 'Iteration mechanics & termination',
    stage: 'Q2',
    opening: (inspection) =>
      inspection.usesHashStructure
        ? 'Trace the mechanics for me. At iteration k, what are `i`, the current element `nums[i]`, and the exact state of your lookup structure right before the branch fires? And precisely what makes the loop stop?'
        : 'Trace the mechanics for me. At the moment `i = 1` in `nums = [2, 7, 11]`, target `9`: what are both indices pointing at, what comparison is performed, and what makes the outer loop terminate?',
    hint: 'Hint: follow `nums = [2, 7, 11]`, target 9 on paper. Write down i = 0: what is computed, what is compared against, and what is i after the increment. Repeat for i = 1. Termination is not magic — the condition is re-evaluated against the length boundary before every single pass.',
    probes: {
      shallow: 'Closer — but be concrete. State the exact values of the index variables on the final iteration, and the exact comparison that returns false one step later. What is stored in the structure at that moment?',
      partial: 'Halfway there. Go one iteration at a time: what does the body do when i = 0, what does it store or compare, and what changes before i = 1? Termination is just that comparison against the boundary going false.',
      confused: 'No — the loop does not end “when the answer is found” in general, and it is not random. The condition is the only thing standing between your code and an out-of-bounds read. Re-state it precisely: which comparison is checked, and against what value?',
      unclear: 'New angle, simpler: pretend you are narrating to a colleague. i starts where? Each pass does what? The loop stops when which comparison fails? Three short sentences are enough.',
      alternative: 'Right, a single-pass lookup changes the story — enumerate what one pass means for mutation order: when is a value inserted, and when is it queried? Which comes first at each index, and why does that ordering matter for correctness?',
    },
    success: 'Clean trace. Now the audit interviewers actually care about — the cost.',
  },

  complexity: {
    id: 'complexity',
    label: 'Time complexity & trade-offs',
    stage: 'Q3',
    opening: () =>
      'Now the audit. Give me the time complexity of your solution and walk me through the dominant term — where, line by line, does the work actually happen? And what is the auxiliary space cost?',
    hint: 'Hint: count primitive operations as a function of n = nums.length. A single pass is O(n). Linear scans nested inside each other multiply into O(n²). A hash insert plus lookup averages O(1) each, so the pass stays O(n) overall. Which story does your code tell?',
    probes: {
      shallow: 'Right ballpark — but justify it. If nums.length doubles, which operations double, and which stay flat? Where exactly is the multiplication coming from in your code?',
      partial: 'Not quite yet. Distinguish two cases: what does one full execution of the inner body cost, and how many times does it run in total as a function of i? Multiply them.',
      confused: 'Hold on. Constant time would mean the work does not grow with the input — does your loop re-examine elements as n grows, or not? Answer that honestly first, then re-derive the bound.',
      unclear: 'Forget notation for a second. If I handed you ten thousand elements instead of ten, how does the number of comparisons change? That growth rate is the complexity — give it its name afterwards.',
      alternative: 'Exactly — a hash map collapses one factor of n in exchange for space. State both bounds precisely: time and auxiliary space for the nested version, and time and auxiliary space for the hash version.',
    },
    success: "Good. Complexity is understood — now let's try to break your code.",
  },

  'edge-cases': {
    id: 'edge-cases',
    label: 'Duplicates & no-solution inputs',
    stage: 'Q4',
    opening: () =>
      'Two classic traps: duplicates (`nums = [3, 3]`, target `6`) and inputs where no pair exists at all. How does your code behave on each? And can an element ever pair with itself?',
    hint: 'Hint: ask three questions about `[3, 3]` with target 6. (1) Does j ever start at the same index as i? (2) Does the code compare the element against itself? (3) If no pair exists, what does the function return — and is that a sensible contract for the caller?',
    probes: {
      shallow: 'Sure, it works — but say what proves it. For `[3, 3]`, target 6: which indices are returned, and what protects pair (i, i) from ever being considered?',
      partial: 'One gap left. Walk me through the no-solution case explicitly: does the function fall off the end of the loops, and what does the caller receive? Is that contract documented or accidental?',
      confused: 'Not quite — an element pairing with itself would mean returning two identical indices from one slot, which produces a wrong answer for inputs like `[3]` or `[5, 5]` handled carelessly. Show me, from the code, why your indices always point at two distinct positions.',
      unclear: 'Simplest framing: take `[3, 3]`, target 6, and talk me through the exact comparisons that lead to the answer. Then tell me what happens if the target can never be made.',
      alternative: 'Yes — a hash approach handles this elegantly, but be precise about the mechanics: when does the complement get checked relative to when the element is stored? Why does checking before insert prevent self-pairing?',
    },
    success: "Solid edge-case hygiene. One last question, and it's about trade-offs.",
  },

  tradeoffs: {
    id: 'tradeoffs',
    label: 'Memory vs. runtime trade-offs',
    stage: 'Q5',
    opening: () =>
      'Last one. Suppose memory were free and you had to minimize runtime — what changes in your design? And the reverse: you are now limited to O(1) extra space. Walk me through what you would strike.',
    hint: 'Hint: there are three canonical strategies. (1) Sort + two pointers — O(n log n) time, O(1) extra space, but indices must be recovered or the array mutated. (2) Hash map — O(n) time, O(n) space. (3) Nested scan — O(n²) time, O(1) space. Know which one your code is, and what buying the alternatives costs.',
    probes: {
      shallow: 'A fair sketch — now quantify it. Give me the exact time and auxiliary space for each of the three strategies, and name the hidden cost of sorting (the indices problem).',
      partial: 'Half the trade is on the table. You named the benefit — what is the cost? Extra space costs memory; sorting costs index fidelity. Finish the sentence for each strategy you mentioned.',
      confused: 'No free lunch: you cannot get O(n) time with O(1) space from a comparison sort, and you cannot get O(n log n) without either sorting or a balanced structure. State one achievable pair of bounds and defend it.',
      unclear: 'Reduce it to one decision: “I will pay X (memory / time / code complexity) in order to save Y.” Fill in X and Y for your current solution, and tell me what you would pay instead under each constraint.',
      alternative: 'Excellent — you are already reaching for the optimal structure. Then own the consequence: with a hash map you are spending O(n) auxiliary space. When would that be unacceptable in a real system, and what would you ship instead?',
    },
    success: "That's a complete defense. Well done.",
  },
};
