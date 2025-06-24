
import React from 'react';
import { Card } from '@/components/ui/card';
import { NodeData } from '@/data/nodeData';
import { LucideIcon } from 'lucide-react';

interface NodeCardProps {
  node: NodeData;
  nodeType: string;
  onDragStart: (event: React.DragEvent, nodeType: string, nodeData: NodeData) => void;
}

export const NodeCard: React.FC<NodeCardProps> = ({ node, nodeType, onDragStart }) => {
  const IconComponent = node.icon as LucideIcon;

  return (
    <Card
      className={`p-3 cursor-grab hover:shadow-md transition-all duration-200 border-2 ${node.color} hover:scale-[1.02]`}
      draggable
      onDragStart={(event) => onDragStart(event, nodeType, node)}
    >
      <div className="flex items-start space-x-3">
        <div className="p-2 rounded-lg bg-white shadow-sm flex-shrink-0">
          <IconComponent className="w-4 h-4 text-gray-600" />
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
