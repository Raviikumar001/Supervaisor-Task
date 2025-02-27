import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { useFlowStore } from '@/stores/flowStore';
import { CircleDot, Box, Square } from 'lucide-react';

interface CustomNodeProps {
  id: string;
  data: {
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
  };
  selected: boolean;
}

const CustomNode: React.FC<CustomNodeProps> = ({ id, data, selected }) => {
  const { onNodesChange } = useFlowStore();

  // Icon based on node type
  const getNodeIcon = () => {
    switch (data.nodeType) {
      case 'step':
        return <Box className="h-4 w-4 mr-2" />;
      case 'parent':
        return <Square className="h-4 w-4 mr-2" />;
      case 'child':
        return <CircleDot className="h-4 w-4 mr-2" />;
      default:
        return <Box className="h-4 w-4 mr-2" />;
    }
  };

  const getBorderColor = () => {
    if (selected) return '#3b82f6';
    
    switch (data.nodeType) {
      case 'step':
        return '#f97316';
      case 'parent':
        return '#8b5cf6';
      case 'child':
        return '#10b981';
      default:
        return '#e2e8f0';
    }
  };

  return (
    <div className={`custom-node ${data.nodeType || ''}`} style={{
      borderColor: getBorderColor(),
      borderWidth: selected ? '2px' : '1px',
    }}>
      <Handle 
        type="target" 
        position={Position.Top} 
        className="custom-handle"
      />
      
      <div className="flex items-center p-3">
        {getNodeIcon()}
        <div className="node-label" contentEditable={false}>
          {data.label}
        </div>
      </div>
      
      {data.nodeType === 'step' && (
        <div className="text-xs text-gray-500 px-3 pb-2">Step</div>
      )}
      
      {data.nodeType === 'parent' && (
        <div className="text-xs text-gray-500 px-3 pb-2">Parent Node</div>
      )}
      
      {data.nodeType === 'child' && (
        <div className="text-xs text-gray-500 px-3 pb-2">Child of: {data.parentId}</div>
      )}
      
      {data.hasChildren && (
        <div className="text-xs text-blue-500 px-3 pb-2">Has children</div>
      )}
      
      <button 
        className="node-remove-btn"
        onClick={(e) => {
          e.stopPropagation();
          onNodesChange([{ type: 'remove', id }]);
        }}
      >
        ×
      </button>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="custom-handle"
      />
    </div>
  );
};

export default CustomNode;