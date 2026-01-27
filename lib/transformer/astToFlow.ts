import type { RootNode, AstNode, Features } from 'regjsparser';
import type { FlowNode, FlowEdge } from '../parser/astTypes';

interface LayoutState {
  x: number;
  y: number;
  nodeIdCounter: number;
  edgeIdCounter: number;
}

// Shared counter to ensure unique IDs across all recursive calls
let globalNodeIdCounter = 0;
let globalEdgeIdCounter = 0;

const BASE_HORIZONTAL_SPACING = 180;
const VERTICAL_SPACING = 150;
const START_X = 100;
const START_Y = 200;
const CHAR_WIDTH = 10; // Approximate width per character in the label
const MIN_NODE_WIDTH = 60;

/**
 * Calculate the width of a node based on its label
 */
function getNodeWidth(label: string): number {
  return Math.max(MIN_NODE_WIDTH, label.length * CHAR_WIDTH + 40);
}

/**
 * Calculate spacing needed after a node based on its label width
 */
function getSpacingForNode(label: string): number {
  return getNodeWidth(label) + BASE_HORIZONTAL_SPACING;
}

/**
 * Converts an AST node to a human-readable label
 */
function getNodeLabel(node: AstNode<Features>): string {
  switch (node.type) {
    case 'anchor':
      return node.kind === 'start' ? '^' : node.kind === 'end' ? '$' : `\\${node.kind}`;
    case 'characterClass':
      const ranges = node.body
        .map((b) => {
          if (b.type === 'characterClassRange') {
            return `${String.fromCodePoint(b.min.codePoint)}-${String.fromCodePoint(b.max.codePoint)}`;
          }
          if (b.type === 'value') {
            return String.fromCodePoint(b.codePoint);
          }
          if (b.type === 'characterClassEscape') {
            return `\\${b.value}`;
          }
          return '';
        })
        .filter(Boolean)
        .join(', ');
      return node.negative ? `[^${ranges}]` : `[${ranges}]`;
    case 'dot':
      return '.';
    case 'group':
      if (node.behavior === 'normal') {
        if ('name' in node && node.name && typeof node.name === 'object' && 'value' in node.name) {
          return `(${(node.name as { value: string }).value})`;
        }
        return `(group)`;
      }
      return `(${node.behavior})`;
    case 'quantifier':
      if (node.symbol) {
        return node.symbol;
      }
      if (node.max === undefined) {
        return `{${node.min},}`;
      }
      if (node.min === node.max) {
        return `{${node.min}}`;
      }
      return `{${node.min},${node.max}}`;
    case 'disjunction':
      return '|';
    case 'value':
      return String.fromCodePoint(node.codePoint);
    default:
      return node.type;
  }
}

/**
 * Recursively converts AST to flow nodes and edges
 */
