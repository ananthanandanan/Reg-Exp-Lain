import { create } from 'zustand';
import type { RootNode, Features, AstNode } from 'regjsparser';
import { parseRegex } from '../parser/regexParser';

interface RegexStore {
  // Input state
  regexInput: string;
  safeString: string;
  deniedString: string;

  // Parsed state
  ast: RootNode<Features> | null;
  error: string | null;

  // UI state
  selectedNodeId: string | null;
  selectedEditorRange: { start: number; end: number } | null;
  explanationNodeId: string | null;
  explanationAstNode: AstNode<Features> | null;

  // Actions
  setRegexInput: (input: string) => void;
  setSafeString: (input: string) => void;
  setDeniedString: (input: string) => void;
  parseRegex: () => void;
  setSelectedNode: (nodeId: string | null) => void;
  setSelectedEditorRange: (range: { start: number; end: number } | null) => void;
  setExplanationNode: (nodeId: string | null, astNode?: AstNode<Features> | null) => void;
  testMatch: (testString: string) => { matches: boolean; groups: string[]; error: string | null };
}

export const useRegexStore = create<RegexStore>((set, get) => ({
  // Initial state
  regexInput: '',
  safeString: '',
  deniedString: '',
  ast: null,
  error: null,
  selectedNodeId: null,
  selectedEditorRange: null,
  explanationNodeId: null,
  explanationAstNode: null,

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
}));
