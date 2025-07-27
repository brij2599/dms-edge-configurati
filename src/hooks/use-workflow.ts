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
  const [connectionSource, setConnectionSource] = useState<string | null>(null);

  const addNode = useCallback((type: string, position: { x: number; y: number }, autoConnect = false) => {
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
    setWorkflow(prev => {
      // Prevent duplicate connections using current state
      const exists = prev.connections.some(
        conn => conn.source === source && conn.target === target
      );
      
      if (exists) return prev;

      const newConnection: NodeConnection = {
        id: `connection-${Date.now()}`,
        source,
        target
      };

      return {
        ...prev,
        connections: [...prev.connections, newConnection]
      };
    });
  }, []);

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

  const setConnectionSourceNode = useCallback((sourceNodeId: string | null) => {
    setConnectionSource(sourceNodeId);
  }, []);

  return {
    workflow,
    selectedNodeId,
    draggedNode,
    isNodeLibraryOpen,
    connectionSource,
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
    closeNodeLibrary,
    setConnectionSourceNode
  };
}