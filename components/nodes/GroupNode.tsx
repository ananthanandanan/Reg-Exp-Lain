"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";

interface GroupNodeData extends Record<string, unknown> {
  label?: string;
  groupNumber?: number;
  groupName?: string;
}

export type GroupNodeType = Node<GroupNodeData, "group">;

function GroupNode({ data, selected }: NodeProps<GroupNodeType>) {
  const displayLabel = data?.groupName
    ? `(${data.groupName})`
    : data?.groupNumber !== undefined
      ? `Group ${data.groupNumber}`
      : data?.label || "GROUP";

  return (
    <div
      className={`flex flex-col items-center justify-center min-w-32 px-4 py-3 rounded-lg border transition-all ${
        selected
          ? "bg-amber-500/30 border-amber-400 shadow-lg shadow-amber-500/20"
          : "bg-amber-900/20 border-amber-700 hover:border-amber-600"
      }`}
    >
      <Handle type="target" position={Position.Left} />
      <span className="text-amber-300 font-mono text-xs font-semibold">
        {displayLabel}
      </span>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(GroupNode);
