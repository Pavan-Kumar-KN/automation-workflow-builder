
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { triggerNodes, actionNodes, conditionNodes, externalAppNodes, NodeData } from '@/data/nodeData';
import { useNodeFilter } from '@/hooks/useNodeFilter';
import { SidebarHeader } from './sidebar/SidebarHeader';
import { SearchBar } from './sidebar/SearchBar';
import { NodeCategory } from './sidebar/NodeCategory';

export const Sidebar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [triggersOpen, setTriggersOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [conditionsOpen, setConditionsOpen] = useState(false);
  const [externalAppsOpen, setExternalAppsOpen] = useState(false);

  const onDragStart = (event: React.DragEvent, nodeType: string, nodeData: NodeData) => {
    // Handle split-condition node type
    const actualNodeType = nodeData.id === 'split-condition' ? 'split-condition' : nodeType;
    event.dataTransfer.setData('application/reactflow', actualNodeType);
    event.dataTransfer.setData('application/nodedata', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredTriggers = useNodeFilter(triggerNodes, searchTerm);
  const filteredActions = useNodeFilter(actionNodes, searchTerm);
  const filteredConditions = useNodeFilter(conditionNodes, searchTerm);
  const filteredExternalApps = useNodeFilter(externalAppNodes, searchTerm);

  const hasNoResults = searchTerm && 
    filteredTriggers.length === 0 && 
    filteredActions.length === 0 && 
    filteredConditions.length === 0 && 
    filteredExternalApps.length === 0;

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto h-full">
      <div className="mb-6">
        <SidebarHeader />
        <p className="text-sm text-gray-600 mb-4">
          Build powerful automation workflows by dragging and dropping components
        </p>
        
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      </div>

      <NodeCategory 
        title="Triggers" 
        nodes={filteredTriggers} 
        nodeType="trigger" 
        emoji="🔥" 
        isOpen={triggersOpen}
        setIsOpen={setTriggersOpen}
        onDragStart={onDragStart}
      />
      <NodeCategory 
        title="Actions" 
        nodes={filteredActions} 
        nodeType="action" 
        emoji="⚡" 
        isOpen={actionsOpen}
        setIsOpen={setActionsOpen}
        onDragStart={onDragStart}
      />
      <NodeCategory 
        title="Conditions" 
        nodes={filteredConditions} 
        nodeType="condition" 
        emoji="🎯" 
        isOpen={conditionsOpen}
        setIsOpen={setConditionsOpen}
        onDragStart={onDragStart}
      />
      <NodeCategory 
        title="External Apps" 
        nodes={filteredExternalApps} 
        nodeType="external-app" 
        emoji="🔗" 
        isOpen={externalAppsOpen}
        setIsOpen={setExternalAppsOpen}
        onDragStart={onDragStart}
      />
      
      {hasNoResults && (
        <div className="text-center py-8 text-gray-500">
          <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No components found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};
