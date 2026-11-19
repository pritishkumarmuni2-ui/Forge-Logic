import { TWO_SUM, INTERVIEW_STAGES } from '../data/problems';

export function ProblemPanel() {
  return (
    <aside className="panel problem-panel" aria-label="Problem statement">
      <div className="panel-header">
        <span className="panel-eyebrow">Problem</span>
        <div className="panel-header-row">
          <h1 className="panel-title">{TWO_SUM.title}</h1>
          <span className="difficulty-chip">{TWO_SUM.difficulty}</span>
        </div>
        <div className="tag-row">
          {TWO_SUM.tags.map((tag) => (
            <span key={tag} className="tag-chip">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="panel-scroll">
        <section className="problem-section">
          {TWO_SUM.statement.map((paragraph, index) => (
            <p key={index} className="problem-text">
              {paragraph}
            </p>
          ))}
          <p className="problem-text followup">
            <span className="followup-label">Follow-up</span>
            {TWO_SUM.followUp}
          </p>
        </section>

        <section className="problem-section" aria-label="Examples">
          <h2 className="section-title">Examples</h2>
          {TWO_SUM.examples.map((example, index) => (
            <figure key={index} className="example-block">
              <figcaption className="example-caption">Example {index + 1}</figcaption>
              <pre className="example-code">
                {`Input:  ${example.input}\nOutput: ${example.output}`}
                {example.explanation ? `\n${example.explanation}` : ''}
              </pre>
            </figure>
          ))}
        </section>

        <section className="problem-section" aria-label="Constraints">
          <h2 className="section-title">Constraints</h2>
          <ul className="constraint-list">
            {TWO_SUM.constraints.map((constraint) => (
              <li key={constraint}>
                <code>{constraint}</code>
              </li>
            ))}
          </ul>
        </section>

        <section className="problem-section" aria-label="Interview roadmap">
          <h2 className="section-title">The Defense Arc</h2>
          <ol className="stage-list">
            {INTERVIEW_STAGES.map((stage) => (
              <li key={stage.id} className="stage-item">
                <span className="stage-number">{stage.stage}</span>
                <span className="stage-name">{stage.title}</span>
              </li>
            ))}
          </ol>
          <p className="defense-note">
            The interviewer asks <em>why</em>, not <em>what</em>. Have your rationale
            ready before you submit.
          </p>
        </section>
      </div>
    </aside>
  );
}
