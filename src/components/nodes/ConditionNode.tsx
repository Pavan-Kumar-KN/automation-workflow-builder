
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch, CheckCircle, XCircle, Filter } from 'lucide-react';

interface ConditionNodeProps {
  data: {
    label: string;
    id: string;
    field?: string;
    operator?: string;
    value?: string;
    description?: string;
  };
}

export const ConditionNode: React.FC<ConditionNodeProps> = ({ data }) => {
  const getIcon = () => {
    if (data.id?.includes('filter')) return Filter;
    return GitBranch;
  };

  const IconComponent = getIcon();

  return (
    <div className="bg-white border-2 border-orange-200 rounded-lg shadow-lg min-w-[200px] hover:shadow-xl transition-all duration-200 hover:scale-[1.02]">
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-orange-500 border-2 border-white shadow-md hover:bg-orange-600 transition-colors"
      />

      <div className="bg-gradient-to-r from-orange-50 to-orange-100 px-4 py-3 rounded-t-lg border-b border-orange-200">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-orange-100 rounded-md shadow-sm">
            <IconComponent className="w-4 h-4 text-orange-600" />
          </div>
          <span className="text-sm font-bold text-orange-800 tracking-wide">CONDITION</span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
          {data.label}
        </h3>
        {data.description && (
          <p className="text-xs text-gray-500 leading-relaxed mb-2">
            {data.description}
          </p>
        )}
        {data.field && data.operator && (
          <p className="text-xs text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded">
            If {data.field} {data.operator} {data.value || '...'}
          </p>
        )}
      </div>

      {/* True/Yes handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="w-3 h-3 bg-green-500 border-2 border-white shadow-md hover:bg-green-600 transition-colors"
        style={{ left: '30%' }}
      />
      
      {/* False/No handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="w-3 h-3 bg-red-500 border-2 border-white shadow-md hover:bg-red-600 transition-colors"
        style={{ left: '70%' }}
      />

      {/* Labels for the handles */}
      <div className="flex justify-between px-4 pb-3 text-xs">
        <div className="flex items-center space-x-1 text-green-600 font-medium">
          <CheckCircle className="w-3 h-3" />
          <span>True</span>
        </div>
        <div className="flex items-center space-x-1 text-red-600 font-medium">
          <XCircle className="w-3 h-3" />
          <span>False</span>
        </div>
      </div>
    </div>
  );
};
