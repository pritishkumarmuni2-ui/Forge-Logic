import { useEffect, useMemo, useRef } from 'react';
import type { Phase } from '../types/interview';

interface CodeEditorProps {
  code: string;
  phase: Phase;
  onChange: (code: string) => void;
  onSubmit: () => void;
  onUnlock: () => void;
}

export function CodeEditor({
  code,
  phase,
  onChange,
  onSubmit,
  onUnlock,
}: CodeEditorProps) {
  const gutterRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const locked = phase !== 'editing';

  const lineNumbers = useMemo(
    () => Array.from({ length: code.split('\n').length }, (_, i) => i + 1),
    [code],
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    const gutter = gutterRef.current;
    if (!textarea || !gutter) return;
    const syncScroll = () => {
      gutter.scrollTop = textarea.scrollTop;
    };
    textarea.addEventListener('scroll', syncScroll);
    return () => textarea.removeEventListener('scroll', syncScroll);
  }, []);

  const charCount = code.length;
  const lineCount = lineNumbers.length;
  const canSubmit = code.trim().length > 0 && !locked;

  return (
    <section className="panel editor-panel" aria-label="Code editor">
      <div className="panel-header panel-header-inline">
        <div>
          <span className="panel-eyebrow">Editor</span>
          <h2 className="panel-title panel-title-sm">solution.js</h2>
        </div>
        <div className="editor-meta">
          <span className="meta-chip">JavaScript</span>
          {locked && <span className="meta-chip meta-chip-locked">Locked</span>}
        </div>
      </div>

      <div className="editor-surface">
        <div className="editor-gutter" ref={gutterRef} aria-hidden="true">
          {lineNumbers.map((line) => (
            <span key={line} className="gutter-line">
              {line}
            </span>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          className="editor-textarea"
          value={code}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
              event.preventDefault();
              if (canSubmit) onSubmit();
            }
          }}
          readOnly={locked}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-label="Solution code"
        />
        {locked && (
          <div className="editor-locked-overlay" role="note">
            <div className="locked-card">
              <svg viewBox="0 0 20 20" width="18" height="18" fill="none" aria-hidden="true">
                <rect x="4" y="9" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M7 9V6.5a3 3 0 0 1 6 0V9" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <p>Code locked during the defense. Editing ends this interview.</p>
              <button type="button" className="btn btn-ghost btn-small" onClick={onUnlock}>
                End session &amp; edit code
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="editor-footer">
        <span className="editor-stats">
          {lineCount} lines · {charCount} chars
        </span>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onSubmit}
          disabled={!canSubmit}
        >
          Submit Code &amp; Start
          <kbd>⌘⏎</kbd>
        </button>
      </div>
    </section>
  );
}
