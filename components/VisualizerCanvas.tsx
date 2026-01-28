"use client";

import { useCallback, useMemo, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useRegexStore } from "@/lib/store/useRegexStore";
import { astToFlow } from "@/lib/transformer/astToFlow";
import type { AstNode, Features } from "regjsparser";
import StartNode from "./nodes/StartNode";
import MatchNode from "./nodes/MatchNode";
import LoopNode from "./nodes/LoopNode";
import GroupNode from "./nodes/GroupNode";
import EndNode from "./nodes/EndNode";
import AlternationNode from "./nodes/AlternationNode";
import LoopEdge from "./edges/LoopEdge";

const nodeTypes = {
  start: StartNode,
  match: MatchNode,
  loop: LoopNode,
  group: GroupNode,
  end: EndNode,
  alternation: AlternationNode,
};

const edgeTypes = {
  loop: LoopEdge,
};

export default function VisualizerCanvas() {
  const {
    ast,
    selectedNodeId,
    explanationNodeId,
    setSelectedNode,
    setExplanationNode,
  } = useRegexStore();

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    return astToFlow(ast);
  }, [ast]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = astToFlow(ast);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [ast, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNode(node.id);
      // Pass the AST node from the flow node's data for explanation
      const astNode = node.data?.astNode as AstNode<Features> | undefined;

      // Only show explanation if there's an AST node (START/END nodes don't have AST nodes)
      if (astNode) {
        setExplanationNode(node.id, astNode);
      } else {
        // For nodes without AST (like START/END), clear explanation
        setExplanationNode(null, null);
      }
    },
    [setSelectedNode, setExplanationNode],
  );

  const onNodeMouseEnter = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode],
  );

  const onNodeMouseLeave = useCallback(() => {
    // Keep selection on click, but clear hover
    // setSelectedNode(null);
  }, []);

  // Update node selection state
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        selected: node.id === selectedNodeId,
      })),
    );
  }, [selectedNodeId, setNodes]);

  const showHint = !explanationNodeId && ast && nodes.length > 0;

  return (
    <div className="w-full h-full bg-slate-950 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        className="bg-slate-950"
      >
        <Background color="#1e293b" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === "start") return "#10b981";
            if (node.type === "end") return "#ef4444";
            if (node.type === "loop") return "#a855f7";
            if (node.type === "group") return "#f59e0b";
            return "#64748b";
          }}
          maskColor="rgba(0, 0, 0, 0.6)"
        />
      </ReactFlow>

      {/* Hint overlay */}
      {showHint && (
        <div className="absolute top-4 right-4 bg-slate-800/90 border border-slate-700 rounded-lg p-3 shadow-lg z-10 max-w-xs">
          <p className="text-sm text-slate-300">
            <span className="font-semibold text-slate-200">💡 Tip:</span> Click
            on any node in the flow diagram to see its explanation.
          </p>
        </div>
      )}
    </div>
  );
}
