import React from 'react';
import { WorkflowNode, NodeConnection } from '@/lib/workflow-types';

interface ConnectionsProps {
  nodes: WorkflowNode[];
  connections: NodeConnection[];
}

export function Connections({ nodes, connections }: ConnectionsProps) {
  const getNodeCenter = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    
    // Node width is 112px (w-28), height 80px (h-20)
    return {
      x: node.position.x + 56, // half width
      y: node.position.y + 40  // half height
    };
  };

  const createPath = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    
    // Control points for bezier curve
    const cp1x = start.x + Math.abs(dx) * 0.5;
    const cp1y = start.y;
    const cp2x = end.x - Math.abs(dx) * 0.5;
    const cp2y = end.y;
    
    return `M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`;
  };

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="#6b7280"
          />
        </marker>
      </defs>
      
      {connections.map(connection => {
        const start = getNodeCenter(connection.source);
        const end = getNodeCenter(connection.target);
        
        // Adjust start and end points to node edges
        const adjustedStart = { x: start.x + 56, y: start.y }; // right edge of source
        const adjustedEnd = { x: end.x - 56, y: end.y }; // left edge of target
        
        return (
          <path
            key={connection.id}
            d={createPath(adjustedStart, adjustedEnd)}
            stroke="#6b7280"
            strokeWidth="2"
            fill="none"
            markerEnd="url(#arrowhead)"
            className="transition-all duration-200 hover:stroke-gray-500"
          />
        );
      })}
    </svg>
  );
}