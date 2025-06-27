import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { NodeCard } from './NodeCard';
import { NodeData } from '@/data/types';

interface Category {
  id: string;
  name: string;
  icon: any;
  description: string;
  color: string;
  triggers?: NodeData[];
  actions?: NodeData[];
}

interface CategorizedNodeSectionProps {
  title: string;
  categories: Category[];
  nodeType: string;
  emoji: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onDragStart: (event: React.DragEvent, nodeType: string, nodeData: NodeData) => void;
  searchTerm?: string;
}

export const CategorizedNodeSection: React.FC<CategorizedNodeSectionProps> = ({
  title,
  categories,
  nodeType,
  emoji,
  isOpen,
  setIsOpen,
  onDragStart,
  searchTerm = ''
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Filter categories and nodes based on search term
  const filteredCategories = categories.map(category => {
    const nodes = category.triggers || category.actions || [];
    const filteredNodes = nodes.filter(node =>
      node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return {
      ...category,
      nodes: filteredNodes,
      hasMatches: filteredNodes.length > 0 ||
                  category.name.toLowerCase().includes(searchTerm.toLowerCase())
    };
  }).filter(category => category.hasMatches);

  const totalNodes = filteredCategories.reduce((sum, cat) => sum + cat.nodes.length, 0);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-6">
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between w-full group hover:bg-gray-50 p-2 rounded-md transition-colors">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-base">{emoji}</span>
            {title} ({totalNodes})
          </h3>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
          )}
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-3">
        <div className="space-y-2 pl-2">
          {filteredCategories.map((category) => {
            const isExpanded = expandedCategories.has(category.id);
            const IconComponent = category.icon;
            
            return (
              <div key={category.id} className="space-y-1 mb-3">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded ${category.color}`}>
                      <IconComponent className="w-3 h-3 text-gray-600" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-medium text-gray-700">
                        {category.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {category.nodes.length} items
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-3 h-3 text-gray-400 transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />
                </button>

                {/* Category Nodes */}
                {isExpanded && (
                  <div className="space-y-2 pl-4 border-l border-gray-200">
                    {category.nodes.map((node) => (
                      <div key={node.id} className="transform scale-95">
                        <NodeCard
                          node={node}
                          nodeType={nodeType}
                          onDragStart={onDragStart}
                        />
                      </div>
                    ))}

                    {category.nodes.length === 0 && searchTerm && (
                      <div className="text-xs text-gray-500 italic p-2">
                        No items match "{searchTerm}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          {filteredCategories.length === 0 && searchTerm && (
            <div className="text-center py-4 text-gray-500">
              <div className="text-sm">No {title.toLowerCase()} found</div>
              <div className="text-xs opacity-80">Try a different search term</div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
