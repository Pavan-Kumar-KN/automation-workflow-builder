
import React from 'react';
import { Card } from '@/components/ui/card';
import { NodeData } from '@/data/nodeData';
import { LucideIcon, ChevronDown } from 'lucide-react';

interface NodeCardProps {
  node: NodeData;
  nodeType: string;
  onDragStart: (event: React.DragEvent, nodeType: string, nodeData: NodeData) => void;
}

export const NodeCard: React.FC<NodeCardProps> = ({ node, nodeType, onDragStart }) => {
  const IconComponent = node.icon as LucideIcon;

  return (
    <Card
      className="p-4 cursor-grab hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300 bg-white rounded-lg"
      draggable
      onDragStart={(event) => onDragStart(event, nodeType, node)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          <div className={`p-2 rounded-lg ${node.color} flex-shrink-0`}>
            <IconComponent className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 leading-tight">
              {node.label}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {node.description}
            </p>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </div>
    </Card>
  );
};
