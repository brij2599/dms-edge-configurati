import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WorkflowNode, NodeConnection } from '@/lib/workflow-types';
import { NODE_TYPES } from '@/lib/workflow-types';
import * as PhosphorIcons from '@phosphor-icons/react';
import { Plus, WarningTriangle } from '@phosphor-icons/react';

interface WorkflowNodeComponentProps {
  node: WorkflowNode;
  connections?: NodeConnection[];
  onSelect: (nodeId: string) => void;
  onDoubleClick?: (nodeId: string) => void;
  onMove: (nodeId: string, position: { x: number; y: number }) => void;
  onAddConnection?: (sourceNodeId: string) => void;
  style?: React.CSSProperties;
}

export function WorkflowNodeComponent({ 
  node, 
  connections = [],
  onSelect, 
  onDoubleClick,
  onMove,
  onAddConnection,
  style 
}: WorkflowNodeComponentProps) {
  const nodeType = NODE_TYPES.find(type => type.id === node.type);
  const IconComponent = nodeType ? (PhosphorIcons as any)[nodeType.icon] || PhosphorIcons.Circle : PhosphorIcons.Circle;
  
  // Check if this node has any outgoing connections
  const hasOutgoingConnection = connections.some(conn => conn.source === node.id);
  
  // Debug log to help verify the logic
  React.useEffect(() => {
    console.log(`Node ${node.id} has outgoing connection: ${hasOutgoingConnection}`);
  }, [hasOutgoingConnection, node.id]);
  
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState<{ x: number; y: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y
    });
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDoubleClick) {
      onDoubleClick(node.id);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    if (node.selected) return 'border-blue-500 border-2';
    if (node.status === 'running') return 'border-blue-400 border-2';
    if (node.status === 'error') return 'border-red-400 border-2';
    if (node.type === 'activecampaign') return 'border-red-400 border-2';
    return 'border-gray-300 border-2';
  };

  const handleAddConnection = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddConnection) {
      onAddConnection(node.id);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      data-node
      style={{
        position: 'absolute',
        left: node.position.x,
        top: node.position.y,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: node.selected ? 10 : 5,
        ...style
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      className="flex flex-col items-center"
    >
      <div className={`relative w-28 h-20 bg-card rounded-xl ${getBorderStyle()} hover:shadow-lg transition-all duration-200 ${
        isDragging ? 'shadow-xl scale-105' : ''
      } ${node.selected ? 'shadow-lg' : 'shadow-sm'}`}>
        
        <div 
          className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gray-500 hover:bg-gray-600 rounded-full border-2 border-background cursor-pointer transition-all duration-200 hover:scale-110 shadow-md"
          title="Input"
        />
        
        <div 
          className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gray-500 hover:bg-gray-600 rounded-full border-2 border-background cursor-pointer transition-all duration-200 hover:scale-110 shadow-md"
          title="Output"
        />

        <div className="flex items-center justify-center h-full">
          <div className="flex flex-col items-center gap-1">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: nodeType?.color || '#6b7280' }}
            >
              <IconComponent size={24} weight="fill" />
            </div>
          </div>
        </div>

        {(node.status === 'error' || node.type === 'activecampaign') && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
            <WarningTriangle size={12} className="text-white" weight="fill" />
          </div>
        )}

        {node.status && node.status !== 'idle' && node.status !== 'error' && (
          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor()}`} />
        )}

        {node.type === 'webhook' && (
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <div className="bg-gray-700 text-white text-xs px-2 py-0.5 rounded-md font-medium">PUT</div>
          </div>
        )}
      </div>

      {/* Connection handle - only show if node doesn't have outgoing connections */}
      {!hasOutgoingConnection && (
        <div className="absolute left-[110px] top-[40px] transform -translate-y-1/2">
          <div className="w-16 h-0.5 bg-gray-400" />
          
          <div
            className="absolute top-[-16px] left-[56px] w-8 h-8 bg-gray-200 hover:bg-gray-300 border-2 border-gray-400 rounded-md flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110"
        </div>
      )}

            <Plus size={16} className="text-gray-600" />
        <h4 className="font-medium text-sm text-foreground">
        </div>
      )}

      <div className="mt-2 text-center">
        <h4 className="font-medium text-sm text-foreground">
          {nodeType?.name || 'Unknown Node'}
        </h4>
        {node.type === 'activecampaign' && (
          <p className="text-xs text-muted-foreground mt-0.5">create: account</p>
        )}
      </div>
    </div>
  );
}