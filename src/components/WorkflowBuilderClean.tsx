import React, { useCallback, useEffect, useState } from 'react';
import { Node } from '@xyflow/react';
import { NodeConfigPanel } from './node-config/NodeConfigPanel';
import { WorkflowHeader } from './WorkflowHeader';
import { TriggerCategoryModal } from './TriggerCategoryModal';
import { ActionCategoryModal } from './ActionCategoryModal';
import { useWorkflowStore } from '@/hooks/useWorkflowState';
import { useWorkflowActions } from '@/hooks/useWorkflowActions';
import { useWorkflowJSON } from '@/hooks/useWorkflowJSON';
import { useGraphStore } from '@/store/useGraphStore';
import { NodeData } from '@/data/types';
import { toast } from 'sonner';
import WorkFlowCanvas from './WorkFlowCanvas';

export const WorkflowBuilderClean = () => {
  // Graph-based state management
  const nodeMap = useGraphStore((state) => state.nodes);
  const addNode = useGraphStore((state) => state.addNode);
  const removeNode = useGraphStore((state) => state.removeNode);
  const insertNode = useGraphStore((state) => state.insertNode);
  const reset = useGraphStore((state) => state.reset);

  // UI state
  const {
    selectedNode,
    setSelectedNode,
    workflowName,
    setWorkflowName,
    isActive,
    setIsActive,
  } = useWorkflowStore();

  const { executeWorkflow, saveWorkflow } = useWorkflowActions();
  const { generateJSON } = useWorkflowJSON();

  // Modal states
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);

  // Core graph operations
  const deleteSingleNode = useCallback((nodeId: string) => {
    console.log('🔍 Graph-based deleteSingleNode:', nodeId);
    removeNode(nodeId);
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode(null);
    }
    toast.success('Node deleted successfully!');
  }, [removeNode, selectedNode, setSelectedNode]);

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
      setTimeout(() => {
        const newNodeFromStore = Object.values(useGraphStore.getState().nodes).find(n => n.id === newNodeId);
        if (newNodeFromStore) {
          setSelectedNode(newNodeFromStore as any);
        }
      }, 100);
    }

    setShowActionModal(false);
    toast.success('Node added successfully!');
    console.log('✅ Node added successfully:', newNodeId);
  }, [nodeMap, addNode, removeNode, setSelectedNode]);

  // Handle trigger selection
  const handleTriggerSelection = useCallback((trigger: any) => {
    console.log('🔍 Trigger selected:', trigger);

    // Find the existing trigger node
    const allNodes = Object.values(nodeMap);
    const existingTrigger = allNodes.find(node => node.type === 'trigger');

    if (existingTrigger) {
      // Update the existing trigger
      const updatedTrigger = {
        ...existingTrigger,
        data: {
          ...existingTrigger.data,
          ...trigger,
          label: trigger.label,
          isConfigured: true,
        }
      };

      removeNode(existingTrigger.id);
      addNode(updatedTrigger);
    }

    setShowTriggerModal(false);
    toast.success('Trigger updated successfully!');
  }, [nodeMap, addNode, removeNode]);

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

  // Debug: Log JSON when nodes change
  useEffect(() => {
    const allNodes = Object.values(nodeMap);
    if (allNodes.length > 0) {
      const json = generateJSON();
      console.log('🔄 Current Workflow JSON:', json);
    }
  }, [Object.keys(nodeMap).length, generateJSON]);

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
        <div className="flex-1">
          <WorkFlowCanvas />
        </div>

        {/* Configuration Panel */}
        {selectedNode && (
          <div className="fixed inset-x-0 bottom-0 h-1/2 z-50 md:relative md:w-[32rem] lg:w-[36rem] md:h-auto md:inset-auto bg-white border-t md:border-t-0 md:border-l border-gray-200 shadow-lg">
            <div className="h-full overflow-y-auto">
              <NodeConfigPanel
                node={selectedNode}
                onClose={() => setSelectedNode(null)}
                onUpdate={(nodeId, updates) => {
                  setNodes((nds) =>
                    nds.map((n) => (n.id === nodeId ? {
                      ...n,
                      data: {
                        ...n.data,
                        ...updates,
                        isConfigured: true // Mark as configured after update
                      }
                    } : n))
                  );
                  setSelectedNode(null); // Close config panel after update
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

      {/* Modals */}
      <TriggerCategoryModal
        isOpen={showTriggerModal}
        onClose={() => setShowTriggerModal(false)}
        onSelectTrigger={handleTriggerSelection}
      />

      <ActionCategoryModal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        onSelectAction={handleNodeSelection}
      />
    </div>
  );
};

export default WorkflowBuilderClean;
