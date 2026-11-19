import type { AnswerCategory, TopicId } from '../types/interview';

/**
 * Transparent, deterministic pattern matching.
 * This is intentionally NOT semantic comprehension — every signal below is
 * auditable, and the README documents them as demo heuristics.
 */

const REASONING_MARKERS = [
  'because',
  'since',
  'so that',
  'therefore',
  'ensures',
  'guarantees',
  'in order to',
  'which means',
  'that way',
  'trade-off',
  'tradeoff',
  'instead of',
  'rather than',
  'the reason',
];

const UNCLEAR_PHRASES = [
  "idk",
  "i don't know",
  'dont know',
  'do not know',
  'not sure',
  'unsure',
  'no idea',
  'dunno',
  'hmm',
  'um ',
];

const MISCONCEPTION_PHRASES = [
  'infinite loop',
  'never terminates',
  'never ends',
  'never stops',
  'random',
  'magic',
  'accident',
  'it just works',
  'doesn\'t matter',
  'dont need to',
  'don\'t need to',
  'always better',
  'always worse',
  'cannot fail',
  'can\'t fail',
];

const ALTERNATIVE_PHRASES = [
  'could also',
  'alternative',
  'another approach',
  'different approach',
  'also work',
  'instead i would',
  'i would use',
  'i would rather',
  'hash map',
  'hashmap',
  'hash set',
  'while loop',
  'recursion',
  'recursive',
  'two pointer',
  'binary search',
  'sort',
];

const TOPIC_SIGNALS: Record<TopicId, string[]> = {
  'loop-choice': [
    'for',
    'while',
    'iterate',
    'iteration',
    'loop',
    'index',
    'counter',
    'fixed',
    'known',
    'range',
    'length',
    'header',
  ],
  termination: [
    'length',
    'i <',
    'i<',
    'j <',
    'j<',
    'condition',
    'terminate',
    'ends',
    'stop',
    'boundary',
    'increment',
    'bounds',
    'out of bounds',
    'index i',
    'comparison',
  ],
  complexity: [
    'o(n',
    'o(1)',
    'o(n²)',
    'o(n^2)',
    'quadratic',
    'linear',
    'constant',
    'big o',
    'complexity',
    'hash lookup',
    'hash map',
    'nested',
    'n squared',
    'squared',
  ],
  'edge-cases': [
    'duplicate',
    'same element',
    'same element twice',
    'twice',
    'no solution',
    'no valid',
    'empty',
    'itself',
    'self',
    'i !== j',
    'distinct',
    'used once',
    'edge',
    '[3, 3]',
  ],
  tradeoffs: [
    'hash',
    'map',
    'set',
    'space',
    'memory',
    'o(1)',
    'o(n)',
    'o(n log n)',
    'trade',
    'extra',
    'sort',
    'two pointer',
    'auxiliary',
    'constant space',
  ],
};

function countSignals(answer: string, signals: string[]): number {
  let hits = 0;
  for (const signal of signals) {
    if (answer.includes(signal)) hits += 1;
  }
  return hits;
}

export function classifyAnswer(rawAnswer: string, topic: TopicId): AnswerCategory {
  const answer = rawAnswer.trim().toLowerCase();
  if (!answer) return 'unclear';

  const words = answer.split(/\s+/).filter(Boolean);
  if (words.length <= 2) return 'unclear';

  const confused = MISCONCEPTION_PHRASES.some((phrase) => answer.includes(phrase));
  const unclearPhrase = UNCLEAR_PHRASES.some((phrase) => answer.includes(phrase));
  const reasoning = REASONING_MARKERS.some((marker) => answer.includes(marker));
  const alternative = ALTERNATIVE_PHRASES.some((phrase) => answer.includes(phrase));
  const score = countSignals(answer, TOPIC_SIGNALS[topic]);

  // A stated misconception dominates everything — challenge it first.
  if (confused) return 'incorrect_or_confused';

  // Strong, reasoned command of the topic beats the alternative branch.
  if (score >= 2 && reasoning) return 'correct_with_reasoning';

  // "I'd do it differently" is its own legitimate branch worth probing.
  if (alternative) return 'alternative_possible';

  if (unclearPhrase && score === 0) return 'unclear';

  if (score >= 2) return 'correct_but_shallow';

  if (score === 1) return 'partially_correct';

  return 'unclear';
}
