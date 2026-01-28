"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";

interface MatchNodeData extends Record<string, unknown> {
  label?: string;
  characterClass?: string;
}

export type MatchNodeType = Node<MatchNodeData, "match">;

function MatchNode({ data, selected }: NodeProps<MatchNodeType>) {
  return (
    <div
      className={`flex items-center justify-center min-w-24 px-4 py-3 rounded-lg border transition-all ${
        selected
          ? "bg-blue-500/30 border-blue-400 shadow-lg shadow-blue-500/20"
          : "bg-slate-800/50 border-slate-600 hover:border-slate-500"
      }`}
    >
      <Handle type="target" position={Position.Left} />
      <span className="text-slate-200 font-mono text-sm font-medium">
        {data?.label || data?.characterClass || "MATCH"}
      </span>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(MatchNode);
