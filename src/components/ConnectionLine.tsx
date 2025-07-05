import React from 'react';
import { PlusButton } from './PlusButton';
import { NodeData } from '@/data/nodeData';

interface ConnectionLineProps {
  onSelectNode: (nodeType: string, nodeData: NodeData) => void;
  validNodeTypes: string[];
  showPlusButton?: boolean;
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({
  onSelectNode,
  validNodeTypes,
  showPlusButton = true
}) => {
  return (
    <div className="flex flex-col items-center py-4">
      {/* Vertical Line */}
      <div className="w-0.5 h-8 bg-gray-300"></div>
      
      {/* Plus Button */}
      {showPlusButton && (
        <PlusButton
          onSelectNode={onSelectNode}
          validNodeTypes={validNodeTypes}
          position="between"
        />
      )}
      
      {/* Vertical Line */}
      <div className="w-0.5 h-8 bg-gray-300"></div>
    </div>
  );
};
