import type { RootNode, AstNode, Features } from 'regjsparser';

export type DebugStepRef = AstNode<Features> | 'start' | 'end';

export interface DebugStep {
  stringIndex: number;
  astNodeRef: DebugStepRef;
}

/**
 * Check if a single code point matches a character class body item.
 */
function matchesCharacterClassBody(
  body: import('regjsparser').CharacterClassBody,
  codePoint: number
): boolean {
  if (body.type === 'value') {
    return body.codePoint === codePoint;
  }
  if (body.type === 'characterClassRange') {
    const min = body.min.codePoint;
    const max = body.max.codePoint;
    return codePoint >= min && codePoint <= max;
  }
  if (body.type === 'characterClassEscape') {
    const ch = String.fromCodePoint(codePoint);
    switch (body.value) {
      case 'd':
        return /\d/.test(ch);
      case 'D':
        return /\D/.test(ch);
      case 'w':
        return /\w/.test(ch);
      case 'W':
        return /\W/.test(ch);
      case 's':
        return /\s/.test(ch);
      case 'S':
        return /\S/.test(ch);
      default:
        return false;
    }
  }
  return false;
}

/**
 * Check if code point matches the character class (positive or negative).
 */
function matchesCharacterClass(
  node: import('regjsparser').CharacterClass<Features>,
  codePoint: number
): boolean {
  let inClass = node.body.some((b) => matchesCharacterClassBody(b, codePoint));
  return node.negative ? !inClass : inClass;
}

/**
 * Match a single node exactly `count` times in sequence. Returns new position or null.
 */
function matchRepeat(
  node: RootNode<Features> | AstNode<Features>,
  str: string,
  pos: number,
  steps: DebugStep[],
  root: RootNode<Features>,
  count: number
): number | null {
  let p = pos;
  for (let i = 0; i < count; i++) {
    const next = match(node, str, p, steps, root);
    if (next === null) return null;
    p = next;
  }
  return p;
}

/**
 * Match a sequence of nodes (alternative body) with backtracking on quantifiers.
 * When a quantifier is greedy we try max down to min repetitions so the rest of the pattern can match.
 */
function matchAlternativeSequence(
  body: (RootNode<Features> | AstNode<Features>)[],
  str: string,
  pos: number,
  steps: DebugStep[],
  root: RootNode<Features>,
  startIndex: number
): number | null {
  if (startIndex >= body.length) return pos;
  const node = body[startIndex];

  if (node.type === 'quantifier') {
    const child = node.body[0];
    const min = node.min;
    const maxLimit = node.max ?? Infinity;
    const maxTry = typeof maxLimit === 'number'
      ? Math.min(maxLimit, str.length - pos)
      : str.length - pos;
    const savedLen = steps.length;
    steps.push({ stringIndex: pos, astNodeRef: node });
    // Greedy: try from max down to min so that the rest of the pattern can match
    for (let k = maxTry; k >= min; k--) {
      steps.length = savedLen + 1;
      const p = matchRepeat(child, str, pos, steps, root, k);
      if (p !== null) {
        const result = matchAlternativeSequence(body, str, p, steps, root, startIndex + 1);
        if (result !== null) return result;
      }
    }
    steps.length = savedLen;
    return null;
  }

  const next = match(node, str, pos, steps, root);
  if (next === null) return null;
  return matchAlternativeSequence(body, str, next, steps, root, startIndex + 1);
}

/**
 * Backtracking matcher: tries to match from node at pos, records steps on the path.
 * Returns new position or null. Mutates steps (push on enter, pop on backtrack).
 */
