export type RedosFindingKind =
  | "nested-quantifier"
  | "ambiguous-alternation"
  | "greedy-wildcard";

interface SuggestionBundle {
  suggestion: string;
  alternatives: string[];
  stressSeeds: string[];
}

const SUGGESTIONS: Record<RedosFindingKind, SuggestionBundle> = {
  "nested-quantifier": {
    suggestion:
      "Flatten nested repeats or make the inner repeat bounded so the engine has fewer backtracking paths.",
    alternatives: [
      "Prefer a single repeat when possible, e.g. `a+` instead of `(a+)+`.",
      "If nested shape is required, add an upper bound like `{1,100}` to limit worst-case work.",
    ],
    stressSeeds: ["a", "x"],
  },
  "ambiguous-alternation": {
    suggestion:
      "Make repeated alternation branches mutually exclusive to avoid branch explosion.",
    alternatives: [
      "Remove prefix overlap, e.g. prefer `(aa|ab)+` over `(a|aa)+`.",
      "Split into clearer, non-overlapping branches before applying `+` or `*`.",
    ],
    stressSeeds: ["a", "ab"],
  },
  "greedy-wildcard": {
    suggestion:
      "Replace broad `.*` repeats with tighter character classes and explicit boundaries.",
    alternatives: [
      "Use anchors such as `^` and `$` to reduce candidate match spans.",
      "Use bounded repeats like `.{0,256}` in risky contexts.",
    ],
    stressSeeds: ["a", " "],
  },
};

export function getSuggestionBundle(kind: RedosFindingKind): SuggestionBundle {
  return SUGGESTIONS[kind];
}

export function getStressInputsForKinds(
  kinds: RedosFindingKind[],
): Array<{ id: string; label: string; value: string }> {
  const uniqueKinds = [...new Set(kinds)];

  return uniqueKinds.map((kind) => {
    const bundle = getSuggestionBundle(kind);
    const seed = bundle.stressSeeds[0] ?? "a";
    const value = `${seed.repeat(64)}!`;

    return {
      id: `stress-${kind}`,
      label: `Quick stress: ${kind.replace(/-/g, " ")}`,
      value,
    };
  });
}
