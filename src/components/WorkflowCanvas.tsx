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

  const handlePlusButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent canvas click handler
    openNodeLibrary();
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Check if click is on canvas background or empty space
    const target = e.target as HTMLElement;
    const canvas = e.currentTarget as HTMLElement;
    
    // Get the actual click coordinates relative to the canvas
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Check if click is on an empty area (not hitting any nodes or UI elements)
    const isOnNode = target.closest('[data-node]');
    const isOnLibrary = target.closest('[data-node-library]');
    const isOnButton = target.closest('button') || target.closest('[role="button"]');
    const isOnCard = target.closest('[data-testid="card"]') || target.closest('.card');
    
    // Only close if we're clicking on truly empty canvas space
    if (!isOnNode && !isOnLibrary && !isOnButton && !isOnCard) {
      selectNode(null);
      closeNodeLibrary();
      setConnectionSourceNode(null); // Clear connection source
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

  // Handle adding a connection from a node's plus button
  const handleAddConnection = (sourceNodeId: string) => {
    console.log('handleAddConnection called with sourceNodeId:', sourceNodeId);
    console.log('Current workflow nodes before setting connection source:', workflow.nodes.map(n => ({ id: n.id, type: n.type })));
    setConnectionSourceNode(sourceNodeId);
    openNodeLibrary();
  };

  //Code added for connection. Taken from Chatgpt
  const handleNodeClick = (targetId: string) => {
  if (connectionSource) {
    addConnection(connectionSource, targetId);
    setConnectionSourceNode(null);
  } else {
    setConnectionSourceNode(targetId);
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
      
      {/* Workflow Name Badge */}
      <div className="absolute top-6 left-6 z-10">
        <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium text-sm shadow-sm">
          {workflow.name}
        </div>
      </div>
      
      {/* Debug Info */}
      <div className="absolute top-6 right-6 z-10 bg-black/80 text-white p-2 rounded text-xs font-mono">
        <div>Nodes: {workflow.nodes.length}</div>
        <div>Connections: {workflow.connections.length}</div>
        <div>Connection Source: {connectionSource || 'None'}</div>
        {workflow.connections.length > 0 && (
          <div className="mt-1">
            <div className="text-yellow-300">Latest connections:</div>
            {workflow.connections.slice(-3).map(conn => (
              <div key={conn.id} className="text-green-300">
                {conn.source} → {conn.target}
              </div>
            ))}
          </div>
        )}
        {workflow.nodes.length >= 2 && (
          <div className="mt-2 space-y-1">
            <button 
              onClick={() => {
                const node1 = workflow.nodes[0];
                const node2 = workflow.nodes[1];
                console.log('=== MANUAL CONNECTION TEST START ===');
                console.log('Node 1:', node1.id, node1.type);
                console.log('Node 2:', node2.id, node2.type);
                console.log('Current connections before:', workflow.connections);
                addConnection(node1.id, node2.id);
                console.log('addConnection called');
                
                // Check connection after a short delay
                setTimeout(() => {
                  console.log('Connection check after 500ms:', workflow.connections);
                }, 500);
                console.log('=== MANUAL CONNECTION TEST END ===');
              }}
              className="block w-full bg-green-600 px-2 py-1 rounded text-white hover:bg-green-700 text-xs"
            >
              Test Connect First 2 Nodes
            </button>
            <button 
              onClick={() => {
                setWorkflow(prev => ({ ...prev, connections: [] }));
                console.log('All connections cleared');
              }}
              className="block w-full bg-red-600 px-2 py-1 rounded text-white hover:bg-red-700 text-xs"
            >
              Clear All Connections
            </button>
          </div>
        )}
      </div>
      
      {workflow.nodes.map(node => (
        <WorkflowNodeComponent
          key={node.id}
          node={node}
          onSelect={handleNodeSelect}
          onMove={handleNodeMove}
          onConnectionStart={handleConnectionStart}
          // onAddConnection={handleAddConnection} - Commented due to Chatgpt
          onAddConnection={handleNodeClick} //added from Chatgpt
        />
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
              onClick={handlePlusButtonClick}
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
        onClick={handlePlusButtonClick}
        size="icon"
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
      >
        <Plus size={24} />
      </Button>
    </div>
  );
}