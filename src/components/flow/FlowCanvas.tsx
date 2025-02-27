
import { ReactFlow, Background, Controls } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toast } from '@/hooks/use-toast';
import { useFlowStore } from '@/stores/flowStore';
import FlowToolbar from './FlowToolbar';

const FlowCanvas = () => {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    updateNodeLabel
  } = useFlowStore();

  const handleNodeDoubleClick = (event: any, node: any) => {
    const nodeElement = event.target.closest('.react-flow__node');
    if (nodeElement) {
      const labelElement = nodeElement.querySelector('[contenteditable]');
      if (labelElement) {
        labelElement.focus();
      } else {
        // Make the text editable
        const textElement = nodeElement.querySelector('.node-label');
        if (textElement) {
          textElement.contentEditable = 'true';
          textElement.focus();

          const handleBlur = () => {
            textElement.contentEditable = 'false';
            const newLabel = textElement.textContent || '';
            if (newLabel !== node.data.label) {
              updateNodeLabel(node.id, newLabel);
              toast({
                title: "Node Updated",
                description: "Node label has been updated successfully.",
              });
            }
            textElement.removeEventListener('blur', handleBlur);
          };

          textElement.addEventListener('blur', handleBlur);
          textElement.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              textElement.blur();
            }
          });
        }
      }
    }
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    
    const reactFlowBounds = document.querySelector('.react-flow')?.getBoundingClientRect();
    if (reactFlowBounds && type) {
      const position = {
        x: event.clientX - reactFlowBounds.left - 75,
        y: event.clientY - reactFlowBounds.top - 25
      };
      useFlowStore.getState().addNode(type, 'New Node', position);
      toast({
        title: "Node Added",
        description: "New node added to canvas.",
      });
    }
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const nodeTypes = {
    default: ({ data }: { data: { label: string } }) => (
      <div className="flex items-center justify-center w-full h-full">
        <span className="node-label select-none" style={{ outline: 'none' }}>
          {data.label}
        </span>
      </div>
    ),
  };

  return (
    <div 
      className="w-full h-[calc(100vh-2rem)] bg-background"
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDoubleClick={handleNodeDoubleClick}
        nodeTypes={nodeTypes}
        onConnect={(params) => {
          onConnect(params);
          toast({
            title: "Connection Created",
            description: "Nodes have been connected successfully.",
          });
        }}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
        style={{ background: '#f8fafc' }}
      >
        <Background 
          color="#94a3b8" 
          gap={20} 
          size={1}
        />
        <Controls />
        <FlowToolbar />
      </ReactFlow>
    </div>
  );
};

export default FlowCanvas;
