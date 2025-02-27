import { create } from 'zustand';
import { Node, Edge, Position, Connection } from '@xyflow/react';

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
}

interface FlowNode extends Node {
  data: NodeData;
}

// Define our JSON data structure for the flowchart
interface FlowData {
  steps: {
    id: string;
    label: string;
    nodes: {
      id: string;
      label: string;
      type: 'parent' | 'child';
      parentId?: string;
      children?: string[];
      position: { x: number; y: number };
    }[];
  }[];
  relationships: {
    id: string;
    source: string;
    target: string;
    type: string;
  }[];
}

interface FlowState {
  nodes: FlowNode[];
  edges: Edge[];
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
  exportData: () => FlowData;
  importData: (data: FlowData) => void;
}

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  
  addNode: (
    type: string, 
    label: string, 
    position?: { x: number; y: number },
    nodeType: 'step' | 'parent' | 'child' = 'parent',
    stepId?: string,
    parentId?: string
  ) => {
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
      
      // If this is a child node with a parent, automatically create an edge
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
      // Handle position changes
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
      
      // Handle node removal (also remove connected edges and child nodes)
      const nodesToRemove = changes
        .filter((change: any) => change.type === 'remove')
        .map((change: any) => change.id);
      
      if (nodesToRemove.length > 0) {
        // First, identify any child nodes that need to be removed
        const allNodesToRemove = [...nodesToRemove];
        
        // Find child nodes recursively
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
        
        // Filter out the nodes that should be removed
        updatedNodes = updatedNodes.filter(node => 
          !allNodesToRemove.includes(node.id)
        );
        
        // Also remove any edges connected to these nodes
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
      // Check if an edge already exists between these nodes
      const edgeExists = state.edges.some(
        edge => edge.source === sourceId && edge.target === targetId
      );
      
      if (!edgeExists) {
        // Add the relationship to the source node's data
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
    // Create a custom relationship between nodes
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
      // Check if an edge already exists between these nodes
      const edgeExists = state.edges.some(
        edge => edge.source === sourceId && edge.target === targetId
      );
      
      if (!edgeExists) {
        // Add the relationship to the source node's data
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
    const { nodes, edges } = get();
    
    // Group nodes by steps
    const stepMap = new Map();
    
    // First pass - collect steps
    nodes.forEach(node => {
      if (node.data.nodeType === 'step') {
        stepMap.set(node.id, {
          id: node.id,
          label: node.data.label,
          nodes: []
        });
      }
    });
    
    // If no steps exist, create a default step
    if (stepMap.size === 0) {
      stepMap.set('default_step', {
        id: 'default_step',
        label: 'Default Step',
        nodes: []
      });
    }
    
    // Second pass - collect nodes per step
    nodes.forEach(node => {
      if (node.data.nodeType !== 'step') {
        const stepId = node.data.step || 'default_step';
        const step = stepMap.get(stepId) || stepMap.get('default_step');
        
        if (step) {
          step.nodes.push({
            id: node.id,
            label: node.data.label,
            type: node.data.nodeType || 'parent',
            parentId: node.data.parentId,
            position: node.position,
            children: nodes
              .filter(n => n.data.parentId === node.id)
              .map(n => n.id)
          });
        }
      }
    });
    
    // Collect relationships
    const relationships = edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.data?.relationshipType || 'default'
    }));
    
    // Build final data structure
    const flowData: FlowData = {
      steps: Array.from(stepMap.values()),
      relationships
    };
    
    return flowData;
  },
  
  importData: (data: FlowData) => {
    try {
      // First, clear the canvas
      set({ nodes: [], edges: [] });
      
      const newNodes: FlowNode[] = [];
      const newEdges: Edge[] = [];
      
      // Import steps as nodes
      data.steps.forEach(step => {
        // Add step node
        const stepNode: FlowNode = {
          id: step.id,
          type: 'default',
          position: { x: Math.random() * 300, y: Math.random() * 100 },
          data: {
            label: step.label,
            type: 'default',
            nodeType: 'step'
          }
        };
        
        newNodes.push(stepNode);
        
        // Add child nodes
        step.nodes.forEach(node => {
          const childNode: FlowNode = {
            id: node.id,
            type: 'default',
            position: node.position || { x: Math.random() * 500, y: Math.random() * 300 + 100 },
            data: {
              label: node.label,
              type: 'default',
              nodeType: node.type,
              step: step.id,
              parentId: node.parentId,
              hasChildren: (node.children?.length || 0) > 0
            }
          };
          
          newNodes.push(childNode);
          
          // Add parent-child edge if parentId exists
          if (node.parentId) {
            newEdges.push({
              id: `edge_parent_${node.id}`,
              source: node.parentId,
              target: node.id,
              type: 'smoothstep',
              style: { stroke: '#8b5cf6', strokeWidth: 2 },
              data: { relationshipType: 'parent-child' }
            });
          }
        });
      });
      
      // Import relationships
      data.relationships.forEach(rel => {
        // Skip if we already created this edge as a parent-child relationship
        const alreadyExists = newEdges.some(
          edge => edge.source === rel.source && edge.target === rel.target
        );
        
        if (!alreadyExists) {
          newEdges.push({
            id: rel.id,
            source: rel.source,
            target: rel.target,
            type: 'smoothstep',
            label: rel.type !== 'parent-child' && rel.type !== 'default' ? rel.type : undefined,
            labelBgPadding: rel.type !== 'parent-child' ? [8, 4] : undefined,
            labelBgBorderRadius: rel.type !== 'parent-child' ? 4 : undefined,
            labelBgStyle: rel.type !== 'parent-child' ? { fill: '#f8fafc', fillOpacity: 0.8 } : undefined,
            labelStyle: rel.type !== 'parent-child' ? { fill: '#0f172a', fontSize: 12 } : undefined,
            style: { 
              stroke: rel.type === 'parent-child' ? '#8b5cf6' : 
                     rel.type === 'default' ? '#94a3b8' : '#0ea5e9', 
              strokeWidth: 2,
              strokeDasharray: rel.type !== 'parent-child' && rel.type !== 'default' ? '5,5' : undefined
            },
            data: { relationshipType: rel.type }
          });
        }
      });
      
      set({ nodes: newNodes, edges: newEdges });
    } catch (error) {
      console.error("Error importing flow data:", error);
    }
  }
}));