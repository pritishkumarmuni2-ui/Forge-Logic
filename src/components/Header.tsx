import type { Phase } from '../types/interview';

interface HeaderProps {
  phase: Phase;
  onNewInterview: () => void;
}

const STATUS: Record<Phase, { label: string; tone: string }> = {
  editing: { label: 'Drafting solution', tone: 'amber' },
  interviewing: { label: 'Defense live', tone: 'green' },
  review: { label: 'Review complete', tone: 'blue' },
};

export function Header({ phase, onNewInterview }: HeaderProps) {
  const status = STATUS[phase];

  return (
    <header className="app-header">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="26" height="26" fill="none">
            <rect x="1.5" y="1.5" width="29" height="29" rx="8" className="brand-mark-bg" />
            <path
              d="M12.5 11.5 8 16l4.5 4.5M19.5 11.5 24 16l-4.5 4.5M17.2 10l-2.4 12"
              stroke="url(#brand-gradient)"
              strokeWidth="2.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="brand-gradient" x1="8" y1="10" x2="24" y2="22">
                <stop stopColor="#ffd166" />
                <stop offset="1" stopColor="#ff7a18" />
              </linearGradient>
            </defs>
          </svg>
        </span>
        <span className="brand-copy">
          <span className="brand-name">ForgeLogic</span>
          <span className="brand-tagline">Code Interview Defense</span>
        </span>
      </div>

      <div className="header-right">
        <span className="stage-chip" title="Current problem">
          Two Sum · JS
        </span>
        <span className={`status-pill status-${status.tone}`} role="status">
          <span className="status-dot" aria-hidden="true" />
          {status.label}
        </span>
        <button type="button" className="btn btn-ghost" onClick={onNewInterview}>
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true">
            <path
              d="M13.5 8a5.5 5.5 0 1 1-1.61-3.89M13.5 2.5v3h-3"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          New Interview
        </button>
      </div>
    </header>
  );
}
