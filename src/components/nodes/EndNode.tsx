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
    <div className="flex flex-col items-center relative w-[280px] min-w-[280px] h-[56px]">
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

      <div className="text-center">
        <div className="text-sm font-medium text-gray-600 bg-gray-100 rounded-lg px-4 py-2 border border-gray-300">
          End
        </div>
      </div>
    </div>
  );
};


export default EndNode;
