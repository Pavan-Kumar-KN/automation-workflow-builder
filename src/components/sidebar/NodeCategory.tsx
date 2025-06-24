
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { NodeCard } from './NodeCard';
import { NodeData } from '@/data/nodeData';

interface NodeCategoryProps {
  title: string;
  nodes: NodeData[];
  nodeType: string;
  emoji: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onDragStart: (event: React.DragEvent, nodeType: string, nodeData: NodeData) => void;
}

export const NodeCategory: React.FC<NodeCategoryProps> = ({
  title,
  nodes,
  nodeType,
  emoji,
  isOpen,
  setIsOpen,
  onDragStart
}) => {
  if (nodes.length === 0) return null;
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-6">
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between w-full group hover:bg-gray-50 p-2 rounded-md transition-colors">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-base">{emoji}</span>
            {title} ({nodes.length})
          </h3>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3">
        <div className="space-y-2">
          {nodes.map((node) => (
            <NodeCard
              key={node.id}
              node={node}
              nodeType={nodeType}
              onDragStart={onDragStart}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