function match(
  node: RootNode<Features> | AstNode<Features>,
  str: string,
  pos: number,
  steps: DebugStep[],
  root: RootNode<Features>
): number | null {
  const len = str.length;

  if (node.type === 'alternative') {
    steps.push({ stringIndex: pos, astNodeRef: node });
    const result = matchAlternativeSequence(node.body, str, pos, steps, root, 0);
    if (result === null) steps.pop();
    return result;
  }

  if (node.type === 'group') {
    steps.push({ stringIndex: pos, astNodeRef: node });
    const result = matchAlternativeSequence(node.body, str, pos, steps, root, 0);
    if (result === null) steps.pop();
    return result;
  }

  if (node.type === 'quantifier') {
    steps.push({ stringIndex: pos, astNodeRef: node });
    const child = node.body[0];
    const min = node.min;
    const max = node.max ?? Infinity;
    let p = pos;

    // Must match at least min times
    for (let i = 0; i < min; i++) {
      const next = match(child, str, p, steps, root);
      if (next === null) {
        steps.pop();
        return null;
      }
      p = next;
    }

    // Greedy: try to match as many as possible (up to max), passing updated position
    const tryMore = (count: number, currentPos: number): number | null => {
      if (count >= max) return currentPos;
      const next = match(child, str, currentPos, steps, root);
      if (next === null) return currentPos;
      return tryMore(count + 1, next);
    };

    if (node.greedy) {
      return tryMore(min, p);
    }

    // Non-greedy: same for now (could try fewer first, then more)
    return tryMore(min, p);
  }

  if (node.type === 'disjunction') {
    steps.push({ stringIndex: pos, astNodeRef: node });
    for (const alt of node.body) {
      const saved = steps.length;
      const next = match(alt, str, pos, steps, root);
      if (next !== null) return next;
      while (steps.length > saved) steps.pop();
    }
    steps.pop();
    return null;
  }

  if (node.type === 'anchor') {
    steps.push({ stringIndex: pos, astNodeRef: node });
    let ok = false;
    if (node.kind === 'start') ok = pos === 0;
    else if (node.kind === 'end') ok = pos === len;
    else if (node.kind === 'boundary') {
      const prev = pos === 0 ? '' : str[pos - 1];
      const curr = pos >= len ? '' : str[pos];
      ok = /\w/.test(prev) !== /\w/.test(curr);
    } else if (node.kind === 'not-boundary') {
      const prev = pos === 0 ? '' : str[pos - 1];
      const curr = pos >= len ? '' : str[pos];
      ok = /\w/.test(prev) === /\w/.test(curr);
    }
    if (!ok) {
      steps.pop();
      return null;
    }
    return pos;
  }

  if (node.type === 'value') {
    steps.push({ stringIndex: pos, astNodeRef: node });
    if (pos < len && str.codePointAt(pos) === node.codePoint) {
      const charLen = node.codePoint <= 0xffff ? 1 : 2;
      return pos + charLen;
    }
    steps.pop();
    return null;
  }

  if (node.type === 'dot') {
    steps.push({ stringIndex: pos, astNodeRef: node });
    if (pos < len) {
      const cp = str.codePointAt(pos)!;
      const charLen = cp <= 0xffff ? 1 : 2;
      return pos + charLen;
    }
    steps.pop();
    return null;
  }

  if (node.type === 'characterClass') {
    steps.push({ stringIndex: pos, astNodeRef: node });
    if (pos < len) {
      const cp = str.codePointAt(pos)!;
      if (matchesCharacterClass(node, cp)) {
        const charLen = cp <= 0xffff ? 1 : 2;
        return pos + charLen;
      }
    }
    steps.pop();
    return null;
  }

  // Standalone \d \D \w \W \s \S (parsed as characterClassEscape when outside [...])
  if (node.type === 'characterClassEscape') {
    steps.push({ stringIndex: pos, astNodeRef: node });
    if (pos < len) {
      const cp = str.codePointAt(pos)!;
      const ch = String.fromCodePoint(cp);
      let ok = false;
      switch (node.value) {
        case 'd': ok = /\d/.test(ch); break;
        case 'D': ok = /\D/.test(ch); break;
        case 'w': ok = /\w/.test(ch); break;
        case 'W': ok = /\W/.test(ch); break;
        case 's': ok = /\s/.test(ch); break;
        case 'S': ok = /\S/.test(ch); break;
        default: ok = false;
      }
      if (ok) {
        const charLen = cp <= 0xffff ? 1 : 2;
        return pos + charLen;
      }
    }
    steps.pop();
    return null;
  }

  // reference, unicodePropertyEscape, etc. - skip for MVP or treat as no-op
  steps.push({ stringIndex: pos, astNodeRef: node });
  steps.pop();
  return null;
}

/**
 * Builds a step-by-step execution trace for matching the regex (AST) against the string.
 * Only records the path of a successful match. Returns empty array if no match.
 */
export function buildDebugSteps(
  ast: RootNode<Features> | null,
  str: string
): DebugStep[] {
  if (!ast) return [];

  const matchRootAt = (pos: number, steps: DebugStep[]): number | null => {
    if (ast.type === 'disjunction') {
      for (const alt of ast.body) {
        const saved = steps.length;
        const next = match(alt, str, pos, steps, ast);
        if (next !== null) {
          return next;
        }
        while (steps.length > saved) steps.pop();
      }
      return null;
    }

    if (ast.type === 'alternative') {
      return matchAlternativeSequence(ast.body, str, pos, steps, ast, 0);
    }

    return match(ast, str, pos, steps, ast);
  };

  // Match like RegExp.exec: scan from left to right for the first successful start index.
  for (let pos = 0; pos <= str.length; pos++) {
    const steps: DebugStep[] = [{ stringIndex: pos, astNodeRef: 'start' }];
    const next = matchRootAt(pos, steps);
    if (next !== null) {
      steps.push({ stringIndex: next, astNodeRef: 'end' });
      return steps;
    }
  }

  return [];
}
