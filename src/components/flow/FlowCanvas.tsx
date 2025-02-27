import React, { useCallback } from 'react';
import { ReactFlow, Background, Controls, Connection, Edge, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toast } from '@/hooks/use-toast';
import { useFlowStore } from '@/stores/flowStore';
import FlowToolbar from './FlowToolbar';
import CustomNode from './CustomNode';

const FlowCanvas = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    updateNodeLabel,
    attachNode,
    getNodeChildren
  } = useFlowStore();
  
  const reactFlowInstance = useReactFlow();

  const handleNodeDoubleClick = (event: React.MouseEvent, node: any) => {
    const nodeElement = event.target as HTMLElement;
    const closestNode = nodeElement.closest('.react-flow__node');
    
    if (closestNode) {
      const labelElement = closestNode.querySelector('.node-label') as HTMLElement;
      if (labelElement) {
        labelElement.contentEditable = 'true';
        labelElement.focus();

        const handleBlur = () => {
          labelElement.contentEditable = 'false';
          const newLabel = labelElement.textContent || '';
          if (newLabel !== node.data.label) {
            updateNodeLabel(node.id, newLabel);
            toast({
              title: "Node Updated",
              description: "Node label has been updated successfully.",
            });
          }
          labelElement.removeEventListener('blur', handleBlur);
        };

        labelElement.addEventListener('blur', handleBlur);
        labelElement.addEventListener('keypress', (e: KeyboardEvent) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            labelElement.blur();
          }
        });
      }
    }
  };

  const handleConnect = useCallback((params: Connection | Edge) => {
    
    const sourceNode = nodes.find(n => n.id === params.source);
    const targetNode = nodes.find(n => n.id === params.target);
    
    if (sourceNode && targetNode) {

      if (sourceNode.data.nodeType === 'parent') {

        attachNode(sourceNode.id, targetNode.id, 'parent-child');
        

        const children = getNodeChildren(sourceNode.id);
        children.forEach(childId => {
          if (childId !== targetNode.id) {
            attachNode(childId, targetNode.id, 'child-connection');
          }
        });
        
        toast({
          title: "Parent Node Attached",
          description: "Parent node and all its children have been attached.",
        });
      } else {

        onConnect(params as Connection);
        toast({
          title: "Connection Created",
          description: "Nodes have been connected successfully.",
        });
      }
    } else {

      onConnect(params as Connection);
    }
  }, [nodes, onConnect, attachNode, getNodeChildren]);

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    const nodeType = event.dataTransfer.getData('node-type');
    const step = event.dataTransfer.getData('step');
    const parentId = event.dataTransfer.getData('parent-id');
    
    const reactFlowBounds = document.querySelector('.react-flow')?.getBoundingClientRect();
    if (reactFlowBounds && type) {
      const position = {
        x: event.clientX - reactFlowBounds.left - 75,
        y: event.clientY - reactFlowBounds.top - 25
      };
      
      useFlowStore.getState().addNode(
        type, 
        nodeType === 'step' ? `Step ${Date.now().toString().slice(-4)}` : 
        nodeType === 'parent' ? `Parent Node` : 
        nodeType === 'child' ? `Child Node` : 'New Node', 
        position,
        nodeType as any,
        step,
        parentId
      );
      
      toast({
        title: `${nodeType || 'Node'} Added`,
        description: "New node added to canvas.",
      });
    }
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const nodeTypes = {
    default: CustomNode,
    input: CustomNode,
    output: CustomNode,
    step: CustomNode,
    parent: CustomNode,
    child: CustomNode
  };

  return (
    <div className="h-full w-full flex flex-col">
      <FlowToolbar />
      <div className="flex-1 w-full h-full border rounded-md overflow-hidden relative" 
        onDrop={onDrop} 
        onDragOver={onDragOver}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onNodeDoubleClick={handleNodeDoubleClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
};

export default FlowCanvas;