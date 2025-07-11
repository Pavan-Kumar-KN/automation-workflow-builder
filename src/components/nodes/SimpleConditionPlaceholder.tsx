import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Plus } from 'lucide-react';

interface SimpleConditionPlaceholderData {
  branchType: 'yes' | 'no';
  conditionNodeId: string;
  onAddAction: () => void;
}

interface SimpleConditionPlaceholderProps extends NodeProps {
  data: SimpleConditionPlaceholderData;
}

// Very simple, minimal placeholder for condition branches
const SimpleConditionPlaceholder: React.FC<SimpleConditionPlaceholderProps> = ({ data }) => {
  return (
    <div className="relative">
      {/* Top Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        style={{ background: '#4CAF50', border: '2px solid #fff', width: 8, height: 8 }}
      />

      {/* Minimal Placeholder Content */}
      <div className="bg-gray-100 rounded border border-dashed border-gray-400 p-2 w-[100px] h-[60px] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
        <button
          onClick={data.onAddAction}
          className="w-6 h-6 bg-white border border-gray-400 rounded flex items-center justify-center hover:border-blue-500 transition-colors"
        >
          <Plus className="w-3 h-3 text-gray-600" />
        </button>
        
        <div className="text-xs mt-1 font-medium text-gray-600">
          {data.branchType === 'yes' ? 'Yes' : 'No'}
        </div>
      </div>

      {/* Bottom Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        style={{ background: '#10B981', border: '2px solid #fff', width: 8, height: 8 }}
      />
    </div>
  );
};

export default SimpleConditionPlaceholder;
