
import React from 'react';
import { Card } from '@/components/ui/card';
import { NodeData } from '@/data/nodeData';

interface NodeCardProps {
  node: NodeData;
  nodeType: string;
  onDragStart: (event: React.DragEvent, nodeType: string, nodeData: NodeData) => void;
}

export const NodeCard: React.FC<NodeCardProps> = ({ node, nodeType, onDragStart }) => {
  const IconComponent = node.icon;

  const getCardStyles = () => {
    switch (nodeType) {
      case 'trigger':
        return 'border-red-200 hover:border-red-300 hover:bg-red-50/50';
      case 'action':
        return 'border-blue-200 hover:border-blue-300 hover:bg-blue-50/50';
      case 'condition':
        return 'border-orange-200 hover:border-orange-300 hover:bg-orange-50/50';
      case 'external-app':
        return 'border-purple-200 hover:border-purple-300 hover:bg-purple-50/50';
      default:
        return 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50';
    }
  };

  const getIconStyles = () => {
    switch (nodeType) {
      case 'trigger':
        return 'bg-red-100 text-red-600';
      case 'action':
        return 'bg-blue-100 text-blue-600';
      case 'condition':
        return 'bg-orange-100 text-orange-600';
      case 'external-app':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <Card
      className={`p-3 cursor-grab hover:shadow-md transition-all duration-200 border-2 ${getCardStyles()} hover:scale-[1.02] active:scale-[0.98]`}
      draggable
      onDragStart={(event) => onDragStart(event, nodeType, node)}
    >
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg shadow-sm flex-shrink-0 ${getIconStyles()}`}>
          <IconComponent className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 leading-tight">
            {node.label}
          </p>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {node.description}
          </p>
        </div>
      </div>
    </Card>
  );
};
