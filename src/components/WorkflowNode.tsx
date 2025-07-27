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
  style?: React.CSSProperties;
}

export function WorkflowNodeComponent({ 
  node, 
  onSelect, 
  onMove,
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
    if (node.selected) return 'border-primary border-2';
    if (node.status === 'running') return 'border-blue-300 border-2';
    if (node.status === 'error') return 'border-red-300 border-2';
    return 'border-border border';
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: node.position.x,
        top: node.position.y,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: node.selected ? 10 : 1,
        ...style
      }}
      onMouseDown={handleMouseDown}
    >
      <Card className={`w-48 ${getBorderStyle()} hover:shadow-md transition-all duration-200 ${
        isDragging ? 'shadow-lg scale-105' : ''
      }`}>
        {/* Connection ports */}
        <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white cursor-pointer hover:scale-110 transition-transform" />
        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-white cursor-pointer hover:scale-110 transition-transform" />
        
        <div className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-8 h-8 rounded-md flex items-center justify-center text-white"
              style={{ backgroundColor: nodeType?.color || '#666' }}
            >
              <IconComponent size={16} weight="fill" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-foreground truncate">
                {nodeType?.name || 'Unknown Node'}
              </h4>
            </div>
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
          </div>
          
          <p className="text-xs text-muted-foreground mb-3">
            {nodeType?.description || 'No description'}
          </p>
          
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {nodeType?.category || 'unknown'}
            </Badge>
            {node.status && node.status !== 'idle' && (
              <Badge 
                variant={node.status === 'error' ? 'destructive' : 'default'}
                className="text-xs"
              >
                {node.status}
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}