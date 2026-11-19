import { afterEach, describe, expect, it, vi } from 'vitest';
import { inspectCode } from '../sessionFlow';
import { classifyAnswer } from '../answerClassifier';
import {
  MAX_ATTEMPTS,
  buildSummary,
  startInterview,
  submitAnswer,
} from '../mockInterviewer';
import { TOPIC_CONFIG, TOPIC_FLOW } from '../../data/interviewQuestions';
import { sessionStorageService } from '../../services/sessionStorage';
import type { InterviewSession } from '../../types/interview';

const BRUTE_FORCE = `function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
  return [];
}`;

const HASH_SOLUTION = `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) return [seen.get(complement), i];
    seen.set(nums[i], i);
  }
  return [];
}`;

const WHILE_SOLUTION = `function twoSum(nums, target) {
  let i = 0;
  while (i < nums.length) {
    let j = i + 1;
    while (j < nums.length) {
      if (nums[i] + nums[j] === target) return [i, j];
      j++;
    }
    i++;
  }
  return [];
}`;

const STRONG_LOOP_ANSWER =
  'because a for loop is the right tool when the bounds are known and fixed in advance — it keeps the index, the condition and the increment in one header, so the iteration contract stays explicit';

describe('inspectCode', () => {
  it('detects a single for loop', () => {
    const result = inspectCode('for (let i = 0; i < nums.length; i++) { sum += nums[i]; }');
    expect(result.usesForLoop).toBe(true);
    expect(result.loopStyle).toBe('for');
  });

  it('detects a while loop', () => {
    const result = inspectCode(WHILE_SOLUTION);
    expect(result.usesWhileLoop).toBe(true);
    expect(result.usesNestedLoops).toBe(true);
  });

  it('detects nested for loops as brute force', () => {
    const result = inspectCode(BRUTE_FORCE);
    expect(result.usesNestedLoops).toBe(true);
    expect(result.loopStyle).toBe('nested-for');
  });

  it('detects hash-map solutions', () => {
    const result = inspectCode(HASH_SOLUTION);
    expect(result.usesHashStructure).toBe(true);
    expect(result.loopStyle).toBe('hash-map');
  });

  it('reports unknown for empty or loop-free code', () => {
    const result = inspectCode('const answer = 42;');
    expect(result.loopStyle).toBe('unknown');
  });
});

describe('classifyAnswer', () => {
  it('rewards reasoned answers on the loop-choice topic', () => {
    expect(classifyAnswer(STRONG_LOOP_ANSWER, 'loop-choice')).toBe(
      'correct_with_reasoning',
    );
  });

  it('flags correct keywords without reasoning as shallow', () => {
    expect(
      classifyAnswer('nested loops, quadratic complexity overall', 'complexity'),
    ).toBe('correct_but_shallow');
  });

  it('flags a single signal as partially correct', () => {
    expect(classifyAnswer('it is linear in time', 'complexity')).toBe(
      'partially_correct',
    );
  });

  it('flags very short answers as unclear', () => {
    expect(classifyAnswer('idk', 'complexity')).toBe('unclear');
  });

  it('flags alternative proposals on their own branch', () => {
    expect(
      classifyAnswer('you could also use a hash map for this one', 'complexity'),
    ).toBe('alternative_possible');
  });

  it('flags misconceptions even when reasoning markers are present', () => {
    expect(
      classifyAnswer(
        'because the loop spins a random infinite loop, it never stops',
        'termination',
      ),
    ).toBe('incorrect_or_confused');
  });
});

