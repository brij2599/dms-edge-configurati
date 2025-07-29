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
    connectionSource,
    addNode, 
    updateNode, 
    selectNode,
    addConnection,
    closeNodeLibrary,
    openNodeLibrary,
    setConnectionSourceNode 
  } = useWorkflowContext();
  
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const [canvasOffset, setCanvasOffset] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    console.log('Canvas Debug - Nodes:', workflow.nodes.length, 'Connections:', workflow.connections.length);
    if (workflow.connections.length > 0) {
      console.log('Connections in workflow:', workflow.connections);
    }
  }, [workflow.nodes, workflow.connections]);

  const handlePlusButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openNodeLibrary();
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    const isOnNode = target.closest('[data-node]');
    const isOnLibrary = target.closest('[data-node-library]');
    const isOnButton = target.closest('button') || target.closest('[role="button"]');
    const isOnCard = target.closest('[data-testid="card"]') || target.closest('.card');
    
    if (!isOnNode && !isOnLibrary && !isOnButton && !isOnCard) {
      selectNode(null);
      closeNodeLibrary();
      setConnectionSourceNode(null);
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
    if (connectionSource && connectionSource !== nodeId) {
      addConnection(connectionSource, nodeId);
      setConnectionSourceNode(null);
      return;
    }
  };

  const handleNodeDoubleClick = (nodeId: string) => {
    selectNode(nodeId);
  };

  const handleAddConnection = (sourceNodeId: string) => {
    setConnectionSourceNode(sourceNodeId);
    openNodeLibrary();
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
      
      <div className="absolute top-6 left-6 z-10">
        <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium text-sm shadow-sm">
          {workflow.name}
        </div>
      </div>
      
      {workflow.nodes.map((node) => (
        <WorkflowNodeComponent
          key={node.id}
          node={node}
          connections={workflow.connections}
          onSelect={handleNodeSelect}
          onDoubleClick={handleNodeDoubleClick}
          onMove={handleNodeMove}
          onAddConnection={handleAddConnection}
        />
      ))}
      
      {workflow.nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Button
              onClick={handlePlusButtonClick}
              variant="ghost"
              className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-muted/80"
            >
              <Plus size={24} className="text-muted-foreground" />
            </Button>
            <h3 className="text-lg font-medium text-foreground mb-2">Start Building Your Workflow</h3>
            <p className="text-muted-foreground max-w-md">
              Click the plus button to add nodes and begin creating your ETL pipeline.
            </p>
          </div>
        </div>
      )}
      
      <Button
        onClick={handlePlusButtonClick}
        size="icon"
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
      >
        <Plus size={24} />
      </Button>
    </div>
  );
}