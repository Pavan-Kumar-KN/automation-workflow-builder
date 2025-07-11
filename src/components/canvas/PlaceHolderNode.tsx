import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Handle, Position } from '@xyflow/react';

interface PlaceHolderNodeProps {
  data: {
    branchType: string;
    handleAddNodeToBranch: (branchType: string) => void;
  };
  isSelected?: boolean;
}

const PlaceHolderNode: React.FC<PlaceHolderNodeProps> = ({ data, isSelected = false }) => {
  return (
    <div className="relative">
      {/* Top handle for incoming edge */}
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        style={{ background: '#ccc', border: '2px solid #fff' }}
      />

      {/* Main node box */}
      <div
        className={`bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-all duration-200 px-4 py-4 w-fit cursor-pointer text-center ${
          isSelected
            ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg'
            : 'border-dashed border-gray-300'
        }`}
        onClick={() => data.handleAddNodeToBranch(data.branchType)}
      >
        <div className="flex flex-col items-center justify-center">
          <LucideIcons.Plus className="w-6 h-6 text-gray-400 mb-2 hover:text-blue-600" />
          <p className="text-sm text-gray-500">Add action to {data.branchType} branch</p>
        </div>
      </div>

      {/* Bottom handle for outgoing edge */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        style={{ background: '#ccc', border: '2px solid #fff' }}
      />
    </div>
  );
};

export default PlaceHolderNode;
