import { create } from 'zustand';
import type { RootNode, Features, AstNode } from 'regjsparser';
import { parseRegex } from '../parser/regexParser';
import { buildDebugSteps, type DebugStep } from '../debug/regexDebugTracer';

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

  // Actions
  setRegexInput: (input: string) => void;
  setSafeString: (input: string) => void;
  setDeniedString: (input: string) => void;
  setBatchTestStrings: (lines: string[]) => void;
  clearBatchTestStrings: () => void;
  parseRegex: () => void;
  setSelectedNode: (nodeId: string | null) => void;
  setSelectedEditorRange: (range: { start: number; end: number } | null) => void;
  setExplanationNode: (nodeId: string | null, astNode?: AstNode<Features> | null) => void;
  testMatch: (testString: string) => { matches: boolean; groups: string[]; error: string | null };
  testMatchAll: (testString: string) => MatchAllResult;
  startDebug: (testString: string) => void;
  stopDebug: () => void;
  debugNextStep: () => void;
  debugPrevStep: () => void;
  setDebugStepIndex: (index: number) => void;
}

export const useRegexStore = create<RegexStore>((set, get) => ({
  // Initial state
  regexInput: '',
  safeString: '',
  deniedString: '',
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
  debugTestString: '',

  // Actions
  setRegexInput: (input: string) => {
    set({ regexInput: input });
    // Auto-parse on input change (will be debounced in component)
    const result = parseRegex(input);
    set({ ast: result.ast, error: result.error });
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

  parseRegex: () => {
    const { regexInput } = get();
    const result = parseRegex(regexInput);
    set({ ast: result.ast, error: result.error });
  },

  setSelectedNode: (nodeId: string | null) => {
    set({ selectedNodeId: nodeId });
  },

  setSelectedEditorRange: (range: { start: number; end: number } | null) => {
    set({ selectedEditorRange: range });
  },

  setExplanationNode: (nodeId: string | null, astNode?: AstNode<Features> | null) => {
    set({ explanationNodeId: nodeId, explanationAstNode: astNode ?? null });
  },

  testMatch: (testString: string) => {
    const { regexInput } = get();
    if (!regexInput) {
      return { matches: false, groups: [], error: 'No regex pattern provided' };
    }

    try {
      // Remove leading/trailing slashes if present
      let cleanedRegex = regexInput.trim();
      if (cleanedRegex.startsWith('/')) {
        const lastSlash = cleanedRegex.lastIndexOf('/');
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
        error: error instanceof Error ? error.message : 'Invalid regex pattern',
      };
    }
  },

  testMatchAll: (testString: string): MatchAllResult => {
    const { regexInput } = get();
    if (!regexInput) {
      return { matches: false, error: 'No regex pattern provided', matchResults: [] };
    }

    try {
      let cleanedRegex = regexInput.trim();
      if (cleanedRegex.startsWith('/')) {
        const lastSlash = cleanedRegex.lastIndexOf('/');
        if (lastSlash > 0) {
          cleanedRegex = cleanedRegex.slice(1, lastSlash);
        }
      }

      // Use 'g' flag so matchAll finds all matches
      const regex = new RegExp(cleanedRegex, 'g');
      const iter = testString.matchAll(regex);
      const matchResults: MatchResultItem[] = [];
      let index = 0;
      for (const m of iter) {
        const groups = (m as RegExpMatchArray).slice(1).filter((g) => g !== undefined) as string[];
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
        error: error instanceof Error ? error.message : 'Invalid regex pattern',
        matchResults: [],
      };
    }
  },

  startDebug: (testString: string) => {
    const { ast } = get();
    if (!ast) {
      set({ debugMode: true, debugSteps: [], debugStepIndex: 0, debugTestString: testString });
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
      debugTestString: '',
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
