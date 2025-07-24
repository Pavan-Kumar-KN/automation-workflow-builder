import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Node, NodeProps } from '@xyflow/react';
import { Handle, Position } from '@xyflow/react';

interface EndNodeData {
  label: string;
  id: string;
  onOpenActionModal?: (insertIndex?: number) => void;
  nodes?: Node[];
}

interface EndNodeProps extends NodeProps {
  data: EndNodeData;
}

const EndNode: React.FC<EndNodeProps> = ({
  data,
  targetPosition
}) => {
  // Use passed position or fallback to default
  const actualTargetPosition = targetPosition || Position.Top;
  return (
    <div className="flex flex-col items-center relative w-[280px] h-[56px]">
      <Handle
        type="target"
        position={actualTargetPosition}
        className="w-3 border-2 border-white"
        style={{
          left: actualTargetPosition === Position.Top || actualTargetPosition === Position.Bottom ? '50%' : undefined,
          top: actualTargetPosition === Position.Left || actualTargetPosition === Position.Right ? '70%' : undefined,
          bottom: actualTargetPosition === Position.Top ? '-12px' : undefined,
          right: actualTargetPosition === Position.Left ? '-12px' : undefined,
          visibility: 'hidden'
        }}
        id='in'
      />

      {/* Uniform vertical lines - compact height */}
      {/* <div className="w-0.5 h-6 bg-gray-400"></div>
      <div className="relative">
        <button
          onClick={() => data.onOpenActionModal?.(data.nodes?.length ? data.nodes.length - 1 : 0)}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-gray-400 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors z-10"
        >
          <LucideIcons.Plus className="w-3 h-3 text-gray-600 hover:text-blue-600" />
        </button>
      </div>
      <div className="w-0.5 h-6 bg-gray-400"></div> */}

      <div className="text-center">
        <div className="text-sm font-medium text-gray-600 bg-gray-100 rounded-lg px-4 py-2 border border-gray-300">
          End
        </div>
      </div>
    </div>
  );
};


export default EndNode;
