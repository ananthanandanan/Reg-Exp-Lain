"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";

interface EndNodeData extends Record<string, unknown> {
  label?: string;
}

export type EndNodeType = Node<EndNodeData, "end">;

function EndNode({ data }: NodeProps<EndNodeType>) {
  return (
    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 text-red-400 font-semibold text-sm">
      {data?.label || "END"}
      <Handle type="target" position={Position.Left} />
    </div>
  );
}

export default memo(EndNode);
