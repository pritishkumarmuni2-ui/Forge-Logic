import type {
  InterviewSession,
  SessionSummary,
} from '../types/interview';

const CODE_KEY = 'forgelogic.code';
const SESSION_KEY = 'forgelogic.session.v1';
const SUMMARY_KEY = 'forgelogic.summary.v1';

function storage(): Storage | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage;
  } catch {
    return null;
  }
}

function safeGet(key: string): string | null {
  try {
    return storage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): boolean {
  try {
    storage()?.setItem(key, value);
    return true;
  } catch {
    // Quota exceeded or serialization blocked — persistence is best-effort.
    return false;
  }
}

function safeRemove(key: string): void {
  try {
    storage()?.removeItem(key);
  } catch {
    // Ignore — clearing is best-effort.
  }
}

function isInterviewSession(value: unknown): value is InterviewSession {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.code === 'string' &&
    typeof candidate.startedAt === 'number' &&
    Array.isArray(candidate.messages) &&
    typeof candidate.currentTopicIndex === 'number' &&
    Array.isArray(candidate.topicResults) &&
    (candidate.status === 'active' || candidate.status === 'completed')
  );
}

function isSessionSummary(value: unknown): value is SessionSummary {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.completedAt === 'number' &&
    typeof candidate.questionsAnswered === 'number' &&
    Array.isArray(candidate.strengths) &&
    Array.isArray(candidate.needsPractice) &&
    typeof candidate.overallNote === 'string' &&
    Array.isArray(candidate.topicBreakdown)
  );
}

export const sessionStorageService = {
  saveCode(code: string): boolean {
    return safeSet(CODE_KEY, code);
  },

  loadCode(): string | null {
    return safeGet(CODE_KEY);
  },

  saveSession(session: InterviewSession): boolean {
    try {
      return safeSet(SESSION_KEY, JSON.stringify(session));
    } catch {
      return false;
    }
  },

  loadSession(): InterviewSession | null {
    const raw = safeGet(SESSION_KEY);
    if (!raw) return null;
    try {
      const parsed: unknown = JSON.parse(raw);
      return isInterviewSession(parsed) ? parsed : null;
    } catch {
      return null;
    }
  },

  saveSummary(summary: SessionSummary): boolean {
    try {
      return safeSet(SUMMARY_KEY, JSON.stringify(summary));
    } catch {
      return false;
    }
  },

  loadSummary(): SessionSummary | null {
    const raw = safeGet(SUMMARY_KEY);
    if (!raw) return null;
    try {
      const parsed: unknown = JSON.parse(raw);
      return isSessionSummary(parsed) ? parsed : null;
    } catch {
      return null;
    }
  },

  clearAll(): void {
    safeRemove(CODE_KEY);
    safeRemove(SESSION_KEY);
    safeRemove(SUMMARY_KEY);
  },
};
