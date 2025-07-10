import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Node } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';

interface EndNodeProps {
  data: {
    label: string;
    id: string;
  },
  onOpenActionModal: (insertIndex?: number) => void;
  nodes: Node[];
}

const EndNode: React.FC<EndNodeProps> = ({ onOpenActionModal, nodes }) => {
  return (
    <div className="flex flex-col items-center relative w-[360px] h-[56px]">
      <Handle
        type="target"
        position={Position.Top}
        style={{ visibility: 'hidden', width: 0, height: 0 }}
        id='in'
      />

      {/* Uniform vertical lines - compact height */}
      {/* <div className="w-0.5 h-6 bg-gray-400"></div>
      <div className="relative">
        <button
          onClick={() => onOpenActionModal(nodes.length - 1)}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-gray-400 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors z-10"
        >
          <LucideIcons.Plus className="w-3 h-3 text-gray-600 hover:text-blue-600" />
        </button>
      </div>
      <div className="w-0.5 h-6 bg-gray-400"></div> */}

      <div className="text-center">
        <div className="text-sm font-medium text-gray-600 bg-gray-100 rounded-lg px-4 py-2 border border-gray-300">
          End
        </div>
      </div>
    </div>
  );
};


export default EndNode;
