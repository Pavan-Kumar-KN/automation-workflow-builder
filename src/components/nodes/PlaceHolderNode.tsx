import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Handle, Position } from '@xyflow/react';

interface PlaceHolderNodeProps {
  id: string; // ✅ React Flow injects this
  data: {
    branchType: string;
    conditionNodeId: string;
    handleAddNodeToBranch: (branchType: string, placeholderNodeId: string, conditionNodeId: string) => void;
  };
  isSelected?: boolean;
  targetPosition?: typeof Position.Top | typeof Position.Left | typeof Position.Right | typeof Position.Bottom;
  sourcePosition?: typeof Position.Top | typeof Position.Left | typeof Position.Right | typeof Position.Bottom;
}

const PlaceHolderNode: React.FC<PlaceHolderNodeProps> = ({
  id,
  data,
  isSelected = false,
  targetPosition = Position.Top,
  sourcePosition = Position.Bottom
}) => {


  return (
    <div className="relative">
      {/* Input Handle */}
      <Handle
        type="target"
        position={targetPosition}
        id="in"
        style={{
          background: '#4CAF50',
          border: '2px solid #fff',
          visibility: 'hidden',
          left: targetPosition === Position.Top || targetPosition === Position.Bottom ? '50%' : undefined,
          top: targetPosition === Position.Left || targetPosition === Position.Right ? '50%' : undefined,
          bottom: targetPosition === Position.Top ? '-12px' : undefined,
          right: targetPosition === Position.Left ? '-12px' : undefined
        }}
      />

      {/* Simple Plus Icon Only */}
      <div
        className={`
          flex items-center justify-center
          bg-[#f8fafc]
          w-[280px] h-10 
          cursor-pointer
          transition-all duration-200
          hover:scale-110
          active:scale-95
        `}
        onClick={() => data.handleAddNodeToBranch(data.branchType, id, data.conditionNodeId)}
      >
        <div className="w-6 h-5 bg-gray-400 border border-gray-500 rounded-md flex items-center justify-center transition-colors shadow-sm">
          <LucideIcons.Plus className="w-4 h-4 text-white stroke-[2.5]" />
        </div>

      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={sourcePosition}
        id="out"
        style={{
          background: '#fff',
          border: '2px solid #fff',
          left: sourcePosition === Position.Top || sourcePosition === Position.Bottom ? '50%' : undefined,
          top: sourcePosition === Position.Left || sourcePosition === Position.Right ? '50%' : undefined,
          bottom: sourcePosition === Position.Bottom ? '-6px' : undefined,
          right: sourcePosition === Position.Right ? '-6px' : undefined
        }}
      />
    </div>
  );
};

export default PlaceHolderNode;