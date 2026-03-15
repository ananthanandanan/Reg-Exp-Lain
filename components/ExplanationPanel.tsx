"use client";

import { useMemo } from "react";
import { useRegexStore } from "@/lib/store/useRegexStore";
import { getExplanationFromAstNode } from "@/lib/transformer/astToExplanation";

export default function ExplanationPanel() {
  const {
    explanationNodeId,
    explanationAstNode,
    redosAnalysis,
    setExplanationNode,
  } = useRegexStore();

  const explanation = useMemo(() => {
    if (!explanationNodeId || !explanationAstNode) return null;
    return getExplanationFromAstNode(explanationAstNode);
  }, [explanationNodeId, explanationAstNode]);

  const isOpen = !!explanationNodeId && !!explanation;

  const nodeRiskFindings = useMemo(() => {
    if (!redosAnalysis || !explanationAstNode) {
      return [];
    }

    return redosAnalysis.findings.filter((finding) => {
      if (finding.nodeRef === explanationAstNode) {
        return true;
      }

      if (!finding.range || !Array.isArray(explanationAstNode.range)) {
        return false;
      }

      return (
        finding.nodeType === explanationAstNode.type &&
        finding.range[0] === explanationAstNode.range[0] &&
        finding.range[1] === explanationAstNode.range[1]
      );
    });
  }, [redosAnalysis, explanationAstNode]);

  return (
    <div
      className={`fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-slate-700 shadow-2xl z-50 flex flex-col transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-full"
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
              <p className="text-slate-200 leading-relaxed">
                {explanation.text}
              </p>
            </div>
            {explanation.astNode && (
              <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700">
                <h3 className="text-sm font-medium text-slate-400 mb-2">
                  AST Node Type
                </h3>
                <code className="text-xs text-slate-300 font-mono">
                  {explanation.astNode.type}
                </code>
              </div>
            )}
            {nodeRiskFindings.length > 0 && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/40 space-y-3">
                <h3 className="text-sm font-semibold text-red-300">
                  Performance risk notes
                </h3>
                {nodeRiskFindings.map((finding) => (
                  <div key={finding.id} className="space-y-1">
                    <p className="text-xs font-semibold text-red-200">
                      {finding.title}
                    </p>
                    <p className="text-xs text-red-100/90">{finding.reason}</p>
                    <p className="text-xs text-red-100/80">
                      Suggestion: {finding.suggestion}
                    </p>
                    {finding.alternatives.length > 0 && (
                      <ul className="space-y-1 pt-1">
                        {finding.alternatives.slice(0, 2).map((alternative) => (
                          <li
                            key={alternative}
                            className="text-xs text-red-100/75"
                          >
                            - {alternative}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
            {redosAnalysis && (
              <div className="p-3 rounded-lg bg-slate-800/20 border border-slate-700">
                <p className="text-[11px] text-slate-400">
                  {redosAnalysis.disclaimer}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
