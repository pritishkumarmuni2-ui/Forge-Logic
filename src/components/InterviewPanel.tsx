import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { TOPIC_FLOW, TOPIC_CONFIG } from '../data/interviewQuestions';
import type { ChatMessage, Phase, TopicResult } from '../types/interview';

interface InterviewPanelProps {
  phase: Phase;
  messages: ChatMessage[];
  topicResults: TopicResult[];
  currentTopicIndex: number;
  status: 'active' | 'completed' | null;
}

export function InterviewPanel({
  phase,
  messages,
  topicResults,
  currentTopicIndex,
  status,
}: InterviewPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  const isIdle = phase === 'editing';

  return (
    <section className="panel interview-panel" aria-label="Interview transcript">
      <div className="panel-header">
        <div className="panel-header-row">
          <div>
            <span className="panel-eyebrow">Defense</span>
            <h2 className="panel-title panel-title-sm">Interview Transcript</h2>
          </div>
          {status === 'active' && (
            <span className="live-badge">
              <span className="live-dot" aria-hidden="true" />
              LIVE
            </span>
          )}
        </div>

        {!isIdle && (
          <div className="topic-progress" aria-label="Defense progress">
            {TOPIC_FLOW.map((topic, index) => {
              const result = topicResults.find((r) => r.topic === topic);
              const state = result?.resolved
                ? result.neededHint
                  ? 'hinted'
                  : 'done'
                : index === currentTopicIndex && status === 'active'
                  ? 'current'
                  : 'pending';
              return (
                <div
                  key={topic}
                  className={`progress-segment progress-${state}`}
                  title={`${TOPIC_CONFIG[topic].stage} · ${TOPIC_CONFIG[topic].label}`}
                >
                  <span className="progress-label">{TOPIC_CONFIG[topic].stage}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="transcript-scroll" ref={scrollRef}>
        {isIdle ? (
          <div className="transcript-empty">
            <div className="empty-orb" aria-hidden="true">
              <svg viewBox="0 0 48 48" width="46" height="46" fill="none">
                <path
                  d="M17 19 9 27l8 8M31 19l8 8-8 8"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3>Awaiting your submission</h3>
            <p>
              Solve <strong>Two Sum</strong> in the editor, then hit{' '}
              <strong>Submit Code &amp; Start</strong>. A staff-level interviewer will
              probe why you made each decision — loop choice, termination, complexity,
              edge cases and trade-offs.
            </p>
            <ul className="empty-points">
              <li>Adaptive branching on your reasoning, not your code style</li>
              <li>Hints only when you're truly stuck — no free answers</li>
              <li>Structured defense review at the end</li>
            </ul>
          </div>
        ) : (
          <div className="transcript-messages">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {messages.length === 0 && (
              <p className="transcript-hint">The interviewer is preparing…</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
