export type AnswerCategory =
  | 'correct_with_reasoning'
  | 'correct_but_shallow'
  | 'partially_correct'
  | 'incorrect_or_confused'
  | 'alternative_possible'
  | 'unclear';

export type Phase = 'editing' | 'interviewing' | 'review';

export type TopicId =
  | 'loop-choice'
  | 'termination'
  | 'complexity'
  | 'edge-cases'
  | 'tradeoffs';

export type MessageRole = 'interviewer' | 'candidate';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
  /** Set on candidate messages after the classifier runs. */
  category?: AnswerCategory;
}

export type LoopStyle = 'for' | 'while' | 'nested-for' | 'hash-map' | 'unknown';

export interface CodeInspection {
  loopStyle: LoopStyle;
  lineCount: number;
  usesForLoop: boolean;
  usesWhileLoop: boolean;
  usesNestedLoops: boolean;
  usesHashStructure: boolean;
}

export interface TopicResult {
  topic: TopicId;
  attempts: number;
  bestCategory: AnswerCategory | null;
  resolved: boolean;
  neededHint: boolean;
}

export interface InterviewSession {
  id: string;
  code: string;
  inspection: CodeInspection;
  startedAt: number;
  messages: ChatMessage[];
  currentTopicIndex: number;
  topicResults: TopicResult[];
  status: 'active' | 'completed';
}

export type TopicOutcome = 'strong' | 'solid' | 'practice';

export interface TopicBreakdown {
  topic: TopicId;
  label: string;
  outcome: TopicOutcome;
  attempts: number;
}

export interface SessionSummary {
  completedAt: number;
  durationSeconds: number;
  questionsAnswered: number;
  strengths: string[];
  needsPractice: string[];
  overallNote: string;
  topicBreakdown: TopicBreakdown[];
  categoryCounts: Record<AnswerCategory, number>;
}
