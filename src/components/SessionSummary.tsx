import type { SessionSummary as Summary, TopicOutcome } from '../types/interview';
import { INTERVIEW_STAGES } from '../data/problems';

const STAGE_BY_TOPIC = new Map(INTERVIEW_STAGES.map((stage) => [stage.id, stage.stage]));

interface SessionSummaryProps {
  summary: Summary;
  onStartNew: () => void;
}

const OUTCOME_META: Record<TopicOutcome, { label: string; tone: string }> = {
  strong: { label: 'Strong', tone: 'good' },
  solid: { label: 'Solid', tone: 'info' },
  practice: { label: 'Practice', tone: 'bad' },
};

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}m ${rest.toString().padStart(2, '0')}s`;
}

export function SessionSummary({ summary, onStartNew }: SessionSummaryProps) {
  const strongCount = summary.topicBreakdown.filter((t) => t.outcome === 'strong').length;
  const answered = summary.questionsAnswered;

  return (
    <div className="review-stage">
      <div className="review-card">
        <div className="review-hero">
          <span className="review-emblem" aria-hidden="true">
            <svg viewBox="0 0 44 44" width="40" height="40" fill="none">
              <circle cx="22" cy="22" r="20" className="emblem-ring" strokeWidth="2.4" />
              <path
                d="M14 22.5 19.5 28 30 16.5"
                stroke="currentColor"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div>
            <span className="panel-eyebrow">End of Session</span>
            <h1 className="review-title">Defense Review</h1>
            <p className="review-subtitle">Two Sum · JavaScript · Adaptive interview</p>
          </div>
        </div>

        <div className="stat-row" role="list" aria-label="Session statistics">
          <div className="stat-tile" role="listitem">
            <span className="stat-value">{answered}</span>
            <span className="stat-label">Answers given</span>
          </div>
          <div className="stat-tile" role="listitem">
            <span className="stat-value">{strongCount}/{summary.topicBreakdown.length}</span>
            <span className="stat-label">Stages aced</span>
          </div>
          <div className="stat-tile" role="listitem">
            <span className="stat-value">{formatDuration(summary.durationSeconds)}</span>
            <span className="stat-label">Defense time</span>
          </div>
          <div className="stat-tile" role="listitem">
            <span className="stat-value">{summary.categoryCounts.correct_with_reasoning}</span>
            <span className="stat-label">Reasoned answers</span>
          </div>
        </div>

        <div className="review-grid">
          <section aria-label="Stage breakdown">
            <h2 className="section-title">Stage Breakdown</h2>
            <ul className="breakdown-list">
              {summary.topicBreakdown.map((entry) => {
                const meta = OUTCOME_META[entry.outcome];
                return (
                  <li key={entry.topic} className="breakdown-item">
                    <span className="breakdown-stage">{STAGE_BY_TOPIC.get(entry.topic) ?? '·'}</span>
                    <span className="breakdown-label">{entry.label}</span>
                    <span className="breakdown-attempts">
                      {entry.attempts} {entry.attempts === 1 ? 'try' : 'tries'}
                    </span>
                    <span className={`category-chip category-${meta.tone}`}>{meta.label}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <div className="review-columns">
            <section aria-label="Demonstrated strengths">
              <h2 className="section-title">What Held Up</h2>
              {summary.strengths.length > 0 ? (
                <ul className="verdict-list verdict-good">
                  {summary.strengths.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="verdict-empty">Nothing held up yet — the fundamentals need reps.</p>
              )}
            </section>

            <section aria-label="Areas to practice">
              <h2 className="section-title">What To Practice</h2>
              {summary.needsPractice.length > 0 ? (
                <ul className="verdict-list verdict-bad">
                  {summary.needsPractice.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="verdict-empty">Nothing outstanding — clean sweep.</p>
              )}
            </section>
          </div>
        </div>

        <blockquote className="review-note">
          <span className="review-note-label">Interviewer Note</span>
          {summary.overallNote}
        </blockquote>

        <div className="review-actions">
          <button type="button" className="btn btn-primary btn-large" onClick={onStartNew}>
            Start New Interview
            <svg viewBox="0 0 16 16" width="15" height="15" fill="none" aria-hidden="true">
              <path
                d="M6 3.5h7.5v7.5M13 3.5 4 12.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
