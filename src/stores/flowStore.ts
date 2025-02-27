
import { create } from 'zustand';
import { Node, Edge, Position } from '@xyflow/react';

interface FlowState {
  nodes: Node[];
  edges: Edge[];
  addNode: (type: string, label: string, position?: { x: number; y: number }) => void;
  updateNodeLabel: (nodeId: string, newLabel: string) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
  resetCanvas: () => void;
}

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  addNode: (type: string, label: string, position?: { x: number; y: number }) => {
    const viewportCenter = {
      x: window.innerWidth / 2 - 75,
      y: window.innerHeight / 2 - 25
    };

    const node: Node = {
      id: `node_${Date.now()}`,
      type,
      position: position || viewportCenter,
      data: { 
        label,
        editing: false 
      },
      draggable: true,
      style: {
        background: '#ffffff',
        color: '#1a1a1a',
        border: '1px solid #e2e8f0',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        width: '150px',
        fontSize: '14px',
        transition: 'box-shadow 0.2s, border-color 0.2s',
        cursor: 'move'
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };
    set((state) => ({
      nodes: [...state.nodes, node]
    }));
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
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  onNodesChange: (changes) => {
    set((state) => ({
      nodes: changes.reduce((acc: Node[], change: any) => {
        switch (change.type) {
          case 'position':
            return acc.map((node) =>
              node.id === change.id 
                ? { ...node, position: change.position }
                : node
            );
          case 'remove':
            return acc.filter((node) => node.id !== change.id);
          default:
            return acc;
        }
      }, get().nodes)
    }));
  },
  onEdgesChange: (changes) => {
    set((state) => ({
      edges: changes.reduce((acc: Edge[], change: any) => {
        if (change.type === 'remove') {
          return acc.filter((edge) => edge.id !== change.id);
        }
        return acc;
      }, get().edges)
    }));
  },
  onConnect: (connection) => {
    const newEdge: Edge = {
      id: `edge_${Date.now()}`,
      source: connection.source,
      target: connection.target,
      type: 'smoothstep',
      style: { stroke: '#94a3b8', strokeWidth: 2 }
    };
    set((state) => ({
      edges: [...state.edges, newEdge]
    }));
  },
  resetCanvas: () => {
    set({ nodes: [], edges: [] });
  }
}));
