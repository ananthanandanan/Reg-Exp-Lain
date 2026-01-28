"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";

interface AlternationNodeData extends Record<string, unknown> {
  label?: string;
}

export type AlternationNodeType = Node<AlternationNodeData, "alternation">;

function AlternationNode({ data, selected }: NodeProps<AlternationNodeType>) {
  return (
    <div
      className={`flex items-center justify-center min-w-24 px-4 py-3 rounded-lg border transition-all ${
        selected
          ? "bg-cyan-500/30 border-cyan-400 shadow-lg shadow-cyan-500/20"
          : "bg-cyan-900/30 border-cyan-600 hover:border-cyan-500"
      }`}
    >
      <Handle type="target" position={Position.Left} />
      <span className="text-cyan-300 font-mono text-sm font-semibold">
        {data?.label || "|"}
      </span>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(AlternationNode);
