import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WorkflowNode } from '@/lib/workflow-types';
import { NODE_TYPES } from '@/lib/workflow-types';
import * as PhosphorIcons from '@phosphor-icons/react';

interface WorkflowNodeComponentProps {
  node: WorkflowNode;
  onSelect: (nodeId: string) => void;
  onMove: (nodeId: string, position: { x: number; y: number }) => void;
  onConnectionStart?: (nodeId: string, e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

export function WorkflowNodeComponent({ 
  node, 
  onSelect, 
  onMove,
  onConnectionStart,
  style 
}: WorkflowNodeComponentProps) {
  const nodeType = NODE_TYPES.find(type => type.id === node.type);
  const IconComponent = nodeType ? (PhosphorIcons as any)[nodeType.icon] || PhosphorIcons.Circle : PhosphorIcons.Circle;
  
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y
    });
    onSelect(node.id);
  };

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStart) return;
    
    const newPosition = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    };
    
    onMove(node.id, newPosition);
  }, [isDragging, dragStart, node.id, onMove]);

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const getStatusColor = () => {
    switch (node.status) {
      case 'running': return 'bg-blue-500';
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getBorderStyle = () => {
    if (node.selected) return 'border-blue-500';
    if (node.status === 'running') return 'border-blue-400';
    if (node.status === 'error') return 'border-red-400';
    return 'border-gray-300';
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (onConnectionStart) {
      onConnectionStart(node.id, e);
    }
  };

  return (
    <div
      data-node
      style={{
        position: 'absolute',
        left: node.position.x,
        top: node.position.y,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: node.selected ? 10 : 1,
        ...style
      }}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
      className="flex flex-col items-center"
    >
      {/* Main Node Card */}
      <div className={`relative w-28 h-20 bg-card rounded-xl border-2 ${getBorderStyle()} hover:shadow-lg transition-all duration-200 ${
        isDragging ? 'shadow-xl scale-105' : ''
      } ${node.selected ? 'shadow-lg' : 'shadow-sm'}`}>
        
        {/* Input Connection Port */}
        <div 
          className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-gray-600 rounded-full border-2 border-white cursor-pointer hover:scale-110 transition-all duration-200 hover:bg-gray-700"
          title="Input"
        />
        
        {/* Output Connection Port */}
        <div 
          className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-gray-600 rounded-full border-2 border-white cursor-pointer hover:scale-110 transition-all duration-200 hover:bg-gray-700"
          title="Output"
        />

        {/* Node Content */}
        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-1">
            {/* Main Icon */}
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: nodeType?.color || '#6b7280' }}
            >
              <IconComponent size={24} weight="fill" />
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        {node.status && node.status !== 'idle' && (
          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor()}`} />
        )}

        {/* HTTP Method Badge for Webhook nodes */}
        {node.type === 'webhook' && (
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <div className="bg-gray-700 text-white text-xs px-2 py-0.5 rounded-md font-medium">
              GET
            </div>
          </div>
        )}
      </div>

      {/* Node Label */}
      <div className="mt-2 text-center">
        <h4 className="font-medium text-sm text-foreground">
          {nodeType?.name || 'Unknown Node'}
        </h4>
      </div>
    </div>
  );
}