import { create } from "zustand";
import type { RootNode, Features, AstNode } from "regjsparser";
import { parseRegex } from "../parser/regexParser";
import { buildDebugSteps, type DebugStep } from "../debug/regexDebugTracer";
import {
  analyzeReDosRisk,
  type RedosFinding,
  type RedosAnalysis,
} from "../security/redosAnalyzer";
import { getStressInputsForKinds } from "../security/redosSuggestions";

export interface MatchResultItem {
  index: number;
  start: number;
  end: number;
  match: string;
  groups: string[];
}

export interface MatchAllResult {
  matches: boolean;
  error: string | null;
  matchResults: MatchResultItem[];
}

export interface PerformanceProbeSample {
  id: string;
  label: string;
  inputSize: number;
  durationMs: number;
  timedOut: boolean;
  matched: boolean;
  error: string | null;
}

export interface PerformanceProbeResult {
  thresholdMs: number;
  observedSlowdown: boolean;
  samples: PerformanceProbeSample[];
}

const PERFORMANCE_PROBE_THRESHOLD_MS = 50;
const PERFORMANCE_PROBE_MAX_INPUT = 4000;

function nowMs(): number {
  if (typeof performance !== "undefined") {
    return performance.now();
  }
  return Date.now();
}

function cleanRegexInput(rawRegex: string): { pattern: string; flags: string } {
  let pattern = rawRegex.trim();
  let flags = "";

  if (pattern.startsWith("/")) {
    const lastSlash = pattern.lastIndexOf("/");
    if (lastSlash > 0) {
      flags = pattern.slice(lastSlash + 1);
      pattern = pattern.slice(1, lastSlash);
    }
  }

  return { pattern, flags };
}

function sanitizeProbeFlags(flags: string): string {
  const allowedFlags = new Set(["d", "i", "m", "s", "u", "v", "y"]);
  return [...new Set(flags)].filter((flag) => allowedFlags.has(flag)).join("");
}

function buildProbeInputs(
  safeString: string,
  deniedString: string,
  findings: RedosFinding[],
): Array<{ id: string; label: string; value: string }> {
  const samples: Array<{ id: string; label: string; value: string }> = [];

  if (safeString.trim()) {
    samples.push({
      id: "safe",
      label: "Safe input",
      value: safeString.slice(0, PERFORMANCE_PROBE_MAX_INPUT),
    });
  }

  if (deniedString.trim()) {
    samples.push({
      id: "denied",
      label: "Denied input",
      value: deniedString.slice(0, PERFORMANCE_PROBE_MAX_INPUT),
    });
  }

  const stressInputs = getStressInputsForKinds(
    findings.map((finding) => finding.kind),
  );
  if (stressInputs.length > 0) {
    samples.push(...stressInputs);
  } else if (samples.length === 0) {
    samples.push({
      id: "stress-default",
      label: "Generated stress input",
      value: `${"a".repeat(2048)}!`,
    });
  }

  return samples;
}

interface RegexStore {
  // Input state
  regexInput: string;
  safeString: string;
  deniedString: string;

  // Batch test (plain text file: one line = one entity)
  batchTestStrings: string[];

  // Parsed state
  ast: RootNode<Features> | null;
  error: string | null;

  // UI state
  selectedNodeId: string | null;
  selectedEditorRange: { start: number; end: number } | null;
  explanationNodeId: string | null;
  explanationAstNode: AstNode<Features> | null;

  // Step-by-step debug state
  debugMode: boolean;
  debugSteps: DebugStep[];
  debugStepIndex: number;
  debugTestString: string;

  // Security analysis state
  redosAnalysis: RedosAnalysis | null;
  performanceProbe: PerformanceProbeResult | null;

  // Actions
  setRegexInput: (input: string) => void;
  setSafeString: (input: string) => void;
  setDeniedString: (input: string) => void;
  setBatchTestStrings: (lines: string[]) => void;
  clearBatchTestStrings: () => void;
  analyzeReDos: () => void;
  runPerformanceProbe: () => void;
  setSelectedNode: (nodeId: string | null) => void;
  setSelectedEditorRange: (
    range: { start: number; end: number } | null,
  ) => void;
  setExplanationNode: (
    nodeId: string | null,
    astNode?: AstNode<Features> | null,
  ) => void;
  testMatch: (testString: string) => {
    matches: boolean;
    groups: string[];
    error: string | null;
  };
  testMatchAll: (testString: string) => MatchAllResult;
  startDebug: (testString: string) => void;
  stopDebug: () => void;
  debugNextStep: () => void;
  debugPrevStep: () => void;
  setDebugStepIndex: (index: number) => void;
}

