"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";

interface StartNodeData extends Record<string, unknown> {
  label?: string;
}

export type StartNodeType = Node<StartNodeData, "start">;

function StartNode({ data }: NodeProps<StartNodeType>) {
  return (
    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 font-semibold text-sm">
      {data?.label || "START"}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export default memo(StartNode);
