import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { ArrowRight, CornerDownRight, Navigation } from 'lucide-react';

interface GotoNodeProps {
  data: {
    label: string;
    id: string;
    targetNodeId?: string;
    targetNodeLabel?: string;
    description?: string;
    layoutMode?: string;
  };
}

export const GotoNode: React.FC<GotoNodeProps> = ({ data }) => {
  const isVertical = data.layoutMode === 'vertical';

  return (
    <div className="bg-white border-2 border-indigo-200 rounded-lg shadow-lg min-w-[200px] hover:shadow-xl transition-all duration-200 hover:scale-[1.02]">
      {/* Input connection point */}
      <Handle
        type="target"
        position={isVertical ? Position.Top : Position.Left}
        className="w-3 h-3 bg-indigo-400 border-2 border-white"
        style={{
          left: isVertical ? '50%' : '-6px',
          top: isVertical ? '-6px' : '50%',
          transform: isVertical ? 'translateX(-50%)' : 'translateY(-50%)',
        }}
      />

      {/* Node content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Navigation className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm">
              {data.label || 'Goto Node'}
            </h3>
            <p className="text-xs text-gray-500">Redirect to another node</p>
          </div>
        </div>

        {/* Target node display */}
        <div className="bg-indigo-50 rounded-lg p-3 mb-3">
          <div className="flex items-center space-x-2">
            <CornerDownRight className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-800">
              {data.targetNodeLabel ? `Go to: ${data.targetNodeLabel}` : 'Select target node'}
            </span>
          </div>
          {data.targetNodeId && (
            <div className="mt-1 text-xs text-indigo-600">
              Node ID: {data.targetNodeId}
            </div>
          )}
        </div>

        {/* Description */}
        {data.description && (
          <div className="text-xs text-gray-600 mb-3 p-2 bg-gray-50 rounded">
            {data.description}
          </div>
        )}

        {/* Configuration hint */}
        {!data.targetNodeId && (
          <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
            ⚠️ Click to configure target node
          </div>
        )}

        {/* Visual flow indicator */}
        <div className="flex items-center justify-center mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-indigo-600">
            <span className="text-xs font-medium">Flow redirect</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Output connection point - Goto nodes typically don't have outputs as they redirect */}
      {/* But we might want one for error handling or logging */}
      <Handle
        type="source"
        position={isVertical ? Position.Bottom : Position.Right}
        className="w-3 h-3 bg-indigo-400 border-2 border-white opacity-50"
        style={{
          right: isVertical ? '50%' : '-6px',
          bottom: isVertical ? '-6px' : '50%',
          transform: isVertical ? 'translateX(50%)' : 'translateY(50%)',
        }}
      />
    </div>
  );
};
