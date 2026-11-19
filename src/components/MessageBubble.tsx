import type { AnswerCategory, ChatMessage } from '../types/interview';

const CATEGORY_META: Record<AnswerCategory, { label: string; tone: string }> = {
  correct_with_reasoning: { label: 'Reasoned', tone: 'good' },
  alternative_possible: { label: 'Alternative', tone: 'info' },
  correct_but_shallow: { label: 'Shallow', tone: 'warn' },
  partially_correct: { label: 'Partial', tone: 'warn' },
  incorrect_or_confused: { label: 'Misconception', tone: 'bad' },
  unclear: { label: 'Unclear', tone: 'bad' },
};

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isInterviewer = message.role === 'interviewer';
  const meta = message.category ? CATEGORY_META[message.category] : null;

  return (
    <div className={`message-row ${isInterviewer ? 'from-interviewer' : 'from-candidate'}`}>
      {isInterviewer && (
        <span className="avatar avatar-interviewer" aria-hidden="true">
          <svg viewBox="0 0 20 20" width="15" height="15" fill="none">
            <path
              d="M6.5 7 3 10l3.5 3M13.5 7 17 10l-3.5 3"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}

      <div className={`message-bubble ${isInterviewer ? 'bubble-interviewer' : 'bubble-candidate'}`}>
        <div className="bubble-meta">
          <span className="bubble-author">{isInterviewer ? 'Forge' : 'You'}</span>
          <span className="bubble-time">{formatTime(message.timestamp)}</span>
          {meta && (
            <span className={`category-chip category-${meta.tone}`} title="Classifier verdict">
              {meta.label}
            </span>
          )}
        </div>
        <p className="bubble-text">{message.text}</p>
      </div>

      {!isInterviewer && (
        <span className="avatar avatar-candidate" aria-hidden="true">
          <svg viewBox="0 0 20 20" width="15" height="15" fill="none">
            <circle cx="10" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M4.5 16.5a5.5 5.5 0 0 1 11 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
      )}
    </div>
  );
}
