import React, { useCallback, useEffect, useState } from 'react';
import { Node } from '@xyflow/react';
import { NodeConfigPanel } from './node-config/NodeConfigPanel';
import { WorkflowHeader } from './WorkflowHeader';
import { TriggerCategoryModal } from './TriggerCategoryModal';
import { ActionCategoryModal } from './ActionCategoryModal';
import { JSONPreview } from './debug/JSONPreview';
import { useWorkflowStore } from '@/hooks/useWorkflowState';
import { useWorkflowActions } from '@/hooks/useWorkflowActions';
import { useWorkflowJSON } from '@/hooks/useWorkflowJSON';
import { useUndoRedoKeyboard } from '@/hooks/useUndoRedoKeyboard';
import { useGraphStore } from '@/store/useGraphStore';
import { NodeData } from '@/data/types';
import { toast } from 'sonner';
import WorkFlowCanvas from './WorkFlowCanvas';
import { RunsPanel } from './panels/RunsPanel';
import { VersionsPanel } from './panels/VersionsPanel';
import { PublishPanel } from './panels/PublishPanel';
import { StickyNotesPanel } from './StickyNotesPanel';

export const WorkflowBuilderClean = () => {
  // Graph-based state management
  const nodeMap = useGraphStore((state) => state.nodes);
  const addNode = useGraphStore((state) => state.addNode);
  const removeNode = useGraphStore((state) => state.removeNode);
  const insertNode = useGraphStore((state) => state.insertNode);
  const updateNodeData = useGraphStore((state) => state.updateNodeData);
  const reset = useGraphStore((state) => state.reset);

  // UI state
  const {
    selectedNode,
    setSelectedNode,
    workflowName,
    setWorkflowName,
    isActive,
    setIsActive,
    nodes,
    setNodes,
  } = useWorkflowStore();

  const { executeWorkflow, saveWorkflow } = useWorkflowActions();
  const { generateJSON, submitToBackend, submitConfigToBackend } = useWorkflowJSON();

  // Modal states
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);

  // Sticky notes state
  const [showStickyNotesPanel, setShowStickyNotesPanel] = useState(true);
  const [stickyNotesVisible, setStickyNotesVisible] = useState(true);

  // Core graph operations
  const deleteSingleNode = useCallback((nodeId: string) => {
    console.log('🔍 Graph-based deleteSingleNode:', nodeId);
    removeNode(nodeId);
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode(null);
    }
    toast.success('Node deleted successfully!');
  }, [removeNode, selectedNode, setSelectedNode]);

  // Backend integration functions
  const handleWorkflowSubmit = useCallback(async () => {
    try {
      toast.loading('Submitting workflow to backend...');
      const result = await submitToBackend();
      toast.success('Workflow submitted successfully!');
      console.log('✅ Workflow submission result:', result);
      return result;
    } catch (error) {
      toast.error('Failed to submit workflow to backend');
      console.error('❌ Workflow submission error:', error);
      throw error;
    }
  }, [submitToBackend]);

  const handleConfigSubmit = useCallback(async (nodeId: string, automationId: string) => {
    try {
      toast.loading('Updating workflow configuration...');
      const result = await submitConfigToBackend(nodeId, automationId);
      toast.success('Configuration updated successfully!');
      console.log('✅ Config update result:', result);
      return result;
    } catch (error) {
      toast.error('Failed to update configuration');
      console.error('❌ Config update error:', error);
      throw error;
    }
  }, [submitConfigToBackend]);

  // Simple node addition handler using graph store
  const handleNodeSelection = useCallback((nodeType: string, nodeData: NodeData, shouldAutoOpenConfig: boolean = false) => {
    console.log('🔍 handleNodeSelection called:', {
      nodeType,
      label: nodeData.label,
      shouldAutoOpenConfig
    });

    const newNodeId = `${nodeType}-${Date.now()}`;

    // Find the trigger and end nodes
    const allNodes = Object.values(nodeMap);
    const triggerNode = allNodes.find(node => node.type === 'trigger');
    const endNode = allNodes.find(node => node.type === 'endNode');

    if (!triggerNode || !endNode) {
      console.error('Trigger or end node not found');
      return;
    }

    // Create the new node
    const newGraphNode = {
      id: newNodeId,
      type: nodeType as any,
      position: { x: 100, y: 175 }, // Between trigger and end
      data: {
        ...nodeData,
        label: nodeData.label,
        isConfigured: false,
      },
      children: [endNode.id],
      parent: triggerNode.id,
    };

    // Add the new node to the graph
    addNode(newGraphNode);

    // Update trigger to point to new node instead of end
    const updatedTrigger = {
      ...triggerNode,
      children: [newNodeId]
    };

    // Remove and re-add trigger with updated children
    removeNode(triggerNode.id);
    addNode(updatedTrigger);

    // Auto-open config if requested
    if (shouldAutoOpenConfig) {
      console.log('🔍 shouldAutoOpenConfig is true, setting up auto-open for:', newNodeId);

      // Create the node object directly instead of searching for it
      const nodeForConfig = {
        id: newNodeId,
        type: nodeType,
        data: {
          ...nodeData,
          label: nodeData.label,
          isConfigured: false,
        },
        position: { x: 100, y: 175 },
        children: [endNode.id],
        parent: triggerNode.id,
      };

      setTimeout(() => {
        console.log('🔍 Auto-opening config panel for new node:', newNodeId);
        console.log('🔍 Node object for config:', nodeForConfig);
        console.log('🔍 Current selectedNode before setting:', selectedNode);

        setSelectedNode(nodeForConfig);

        // Check if it was set after a brief delay
        setTimeout(() => {
          const currentSelected = useWorkflowStore.getState().selectedNode;
          console.log('🔍 selectedNode after setting:', currentSelected);
          if (currentSelected && currentSelected.id === newNodeId) {
            console.log('✅ Config panel auto-opened successfully for new node:', newNodeId);
          } else {
            console.log('❌ Config panel failed to open for new node:', newNodeId);
          }
        }, 50);
      }, 100); // Reduced timeout since we're not searching
    } else {
      console.log('🔍 shouldAutoOpenConfig is false, skipping auto-open');
    }

    setShowActionModal(false);
    toast.success('Node added successfully!');
    console.log('✅ Node added successfully:', newNodeId);
  }, [nodeMap, addNode, removeNode, setSelectedNode, selectedNode]);

  // Handle trigger selection
  const handleTriggerSelection = useCallback((trigger: any) => {
    console.log('🔍 Trigger selected:', trigger);

    // Find the existing trigger node
    const allNodes = Object.values(nodeMap);
    const existingTrigger = allNodes.find(node => node.type === 'trigger');

    if (existingTrigger) {
      // Create updated trigger with new trigger data
      const updatedTrigger = {
        ...existingTrigger,
        data: {
          ...trigger,
          label: trigger.label,
          icon: trigger.icon,
          id: trigger.id,
          isConfigured: false, // Set to false so config panel opens
        }
      };

      // Replace the existing trigger
      removeNode(existingTrigger.id);
      addNode(updatedTrigger);

      // Auto-open config panel for the new trigger
      setTimeout(() => {
        // Get the updated trigger from the store
        const allNodes = Object.values(useGraphStore.getState().nodes);
        const triggerNode = allNodes.find(n => n.type === 'trigger');

        if (triggerNode) {
          const nodeForConfig = {
            id: triggerNode.id,
            type: 'trigger',
            data: triggerNode.data,
            position: triggerNode.position,
          };
          setSelectedNode(nodeForConfig);
          console.log('✅ Auto-opened config for new trigger:', triggerNode.id);
        }
      }, 100);
    }

    setShowTriggerModal(false);
    toast.success(`${trigger.label} trigger selected! Configure it now.`);
  }, [nodeMap, addNode, removeNode, setSelectedNode]);

  // Open action modal
  const openActionModal = useCallback((insertIndex?: number) => {
    console.log('🔍 Opening action modal, insertIndex:', insertIndex);
    setShowActionModal(true);
  }, []);

  // Handle reset workflow
  const handleResetWorkflow = useCallback(() => {
    if (window.confirm('Are you sure you want to reset the entire workflow? This action cannot be undone.')) {
      reset();
      setSelectedNode(null);
      toast.success('Workflow reset successfully!');
    }
  }, [reset, setSelectedNode]);

  // Handle node click to open config panel
  const onNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    console.log('🔍 Node clicked:', node);

    // Don't open config panel for placeholder, ghost, and sticky note nodes
    if (node.type === 'placeholder' || node.type === 'ghost' || node.type === 'stickyNote') {
      console.log('🔍 Skipping config panel for node type:', node.type);
      return;
    }

    // Check if the click was on an interactive element (dropdown, button, etc.)
    const target = event.target as HTMLElement;
    const isInteractiveElement = target.closest('button, select, input, [role="button"], [role="menuitem"], [data-radix-collection-item]');

    if (isInteractiveElement) {
      console.log('🔍 Click was on interactive element, not opening config panel');
      return;
    }

    // Special handling for trigger nodes
    if (node.type === 'trigger') {
      const isDefaultTrigger = node.data?.id === 'trigger-default' || node.data?.label === 'Select Trigger';

      if (isDefaultTrigger) {
        // For default trigger, open trigger selection modal
        console.log('🔍 Opening trigger selection modal for default trigger');
        setShowTriggerModal(true);
        return;
      } else {
        // For configured trigger, open config panel
        console.log('🔍 Opening config panel for configured trigger');
        setSelectedNode(node);
        return;
      }
    }

    // For all other nodes, open config panel
    setSelectedNode(node);
    console.log('✅ Config panel opened for node:', node.id);
  }, [setSelectedNode, setShowTriggerModal]);

  // Handle trigger modal opening
  const openTriggerModal = useCallback(() => {
    setShowTriggerModal(true);
  }, []);

  // Wrapper for action selection to match expected signature
  const handleActionSelection = useCallback((action: any) => {
    console.log('🔍 handleActionSelection called with action:', action);

    // Check if we're replacing a condition
    const { replacingConditionId, replaceCondition } = useGraphStore.getState();

    if (replacingConditionId) {
      // We're replacing a condition
      console.log('🔍 Replacing condition with:', action);
      replaceCondition(action);
      toast.success(`Condition replaced with ${action.label}! Configure it now.`);

      // Auto-open config panel for the replaced condition
      setTimeout(() => {
        const allNodes = Object.values(useGraphStore.getState().nodes);
        const replacedCondition = allNodes.find(n => n.id === replacingConditionId);

        if (replacedCondition) {
          const nodeForConfig = {
            id: replacedCondition.id,
            type: 'condition',
            data: replacedCondition.data,
            position: replacedCondition.position,
          };
          setSelectedNode(nodeForConfig);
          console.log('✅ Auto-opened config for replaced condition:', replacedCondition.id);
        }
      }, 100);

      return;
    }

    // Normal action selection
    console.log('🔍 Calling handleNodeSelection with shouldAutoOpenConfig: true');
    handleNodeSelection('action', action, true); // Auto-open config panel
  }, [handleNodeSelection, setSelectedNode]);

  // Panel handlers
  const handleOpenRuns = useCallback(() => {
    setActivePanel(activePanel === 'runs' ? null : 'runs');
  }, [activePanel]);

  const handleOpenVersions = useCallback(() => {
    setActivePanel(activePanel === 'versions' ? null : 'versions');
  }, [activePanel]);

  const handleOpenPublish = useCallback(() => {
    setActivePanel(activePanel === 'publish' ? null : 'publish');
  }, [activePanel]);

  // Sticky notes handlers
  const handleAddStickyNote = useCallback((color: string) => {
    console.log('🔍 Adding sticky note with color:', color);
    const { addStickyNote } = useGraphStore.getState();
    const noteId = addStickyNote(color);
    console.log('🔍 Created sticky note with ID:', noteId);
  }, []);

  const handleToggleStickyNotesVisibility = useCallback(() => {
    const newVisibility = !stickyNotesVisible;
    setStickyNotesVisible(newVisibility);

    // Update all sticky notes visibility in the graph store
    const { nodes, addNode } = useGraphStore.getState();
    Object.values(nodes).forEach(node => {
      if (node.type === 'stickyNote') {
        addNode({
          ...node,
          data: {
            ...node.data,
            isVisible: newVisibility
          }
        });
      }
    });
  }, [stickyNotesVisible]);

  // Auto-open config panel for newly inserted nodes
  const [lastNodeCount, setLastNodeCount] = useState(0);
  const [lastInsertTime, setLastInsertTime] = useState(0);

  useEffect(() => {
    const allNodes = Object.values(nodeMap);
    const currentNodeCount = allNodes.length;

    // Check if a new node was added (not just initial load)
    if (currentNodeCount > lastNodeCount && lastNodeCount > 0) {
      const now = Date.now();

      // Find the newest node (most recent timestamp in ID)
      const newestNode = allNodes.reduce((newest, node) => {
        const nodeTime = parseInt(node.id.split('-').pop() || '0');
        const newestTime = parseInt(newest.id.split('-').pop() || '0');
        return nodeTime > newestTime ? node : newest;
      });

      // Only auto-open if this is a recent insertion (within last 2 seconds)
      // and it's an action or condition node
      if (now - lastInsertTime < 2000 &&
          (newestNode.type === 'action' || newestNode.type === 'condition') &&
          !newestNode.data.isConfigured) {

        console.log('🔍 New node detected, auto-opening config:', newestNode.id);
        setTimeout(() => {
          setSelectedNode(newestNode);
          console.log('✅ Auto-opened config for inserted node:', newestNode.id);
        }, 100);
      }
    }

    setLastNodeCount(currentNodeCount);

    // Debug: Log JSON when nodes change
    if (allNodes.length > 0) {
      const json = generateJSON();
      console.log('🔄 Current Workflow JSON:', json);
    }
  }, [Object.keys(nodeMap).length, generateJSON, lastNodeCount, lastInsertTime, setSelectedNode]);

  // Track when insertions happen (called from FlowEdge)
  useEffect(() => {
    const handleNodeInsertion = () => {
      setLastInsertTime(Date.now());
    };

    // Listen for node insertions (we'll trigger this from FlowEdge)
    window.addEventListener('nodeInserted', handleNodeInsertion);

    return () => {
      window.removeEventListener('nodeInserted', handleNodeInsertion);
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <WorkflowHeader
        workflowName={workflowName}
        setWorkflowName={setWorkflowName}
        isActive={isActive}
        setIsActive={setIsActive}
        onExecute={executeWorkflow}
        onSave={saveWorkflow}
        onReset={handleResetWorkflow}
        onOpenRuns={handleOpenRuns}
        onOpenVersions={handleOpenVersions}
        onOpenPublish={handleOpenPublish}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sticky Notes Panel */}
        <StickyNotesPanel
          onAddNote={handleAddStickyNote}
          onToggleVisibility={handleToggleStickyNotesVisibility}
          isVisible={stickyNotesVisible}
          isOpen={showStickyNotesPanel}
        />

        <div className="flex-1">
          <WorkFlowCanvas
            onNodeClick={onNodeClick}
            openTriggerModal={() => setShowTriggerModal(true)}
            openActionModal={() => setShowActionModal(true)}
          />
        </div>

        {/* Configuration Panel */}
        {selectedNode && (
          <div className="fixed inset-x-0 bottom-0 h-1/2 z-50 md:relative md:w-[32rem] lg:w-[36rem] md:h-auto md:inset-auto bg-white border-t md:border-t-0 md:border-l border-gray-200 shadow-lg">
            <div className="h-full overflow-y-auto">
              <NodeConfigPanel
                node={selectedNode}
                onClose={() => setSelectedNode(null)}
                onUpdate={(nodeId, updates) => {
                  console.log('🔍 Updating node:', nodeId, 'with updates:', updates);

                  // Update the graph store (main source of truth) using updateNodeData
                  if (updateNodeData) {
                    updateNodeData(nodeId, {
                      ...updates,
                      isConfigured: true // Mark as configured after update
                    });
                    console.log('✅ Node updated in graph store:', nodeId);
                  }

                  // Also update the workflow store for UI consistency
                  setNodes((nds) =>
                    nds.map((n) => (n.id === nodeId ? {
                      ...n,
                      data: {
                        ...n.data,
                        ...updates,
                        isConfigured: true
                      }
                    } : n))
                  );

                  setSelectedNode(null); // Close config panel after update
                  console.log('✅ Config panel closed after update');
                }}
                onDelete={(nodeId) => {
                  // ✅ Handle node deletion from config panel using graph store
                  removeNode(nodeId);
                  setSelectedNode(null); // Close config panel after deletion
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Slide Panels - Using your existing panel components */}
      <RunsPanel
        isOpen={activePanel === 'runs'}
        onClose={() => setActivePanel(null)}
      />

      <VersionsPanel
        isOpen={activePanel === 'versions'}
        onClose={() => setActivePanel(null)}
      />

      <PublishPanel
        isOpen={activePanel === 'publish'}
        onClose={() => setActivePanel(null)}
      />

      {/* Modals */}
      <TriggerCategoryModal
        isOpen={showTriggerModal}
        onClose={() => setShowTriggerModal(false)}
        onSelectTrigger={handleTriggerSelection}
      />

      <ActionCategoryModal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        onSelectAction={handleActionSelection}
      />

      {/* JSON Preview for debugging */}
      <JSONPreview />
    </div>
  );
};

export default WorkflowBuilderClean;
