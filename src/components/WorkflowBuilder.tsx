
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Node, Connection } from '@xyflow/react';
import { Plus, Minus, RotateCcw, Lock, Unlock } from 'lucide-react';

import { NodeConfigPanel } from './node-config/NodeConfigPanel';
import { WorkflowHeader } from './WorkflowHeader';
import { SimpleWorkflowCanvas } from './SimpleWorkflowCanvas';
import { TriggerCategoryModal } from './TriggerCategoryModal';
import { ActionCategoryModal } from './ActionCategoryModal';
import { RunsPanel } from './panels/RunsPanel';
import { VersionsPanel } from './panels/VersionsPanel';
import { PublishPanel } from './panels/PublishPanel';
import { useWorkflowStore } from '@/hooks/useWorkflowState';
import { useWorkflowActions } from '@/hooks/useWorkflowActions';
import { useWorkflowJSON } from '@/hooks/useWorkflowJSON';
import { NodeData } from '@/data/nodeData';
import { toast } from 'sonner';

export const WorkflowBuilder = () => {
  const {
    selectedNode,
    setSelectedNode,
    workflowName,
    setWorkflowName,
    isActive,
    setIsActive,
    nodes,
    setNodes,
    setEdges,
  } = useWorkflowStore();

  const { executeWorkflow, saveWorkflow } = useWorkflowActions();

  // Modal states
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionInsertIndex, setActionInsertIndex] = useState<number | null>(null);

  // Panel states - only one panel can be open at a time
  const [activePanel, setActivePanel] = useState<'runs' | 'versions' | 'publish' | null>(null);

  // Initialize with default trigger node if empty
  useEffect(() => {
    if (nodes.length === 0) {
      const defaultTriggerNode: Node = {
        id: 'trigger-default',
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: {
          label: 'Select Trigger',
          icon: 'Zap',
          description: 'Empty Trigger',
          isConfigured: false,
          openTriggerModal: () => setShowTriggerModal(true),
        },
      };
      setNodes([defaultTriggerNode]);
    }
  }, [nodes.length, setNodes]);

  // JSON generation (auto-updates on node changes)
  const { generateJSON } = useWorkflowJSON();

  // Debug: Log JSON when nodes change (for development)
  useEffect(() => {
    if (nodes.length > 0) {
      const json = generateJSON();
      console.log('🔄 Current Workflow JSON:', json);
    }
  }, [nodes.length, generateJSON]);

  // Simple node addition handler
  const handleNodeSelection = useCallback((nodeType: string, nodeData: NodeData) => {
    const newNode: Node = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position: { x: 0, y: 0 }, // Position doesn't matter in our simple layout
      data: {
        ...nodeData,
        label: nodeData.label,
        openTriggerModal: nodeType === 'trigger' ? () => setShowTriggerModal(true) : undefined,
        isConfigured: false,
      },
    };

    setNodes((nds) => {
      const newNodes = [...nds, newNode];

      // Create edge from previous node to new node
      if (nds.length > 0) {
        const previousNode = nds[nds.length - 1];
        const newEdge = {
          id: `edge-${previousNode.id}-${newNode.id}`,
          source: previousNode.id,
          target: newNode.id,
          type: 'smoothstep',
          animated: false,
        };

        setEdges((eds) => [...eds, newEdge]);
      }

      return newNodes;
    });
    toast.success(`${nodeData.label} added to workflow!`);
  }, [setNodes, setEdges]);

  // Handle node insertion between existing nodes
  const handleNodeInsertion = useCallback((afterNodeIndex: number, nodeType: string, nodeData: NodeData) => {
    const newNode: Node = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position: { x: 0, y: 0 },
      data: {
        ...nodeData,
        label: nodeData.label,
        openTriggerModal: nodeType === 'trigger' ? () => setShowTriggerModal(true) : undefined,
        isConfigured: false,
      },
    };

    setNodes((nds) => {
      const newNodes = [...nds];
      const previousNode = newNodes[afterNodeIndex];
      const nextNode = newNodes[afterNodeIndex + 1];

      // Insert the new node
      newNodes.splice(afterNodeIndex + 1, 0, newNode);

      // Update edges: remove old edge and create new ones
      setEdges((eds) => {
        let newEdges = [...eds];

        // Remove edge from previous to next (if it exists)
        if (previousNode && nextNode) {
          newEdges = newEdges.filter(edge =>
            !(edge.source === previousNode.id && edge.target === nextNode.id)
          );
        }

        // Add edge from previous to new node
        if (previousNode) {
          newEdges.push({
            id: `edge-${previousNode.id}-${newNode.id}`,
            source: previousNode.id,
            target: newNode.id,
            type: 'smoothstep',
            animated: false,
          });
        }

        // Add edge from new node to next
        if (nextNode) {
          newEdges.push({
            id: `edge-${newNode.id}-${nextNode.id}`,
            source: newNode.id,
            target: nextNode.id,
            type: 'smoothstep',
            animated: false,
          });
        }

        return newEdges;
      });

      return newNodes;
    });
    toast.success(`${nodeData.label} inserted into workflow!`);
  }, [setNodes, setEdges]);

  // Handle action selection from modal
  const handleActionSelection = useCallback((action: NodeData) => {
    // Determine node type based on action id
    const nodeType = action.id === 'condition-action' ? 'condition' : 'action';

    if (actionInsertIndex !== null) {
      handleNodeInsertion(actionInsertIndex, nodeType, action);
      setActionInsertIndex(null);
    } else {
      handleNodeSelection(nodeType, action);
    }
    setShowActionModal(false);
  }, [actionInsertIndex, handleNodeInsertion, handleNodeSelection]);

  // Open action modal for insertion
  const openActionModal = useCallback((insertIndex?: number) => {
    setActionInsertIndex(insertIndex ?? null);
    setShowActionModal(true);
  }, []);

  // Handle node deletion
  const handleNodeDeletion = useCallback((nodeIndex: number) => {
    setNodes((nds) => {
      const newNodes = [...nds];
      const nodeToDelete = newNodes[nodeIndex];
      const previousNode = nodeIndex > 0 ? newNodes[nodeIndex - 1] : null;
      const nextNode = nodeIndex < newNodes.length - 1 ? newNodes[nodeIndex + 1] : null;

      // Remove the node
      newNodes.splice(nodeIndex, 1);

      // Update edges: remove edges connected to deleted node and reconnect previous to next
      setEdges((eds) => {
        let newEdges = eds.filter(edge =>
          edge.source !== nodeToDelete.id && edge.target !== nodeToDelete.id
        );

        // If there are previous and next nodes, connect them
        if (previousNode && nextNode) {
          newEdges.push({
            id: `edge-${previousNode.id}-${nextNode.id}`,
            source: previousNode.id,
            target: nextNode.id,
            type: 'smoothstep',
            animated: false,
          });
        }

        return newEdges;
      });

      return newNodes;
    });
    toast.success('Node deleted from workflow!');
  }, [setNodes, setEdges]);

  // Handle trigger selection from modal
  const handleTriggerSelection = useCallback((trigger: NodeData) => {
    // Update the first trigger node with the selected trigger
    setNodes((nds) =>
      nds.map((node, index) => {
        if (node.type === 'trigger' && index === 0) {
          return {
            ...node,
            data: {
              ...node.data,
              ...trigger,
              isConfigured: false, // Still needs configuration
              openTriggerModal: () => setShowTriggerModal(true),
            },
          };
        }
        return node;
      })
    );

    setShowTriggerModal(false);
    toast.success(`${trigger.label} trigger selected!`);

    // Open configuration panel for the trigger
    const triggerNode = nodes.find(n => n.type === 'trigger');
    if (triggerNode) {
      setSelectedNode({
        ...triggerNode,
        data: { ...triggerNode.data, ...trigger }
      });
    }
  }, [setNodes, nodes, setSelectedNode]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    // Don't open config panel for default trigger
    const isDefaultTrigger = node.data?.id === 'trigger-default' || node.data?.label === 'Select Trigger';

    if (!isDefaultTrigger) {
      setSelectedNode(node);
    }
  }, [setSelectedNode]);

  // Handle replace trigger
  const handleReplaceTrigger = useCallback(() => {
    setShowTriggerModal(true);
  }, []);

  // Handle open trigger config
  const handleOpenTriggerConfig = useCallback((node: Node) => {
    setSelectedNode(node);
  }, [setSelectedNode]);

  // Handle reset workflow
  const handleResetWorkflow = useCallback(() => {
    if (window.confirm('Are you sure you want to reset the entire workflow? This action cannot be undone.')) {
      // Reset to initial state with just the default trigger
      const defaultTriggerNode: Node = {
        id: 'trigger-default',
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: {
          label: 'Select Trigger',
          icon: 'Zap',
          description: 'Empty Trigger',
          isConfigured: false,
          openTriggerModal: () => setShowTriggerModal(true),
        },
      };

      setNodes([defaultTriggerNode]);
      setEdges([]);
      setSelectedNode(null);
      toast.success('Workflow reset successfully!');
    }
  }, [setNodes, setEdges, setSelectedNode]);

  // Zoom controls state
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isLocked, setIsLocked] = useState(false);

  const handleZoomIn = useCallback(() => {
    if (!isLocked) {
      setZoomLevel(prev => Math.min(prev + 25, 200));
    }
  }, [isLocked]);

  const handleZoomOut = useCallback(() => {
    if (!isLocked) {
      setZoomLevel(prev => Math.max(prev - 25, 25));
    }
  }, [isLocked]);

  const handleFitToScreen = useCallback(() => {
    if (!isLocked) {
      setZoomLevel(100);
    }
  }, [isLocked]);

  const handleToggleLock = useCallback(() => {
    setIsLocked(prev => !prev);
  }, []);

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

  const handleClosePanel = useCallback(() => {
    setActivePanel(null);
  }, []);

  const handleLoadVersion = useCallback((versionId: string) => {
    console.log('Loading version:', versionId);
    // TODO: Implement version loading logic
    toast.success(`Loading version ${versionId}...`);
  }, []);

  const handlePublish = useCallback((publishData: any) => {
    console.log('Publishing workflow:', publishData);
    // TODO: Implement publish logic
    toast.success(`Workflow published as v${publishData.version}`);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <WorkflowHeader
        workflowName={workflowName}
        setWorkflowName={setWorkflowName}
        isActive={isActive}
        setIsActive={setIsActive}
        onSave={saveWorkflow}
        onExecute={executeWorkflow}
        onReset={handleResetWorkflow}
        onOpenRuns={handleOpenRuns}
        onOpenVersions={handleOpenVersions}
        onOpenPublish={handleOpenPublish}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1">
          <SimpleWorkflowCanvas
            nodes={nodes}
            selectedNodeId={selectedNode?.id}
            onSelectNode={handleNodeSelection}
            onNodeClick={onNodeClick}
            onOpenTriggerModal={() => setShowTriggerModal(true)}
            onOpenActionModal={openActionModal}
            onInsertNode={handleNodeInsertion}
            onDeleteNode={handleNodeDeletion}
            onReplaceTrigger={handleReplaceTrigger}
            onOpenTriggerConfig={handleOpenTriggerConfig}
            zoomLevel={zoomLevel}
          />
        </div>

        {/* Zoom Controls - Bottom Left */}
        <div className="absolute bottom-4 left-4 z-50">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 space-y-2">
            {/* Zoom In */}
            <button
              onClick={handleZoomIn}
              disabled={isLocked || zoomLevel >= 200}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Zoom In"
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </button>

            {/* Zoom Out */}
            <button
              onClick={handleZoomOut}
              disabled={isLocked || zoomLevel <= 25}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Zoom Out"
            >
              <Minus className="w-4 h-4 text-gray-600" />
            </button>

            {/* Fit to Screen */}
            <button
              onClick={handleFitToScreen}
              disabled={isLocked}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Fit to Screen"
            >
              <RotateCcw className="w-4 h-4 text-gray-600" />
            </button>

            {/* Lock/Unlock */}
            <button
              onClick={handleToggleLock}
              className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                isLocked
                  ? 'bg-red-100 hover:bg-red-200 text-red-600'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              title={isLocked ? "Unlock Controls" : "Lock Controls"}
            >
              {isLocked ? (
                <Lock className="w-4 h-4" />
              ) : (
                <Unlock className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

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
              />
            </div>
          </div>
        )}
      </div>

      {/* Trigger Category Modal */}
      <TriggerCategoryModal
        isOpen={showTriggerModal}
        onClose={() => setShowTriggerModal(false)}
        onSelectTrigger={handleTriggerSelection}
      />

      {/* Action Category Modal */}
      <ActionCategoryModal
        isOpen={showActionModal}
        onClose={() => {
          setShowActionModal(false);
          setActionInsertIndex(null);
        }}
        onSelectAction={handleActionSelection}
      />

      {/* Slide-out Panels */}
      <RunsPanel
        isOpen={activePanel === 'runs'}
        onClose={handleClosePanel}
      />

      <VersionsPanel
        isOpen={activePanel === 'versions'}
        onClose={handleClosePanel}
        onLoadVersion={handleLoadVersion}
      />

      <PublishPanel
        isOpen={activePanel === 'publish'}
        onClose={handleClosePanel}
        onPublish={handlePublish}
      />
    </div>
  );
};
