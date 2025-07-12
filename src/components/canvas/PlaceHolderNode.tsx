import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Handle, Position } from '@xyflow/react';

interface PlaceHolderNodeProps {
  id: string; // ✅ React Flow injects this
  data: {
    branchType: string;
    conditionNodeId: string;
    handleAddNodeToBranch: (branchType: string, placeholderNodeId: string) => void;
  };
  isSelected?: boolean;
}

const PlaceHolderNode: React.FC<PlaceHolderNodeProps> = ({ id, data, isSelected = false }) => {
  return (
    <div className="relative">
      {/* Top Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        style={{ 
          background: '#4CAF50', 
          border: '2px solid #fff', 
          visibility: 'hidden', 
          top: '-12px' 
        }}
      />

      {/* Main Container */}
      <div
        className={`
          flex items-center justify-center
          w-[280px] h-6
          rounded-lg
          cursor-pointer
          transition-all duration-200
        `}
        onClick={() => data.handleAddNodeToBranch(data.branchType, id, data.conditionNodeId)}
      >
      <div className='border border-gray-300 bg-gray-50'>
          {/* Plus Icon */}
        <LucideIcons.Plus 
          className={`
            w-12 h-8
            transition-colors duration-200
            ${isSelected
              ? 'text-blue-600'
              : 'text-gray-400 hover:text-blue-600'
            }
          `} 
        />
      </div>
      </div>

      {/* Bottom Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        style={{ 
          background: '#fff', 
          border: '2px solid #fff' 
        }}
      />
    </div>
  );
};

export default PlaceHolderNode;