import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Handle, Position } from '@xyflow/react';

interface PlaceHolderNodeProps {
  id: string; // ✅ React Flow injects this
  data: {
    branchType: string;
    conditionNodeId: string;
    handleAddNodeToBranch: (branchType: string, placeholderNodeId: string) => void;
  };
  isSelected?: boolean;
}

const PlaceHolderNode: React.FC<PlaceHolderNodeProps> = ({ id , data, isSelected = false }) => {

  console.log('PlaceHolderNode rendered with id:', id);

  console.log('PlaceHolderNode data:', data);

  return (
    <div className="relative">
      {/* Top Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        style={{ background: '#4CAF50', border: '2px solid #fff' }}
      />

      {/* Main Container - Match ActionNode styling */}
      <div
        className={`flex items-center shadow-sm transition-all duration-200 px-6 py-6 w-[360px]  cursor-pointer ${isSelected
          ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg'
          : 'border-dashed border-gray-300 hover:border-blue-400'
          }`}
        onClick={() => data.handleAddNodeToBranch(data.branchType, id , data.conditionNodeId)}

      >
        <div className="flex items-center gap-1 ml-[90px]">
          {/* Plus Icon */}
          <div className="flex-shrink-0">
            <LucideIcons.Plus className="w-6 h-6 text-gray-400 hover:text-blue-600" />
          </div>

          {/* Text - Match ActionNode text styling */}
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold text-gray-500">
              Add Action
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        style={{ background: '#4CAF50', border: '2px solid #fff' }}
      />
    </div>
  );
};

export default PlaceHolderNode;
