import React from 'react';
import { Plus } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { WorkflowNodeComponent } from './WorkflowNode';
import { Connections } from './Connections';
import { useWorkflowContext } from '@/contexts/WorkflowContext';

interface WorkflowCanvasProps {
  draggedNode: { type: string; offset: { x: number; y: number } } | null;
  onDragEnd: () => void;
}

export function WorkflowCanvas({ draggedNode, onDragEnd }: WorkflowCanvasProps) {
  const { 
    workflow, 
    addNode, 
    updateNode, 
    selectNode,
    addConnection,
    closeNodeLibrary,
    toggleNodeLibrary 
  } = useWorkflowContext();
  
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const [canvasOffset, setCanvasOffset] = React.useState({ x: 0, y: 0 });
  const [connecting, setConnecting] = React.useState<string | null>(null);

  // Handle escape key to cancel connections
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && connecting) {
        setConnecting(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [connecting]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      selectNode(null);
      closeNodeLibrary();
      if (connecting) {
        setConnecting(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!draggedNode) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left - draggedNode.offset.x;
    const y = e.clientY - rect.top - draggedNode.offset.y;
    
    addNode(draggedNode.type, { x, y });
    onDragEnd();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleNodeMove = (nodeId: string, position: { x: number; y: number }) => {
    updateNode(nodeId, { position });
  };

  const handleNodeSelect = (nodeId: string) => {
    if (connecting) {
      // Complete connection
      if (connecting !== nodeId) {
        addConnection(connecting, nodeId);
      }
      setConnecting(null);
    } else {
      selectNode(nodeId);
    }
  };

  // Handle connection start (right-click or ctrl+click)
  const handleConnectionStart = (nodeId: string, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setConnecting(nodeId);
    }
  };

  return (
    <div 
      ref={canvasRef}
      className="flex-1 relative bg-background overflow-hidden"
      onClick={handleCanvasClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{
        backgroundImage: `
          radial-gradient(circle, oklch(0.8 0.005 240) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
        backgroundPosition: `${canvasOffset.x}px ${canvasOffset.y}px`
      }}
    >
      <Connections nodes={workflow.nodes} connections={workflow.connections} />
      
      {workflow.nodes.map(node => (
        <div
          key={node.id}
          onContextMenu={(e) => handleConnectionStart(node.id, e)}
        >
          <WorkflowNodeComponent
            node={node}
            onSelect={handleNodeSelect}
            onMove={handleNodeMove}
          />
        </div>
      ))}
      
      {connecting && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium z-50 animate-in slide-in-from-top-2">
          Click another node to connect, or press Escape to cancel
        </div>
      )}
      
      {workflow.nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Button
              onClick={toggleNodeLibrary}
              variant="ghost"
              className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-muted/80"
            >
              <Plus size={24} className="text-muted-foreground" />
            </Button>
            <h3 className="text-lg font-medium text-foreground mb-2">Start Building Your Workflow</h3>
            <p className="text-muted-foreground max-w-md">
              Click the plus button to add nodes and begin creating your ETL pipeline. 
              Hold Ctrl and click nodes to connect them.
            </p>
          </div>
        </div>
      )}
      
      {/* Floating Add Node Button */}
      <Button
        onClick={toggleNodeLibrary}
        size="icon"
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
      >
        <Plus size={24} />
      </Button>
    </div>
  );
}