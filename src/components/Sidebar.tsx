import React from 'react';
import { Search } from 'lucide-react';
import { categorizedTriggers, getAllTriggers } from '@/data/categorizedTriggers';
import { categorizedActions, getAllActions } from '@/data/categorizedActions';
import { conditionNodes, externalAppNodes, NodeData } from '@/data/nodeData';
import { useNodeFilter } from '@/hooks/useNodeFilter';
import { useWorkflowStore } from '@/hooks/useWorkflowState';
import { SidebarHeader } from './sidebar/SidebarHeader';
import { SearchBar } from './sidebar/SearchBar';
import { NodeCategory } from './sidebar/NodeCategory';
import { CategorizedNodeSection } from './sidebar/CategorizedNodeSection';

export const Sidebar = () => {
  const {
    searchTerm,
    setSearchTerm,
    triggersOpen,
    setTriggersOpen,
    actionsOpen,
    setActionsOpen,
    conditionsOpen,
    setConditionsOpen,
    externalAppsOpen,
    setExternalAppsOpen,
  } = useWorkflowStore();

  const onDragStart = (event: React.DragEvent, nodeType: string, nodeData: NodeData) => {
    // Handle special node types
    let actualNodeType = nodeType;

    // if (nodeData.id === 'split-condition') {
    //   actualNodeType = 'split-condition';
    // } 
    if (nodeData.id === 'add-new-trigger') {
      actualNodeType = 'add-trigger';
    }

    event.dataTransfer.setData('application/reactflow', actualNodeType);
    event.dataTransfer.setData('application/nodedata', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  // Get all triggers and actions from categorized data
  const allTriggers = getAllTriggers();
  const allActions = getAllActions();

  // Filter out specific nodes that should be hidden
  const hiddenNodeIds = ['goto-node', 'split-condition'];

  const filteredTriggers = useNodeFilter(allTriggers, searchTerm);
  const filteredActions = useNodeFilter(allActions, searchTerm).filter(node => !hiddenNodeIds.includes(node.id));
  const filteredConditions = useNodeFilter(conditionNodes, searchTerm).filter(node => !hiddenNodeIds.includes(node.id));
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

      <CategorizedNodeSection
        title="Triggers"
        categories={categorizedTriggers}
        nodeType="trigger"
        emoji="🔥"
        isOpen={triggersOpen}
        setIsOpen={setTriggersOpen}
        onDragStart={onDragStart}
        searchTerm={searchTerm}
      />
      <CategorizedNodeSection
        title="Actions"
        categories={categorizedActions}
        nodeType="action"
        emoji="⚡"
        isOpen={actionsOpen}
        setIsOpen={setActionsOpen}
        onDragStart={onDragStart}
        searchTerm={searchTerm}
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
      
      {/* <NodeCategory
        title="External Apps"
        nodes={filteredExternalApps}
        nodeType="external-app"
        emoji="🔗"
        isOpen={externalAppsOpen}
        setIsOpen={setExternalAppsOpen}
        onDragStart={onDragStart}
      /> */}

      {hasNoResults && (
        <div className="text-center py-8 text-gray-500">
          <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No components found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};
