import React, { createContext, useContext, ReactNode } from 'react';
import { useWorkflow } from '@/hooks/use-workflow';

interface WorkflowContextType {
  workflow: ReturnType<typeof useWorkflow>['workflow'];
  selectedNodeId: ReturnType<typeof useWorkflow>['selectedNodeId'];
  draggedNode: ReturnType<typeof useWorkflow>['draggedNode'];
  isNodeLibraryOpen: ReturnType<typeof useWorkflow>['isNodeLibraryOpen'];
  connectionSource: ReturnType<typeof useWorkflow>['connectionSource'];
  addNode: ReturnType<typeof useWorkflow>['addNode'];
  updateNode: ReturnType<typeof useWorkflow>['updateNode'];
  deleteNode: ReturnType<typeof useWorkflow>['deleteNode'];
  addConnection: ReturnType<typeof useWorkflow>['addConnection'];
  deleteConnection: ReturnType<typeof useWorkflow>['deleteConnection'];
  selectNode: ReturnType<typeof useWorkflow>['selectNode'];
  startDrag: ReturnType<typeof useWorkflow>['startDrag'];
  endDrag: ReturnType<typeof useWorkflow>['endDrag'];
  toggleNodeLibrary: ReturnType<typeof useWorkflow>['toggleNodeLibrary'];
  openNodeLibrary: ReturnType<typeof useWorkflow>['openNodeLibrary'];
  closeNodeLibrary: ReturnType<typeof useWorkflow>['closeNodeLibrary'];
  setConnectionSourceNode: ReturnType<typeof useWorkflow>['setConnectionSourceNode'];
}

const WorkflowContext = createContext<WorkflowContextType | null>(null);

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const workflowHook = useWorkflow();
  
  return (
    <WorkflowContext.Provider value={workflowHook}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflowContext() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflowContext must be used within a WorkflowProvider');
  }
  return context;
}