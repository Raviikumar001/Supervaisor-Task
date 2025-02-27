import { create } from 'zustand';
import { Node, Edge, Position, Connection } from '@xyflow/react';
import  useUndoable  from "use-undoable";
import React from 'react';
interface NodeData {
  label: string;
  type: string;
  nodeType?: 'step' | 'parent' | 'child';
  step?: string;
  parentId?: string;
  hasChildren?: boolean;
  relationships?: {
    type: string;
    targetId: string;
  }[];
  [key: string]: unknown;
}

interface FlowNode extends Node {
  data: NodeData;
}


interface FlowData {
  nodes: FlowNode[];
  edges: Edge[];
}


interface FlowSnapshot {
  nodes: FlowNode[];
  edges: Edge[];
}

interface FlowState {
  nodes: FlowNode[];
  edges: Edge[];
  

  isBatchingUpdates: boolean;
  startBatchingUpdates: () => void;
  endBatchingUpdates: () => void;
  

  takeSnapshot: () => FlowSnapshot;
  applySnapshot: (snapshot: FlowSnapshot) => void;
  
  addNode: (
    type: string, 
    label: string, 
    position?: { x: number; y: number },
    nodeType?: 'step' | 'parent' | 'child',
    stepId?: string,
    parentId?: string
  ) => void;
  updateNodeLabel: (nodeId: string, newLabel: string) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  resetCanvas: () => void;
  attachNode: (sourceId: string, targetId: string, relationshipType: string) => void;
  getNodeChildren: (nodeId: string) => string[];
  createRelationship: (sourceId: string, targetId: string, relationshipType: string) => void;
  exportData: () => {
    nodes: FlowNode[];
    edges: Edge[];
  };
  importData: (data: FlowData) => void;
  history: {
    past: { nodes: FlowNode[]; edges: Edge[] }[];
    future: { nodes: FlowNode[]; edges: Edge[] }[];
  };
  undo: () => void;
  redo: () => void;
  addToHistory: () => void;
}

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  isBatchingUpdates: false,
  
  startBatchingUpdates: () => {
    set({ isBatchingUpdates: true });
  },
  
  endBatchingUpdates: () => {
    set({ isBatchingUpdates: false });
  },
  
  takeSnapshot: () => {
    const { nodes, edges } = get();

    return {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges))
    };
  },
  
  applySnapshot: (snapshot: FlowSnapshot) => {
    set({
      nodes: snapshot.nodes,
      edges: snapshot.edges
    });
  },
  
  addNode: (
    type: string, 
    label: string, 
    position?: { x: number; y: number },
    nodeType: 'step' | 'parent' | 'child' = 'parent',
    stepId?: string,
    parentId?: string
  ) => {

    get().addToHistory();

    const viewportCenter = {
      x: window.innerWidth / 2 - 75,
      y: window.innerHeight / 2 - 25
    };

    const nodePosition = position || viewportCenter;
    
    const node: FlowNode = {
      id: `node_${Date.now()}`,
      type,
      position: nodePosition,
      data: { 
        label,
        type,
        nodeType,
        step: stepId,
        parentId,
        hasChildren: nodeType === 'parent',
        relationships: []
      },
      draggable: true,
      style: {
        background: nodeType === 'step' ? '#fff7ed' : 
                   nodeType === 'parent' ? '#f3e8ff' : 
                   nodeType === 'child' ? '#ecfdf5' : '#ffffff',
        color: '#1e293b',
        border: '1px solid #e2e8f0',
        padding: '8px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        width: 'auto',
        minWidth: '180px',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        cursor: 'move'
      }
    };

    set((state) => {
      const newNodes = [...state.nodes, node];
      

      if (nodeType === 'child' && parentId) {
        const newEdge: Edge = {
          id: `edge_${Date.now()}`,
          source: parentId,
          target: node.id,
          type: 'smoothstep',
          style: { stroke: '#8b5cf6', strokeWidth: 2 },
          data: { relationshipType: 'parent-child' }
        };
        
        return {
          nodes: newNodes,
          edges: [...state.edges, newEdge]
        };
      }
      
      return { nodes: newNodes };
    });
  },
  
  updateNodeLabel: (nodeId: string, newLabel: string) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId 
          ? { ...node, data: { ...node.data, label: newLabel } }
          : node
      )
    }));
  },
  
  setNodes: (nodes) => set({ nodes: nodes as FlowNode[] }),
  
  setEdges: (edges) => set({ edges }),
  
  onNodesChange: (changes) => {
    set((state) => {

      let updatedNodes = [...state.nodes];
      
      changes.forEach((change: any) => {
        if (change.type === 'position' && change.position) {
          updatedNodes = updatedNodes.map(node => 
            node.id === change.id 
              ? { ...node, position: change.position } 
              : node
          );
        }
      });
      

      const nodesToRemove = changes
        .filter((change: any) => change.type === 'remove')
        .map((change: any) => change.id);
      
      if (nodesToRemove.length > 0) {

        const allNodesToRemove = [...nodesToRemove];
        

        const findChildNodesToRemove = (nodeId: string) => {
          const childNodes = updatedNodes.filter(node => 
            node.data.parentId === nodeId
          );
          
          childNodes.forEach(child => {
            allNodesToRemove.push(child.id);
            findChildNodesToRemove(child.id);
          });
        };
        
        nodesToRemove.forEach(nodeId => findChildNodesToRemove(nodeId));
        

        updatedNodes = updatedNodes.filter(node => 
          !allNodesToRemove.includes(node.id)
        );
        

        const edgesToKeep = state.edges.filter(edge => 
          !allNodesToRemove.includes(edge.source) && 
          !allNodesToRemove.includes(edge.target)
        );
        
        return { nodes: updatedNodes, edges: edgesToKeep };
      }
      
      return { nodes: updatedNodes };
    });
  },
  
  onEdgesChange: (changes) => {
    set((state) => ({
      edges: state.edges.filter(edge => 
        !changes.some((change: any) => 
          change.type === 'remove' && change.id === edge.id
        )
      )
    }));
  },
  
  onConnect: (connection: Connection) => {
    if (!connection.source || !connection.target) return;
    
    const newEdge: Edge = {
      id: `edge_${Date.now()}`,
      source: connection.source,
      target: connection.target,
      type: 'smoothstep',
      style: { stroke: '#94a3b8', strokeWidth: 2 },
      data: { relationshipType: 'custom' }
    };
    
    set((state) => ({
      edges: [...state.edges, newEdge]
    }));
  },
  
  resetCanvas: () => {
    set({ nodes: [], edges: [] });
  },
  
  attachNode: (sourceId: string, targetId: string, relationshipType: string) => {
    const newEdge: Edge = {
      id: `edge_${Date.now()}`,
      source: sourceId,
      target: targetId,
      type: 'smoothstep',
      style: { 
        stroke: relationshipType === 'parent-child' ? '#8b5cf6' : '#94a3b8', 
        strokeWidth: 2,
        strokeDasharray: relationshipType === 'custom' ? '5,5' : undefined
      },
      data: { relationshipType }
    };
    
    set((state) => {

      const edgeExists = state.edges.some(
        edge => edge.source === sourceId && edge.target === targetId
      );
      
      if (!edgeExists) {

        const updatedNodes = state.nodes.map(node => {
          if (node.id === sourceId) {
            const relationships = node.data.relationships || [];
            return {
              ...node,
              data: {
                ...node.data,
                relationships: [
                  ...relationships,
                  { type: relationshipType, targetId }
                ]
              }
            };
          }
          return node;
        });
        
        return {
          nodes: updatedNodes,
          edges: [...state.edges, newEdge]
        };
      }
      
      return state;
    });
  },
  
  getNodeChildren: (nodeId: string) => {
    const { nodes } = get();
    return nodes
      .filter(node => node.data.parentId === nodeId)
      .map(node => node.id);
  },
  
  createRelationship: (sourceId: string, targetId: string, relationshipType: string) => {

    const newEdge: Edge = {
      id: `edge_${Date.now()}`,
      source: sourceId,
      target: targetId,
      type: 'smoothstep',
      style: { 
        stroke: '#0ea5e9', 
        strokeWidth: 2,
        strokeDasharray: '5,5'
      },
      label: relationshipType,
      labelBgPadding: [8, 4],
      labelBgBorderRadius: 4,
      labelBgStyle: { fill: '#f8fafc', fillOpacity: 0.8 },
      labelStyle: { fill: '#0f172a', fontSize: 12 },
      data: { relationshipType }
    };
    
    set((state) => {

      const edgeExists = state.edges.some(
        edge => edge.source === sourceId && edge.target === targetId
      );
      
      if (!edgeExists) {

        const updatedNodes = state.nodes.map(node => {
          if (node.id === sourceId) {
            const relationships = node.data.relationships || [];
            return {
              ...node,
              data: {
                ...node.data,
                relationships: [
                  ...relationships,
                  { type: relationshipType, targetId }
                ]
              }
            };
          }
          return node;
        });
        
        return {
          nodes: updatedNodes,
          edges: [...state.edges, newEdge]
        };
      }
      
      return state;
    });
  },
  
  exportData: () => {
    return { 
      nodes: get().nodes,
      edges: get().edges 
    };
  },
  
  importData: (data: FlowData) => {
    try {
      set({ 
        nodes: data.nodes.map(node => ({
          ...node,
          position: node.position,
          data: {
            ...node.data,
            relationships: node.data.relationships || []
          }
        })),
        edges: data.edges.map(edge => ({
          ...edge,
          type: edge.type || 'smoothstep',
          style: edge.style || { stroke: '#94a3b8', strokeWidth: 2 }
        }))
      });
    } catch (error) {
      console.error("Import error:", error);
      throw error;
    }
  },
  
  history: {
    past: [],
    future: []
  },

  addToHistory: () => {
    const currentState = { 
      nodes: [...get().nodes], 
      edges: [...get().edges] 
    };
    
    set(state => ({
      history: {
        past: [...state.history.past, currentState],
        future: []
      }
    }));
  },

  undo: () => {
    const { history } = get();
    if (history.past.length === 0) return;

    const previousState = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, -1);

    set({
      nodes: previousState.nodes,
      edges: previousState.edges,
      history: {
        past: newPast,
        future: [{ nodes: get().nodes, edges: get().edges }, ...history.future]
      }
    });
  },

  redo: () => {
    const { history } = get();
    if (history.future.length === 0) return;

    const nextState = history.future[0];
    const newFuture = history.future.slice(1);

    set({
      nodes: nextState.nodes,
      edges: nextState.edges,
      history: {
        past: [...history.past, { nodes: get().nodes, edges: get().edges }],
        future: newFuture
      }
    });
  }
}));


