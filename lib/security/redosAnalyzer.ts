import type { AstNode, Features, RootNode } from "regjsparser";
import { getSuggestionBundle, type RedosFindingKind } from "./redosSuggestions";

export type RedosRiskLevel = "low" | "medium" | "high";
export type RedosSeverity = "medium" | "high";

export interface RedosFinding {
  id: string;
  kind: RedosFindingKind;
  severity: RedosSeverity;
  title: string;
  reason: string;
  suggestion: string;
  alternatives: string[];
  exampleInput: string;
  nodeType: string;
  raw: string;
  range: [number, number] | null;
  nodeRef?: AstNode<Features>;
}

export interface RedosAnalysis {
  riskLevel: RedosRiskLevel;
  score: number;
  summary: string;
  disclaimer: string;
  findings: RedosFinding[];
}

function getChildren(
  node: AstNode<Features> | RootNode<Features>,
): AstNode<Features>[] {
  if (node.type === "alternative") {
    return node.body;
  }

  if (node.type === "group") {
    return node.body;
  }

  if (node.type === "quantifier") {
    return node.body;
  }

  if (node.type === "disjunction") {
    return node.body;
  }

  return [];
}

function walkAst(
  node: AstNode<Features> | RootNode<Features>,
  visitor: (node: AstNode<Features>) => void,
): void {
  visitor(node);
  for (const child of getChildren(node)) {
    walkAst(child, visitor);
  }
}

function isUnboundedQuantifier(node: AstNode<Features>): boolean {
  if (node.type !== "quantifier") {
    return false;
  }

  return node.max === undefined || node.symbol === "*" || node.symbol === "+";
}

function findNestedQuantifier(
  node: AstNode<Features>,
): AstNode<Features> | null {
  if (node.type !== "quantifier") {
    return null;
  }

  for (const child of node.body) {
    let found: AstNode<Features> | null = null;
    walkAst(child, (descendant) => {
      if (found || descendant === node) {
        return;
      }

      if (
        descendant.type === "quantifier" &&
        isUnboundedQuantifier(descendant)
      ) {
        found = descendant;
      }
    });

    if (found) {
      return found;
    }
  }

  return null;
}

function getStartSignature(node: AstNode<Features>): string {
  if (node.type === "value") {
    return `literal:${String.fromCodePoint(node.codePoint)}`;
  }

  if (node.type === "characterClass") {
    return "class:characterClass";
  }

  if (node.type === "characterClassEscape") {
    return `class:${node.value}`;
  }

  if (node.type === "dot") {
    return "class:any";
  }

  if (node.type === "group" && node.body.length > 0) {
    return getStartSignature(node.body[0]);
  }

  if (node.type === "alternative" && node.body.length > 0) {
    return getStartSignature(node.body[0]);
  }

  if (node.type === "quantifier" && node.body.length > 0) {
    return getStartSignature(node.body[0]);
  }

  return `node:${node.type}`;
}

function getSimpleLiteralPrefix(node: AstNode<Features>): string | null {
  if (node.type === "value") {
    return String.fromCodePoint(node.codePoint);
  }

  if (node.type === "alternative") {
    const chars: string[] = [];
    for (const child of node.body) {
      if (child.type !== "value") {
        return null;
      }
      chars.push(String.fromCodePoint(child.codePoint));
      if (chars.length >= 6) {
        break;
      }
    }
    return chars.length > 0 ? chars.join("") : null;
  }

  return null;
}

function hasAmbiguousAlternation(disjunction: AstNode<Features>): boolean {
  if (disjunction.type !== "disjunction") {
    return false;
  }

  const signatures = new Map<string, number>();
  for (const branch of disjunction.body) {
    const signature = getStartSignature(branch);
    signatures.set(signature, (signatures.get(signature) ?? 0) + 1);
    if ((signatures.get(signature) ?? 0) > 1) {
      return true;
    }
  }

  for (let i = 0; i < disjunction.body.length; i++) {
    for (let j = i + 1; j < disjunction.body.length; j++) {
      const firstPrefix = getSimpleLiteralPrefix(disjunction.body[i]);
      const secondPrefix = getSimpleLiteralPrefix(disjunction.body[j]);
      if (!firstPrefix || !secondPrefix) {
        continue;
      }
      if (
        firstPrefix.startsWith(secondPrefix) ||
        secondPrefix.startsWith(firstPrefix)
      ) {
        return true;
      }
    }
  }

  return false;
}

