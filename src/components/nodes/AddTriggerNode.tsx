
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Plus } from 'lucide-react';

interface AddTriggerNodeProps {
  data: {
    label: string;
    id: string;
    description?: string;
  };
}

export const AddTriggerNode: React.FC<AddTriggerNodeProps> = ({ data }) => {
  return (
    <div className="bg-white border-2 border-dashed border-blue-300 rounded-lg shadow-lg min-w-[200px] hover:shadow-xl transition-all duration-200 hover:scale-[1.02] hover:border-blue-400">
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 rounded-t-lg border-b border-blue-200">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-blue-100 rounded-md shadow-sm">
            <Plus className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-sm font-bold text-blue-800 tracking-wide">ADD TRIGGER</span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
          {data.label}
        </h3>
        {data.description && (
          <p className="text-xs text-gray-500 leading-relaxed">
            {data.description}
          </p>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-500 border-2 border-white shadow-md hover:bg-blue-600 transition-colors"
      />
    </div>
  );
};