export const useFlowUndoRedo = () => {
  const takeSnapshot = useFlowStore(state => state.takeSnapshot);
  const applySnapshot = useFlowStore(state => state.applySnapshot);
  const startBatchingUpdates = useFlowStore(state => state.startBatchingUpdates);
  const endBatchingUpdates = useFlowStore(state => state.endBatchingUpdates);
  

  const [currentSnapshot, { undo, redo, reset, set: setSnapshot, canUndo, canRedo }] = useUndoable(
    takeSnapshot()
  );
  

  const applyCurrentSnapshot = () => {
    applySnapshot(currentSnapshot);
  };
  

  const captureSnapshot = () => {
    setSnapshot(takeSnapshot());
  };
  

  const [isDragging, setIsDragging] = React.useState(false);
  const dragTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  

  const handleDragStart = () => {
    startBatchingUpdates();
    setIsDragging(true);
  };
  

  const handleDragEnd = () => {

    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }
    

    dragTimeoutRef.current = setTimeout(() => {
      endBatchingUpdates();
      setIsDragging(false);
      captureSnapshot(); 
    }, 300); 
  };
  

  const undoOperation = () => {
    undo();
    applyCurrentSnapshot();
  };
  

  const redoOperation = () => {
    redo();
    applyCurrentSnapshot();
  };
  

  const resetHistory = () => {
    reset(takeSnapshot());
    applyCurrentSnapshot();
  };
  
  return {
    captureSnapshot,
    undoOperation,
    redoOperation,
    resetHistory,
    canUndo,
    canRedo,
    handleDragStart,
    handleDragEnd,
    isDragging
  };
};
