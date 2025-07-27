import React from 'react';
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
    addConnection 
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
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
                <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">Start Building Your Workflow</h3>
            <p className="text-muted-foreground max-w-md">
              Drag nodes from the library to the canvas to begin creating your ETL pipeline. 
              Hold Ctrl and click nodes to connect them.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}