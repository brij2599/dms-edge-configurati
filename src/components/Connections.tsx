import React from 'react';
import { WorkflowNode, NodeConnection } from '@/lib/workflow-types';

interface ConnectionsProps {
  nodes: WorkflowNode[];
  connections: NodeConnection[];
}

export function Connections({ nodes, connections }: ConnectionsProps) {
  const getNodeConnectionPoints = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) {
      return { input: { x: 0, y: 0 }, output: { x: 0, y: 0 } };
    }
    
    // Check if this is the first node (special shape)
    const isFirstNode = node.id === 'node-demo-first' || node.id.startsWith('node-demo-first');
    
    const centerY = node.position.y + 40; // half height (both nodes are h-20, 80px)
    
    if (isFirstNode) {
      // First node: width is 80px (w-20), height 80px (h-20)
      // Input port is at -left-2 (-8px from left edge)
      // Output port is at -right-2 (-8px from right edge, so +88px from left edge)
      return {
        input: {
          x: node.position.x - 8, // -left-2 position
          y: centerY
        },
        output: {
          x: node.position.x + 88, // -right-2 position (80px + 8px)
          y: centerY
        }
      };
    } else {
      // Regular node: width is 112px (w-28), height 80px (h-20)
      // Input port is at -left-2 (-8px from left edge)
      // Output port is at -right-2 (-8px from right edge, so +120px from left edge)
      return {
        input: {
          x: node.position.x - 8, // -left-2 position
          y: centerY
        },
        output: {
          x: node.position.x + 120, // -right-2 position (112px + 8px)
          y: centerY
        }
      };
    }
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
      width="100%"
      height="100%"
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
            fill="#ef4444"
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
            <g key={connection.id}>
              <path
                d={createPath(start, end)}
                stroke="#ef4444"
                strokeWidth="3"
                fill="none"
                markerEnd="url(#arrowhead)"
                className="drop-shadow-sm"
              />
              {/* Debug circles to show connection points */}
              <circle cx={start.x} cy={start.y} r="4" fill="#22c55e" />
              <circle cx={end.x} cy={end.y} r="4" fill="#3b82f6" />
            </g>
          );
        })}
    </svg>
  );
}