function astToFlowRecursive(
  node: AstNode<Features> | RootNode<Features>,
  state: LayoutState,
  parentId: string | null
): { nodes: FlowNode[]; edges: FlowEdge[]; lastNodeId: string } {
  const nodes: FlowNode[] = [];
  const edges: FlowEdge[] = [];
  const currentNodeId = `node-${globalNodeIdCounter++}`;

  // Determine node type and create flow node
  let flowNodeType: FlowNode['type'] = 'match';
  let data: FlowNode['data'] = { label: getNodeLabel(node) };

  if (node.type === 'anchor') {
    if (node.kind === 'start') {
      flowNodeType = 'start';
    } else {
      flowNodeType = 'match';
    }
  } else if (node.type === 'quantifier') {
    flowNodeType = 'loop';
    data.quantifier = getNodeLabel(node);
  } else if (node.type === 'group') {
    flowNodeType = 'group';
    if (node.behavior === 'normal') {
      // Use a simple counter for group number
      data.groupNumber = 1;
      if ('name' in node && node.name && typeof node.name === 'object' && 'value' in node.name) {
        data.groupName = (node.name as { value: string }).value;
      }
    }
  } else if (node.type === 'disjunction') {
    flowNodeType = 'alternation';
  } else if (node.type === 'characterClass') {
    data.characterClass = getNodeLabel(node);
  }

  const flowNode: FlowNode = {
    id: currentNodeId,
    type: flowNodeType,
    label: getNodeLabel(node),
    astNode: node,
    position: { x: state.x, y: state.y },
    data: { ...data, label: getNodeLabel(node), astNode: node },
  };

  nodes.push(flowNode);

  // Connect to parent
  if (parentId) {
    edges.push({
      id: `edge-${globalEdgeIdCounter++}`,
      source: parentId,
      target: currentNodeId,
      type: 'default',
    });
  }

  // Handle children based on node type
  if (node.type === 'alternative') {
    // Sequential processing - horizontal layout
    let lastId = currentNodeId;
    let childX = state.x + getSpacingForNode(getNodeLabel(node));

    for (const child of node.body) {
      const childLabel = getNodeLabel(child);
      const result = astToFlowRecursive(
        child,
        {
          ...state,
          x: childX,
        },
        lastId
      );
      nodes.push(...result.nodes);
      edges.push(...result.edges);
      lastId = result.lastNodeId;
      // Use the last node's position to calculate next X
      const lastNodeInResult = result.nodes[result.nodes.length - 1];
      if (lastNodeInResult) {
        childX = lastNodeInResult.position.x + getSpacingForNode(lastNodeInResult.label || childLabel);
      } else {
        childX += getSpacingForNode(childLabel);
      }
    }

    return { nodes, edges, lastNodeId: lastId };
  }

  if (node.type === 'group') {
    // Process group body
    let lastId = currentNodeId;
    let childX = state.x + getSpacingForNode(getNodeLabel(node));

    for (const child of node.body) {
      const childLabel = getNodeLabel(child);
      const result = astToFlowRecursive(
        child,
        {
          ...state,
          x: childX,
        },
        lastId
      );
      nodes.push(...result.nodes);
      edges.push(...result.edges);
      lastId = result.lastNodeId;
      // Use the last node's position to calculate next X
      const lastNodeInResult = result.nodes[result.nodes.length - 1];
      if (lastNodeInResult) {
        childX = lastNodeInResult.position.x + getSpacingForNode(lastNodeInResult.label || childLabel);
      } else {
        childX += getSpacingForNode(childLabel);
      }
    }

    return { nodes, edges, lastNodeId: lastId };
  }

  if (node.type === 'quantifier') {
    // Quantifier wraps a single child
    const child = node.body[0];
    const quantifierLabel = getNodeLabel(node);
    const childLabel = getNodeLabel(child);
    const childX = state.x + getSpacingForNode(quantifierLabel);
    
    const result = astToFlowRecursive(
      child,
      {
        ...state,
        x: childX,
      },
      currentNodeId
    );
    nodes.push(...result.nodes);
    edges.push(...result.edges);

    // Add loop-back edge for quantifier
    edges.push({
      id: `edge-${globalEdgeIdCounter++}`,
      source: result.lastNodeId,
      target: currentNodeId,
      type: 'loop',
      animated: true,
    });

    // Forward edge from quantifier - position after the child
    const lastChildNode = result.nodes[result.nodes.length - 1];
    const forwardX = lastChildNode 
      ? lastChildNode.position.x + getSpacingForNode(lastChildNode.label || childLabel)
      : childX + getSpacingForNode(childLabel);
    
    const forwardNodeId = `node-${globalNodeIdCounter++}`;
    const forwardNode: FlowNode = {
      id: forwardNodeId,
      type: 'match',
      label: '→',
      position: { x: forwardX, y: state.y },
      data: { label: '→' },
    };
    nodes.push(forwardNode);
    edges.push({
      id: `edge-${globalEdgeIdCounter++}`,
      source: result.lastNodeId,
      target: forwardNodeId,
      type: 'default',
    });

    return { nodes, edges, lastNodeId: forwardNodeId };
  }

  if (node.type === 'disjunction') {
    // Alternation - vertical branching
    const disjunctionLabel = getNodeLabel(node);
    const branchY = state.y - ((node.body.length - 1) * VERTICAL_SPACING) / 2;
    const branchX = state.x + getSpacingForNode(disjunctionLabel);
    const branchNodes: string[] = [];
    let maxEndX = branchX;

    for (let i = 0; i < node.body.length; i++) {
      const child = node.body[i];
      const result = astToFlowRecursive(
        child,
        {
          ...state,
          x: branchX,
          y: branchY + i * VERTICAL_SPACING,
        },
        currentNodeId
      );
      nodes.push(...result.nodes);
      edges.push(...result.edges);
      branchNodes.push(result.lastNodeId);
      
      // Track the maximum X position across all branches
      const lastNodeInBranch = result.nodes[result.nodes.length - 1];
      if (lastNodeInBranch) {
        const endX = lastNodeInBranch.position.x + getSpacingForNode(lastNodeInBranch.label || '');
        maxEndX = Math.max(maxEndX, endX);
      }
    }

    // Merge branches - position after the longest branch
    const mergeNodeId = `node-${globalNodeIdCounter++}`;
    const mergeNode: FlowNode = {
      id: mergeNodeId,
      type: 'match',
      label: '→',
      position: { x: maxEndX, y: state.y },
      data: { label: '→' },
    };
    nodes.push(mergeNode);

    for (const branchId of branchNodes) {
      edges.push({
        id: `edge-${globalEdgeIdCounter++}`,
        source: branchId,
        target: mergeNodeId,
        type: 'alternation',
      });
    }

    return { nodes, edges, lastNodeId: mergeNodeId };
  }

  // Default: no children, this is a leaf node
  return { nodes, edges, lastNodeId: currentNodeId };
}

/**
 * Converts a regex AST to React Flow nodes and edges
 */
export function astToFlow(ast: RootNode<Features> | null): { nodes: FlowNode[]; edges: FlowEdge[] } {
  if (!ast) {
    return { nodes: [], edges: [] };
  }

  // Reset global counters for each new AST conversion
  globalNodeIdCounter = 0;
  globalEdgeIdCounter = 0;

  const state: LayoutState = {
    x: START_X,
    y: START_Y,
    nodeIdCounter: 0,
    edgeIdCounter: 0,
  };

  // Add start node
  const startNode: FlowNode = {
    id: 'start',
    type: 'start',
    label: 'START',
    position: { x: START_X - 100, y: START_Y },
    data: { label: 'START' },
  };

  // Process AST
  const result = astToFlowRecursive(ast, state, 'start');

  // Calculate end position
  const lastNode = result.nodes[result.nodes.length - 1];
  const endX = lastNode ? lastNode.position.x + getSpacingForNode(lastNode.label || '') : START_X + BASE_HORIZONTAL_SPACING;

  // Add end node
  const endNode: FlowNode = {
    id: 'end',
    type: 'end',
    label: 'END',
    position: { x: endX, y: START_Y },
    data: { label: 'END' },
  };

  result.nodes.push(startNode, endNode);
  result.edges.push({
    id: `edge-${globalEdgeIdCounter++}`,
    source: result.lastNodeId,
    target: 'end',
    type: 'default',
  });

  return { nodes: result.nodes, edges: result.edges };
}
