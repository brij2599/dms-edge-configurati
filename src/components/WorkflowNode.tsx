import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WorkflowNode } from '@/lib/workflow-types';
import { NODE_TYPES } from '@/lib/workflow-types';
import * as PhosphorIcons from '@phosphor-icons/react';
import { Plus, WarningTriangle } from '@phosphor-icons/react';

interface WorkflowNodeComponentProps {
  node: WorkflowNode;
  onSelect: (nodeId: string) => void;
  onMove: (nodeId: string, position: { x: number; y: number }) => void;
  onConnectionStart?: (nodeId: string, e: React.MouseEvent) => void;
  onAddConnection?: (sourceNodeId: string) => void;
  style?: React.CSSProperties;
}

export function WorkflowNodeComponent({ 
  node, 
  onSelect, 
  onMove,
  onConnectionStart,
  onAddConnection,
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
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
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
    if (node.type === 'activecampaign') return 'border-red-400 border-2'; // Error state from image
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
    // Prevent right-click context menu on nodes for now
    // Could be extended later for node-specific actions
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
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      className="flex flex-col items-center"
    >
      {/* Main Node Card */}
      <div className={`relative w-28 h-20 bg-card rounded-xl ${getBorderStyle()} hover:shadow-lg transition-all duration-200 ${
        isDragging ? 'shadow-xl scale-105' : ''
      } ${node.selected ? 'shadow-lg' : 'shadow-sm'}`}>
        
        {/* Input Connection Port */}
        <div 
          className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gray-500 hover:bg-gray-600 rounded-full border-2 border-background cursor-pointer transition-all duration-200 hover:scale-110 shadow-md"
          title="Input"
          style={{
            background: node.type === 'webhook' ? '#6b7280' : '#6b7280'
          }}
        />
        
        {/* Output Connection Port */}
        <div 
          className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-gray-500 hover:bg-gray-600 rounded-full border-2 border-background cursor-pointer transition-all duration-200 hover:scale-110 shadow-md"
          title="Output"
          style={{
            background: node.type === 'webhook' ? '#6b7280' : '#6b7280'
          }}
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

        {/* Error Warning Icon for specific nodes */}
        {(node.status === 'error' || node.type === 'activecampaign') && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
            <WarningTriangle size={12} className="text-white" weight="fill" />
          </div>
        )}

        {/* Status Indicator */}
        {node.status && node.status !== 'idle' && node.status !== 'error' && (
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

      {/* Connection Line with Plus Button */}
      <div className="absolute left-[110px] top-[40px]">
        {/* Horizontal line extending from the output port */}
        <div className="w-16 h-0.5 bg-gray-400" />
        
        {/* Plus button at the end of the line */}
        <div
          className="absolute top-[-16px] left-[56px] w-8 h-8 bg-gray-200 hover:bg-gray-300 border-2 border-gray-400 rounded-md flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110"
          onClick={handleAddConnection}
          title="Add connected node"
        >
          <Plus size={16} className="text-gray-600" />
        </div>
      </div>

      {/* Node Label */}
      <div className="mt-2 text-center">
        <h4 className="font-medium text-sm text-foreground">
          {nodeType?.name || 'Unknown Node'}
        </h4>
        {/* Add subtitle for specific node types */}
        {node.type === 'activecampaign' && (
          <p className="text-xs text-muted-foreground mt-0.5">create: account</p>
        )}
      </div>
    </div>
  );
}