import { useState, useCallback } from 'react';
import { WorkflowNode, NodeConnection, Workflow } from '@/lib/workflow-types';

export function useWorkflow() {
  const [workflow, setWorkflow] = useState<Workflow>({
    id: 'workflow-1',
    name: 'New ETL Workflow',
    nodes: [],
    connections: [],
    status: 'draft'
  });

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<{ type: string; offset: { x: number; y: number } } | null>(null);
  const [isNodeLibraryOpen, setIsNodeLibraryOpen] = useState(false);

  const addNode = useCallback((type: string, position: { x: number; y: number }) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type,
      position,
      data: {},
      status: 'idle'
    };

    setWorkflow(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));

    return newNode.id;
  }, []);

  const updateNode = useCallback((nodeId: string, updates: Partial<WorkflowNode>) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === nodeId ? { ...node, ...updates } : node
      )
    }));
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== nodeId),
      connections: prev.connections.filter(
        conn => conn.source !== nodeId && conn.target !== nodeId
      )
    }));
  }, []);

  const addConnection = useCallback((source: string, target: string) => {
    // Prevent duplicate connections
    const exists = workflow.connections.some(
      conn => conn.source === source && conn.target === target
    );
    
    if (exists) return;

    const newConnection: NodeConnection = {
      id: `connection-${Date.now()}`,
      source,
      target
    };

    setWorkflow(prev => ({
      ...prev,
      connections: [...prev.connections, newConnection]
    }));
  }, [workflow.connections]);

  const deleteConnection = useCallback((connectionId: string) => {
    setWorkflow(prev => ({
      ...prev,
      connections: prev.connections.filter(conn => conn.id !== connectionId)
    }));
  }, []);

  const selectNode = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
    
    // Update node selection state
    setWorkflow(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => ({
        ...node,
        selected: node.id === nodeId
      }))
    }));
  }, []);

  const startDrag = useCallback((type: string, offset: { x: number; y: number }) => {
    setDraggedNode({ type, offset });
  }, []);

  const endDrag = useCallback(() => {
    setDraggedNode(null);
  }, []);

  const toggleNodeLibrary = useCallback(() => {
    setIsNodeLibraryOpen(prev => !prev);
  }, []);

  const openNodeLibrary = useCallback(() => {
    setIsNodeLibraryOpen(true);
  }, []);

  const closeNodeLibrary = useCallback(() => {
    setIsNodeLibraryOpen(false);
  }, []);

  return {
    workflow,
    selectedNodeId,
    draggedNode,
    isNodeLibraryOpen,
    addNode,
    updateNode,
    deleteNode,
    addConnection,
    deleteConnection,
    selectNode,
    startDrag,
    endDrag,
    toggleNodeLibrary,
    openNodeLibrary,
    closeNodeLibrary
  };
}