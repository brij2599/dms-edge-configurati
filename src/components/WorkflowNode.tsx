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
  isFirstNode?: boolean;
}

export function WorkflowNodeComponent({ 
  node, 
  connections = [],
  onSelect, 
  onDoubleClick,
  onMove,
  onAddConnection,
  style,
  isFirstNode = false
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
      {isFirstNode ? (
        // Special shape for first node - larger distinctive hexagonal design
        <div className={`relative group ${getBorderStyle()} hover:shadow-xl transition-all duration-300 ${
          isDragging ? 'shadow-2xl scale-110' : ''
        } ${node.selected ? 'shadow-xl' : 'shadow-lg'}`}>
          
          {/* Enhanced hexagonal container with gradient background */}
          <div className="relative w-36 h-36 bg-gradient-to-br from-primary/10 via-card to-accent/5 rounded-3xl border-4 border-primary/20 backdrop-blur-sm">
            
            {/* Inner decorative ring */}
            <div className="absolute inset-2 rounded-2xl border-2 border-primary/10" />
            
            {/* Central icon container with enhanced styling */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Glowing background effect */}
                <div 
                  className="absolute inset-0 rounded-3xl blur-md opacity-30"
                  style={{ backgroundColor: nodeType?.color || '#6b7280' }}
                />
                
                {/* Main icon container */}
                <div 
                  className="relative w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-xl border-2 border-white/20 backdrop-blur-sm"
                  style={{ 
                    backgroundColor: nodeType?.color || '#6b7280',
                    background: `linear-gradient(145deg, ${nodeType?.color || '#6b7280'}, ${nodeType?.color || '#6b7280'}dd)`
                  }}
                >
                  <IconComponent size={40} weight="fill" />
                  
                  {/* Subtle inner glow */}
                  <div className="absolute inset-0 rounded-3xl bg-white/10" />
                </div>
              </div>
            </div>

            {/* Enhanced output connector */}
            <div 
              className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary rounded-full border-4 border-background cursor-pointer transition-all duration-300 hover:scale-125 shadow-lg group-hover:shadow-xl"
              title="Output"
            >
              <div className="absolute inset-1 bg-white/20 rounded-full" />
            </div>

            {/* Decorative corner elements */}
            <div className="absolute top-3 right-3 w-2 h-2 bg-primary/30 rounded-full" />
            <div className="absolute bottom-3 left-3 w-2 h-2 bg-accent/30 rounded-full" />
            
            {/* Animated pulse for first node */}
            <div className="absolute inset-0 rounded-3xl bg-primary/5 animate-pulse" />
          </div>

          {/* Enhanced error indicator */}
          {(node.status === 'error' || node.type === 'activecampaign') && (
            <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
              <WarningTriangle size={14} className="text-white" weight="fill" />
            </div>
          )}

          {/* Enhanced status indicator */}
          {node.status && node.status !== 'idle' && node.status !== 'error' && (
            <div className={`absolute -top-2 -right-2 w-4 h-4 rounded-full border-4 border-white shadow-lg ${getStatusColor()}`}>
              <div className="absolute inset-0.5 bg-white/30 rounded-full" />
            </div>
          )}

          {/* Enhanced webhook label */}
          {node.type === 'webhook' && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white text-xs px-3 py-1 rounded-lg font-semibold shadow-lg border border-gray-600">
                PUT
              </div>
            </div>
          )}

          {/* Special "START" label for first node */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <div className="bg-gradient-to-r from-primary to-accent text-white text-xs px-3 py-1 rounded-full font-bold tracking-wide shadow-lg border border-white/20">
              START
            </div>
          </div>
        </div>
      ) : (
        // Regular shape for other nodes
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
      )}

      {/* Connection handle - only show if node doesn't have outgoing connections and not first node */}
      {!hasOutgoingConnection && !isFirstNode && (
        <div className="absolute left-[110px] top-[40px] transform -translate-y-1/2">
          <div className="w-16 h-0.5 bg-gray-400" />
          
          <div
            className="absolute top-[-16px] left-[56px] w-8 h-8 bg-gray-200 hover:bg-gray-300 border-2 border-gray-400 rounded-md flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110"
            onClick={handleAddConnection}
          >
            <Plus size={16} className="text-gray-600" />
          </div>
        </div>
      )}

      {/* Enhanced connection handle for first node */}
      {!hasOutgoingConnection && isFirstNode && (
        <div className="absolute left-[142px] top-[72px] transform -translate-y-1/2">
          {/* Enhanced connection line */}
          <div className="w-20 h-1 bg-gradient-to-r from-primary/40 to-transparent rounded-full" />
          
          {/* Enhanced plus button */}
          <div
            className="absolute top-[-18px] left-[68px] w-10 h-10 bg-gradient-to-br from-primary to-accent hover:from-accent hover:to-primary border-4 border-white rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-125 shadow-lg hover:shadow-xl"
            onClick={handleAddConnection}
          >
            <Plus size={18} className="text-white" weight="bold" />
            <div className="absolute inset-1 bg-white/20 rounded-lg" />
          </div>
        </div>
      )}

      <div className="mt-3 text-center">
        {isFirstNode ? (
          // Enhanced title for first node
          <div className="flex flex-col items-center gap-1">
            <h4 className="font-bold text-lg text-foreground bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {nodeType?.name || 'Unknown Node'}
            </h4>
            <div className="text-xs text-muted-foreground font-medium px-2 py-0.5 bg-primary/10 rounded-full">
              Entry Point
            </div>
          </div>
        ) : (
          // Regular title for other nodes
          <h4 className="font-medium text-sm text-foreground">
            {nodeType?.name || 'Unknown Node'}
          </h4>
        )}
        {node.type === 'activecampaign' && (
          <p className="text-xs text-muted-foreground mt-0.5">create: account</p>
        )}
      </div>
    </div>
  );
}