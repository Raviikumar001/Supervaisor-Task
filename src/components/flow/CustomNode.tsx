import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { useFlowStore } from '@/stores/flowStore';
import { CircleDot, Box, Square } from 'lucide-react';

interface CustomNodeProps {
  id: string;
  data: {
    label: string;
    type: string;
  };
}

const CustomNode: React.FC<CustomNodeProps> = ({ id, data }) => {
  const { onNodesChange } = useFlowStore();



  return (
    <div className="group relative px-4 py-2">
      {/* Four Handles positioned on borders */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-slate-400 !w-3 !h-3 !border-2 !border-white !-top-1.5"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-slate-400 !w-3 !h-3 !border-2 !border-white !-left-1.5"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-slate-400 !w-3 !h-3 !border-2 !border-white !-right-1.5"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-slate-400 !w-3 !h-3 !border-2 !border-white !-bottom-1.5"
      />
      
      <div className="flex items-center gap-2 min-w-[150px]">
       
        <span 
          className="node-label select-none flex-1"
          style={{ outline: 'none' }}
        >
          {data.label}
        </span>
      </div>

      <button
        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white 
                   opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onNodesChange([{ type: 'remove', id }]);
        }}
      >
        ×
      </button>
    </div>
  );
};

export default CustomNode;