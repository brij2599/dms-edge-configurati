import React from 'react';
import { WorkflowNode, NodeConnection } from '@/lib/workflow-types';

interface ConnectionsProps {
  nodes: WorkflowNode[];
  connections: NodeConnection[];
}

export function Connections({ nodes, connections }: ConnectionsProps) {
  React.useEffect(() => {
    console.log('Connections render - nodes:', nodes.length, 'connections:', connections.length);
    console.log('Connections details:', connections);
  }, [nodes, connections]);

  const getNodeConnectionPoints = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) {
      return { input: { x: 0, y: 0 }, output: { x: 0, y: 0 } };
    }
    
    // Node width is 112px (w-28), height 80px (h-20)
    const centerY = node.position.y + 40; // half height
    
    return {
      input: {
        x: node.position.x - 8, // left edge with port offset
        y: centerY
      },
      output: {
        x: node.position.x + 112 + 8, // right edge with port offset  
        y: centerY
      }
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
      style={{ zIndex: 1 }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <polygon
            points="0 0, 8 3, 0 6"
            fill="#6b7280"
          />
        </marker>
      </defs>
      
      {connections
        .filter(connection => {
          // Only render connections where both source and target nodes exist
          const sourceExists = nodes.some(n => n.id === connection.source);
          const targetExists = nodes.some(n => n.id === connection.target);
          return sourceExists && targetExists;
        })
        .map(connection => {
          const sourcePoints = getNodeConnectionPoints(connection.source);
          const targetPoints = getNodeConnectionPoints(connection.target);
          
          const start = sourcePoints.output;
          const end = targetPoints.input;
          
          return (
            <path
              key={connection.id}
              d={createPath(start, end)}
              stroke="#374151"
              strokeWidth="3"
              fill="none"
              markerEnd="url(#arrowhead)"
              className="drop-shadow-sm"
            />
          );
        })}
    </svg>
  );
}