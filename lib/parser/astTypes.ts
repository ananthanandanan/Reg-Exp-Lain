import type { RootNode, AstNode, Features } from 'regjsparser';

// Re-export regjsparser types for convenience
export type { RootNode, AstNode, Features } from 'regjsparser';

// Extended types for our visualization needs
export interface FlowNode {
  id: string;
  type: 'start' | 'match' | 'loop' | 'group' | 'end' | 'alternation';
  label: string;
  astNode?: AstNode<Features>;
  position: { x: number; y: number };
  data: Record<string, unknown> & {
    characterClass?: string;
    quantifier?: string;
    groupNumber?: number;
    groupName?: string;
    alternationIndex?: number;
    label?: string;
    astNode?: AstNode<Features>;
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type?: 'default' | 'loop' | 'alternation';
  label?: string;
  animated?: boolean;
}

export interface ExplanationItem {
  nodeId: string;
  text: string;
  astNode?: AstNode<Features>;
}
