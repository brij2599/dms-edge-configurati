import React from 'react';
import { WorkflowProvider, useWorkflowContext } from '@/contexts/WorkflowContext';
import { WorkflowHeader } from '@/components/WorkflowHeader';
import { NodeLibrary } from '@/components/NodeLibrary';
import { WorkflowCanvas } from '@/components/WorkflowCanvas';
import { NodeConfigPanel } from '@/components/NodeConfigPanel';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { NODE_TYPES } from '@/lib/workflow-types';

function WorkflowBuilder() {
  const { 
    workflow, 
    selectedNodeId,
    draggedNode,
    isNodeLibraryOpen,
    connectionSource,
    addNode,
    addConnection,
    startDrag, 
    endDrag,
    selectNode,
    setConnectionSourceNode,
    closeNodeLibrary
  } = useWorkflowContext();

  React.useEffect(() => {
    // Track workflow state changes for development
  }, [workflow, connectionSource]);

  const selectedNode = selectedNodeId 
    ? workflow.nodes.find(node => node.id === selectedNodeId) || null 
    : null;

  const handleNodeClick = (nodeType: string) => {
    const canvasWidth = 800;
    const canvasHeight = 600;
    let centerX = canvasWidth / 2;
    let centerY = canvasHeight / 2;
    
    if (connectionSource) {
      const sourceNode = workflow.nodes.find(node => node.id === connectionSource);
      if (sourceNode) {
        centerX = sourceNode.position.x + 200;
        centerY = sourceNode.position.y;
      } else {
        setConnectionSourceNode(null);
      }
    } else {
      const offsetX = (Math.random() - 0.5) * 200;
      const offsetY = (Math.random() - 0.5) * 200;
      centerX += offsetX;
      centerY += offsetY;
    }
    
    const position = { x: centerX, y: centerY };
    const shouldAutoConnect = !!connectionSource;
    const sourceNodeId = connectionSource || undefined;
    
    const newNodeId = addNode(nodeType, position, shouldAutoConnect, sourceNodeId);
    setConnectionSourceNode(null);
    closeNodeLibrary();
    
    const nodeInfo = NODE_TYPES.find(node => node.id === nodeType);
    const nodeName = nodeInfo ? nodeInfo.name : nodeType;
    toast.success(`${nodeName} node added to canvas`);
  };

  const handleDragStart = (nodeType: string, event: React.DragEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const offset = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    startDrag(nodeType, offset);
  };

  const handleWorkflowRun = () => {
    if (workflow.nodes.length === 0) {
      toast.error('Add nodes to your workflow before executing');
      return;
    }
    
    toast.success('Workflow execution started');
    // Here you would integrate with your backend API
  };

  const handleWorkflowStop = () => {
    toast.info('Workflow execution stopped');
  };

  const handleWorkflowSave = () => {
    toast.success('Workflow saved successfully');
    // Here you would save to your backend
  };

  const handleCloseConfig = () => {
    selectNode(null);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <WorkflowHeader
        workflowName={workflow.name}
        workflowStatus={workflow.status}
        onRun={handleWorkflowRun}
        onStop={handleWorkflowStop}
        onSave={handleWorkflowSave}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <WorkflowCanvas 
          draggedNode={draggedNode}
          onDragEnd={endDrag}
        />
        
        {selectedNode && (
          <NodeConfigPanel 
            node={selectedNode}
            onClose={handleCloseConfig}
          />
        )}
        
        {isNodeLibraryOpen && (
          <NodeLibrary 
            onDragStart={handleDragStart} 
            onNodeClick={handleNodeClick}
          />
        )}
      </div>
      
      <Toaster position="bottom-right" />
    </div>
  );
}

function App() {
  return (
    <WorkflowProvider>
      <WorkflowBuilder />
    </WorkflowProvider>
  );
}

export default App;