export const useRegexStore = create<RegexStore>((set, get) => ({
  // Initial state
  regexInput: "",
  safeString: "",
  deniedString: "",
  batchTestStrings: [],
  ast: null,
  error: null,
  selectedNodeId: null,
  selectedEditorRange: null,
  explanationNodeId: null,
  explanationAstNode: null,
  debugMode: false,
  debugSteps: [],
  debugStepIndex: 0,
  debugTestString: "",
  redosAnalysis: null,
  performanceProbe: null,

  // Actions
  setRegexInput: (input: string) => {
    set({ regexInput: input });
    // Auto-parse on input change (will be debounced in component)
    const result = parseRegex(input);
    const redosAnalysis = analyzeReDosRisk(result.ast);
    set({
      ast: result.ast,
      error: result.error,
      redosAnalysis,
      performanceProbe: null,
    });
  },

  setSafeString: (input: string) => {
    set({ safeString: input });
  },

  setDeniedString: (input: string) => {
    set({ deniedString: input });
  },

  setBatchTestStrings: (lines: string[]) => {
    set({ batchTestStrings: lines });
  },

  clearBatchTestStrings: () => {
    set({ batchTestStrings: [] });
  },

  analyzeReDos: () => {
    const { ast } = get();
    set({ redosAnalysis: analyzeReDosRisk(ast) });
  },

  runPerformanceProbe: () => {
    const { regexInput, safeString, deniedString, redosAnalysis } = get();
    if (!regexInput.trim()) {
      set({
        performanceProbe: {
          thresholdMs: PERFORMANCE_PROBE_THRESHOLD_MS,
          observedSlowdown: false,
          samples: [],
        },
      });
      return;
    }

    const { pattern, flags } = cleanRegexInput(regexInput);
    const sanitizedFlags = sanitizeProbeFlags(flags);
    const probeInputs = buildProbeInputs(
      safeString,
      deniedString,
      redosAnalysis?.findings ?? [],
    );

    const samples: PerformanceProbeSample[] = probeInputs.map((probeInput) => {
      const input = probeInput.value.slice(0, PERFORMANCE_PROBE_MAX_INPUT);
      const start = nowMs();
      let matched = false;
      let error: string | null = null;

      try {
        const regex = new RegExp(pattern, sanitizedFlags);
        matched = regex.test(input);
      } catch (probeError) {
        error =
          probeError instanceof Error
            ? probeError.message
            : "Invalid regex pattern";
      }

      const durationMs = nowMs() - start;

      return {
        id: probeInput.id,
        label: probeInput.label,
        inputSize: input.length,
        durationMs,
        timedOut: durationMs >= PERFORMANCE_PROBE_THRESHOLD_MS,
        matched,
        error,
      };
    });

    set({
      performanceProbe: {
        thresholdMs: PERFORMANCE_PROBE_THRESHOLD_MS,
        observedSlowdown: samples.some((sample) => sample.timedOut),
        samples,
      },
    });
  },

  setSelectedNode: (nodeId: string | null) => {
    set({ selectedNodeId: nodeId });
  },

  setSelectedEditorRange: (range: { start: number; end: number } | null) => {
    set({ selectedEditorRange: range });
  },

  setExplanationNode: (
    nodeId: string | null,
    astNode?: AstNode<Features> | null,
  ) => {
    set({ explanationNodeId: nodeId, explanationAstNode: astNode ?? null });
  },

  testMatch: (testString: string) => {
    const { regexInput } = get();
    if (!regexInput) {
      return { matches: false, groups: [], error: "No regex pattern provided" };
    }

    try {
      // Remove leading/trailing slashes if present
      let cleanedRegex = regexInput.trim();
      if (cleanedRegex.startsWith("/")) {
        const lastSlash = cleanedRegex.lastIndexOf("/");
        if (lastSlash > 0) {
          cleanedRegex = cleanedRegex.slice(1, lastSlash);
        }
      }

      const regex = new RegExp(cleanedRegex);
      const match = regex.exec(testString);

      if (match) {
        const groups = match.slice(1).filter((g) => g !== undefined);
        return { matches: true, groups, error: null };
      }

      return { matches: false, groups: [], error: null };
    } catch (error) {
      return {
        matches: false,
        groups: [],
        error: error instanceof Error ? error.message : "Invalid regex pattern",
      };
    }
  },

  testMatchAll: (testString: string): MatchAllResult => {
    const { regexInput } = get();
    if (!regexInput) {
      return {
        matches: false,
        error: "No regex pattern provided",
        matchResults: [],
      };
    }

    try {
      let cleanedRegex = regexInput.trim();
      if (cleanedRegex.startsWith("/")) {
        const lastSlash = cleanedRegex.lastIndexOf("/");
        if (lastSlash > 0) {
          cleanedRegex = cleanedRegex.slice(1, lastSlash);
        }
      }

      // Use 'g' flag so matchAll finds all matches
      const regex = new RegExp(cleanedRegex, "g");
      const iter = testString.matchAll(regex);
      const matchResults: MatchResultItem[] = [];
      let index = 0;
      for (const m of iter) {
        const groups = (m as RegExpMatchArray)
          .slice(1)
          .filter((g) => g !== undefined) as string[];
        matchResults.push({
          index: index++,
          start: m.index!,
          end: m.index! + m[0].length,
          match: m[0],
          groups,
        });
      }
      return {
        matches: matchResults.length > 0,
        error: null,
        matchResults,
      };
    } catch (error) {
      return {
        matches: false,
        error: error instanceof Error ? error.message : "Invalid regex pattern",
        matchResults: [],
      };
    }
  },

  startDebug: (testString: string) => {
    const { ast } = get();
    if (!ast) {
      set({
        debugMode: true,
        debugSteps: [],
        debugStepIndex: 0,
        debugTestString: testString,
      });
      return;
    }
    const steps = buildDebugSteps(ast, testString);
    set({
      debugMode: true,
      debugSteps: steps,
      debugStepIndex: 0,
      debugTestString: testString,
    });
  },

  stopDebug: () => {
    set({
      debugMode: false,
      debugSteps: [],
      debugStepIndex: 0,
      debugTestString: "",
    });
  },

  debugNextStep: () => {
    const { debugSteps, debugStepIndex } = get();
    if (debugStepIndex < debugSteps.length - 1) {
      set({ debugStepIndex: debugStepIndex + 1 });
    }
  },

  debugPrevStep: () => {
    const { debugStepIndex } = get();
    if (debugStepIndex > 0) {
      set({ debugStepIndex: debugStepIndex - 1 });
    }
  },

  setDebugStepIndex: (index: number) => {
    const { debugSteps } = get();
    const clamped = Math.max(0, Math.min(index, debugSteps.length - 1));
    set({ debugStepIndex: clamped });
  },
}));
