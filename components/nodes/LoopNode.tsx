'use client';

import { memo } from 'react';
import type { NodeProps, Node } from '@xyflow/react';

interface LoopNodeData extends Record<string, unknown> {
  label?: string;
  quantifier?: string;
}

export type LoopNodeType = Node<LoopNodeData, 'loop'>;

function LoopNode({ data, selected }: NodeProps<LoopNodeType>) {
  return (
    <div
      className={`flex items-center justify-center min-w-24 px-4 py-3 rounded-lg border transition-all ${
        selected
          ? 'bg-purple-500/30 border-purple-400 shadow-lg shadow-purple-500/20'
          : 'bg-purple-900/30 border-purple-600 hover:border-purple-500'
      }`}
    >
      <span className="text-purple-300 font-mono text-sm font-semibold">
        {data?.label || data?.quantifier || 'LOOP'}
      </span>
    </div>
  );
}

export default memo(LoopNode);
