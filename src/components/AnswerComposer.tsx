import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

interface AnswerComposerProps {
  disabled: boolean;
  completed: boolean;
  onSubmit: (answer: string) => void;
}

export function AnswerComposer({ disabled, completed, onSubmit }: AnswerComposerProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!disabled && !completed) {
      textareaRef.current?.focus();
    }
  }, [disabled, completed]);

  const canSend = !disabled && !completed && value.trim().length > 0;

  const send = () => {
    if (!canSend) return;
    onSubmit(value.trim());
    setValue('');
    textareaRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  const placeholder = completed
    ? 'Interview complete — see your review.'
    : disabled
      ? 'Submit your solution to unlock the defense…'
      : 'Defend your decision — be specific about why…';

  return (
    <div className="answer-composer">
      <textarea
        ref={textareaRef}
        className="composer-input"
        rows={2}
        value={value}
        placeholder={placeholder}
        disabled={disabled || completed}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        aria-label="Your answer"
      />
      <div className="composer-footer">
        <span className="composer-hint">
          <kbd>Enter</kbd> send · <kbd>Shift</kbd> + <kbd>Enter</kbd> new line
        </span>
        <button
          type="button"
          className="btn btn-primary btn-send"
          onClick={send}
          disabled={!canSend}
          aria-label="Send answer"
        >
          Defend
          <svg viewBox="0 0 16 16" width="15" height="15" fill="none" aria-hidden="true">
            <path
              d="M14 2 7.5 14l-1.6-5.9L.5 6.5 14 2Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
