// ConditionNode.tsx
import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Handle, Position } from '@xyflow/react';
import PlaceHolderNode from '../canvas/PlaceHolderNode';

interface Branch {
  label: string;
  branchType: string;
}

interface ConditionNodeProps {
  data: {
    label: string;
    icon?: keyof typeof LucideIcons;
    description?: string;
    color?: string;
    openNodeModal?: (node: any) => void;

    // New props for tree structure
    branches?: Branch[];  // e.g. [{ label: 'Yes', branchType: 'yes' }]
    handleAddNodeToBranch?: (branchType: string) => void;
  };
  isSelected?: boolean;
}


const ConditionNode: React.FC<ConditionNodeProps> = ({ data, isSelected = false }) => {

  const IconComponent = (data.icon && LucideIcons[data.icon]) || LucideIcons.GitBranch;

  return (
    <div className="relative">
      {/* Top Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        style={{ background: '#4CAF50', border: '2px solid #fff' }}
      />

      {/* Node Content */}
      <div className={`bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-all duration-200 px-6 py-6 w-[360px] cursor-pointer ${isSelected
        ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg'
        : 'border-gray-200 hover:border-gray-300'
        }`}>
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <IconComponent className={`w-6 h-6 ${data.color || 'text-gray-600'}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold text-gray-900">
              {data.label}
            </div>
          </div>

        </div>
      </div>


      {/* Bottom Handles for Yes/No branches */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="yes"
        className="w-3 h-3 bg-green-500 border-2 border-white"
        style={{ left: '35%', bottom: '-6px' }}
      />

      <Handle
        type="source"
        position={Position.Bottom}
        id="no"
        className="w-3 h-3 bg-red-500 border-2 border-white"
        style={{ left: '65%', bottom: '-6px' }}
      />

      {/* Branch Labels */}
      <div className="absolute bottom-[-25px] left-[35%] transform -translate-x-1/2">
        <span className="text-xs text-green-600 font-medium">Yes</span>
      </div>
      <div className="absolute bottom-[-25px] left-[65%] transform -translate-x-1/2">
        <span className="text-xs text-red-600 font-medium">No</span>
      </div>

    </div>
  );
};

export default ConditionNode;
