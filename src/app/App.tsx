import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { ProblemPanel } from '../components/ProblemPanel';
import { CodeEditor } from '../components/CodeEditor';
import { InterviewPanel } from '../components/InterviewPanel';
import { AnswerComposer } from '../components/AnswerComposer';
import { SessionSummary } from '../components/SessionSummary';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { STARTER_CODE } from '../data/problems';
import { buildSummary, startInterview, submitAnswer } from '../engine/mockInterviewer';
import { sessionStorageService } from '../services/sessionStorage';
import type {
  InterviewSession,
  Phase,
  SessionSummary as Summary,
} from '../types/interview';

interface PersistedState {
  session: InterviewSession | null;
  summary: Summary | null;
}

/**
 * Loads persisted state once. If a session was stored as "completed" without a
 * summary (e.g. the tab closed mid-transition), the review is rebuilt here.
 */
function loadPersistedState(): PersistedState {
  const session = sessionStorageService.loadSession();
  const stored = sessionStorageService.loadSummary();
  if (stored) return { session, summary: stored };
  if (session?.status === 'completed') {
    const rebuilt = buildSummary(session);
    sessionStorageService.saveSummary(rebuilt);
    return { session, summary: rebuilt };
  }
  return { session, summary: null };
}

export default function App() {
  const [initialPersisted] = useState(loadPersistedState);
  const [code, setCode] = useState<string>(
    () => sessionStorageService.loadCode() ?? STARTER_CODE,
  );
  const [session, setSession] = useState<InterviewSession | null>(
    initialPersisted.session,
  );
  const [summary, setSummary] = useState<Summary | null>(initialPersisted.summary);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Phase is derived — never stored — so it can't drift out of sync.
  const phase: Phase = summary ? 'review' : session ? 'interviewing' : 'editing';
  const interviewActive = session?.status === 'active';

  // Persist the editor draft on every change.
  useEffect(() => {
    sessionStorageService.saveCode(code);
  }, [code]);

  // Persist the session snapshot so a refresh never loses the defense.
  useEffect(() => {
    if (session) sessionStorageService.saveSession(session);
  }, [session]);

  const handleSubmitCode = () => {
    if (phase !== 'editing') return;
    sessionStorageService.clearAll();
    sessionStorageService.saveCode(code);
    setSummary(null);
    setSession(startInterview(code));
  };

  const handleAnswer = (answer: string) => {
    if (!session || session.status !== 'active') return;
    const next = submitAnswer(session, answer);
    setSession(next);
    if (next.status === 'completed' && !summary) {
      const built = buildSummary(next);
      sessionStorageService.saveSummary(built);
      setSummary(built);
    }
  };

  const resetWorkspace = () => {
    sessionStorageService.clearAll();
    setCode(STARTER_CODE);
    setSession(null);
    setSummary(null);
    setConfirmOpen(false);
  };

  const handleNewInterview = () => {
    if (interviewActive) {
      setConfirmOpen(true);
      return;
    }
    resetWorkspace();
  };

  return (
    <div className="app-shell">
      <Header phase={phase} onNewInterview={handleNewInterview} />

      {phase === 'review' && summary ? (
        <main className="review-workspace">
          <SessionSummary summary={summary} onStartNew={resetWorkspace} />
        </main>
      ) : (
        <main className="workspace">
          <ProblemPanel />

          <CodeEditor
            code={code}
            phase={phase}
            onChange={setCode}
            onSubmit={handleSubmitCode}
            onUnlock={() => setConfirmOpen(true)}
          />

          <div className="interview-column">
            <InterviewPanel
              phase={phase}
              messages={session?.messages ?? []}
              topicResults={session?.topicResults ?? []}
              currentTopicIndex={session?.currentTopicIndex ?? 0}
              status={session?.status ?? null}
            />
            <AnswerComposer
              disabled={phase !== 'interviewing'}
              completed={session?.status === 'completed'}
              onSubmit={handleAnswer}
            />
          </div>
        </main>
      )}

      <ConfirmationModal
        open={confirmOpen}
        title="Discard this interview?"
        message="Your in-progress defense, the code you submitted, and this session's progress will be discarded. This cannot be undone."
        confirmLabel="Discard & restart"
        onConfirm={resetWorkspace}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
