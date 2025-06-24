
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch, CheckCircle, XCircle } from 'lucide-react';

interface ConditionNodeProps {
  data: {
    label: string;
    id: string;
    field?: string;
    operator?: string;
    value?: string;
  };
}

export const ConditionNode: React.FC<ConditionNodeProps> = ({ data }) => {
  return (
    <div className="bg-white border-2 border-orange-200 rounded-lg shadow-lg min-w-[200px] hover:shadow-xl transition-shadow">
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-orange-400 border-2 border-white"
      />

      <div className="bg-orange-50 px-4 py-2 rounded-t-lg border-b border-orange-200">
        <div className="flex items-center space-x-2">
          <div className="p-1 bg-orange-100 rounded">
            <GitBranch className="w-4 h-4 text-orange-600" />
          </div>
          <span className="text-sm font-semibold text-orange-800">CONDITION</span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-gray-900 text-sm leading-tight">
          {data.label}
        </h3>
        {data.field && data.operator && (
          <p className="text-xs text-gray-500 mt-1">
            If {data.field} {data.operator} {data.value || '...'}
          </p>
        )}
      </div>

      {/* True/Yes handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="w-3 h-3 bg-green-400 border-2 border-white"
        style={{ left: '30%' }}
      />
      
      {/* False/No handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="w-3 h-3 bg-red-400 border-2 border-white"
        style={{ left: '70%' }}
      />

      {/* Labels for the handles */}
      <div className="flex justify-between px-4 pb-2 text-xs">
        <div className="flex items-center space-x-1 text-green-600">
          <CheckCircle className="w-3 h-3" />
          <span>Yes</span>
        </div>
        <div className="flex items-center space-x-1 text-red-600">
          <XCircle className="w-3 h-3" />
          <span>No</span>
        </div>
      </div>
    </div>
  );
};
