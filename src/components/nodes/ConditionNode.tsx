import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch, CheckCircle, XCircle, Filter, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkflowStore } from '@/hooks/useWorkflowState';

interface ConditionNodeProps {
  data: {
    label: string;
    id: string;
    field?: string;
    operator?: string;
    value?: string;
    description?: string;
    layoutMode?: string;
    openNodeModal?: (node: any) => void;
  };
}

export const ConditionNode: React.FC<ConditionNodeProps> = ({ data }) => {
  const { edges, nodes } = useWorkflowStore();

  const getIcon = () => {
    if (data.id?.includes('filter')) return Filter;
    return GitBranch;
  };

  const IconComponent = getIcon();

  // Check if true/false handles have outgoing connections
  const hasTrueConnection = edges.some(edge => edge.source === data.id && edge.sourceHandle === 'true');
  const hasFalseConnection = edges.some(edge => edge.source === data.id && edge.sourceHandle === 'false');

  // Handle adding nodes for true/false paths
  const handleAddTrueNode = () => {
    const currentNode = nodes.find(n => n.data === data);
    if (currentNode && data.openNodeModal) {
      data.openNodeModal({ ...currentNode, sourceHandle: 'true' });
    }
  };

  const handleAddFalseNode = () => {
    const currentNode = nodes.find(n => n.data === data);
    if (currentNode && data.openNodeModal) {
      data.openNodeModal({ ...currentNode, sourceHandle: 'false' });
    }
  };

  return (
    <div className="relative bg-white rounded-full shadow-md w-[120px] h-[120px] hover:shadow-lg transition-all duration-200">
      {/* Input handle - Left side */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="w-3 h-3 bg-orange-500 border-2 border-white shadow-sm hover:bg-orange-600 transition-colors"
        style={{ top: '50%' }}
      />

      {/* Main content - centered in circle */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Router icon */}
        <div className="w-8 h-8 mb-1 bg-orange-100 rounded-full flex items-center justify-center">
          <IconComponent className="w-4 h-4 text-orange-600" />
        </div>

        {/* Label */}
        <div className="text-xs font-medium text-gray-700">Router</div>

        {/* Condition info if available */}
        {data.field && (
          <div className="text-xs text-gray-400 truncate max-w-[80px]">
            {data.field}
          </div>
        )}
      </div>

      {/* TRUE handle - Right side, upper position */}
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        className="w-3 h-3 bg-green-500 border-2 border-white shadow-sm hover:bg-green-600 transition-colors"
        style={{ top: '30%' }}
      />

      {/* FALSE handle - Right side, lower position */}
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        className="w-3 h-3 bg-red-500 border-2 border-white shadow-sm hover:bg-red-600 transition-colors"
        style={{ top: '70%' }}
      />

      {/* TRUE path plus button and label */}
      {!hasTrueConnection && (
        <div className="absolute flex items-center pointer-events-auto z-50"
             style={{ right: '-60px', top: '30%', transform: 'translateY(-50%)' }}>
          <Button
            size="sm"
            variant="outline"
            className="h-6 w-6 p-0 rounded-full text-xs bg-white hover:bg-gray-50 text-green-600 border border-green-300 shadow-sm hover:shadow-md transition-all duration-200 mr-2"
            onClick={handleAddTrueNode}
            title="Add node for true path"
          >
            <Plus className="h-3 w-3" />
          </Button>
          <span className="text-xs font-medium text-green-600 whitespace-nowrap">Yes</span>
        </div>
      )}

      {/* FALSE path plus button and label */}
      {!hasFalseConnection && (
        <div className="absolute flex items-center pointer-events-auto z-50"
             style={{ right: '-60px', top: '70%', transform: 'translateY(-50%)' }}>
          <Button
            size="sm"
            variant="outline"
            className="h-6 w-6 p-0 rounded-full text-xs bg-white hover:bg-gray-50 text-red-600 border border-red-300 shadow-sm hover:shadow-md transition-all duration-200 mr-2"
            onClick={handleAddFalseNode}
            title="Add node for false path"
          >
            <Plus className="h-3 w-3" />
          </Button>
          <span className="text-xs font-medium text-red-600 whitespace-nowrap">No</span>
        </div>
      )}

      {/* Path indicators on the node itself */}
      <div className="absolute text-xs font-medium text-green-600" 
           style={{ right: '-15px', top: '30%' }}>
        Y
      </div>
      <div className="absolute text-xs font-medium text-red-600" 
           style={{ right: '-15px', top: '60%' }}>
        N
      </div>
    </div>
  );
};