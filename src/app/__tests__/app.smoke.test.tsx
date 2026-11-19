import { describe, expect, it } from 'vitest';
import { renderToString } from 'react-dom/server';
import App from '../App';

/**
 * Server-side render smoke test: proves the whole component tree mounts,
 * including state initializers, without a DOM or localStorage.
 */
describe('App smoke test', () => {
  it('renders the workspace shell without crashing', () => {
    const html = renderToString(<App />);
    expect(html).toContain('ForgeLogic');
    expect(html).toContain('Two Sum');
    expect(html).toContain('Submit Code &amp; Start');
    expect(html).toContain('Interview Transcript');
  });
});
