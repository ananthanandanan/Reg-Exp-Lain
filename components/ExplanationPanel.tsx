'use client';

import { useMemo } from 'react';
import { useRegexStore } from '@/lib/store/useRegexStore';
import { getExplanationFromAstNode } from '@/lib/transformer/astToExplanation';

export default function ExplanationPanel() {
  const { explanationNodeId, explanationAstNode, setExplanationNode } = useRegexStore();

  const explanation = useMemo(() => {
    if (!explanationNodeId || !explanationAstNode) return null;
    return getExplanationFromAstNode(explanationAstNode);
  }, [explanationNodeId, explanationAstNode]);

  const isOpen = !!explanationNodeId && !!explanation;

  return (
    <div 
      className={`fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-slate-700 shadow-2xl z-50 flex flex-col transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-slate-200">Explanation</h2>
        <button
          onClick={() => setExplanationNode(null)}
          className="text-slate-400 hover:text-slate-200 transition-colors"
          aria-label="Close explanation panel"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {explanation && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <p className="text-slate-200 leading-relaxed">{explanation.text}</p>
            </div>
            {explanation.astNode && (
              <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700">
                <h3 className="text-sm font-medium text-slate-400 mb-2">AST Node Type</h3>
                <code className="text-xs text-slate-300 font-mono">
                  {explanation.astNode.type}
                </code>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