function findingFromNode(
  node: AstNode<Features>,
  kind: RedosFindingKind,
  severity: RedosSeverity,
  title: string,
  reason: string,
  exampleInput: string,
): RedosFinding {
  const bundle = getSuggestionBundle(kind);

  return {
    id: `${node.type}-${node.range?.join("-") ?? "unknown"}-${title}`,
    kind,
    severity,
    title,
    reason,
    suggestion: bundle.suggestion,
    alternatives: bundle.alternatives,
    exampleInput,
    nodeType: node.type,
    raw: "raw" in node && typeof node.raw === "string" ? node.raw : node.type,
    range: Array.isArray(node.range) ? [node.range[0], node.range[1]] : null,
    nodeRef: node,
  };
}

function dedupeFindings(findings: RedosFinding[]): RedosFinding[] {
  const byId = new Map<string, RedosFinding>();
  for (const finding of findings) {
    byId.set(finding.id, finding);
  }
  return [...byId.values()].sort((a, b) => {
    if (a.severity === b.severity) {
      return (a.range?.[0] ?? 0) - (b.range?.[0] ?? 0);
    }
    return a.severity === "high" ? -1 : 1;
  });
}

function scoreFromFindings(findings: RedosFinding[]): number {
  return Math.min(
    100,
    findings.reduce((score, finding) => {
      return score + (finding.severity === "high" ? 55 : 25);
    }, 0),
  );
}

function riskLevelFromScore(score: number): RedosRiskLevel {
  if (score >= 55) {
    return "high";
  }
  if (score >= 25) {
    return "medium";
  }
  return "low";
}

export function analyzeReDosRisk(
  ast: RootNode<Features> | null,
): RedosAnalysis | null {
  if (!ast) {
    return null;
  }

  const findings: RedosFinding[] = [];

  walkAst(ast, (node) => {
    if (node.type !== "quantifier") {
      return;
    }

    const nestedQuantifier = findNestedQuantifier(node);
    if (nestedQuantifier && isUnboundedQuantifier(node)) {
      findings.push(
        findingFromNode(
          node,
          "nested-quantifier",
          "high",
          "Nested quantifiers",
          "A repeated pattern contains another repeated pattern. This can cause catastrophic backtracking on near-miss input.",
          "Try input like many repeated characters followed by a failing suffix.",
        ),
      );
    }

    let ambiguousDisjunction: AstNode<Features> | null = null;
    for (const child of node.body) {
      walkAst(child, (descendant) => {
        if (ambiguousDisjunction) {
          return;
        }
        if (
          descendant.type === "disjunction" &&
          hasAmbiguousAlternation(descendant)
        ) {
          ambiguousDisjunction = descendant;
        }
      });
    }

    if (ambiguousDisjunction && isUnboundedQuantifier(node)) {
      findings.push(
        findingFromNode(
          ambiguousDisjunction,
          "ambiguous-alternation",
          "high",
          "Ambiguous alternation in repeated group",
          "Alternation branches overlap and the whole expression is repeated. The engine can retry many branch combinations before failing.",
          "For example, (a|aa)+ against a long sequence ending with a mismatch.",
        ),
      );
    }

    if (
      node.greedy &&
      isUnboundedQuantifier(node) &&
      node.body.some((child) => child.type === "dot")
    ) {
      findings.push(
        findingFromNode(
          node,
          "greedy-wildcard",
          "medium",
          "Greedy wildcard repetition",
          "A greedy wildcard repeat can scan too broadly and backtrack heavily when the rest of the pattern fails late.",
          "Example near-miss: long text that almost matches the suffix.",
        ),
      );
    }
  });

  const dedupedFindings = dedupeFindings(findings);
  const score = scoreFromFindings(dedupedFindings);
  const riskLevel = riskLevelFromScore(score);

  const summary =
    dedupedFindings.length === 0
      ? "No major catastrophic backtracking shapes detected."
      : `${dedupedFindings.length} potential backtracking risk${dedupedFindings.length > 1 ? "s" : ""} detected.`;

  return {
    riskLevel,
    score,
    summary,
    disclaimer:
      "Heuristic warning only. Validate with runtime tests on real and stress inputs.",
    findings: dedupedFindings,
  };
}
