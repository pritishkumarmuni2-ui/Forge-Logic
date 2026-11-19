import { classifyAnswer } from './answerClassifier';
import { inspectCode } from './sessionFlow';
import {
  CLOSING_MESSAGE,
  TOPIC_CONFIG,
  TOPIC_FLOW,
  type ProbeKind,
} from '../data/interviewQuestions';
import type {
  AnswerCategory,
  ChatMessage,
  InterviewSession,
  SessionSummary,
  TopicBreakdown,
  TopicOutcome,
} from '../types/interview';

const RANK: Record<AnswerCategory, number> = {
  correct_with_reasoning: 5,
  alternative_possible: 4,
  correct_but_shallow: 3,
  partially_correct: 2,
  incorrect_or_confused: 1,
  unclear: 0,
};

/** Attempts allotted per topic before the hint-and-advance safeguard fires. */
export const MAX_ATTEMPTS = 3;
export const SHALLOW_ADVANCE_ATTEMPTS = 2;
export const ALTERNATIVE_ADVANCE_ATTEMPTS = 2;

function createId(): string {
  const cryptoObj = globalThis.crypto;
  if (cryptoObj && typeof cryptoObj.randomUUID === 'function') {
    return cryptoObj.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function makeMessage(
  role: ChatMessage['role'],
  text: string,
  category?: AnswerCategory,
): ChatMessage {
  return { id: createId(), role, text, timestamp: Date.now(), category };
}

function betterCategory(
  current: AnswerCategory | null,
  candidate: AnswerCategory,
): AnswerCategory {
  if (current === null) return candidate;
  return RANK[candidate] > RANK[current] ? candidate : current;
}

function probeKindFor(category: AnswerCategory): ProbeKind {
  switch (category) {
    case 'correct_but_shallow':
      return 'shallow';
    case 'partially_correct':
      return 'partial';
    case 'incorrect_or_confused':
      return 'confused';
    case 'alternative_possible':
      return 'alternative';
    case 'unclear':
    default:
      return 'unclear';
  }
}

interface AdvanceDecision {
  advance: boolean;
  neededHint: boolean;
}

function decideAdvance(category: AnswerCategory, attempts: number): AdvanceDecision {
  switch (category) {
    case 'correct_with_reasoning':
      return { advance: true, neededHint: false };
    case 'correct_but_shallow':
      return attempts >= SHALLOW_ADVANCE_ATTEMPTS
        ? { advance: true, neededHint: false }
        : { advance: false, neededHint: false };
    case 'alternative_possible':
      return attempts >= ALTERNATIVE_ADVANCE_ATTEMPTS
        ? { advance: true, neededHint: false }
        : { advance: false, neededHint: false };
    case 'partially_correct':
    case 'incorrect_or_confused':
    case 'unclear':
      return attempts >= MAX_ATTEMPTS
        ? { advance: true, neededHint: true }
        : { advance: false, neededHint: false };
  }
}

export function startInterview(code: string): InterviewSession {
  const inspection = inspectCode(code);
  const opening = TOPIC_CONFIG[TOPIC_FLOW[0]].opening(inspection);

  return {
    id: createId(),
    code,
    inspection,
    startedAt: Date.now(),
    messages: [makeMessage('interviewer', opening)],
    currentTopicIndex: 0,
    topicResults: TOPIC_FLOW.map((topic) => ({
      topic,
      attempts: 0,
      bestCategory: null,
      resolved: false,
      neededHint: false,
    })),
    status: 'active',
  };
}

export function submitAnswer(
  session: InterviewSession,
  rawAnswer: string,
): InterviewSession {
  if (session.status === 'completed') return session;
  const answer = rawAnswer.trim();
  if (!answer) return session;

  const next: InterviewSession = {
    ...session,
    messages: [...session.messages],
    topicResults: session.topicResults.map((result) => ({ ...result })),
  };

  const topicId = TOPIC_FLOW[next.currentTopicIndex];
  const config = TOPIC_CONFIG[topicId];
  const category = classifyAnswer(answer, topicId);

  next.messages.push(makeMessage('candidate', answer, category));

  const result = next.topicResults[next.currentTopicIndex];
  result.attempts += 1;
  result.bestCategory = betterCategory(result.bestCategory, category);

  const decision = decideAdvance(category, result.attempts);
  const interviewerTexts: string[] = [];

  if (decision.advance) {
    result.resolved = true;
    if (decision.neededHint) {
      result.neededHint = true;
      interviewerTexts.push(config.hint);
    }
    interviewerTexts.push(config.success);

    const nextIndex = next.currentTopicIndex + 1;
    if (nextIndex < TOPIC_FLOW.length) {
      next.currentTopicIndex = nextIndex;
      const nextConfig = TOPIC_CONFIG[TOPIC_FLOW[nextIndex]];
      interviewerTexts.push(nextConfig.opening(next.inspection));
    } else {
      next.status = 'completed';
      interviewerTexts.push(CLOSING_MESSAGE);
    }
  } else {
    interviewerTexts.push(config.probes[probeKindFor(category)]);
  }

  for (const text of interviewerTexts) {
    next.messages.push(makeMessage('interviewer', text));
  }

  return next;
}

function outcomeFor(best: AnswerCategory | null): TopicOutcome {
  switch (best) {
    case 'correct_with_reasoning':
      return 'strong';
    case 'alternative_possible':
    case 'correct_but_shallow':
      return 'solid';
    default:
      return 'practice';
  }
}

export function buildSummary(
  session: InterviewSession,
  completedAt: number = Date.now(),
): SessionSummary {
  const candidateMessages = session.messages.filter(
    (message) => message.role === 'candidate',
  );

  const categoryCounts: Record<AnswerCategory, number> = {
    correct_with_reasoning: 0,
    correct_but_shallow: 0,
    partially_correct: 0,
    incorrect_or_confused: 0,
    alternative_possible: 0,
    unclear: 0,
  };
  for (const message of candidateMessages) {
    if (message.category) categoryCounts[message.category] += 1;
  }

  const topicBreakdown: TopicBreakdown[] = session.topicResults.map((result) => ({
    topic: result.topic,
    label: TOPIC_CONFIG[result.topic].label,
    outcome: outcomeFor(result.bestCategory),
    attempts: result.attempts,
  }));

  const strengths = topicBreakdown
    .filter((entry) => entry.outcome !== 'practice')
    .map((entry) =>
      entry.outcome === 'strong'
        ? `${entry.label} — reasoned through it clearly`
        : `${entry.label} — solid grasp, could go deeper`,
    );

  const needsPractice = topicBreakdown
    .filter((entry) => entry.outcome === 'practice')
    .map((entry) => `${entry.label} — revisit the fundamentals`);

  const strongCount = topicBreakdown.filter((e) => e.outcome === 'strong').length;
  const solidCount = topicBreakdown.filter((e) => e.outcome === 'solid').length;

  let overallNote: string;
  if (strongCount >= 4) {
    overallNote =
      'Interviewer verdict: exceptional defense. You connected mechanics, complexity, and trade-offs with explicit reasoning — exactly what separates code that passes tests from code that survives review.';
  } else if (strongCount + solidCount >= 4) {
    overallNote =
      'Interviewer verdict: hire-worthy fundamentals. You understood the mechanics well; sharpen your ability to articulate why, not just what, and the reasoning gaps will close on their own.';
  } else if (strongCount + solidCount >= 2) {
    overallNote =
      'Interviewer verdict: partial defense. You held up on some stages but leaned on pattern-matching elsewhere. Re-derive the mechanics on paper — termination and the cost model are where the reasoning gaps showed.';
  } else {
    overallNote =
      'Interviewer verdict: not ready yet. The code runs, but the decisions behind it did not hold up under pressure. Rebuild the mental model: why the loop, when it stops, what it costs, and how edge cases fail.';
  }

  return {
    completedAt,
    durationSeconds: Math.max(
      0,
      Math.round((completedAt - session.startedAt) / 1000),
    ),
    questionsAnswered: candidateMessages.length,
    strengths,
    needsPractice,
    overallNote,
    topicBreakdown,
    categoryCounts,
  };
}
