import React from 'react';
import { WorkflowProvider, useWorkflowContext } from '@/contexts/WorkflowContext';
import { WorkflowHeader } from '@/components/WorkflowHeader';
import { NodeLibrary } from '@/components/NodeLibrary';
import { WorkflowCanvas } from '@/components/WorkflowCanvas';
import { NodeConfigPanel } from '@/components/NodeConfigPanel';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

function WorkflowBuilder() {
  const { 
    workflow, 
    selectedNodeId,
    draggedNode,
    isNodeLibraryOpen,
    startDrag, 
    endDrag,
    selectNode
  } = useWorkflowContext();

  const selectedNode = selectedNodeId 
    ? workflow.nodes.find(node => node.id === selectedNodeId) || null 
    : null;

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
          <NodeLibrary onDragStart={handleDragStart} />
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