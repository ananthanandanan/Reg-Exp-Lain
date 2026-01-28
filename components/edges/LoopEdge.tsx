"use client";

import { BaseEdge, EdgeProps } from "@xyflow/react";

export default function LoopEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
}: EdgeProps) {
  // Create a curved path that loops back (goes up/down and back)
  const isLoopingBack = sourceX > targetX;

  if (isLoopingBack) {
    // For backwards loops, create an arc that curves upward
    const midX = (sourceX + targetX) / 2;
    const curveHeight = 80; // How high the curve goes
    const controlY = sourceY - curveHeight;

    // Create a smooth curve using quadratic bezier
    const edgePath = `
      M ${sourceX},${sourceY}
      Q ${midX},${controlY} ${targetX},${targetY}
    `;

    return (
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: "#a855f7", // Purple color for loop edges
          strokeWidth: 2,
          strokeDasharray: "5,5",
          animation: "dashdraw 0.5s linear infinite",
        }}
      />
    );
  }

  // For forward loops, use a simple straight line
  const edgePath = `M ${sourceX},${sourceY} L ${targetX},${targetY}`;

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        ...style,
        stroke: "#a855f7",
        strokeWidth: 2,
        strokeDasharray: "5,5",
        animation: "dashdraw 0.5s linear infinite",
      }}
    />
  );
}
