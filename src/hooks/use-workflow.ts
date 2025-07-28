import { useState, useCallback, useEffect } from 'react';
import { WorkflowNode, NodeConnection, Workflow } from '@/lib/workflow-types';

export function useWorkflow() {
  const [workflow, setWorkflow] = useState<Workflow>({
    id: 'workflow-1',
    name: 'New ETL Workflow',
    nodes: [],
    connections: [],
    status: 'draft'
  });

  // Add test nodes on initial load
  const [testNodesAdded, setTestNodesAdded] = useState(false);
  
  useEffect(() => {
    if (!testNodesAdded) {
      setWorkflow(prev => ({
        ...prev,
        nodes: [
          {
            id: 'test-node-1',
            type: 'webhook',
            position: { x: 200, y: 200 },
            data: {},
            status: 'idle'
          },
          {
            id: 'test-node-2',
            type: 'ai-transform',
            position: { x: 450, y: 200 },
            data: {},
            status: 'idle'
          }
        ]
      }));
      setTestNodesAdded(true);
    }
  }, [testNodesAdded]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<{ type: string; offset: { x: number; y: number } } | null>(null);
  const [isNodeLibraryOpen, setIsNodeLibraryOpen] = useState(false);
  const [connectionSource, setConnectionSource] = useState<string | null>(null);

  const addNode = useCallback((type: string, position: { x: number; y: number }, autoConnect = false, sourceNodeId?: string) => {
    const nodeId = `node-${Date.now()}`;
    const newNode: WorkflowNode = {
      id: nodeId,
      type,
      position,
      data: {},
      status: 'idle'
    };
    console.log('addNode called:', { type, position, autoConnect, sourceNodeId, nodeId });

    setWorkflow(prev => {
      console.log('addNode - current workflow:', prev);
      console.log('addNode - current nodes before adding:', prev.nodes.map(n => ({ id: n.id, type: n.type })));
      console.log('addNode - current connections before adding:', prev.connections);
      
      const updatedNodes = [...prev.nodes, newNode];
      let updatedConnections = [...prev.connections];
      
      // If we need to auto-connect and source node exists
      if (autoConnect && sourceNodeId) {
        const sourceExists = prev.nodes.some(n => n.id === sourceNodeId);
        console.log('Auto-connect attempt:', { 
          sourceNodeId, 
          sourceExists, 
          currentNodes: prev.nodes.map(n => n.id),
          currentConnections: prev.connections.length 
        });
        
        if (sourceExists) {
          const newConnection: NodeConnection = {
            id: `connection-${Date.now()}-${sourceNodeId}-${nodeId}`,
            source: sourceNodeId,
            target: nodeId
          };
          updatedConnections = [...prev.connections, newConnection];
          console.log('Connection created:', newConnection);
          console.log('Updated connections array:', updatedConnections);
          
          // Add a timeout to see if connections render after a delay
          setTimeout(() => {
            console.log('POST-CREATION: Checking if connection exists in state...');
            setWorkflow(current => {
              console.log('Current connections after timeout:', current.connections);
              return current; // No change, just checking
            });
          }, 1000);
        } else {
          console.error('Source node not found for auto-connect:', sourceNodeId);
          console.error('Available nodes:', prev.nodes.map(n => ({ id: n.id, type: n.type })));
        }
      }

      const newWorkflow = {
        ...prev,
        nodes: updatedNodes,
        connections: updatedConnections
      };
      
      console.log('Workflow updated:', {
        nodeCount: newWorkflow.nodes.length,
        connectionCount: newWorkflow.connections.length,
        addedNode: nodeId,
        connections: newWorkflow.connections
      });
      
      return newWorkflow;
    });

    return nodeId;
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
    console.log('=== addConnection CALLED ===');
    console.log('Source:', source, 'Target:', target);
    
    setWorkflow(prev => {
      console.log('addConnection - current state before update:');
      console.log('  - nodes:', prev.nodes.map(n => ({ id: n.id, type: n.type })));
      console.log('  - connections:', prev.connections);
      
      // Prevent duplicate connections using current state
      const exists = prev.connections.some(
        conn => conn.source === source && conn.target === target
      );
      
      if (exists) {
        console.log('Connection already exists, skipping');
        return prev;
      }

      const newConnection: NodeConnection = {
        id: `connection-${Date.now()}`,
        source,
        target
      };

      console.log('Creating new connection:', newConnection);

      const newState = {
        ...prev,
        connections: [...prev.connections, newConnection]
      };
      
      console.log('New state after addConnection:');
      console.log('  - nodes:', newState.nodes.map(n => ({ id: n.id, type: n.type })));
      console.log('  - connections:', newState.connections);
      console.log('=== addConnection END ===');
      
      return newState;
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
    console.log('setConnectionSourceNode called:', sourceNodeId);
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