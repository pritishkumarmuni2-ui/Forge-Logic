import type { CodeInspection, LoopStyle } from '../types/interview';

/**
 * Static pattern heuristics — no code is ever executed or parsed into an AST.
 * Comments are stripped first so `for` inside a comment doesn't register.
 */
export function inspectCode(code: string): CodeInspection {
  const stripped = code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');

  const forMatches = stripped.match(/\bfor\s*\(/g) ?? [];
  const whileMatches = stripped.match(/\bwhile\s*\(/g) ?? [];

  const usesForLoop = forMatches.length > 0;
  const usesWhileLoop = whileMatches.length > 0;
  const usesNestedLoops =
    forMatches.length >= 2 ||
    whileMatches.length >= 2 ||
    (usesForLoop && usesWhileLoop);

  const usesHashStructure =
    /new\s+(Map|Set)\s*\(/.test(stripped) ||
    /\b(seen|map|cache|lookup|hash|freq|counts?|visited|complement)\s*=\s*(new Map|new Set|\{)/.test(
      stripped,
    );

  let loopStyle: LoopStyle = 'unknown';
  if (usesNestedLoops) loopStyle = 'nested-for';
  else if (usesHashStructure && usesForLoop) loopStyle = 'hash-map';
  else if (usesForLoop) loopStyle = 'for';
  else if (usesWhileLoop) loopStyle = 'while';

  return {
    loopStyle,
    lineCount: code.split('\n').length,
    usesForLoop,
    usesWhileLoop,
    usesNestedLoops,
    usesHashStructure,
  };
}
