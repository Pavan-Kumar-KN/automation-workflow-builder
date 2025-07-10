import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Handle, Position } from '@xyflow/react';

interface PlaceholderNodeProps {
  data: {
    label: string;
    branchType: 'yes' | 'no';
    conditionNodeId: string;
    onAddAction: () => void;
  };
  isSelected?: boolean;
}

const PlaceholderNode: React.FC<PlaceholderNodeProps> = ({ data, isSelected = false }) => {
  return (
    <div className="relative">
      {/* Top Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        style={{ background: '#4CAF50', border: '2px solid #fff' }}
      />

      {/* Placeholder Content */}
      <div className={`bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 shadow-sm hover:shadow-md transition-all duration-200 px-6 py-4 w-[200px] cursor-pointer ${isSelected
        ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg'
        : 'hover:border-gray-400'
        }`}>
        <div className="flex flex-col items-center gap-2">
          {/* Plus Icon */}
          <button
            onClick={data.onAddAction}
            className="w-8 h-8 bg-white border-2 border-gray-400 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <LucideIcons.Plus className="w-4 h-4 text-gray-600 hover:text-blue-600" />
          </button>

          {/* Label */}
          <div className="text-sm font-medium text-gray-600">
            {data.label}
          </div>

          {/* Branch Type Badge */}
          <div className={`text-xs px-2 py-1 rounded-full ${
            data.branchType === 'yes' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {data.branchType === 'yes' ? 'Yes' : 'No'}
          </div>
        </div>
      </div>

      {/* Bottom Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        style={{ background: '#10B981', border: '2px solid #fff' }}
      />
    </div>
  );
};

export default PlaceholderNode;