describe('interview flow', () => {
  it('seeds a code-grounded opening question', () => {
    const session = startInterview(BRUTE_FORCE);
    expect(session.messages).toHaveLength(1);
    expect(session.messages[0].role).toBe('interviewer');
    expect(session.messages[0].text.toLowerCase()).toContain('nested');
    expect(session.status).toBe('active');
  });

  it('advances to the next stage after a strongly reasoned answer', () => {
    let session = startInterview(BRUTE_FORCE);
    session = submitAnswer(session, STRONG_LOOP_ANSWER);
    expect(session.currentTopicIndex).toBe(1);
    expect(TOPIC_FLOW[session.currentTopicIndex]).toBe('termination');
    expect(session.topicResults[0].resolved).toBe(true);
  });

  it('accepts a shallow answer only after a deeper probe', () => {
    let session = startInterview(BRUTE_FORCE);
    const shallow =
      'looping index pointer iterate over the fixed array range with the known length';
    session = submitAnswer(session, shallow);
    expect(session.currentTopicIndex).toBe(0);
    session = submitAnswer(session, shallow);
    expect(session.currentTopicIndex).toBe(1);
    expect(session.topicResults[0].bestCategory).toBe('correct_but_shallow');
  });

  it('provides a hint and advances after repeated unclear answers', () => {
    let session = startInterview(BRUTE_FORCE);
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      session = submitAnswer(session, 'idk');
    }
    expect(session.currentTopicIndex).toBe(1);
    expect(session.topicResults[0].neededHint).toBe(true);
    expect(
      session.messages.some(
        (message) =>
          message.role === 'interviewer' &&
          message.text.includes(TOPIC_CONFIG['loop-choice'].hint.slice(0, 24)),
      ),
    ).toBe(true);
  });

  it('completes all stages and summarizes strong defenses', () => {
    let session = startInterview(HASH_SOLUTION);
    const strongAnswers: Record<string, string> = {
      'loop-choice': STRONG_LOOP_ANSWER,
      termination:
        'because i < length is re-checked on every pass — when the boundary comparison fails the loop ends, and since each index increments once, the out of bounds read never happens',
      complexity:
        'because a single linear pass with an o(n) hash map — the lookup is constant, so the dominant cost stays o(n) overall',
      'edge-cases':
        'duplicates are fine because each element is checked against the seen set before being stored, so that the same element is never used twice, and when no solution exists the function returns an empty array',
      tradeoffs:
        'because the hash map trades space for time — it spends o(n) auxiliary memory to buy a single linear pass, rather than sorting with two pointers and keeping o(1) space',
    };
    for (const topic of TOPIC_FLOW) {
      session = submitAnswer(session, strongAnswers[topic]);
    }
    expect(session.status).toBe('completed');

    const summary = buildSummary(session);
    expect(summary.questionsAnswered).toBe(TOPIC_FLOW.length);
    expect(summary.strengths).toHaveLength(TOPIC_FLOW.length);
    expect(summary.needsPractice).toHaveLength(0);
    expect(summary.categoryCounts.correct_with_reasoning).toBe(TOPIC_FLOW.length);
  });
});

describe('sessionStorageService', () => {
  const store = new Map<string, string>();
  const mockLocalStorage: Storage = {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => [...store.keys()][index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };

  afterEach(() => {
    store.clear();
    vi.unstubAllGlobals();
  });

  it('round-trips a saved session', () => {
    vi.stubGlobal('localStorage', mockLocalStorage);
    const session = startInterview(BRUTE_FORCE);
    expect(sessionStorageService.saveSession(session)).toBe(true);
    const restored = sessionStorageService.loadSession();
    expect(restored).not.toBeNull();
    expect(restored?.id).toBe(session.id);
    expect(restored?.messages).toHaveLength(session.messages.length);
  });

  it('returns null for corrupted stored JSON', () => {
    vi.stubGlobal('localStorage', mockLocalStorage);
    store.set('forgelogic.summary.v1', '{not valid json');
    expect(sessionStorageService.loadSummary()).toBeNull();
  });
});

describe('session typing', () => {
  it('produces a session with well-formed structure', () => {
    const session: InterviewSession = startInterview(BRUTE_FORCE);
    expect(session.topicResults).toHaveLength(TOPIC_FLOW.length);
    expect(session.topicResults.every((result) => !result.resolved)).toBe(true);
    expect(session.inspection.loopStyle).toBe('nested-for');
  });
});
