
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Node } from '@xyflow/react';
import { RotateCcw, Plus, Minus, Lock, Unlock } from 'lucide-react';

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
  const [isReplacementMode, setIsReplacementMode] = useState(false);

  // Panel states - only one panel can be open at a time
  const [activePanel, setActivePanel] = useState<'runs' | 'versions' | 'publish' | null>(null);

  // Branch context for conditional nodes
  const [branchContext, setBranchContext] = useState<{
    conditionNodeIndex: number;
    branchType: 'branch1' | 'otherwise';
    insertIndex?: number;
    isReplacement?: boolean; // Flag to distinguish replacement from insertion
  } | null>(null);
  const [insertAfterIndex, setInsertAfterIndex] = useState<number | null>(null);

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
    // Check if this is an evaluate condition action - auto-create router node
    const isEvaluateCondition = nodeData.id && (
      nodeData.id.includes('contact-updated-action') ||
      nodeData.id.includes('evaluate') ||
      nodeData.description?.toLowerCase().includes('conditional logic')
    );

    const actualNodeType = isEvaluateCondition ? 'condition' : nodeType;
    const actualNodeData = isEvaluateCondition ? {
      ...nodeData,
      branchNodes: { branch1: [], otherwise: [] },
      isConfigured: false
    } : nodeData;

    const newNode: Node = {
      id: `${actualNodeType}-${Date.now()}`,
      type: actualNodeType,
      position: { x: 0, y: 0 },
      data: {
        ...actualNodeData,
        label: nodeData.label,
        openTriggerModal: actualNodeType === 'trigger' ? () => setShowTriggerModal(true) : undefined,
        isConfigured: false,
      },
    };

    setNodes((nds) => {
      const newNodes = [...nds];
      const previousNode = newNodes[afterNodeIndex];
      const nextNode = newNodes[afterNodeIndex + 1];

      // Special case: If new node is conditional and next node is also conditional,
      // move the next conditional node into the new conditional node's "Yes" branch
      if (isEvaluateCondition && nextNode && nextNode.type === 'condition') {
        // Create the new conditional node with the next conditional node as a sub-branch
        const newConditionalNode: Node = {
          ...newNode,
          data: {
            ...newNode.data,
            branchNodes: {
              branch1: [{
                id: nextNode.id,
                type: nextNode.type,
                data: nextNode.data
              }],
              otherwise: []
            }
          }
        };

        // Replace the next node with the new conditional node
        newNodes[afterNodeIndex + 1] = newConditionalNode;

        // Remove the original next node since it's now a sub-branch
        // (We're not inserting a new node, we're replacing the next node)
      } else {
        // Regular insertion
        newNodes.splice(afterNodeIndex + 1, 0, newNode);
      }

      // Update edges: remove old edge and create new ones
      setEdges((eds) => {
        let newEdges = [...eds];

        if (isEvaluateCondition && nextNode && nextNode.type === 'condition') {
          // Sub-branch case: Remove edge from previous to next, add edge from previous to new conditional
          if (previousNode && nextNode) {
            newEdges = newEdges.filter(edge =>
              !(edge.source === previousNode.id && edge.target === nextNode.id)
            );
          }

          // Add edge from previous to new conditional node (which now contains the old conditional as sub-branch)
          if (previousNode) {
            newEdges.push({
              id: `edge-${previousNode.id}-${newNode.id}`,
              source: previousNode.id,
              target: newNode.id,
              type: 'smoothstep',
              animated: false,
            });
          }

          // Find the node after the original next node for continuation
          const nodeAfterNext = newNodes[afterNodeIndex + 2];
          if (nodeAfterNext) {
            // Add edge from new conditional to the node after the original next node
            newEdges.push({
              id: `edge-${newNode.id}-${nodeAfterNext.id}`,
              source: newNode.id,
              target: nodeAfterNext.id,
              type: 'smoothstep',
              animated: false,
            });
          }
        } else {
          // Regular insertion case
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
        }

        return newEdges;
      });

      return newNodes;
    });
    toast.success(`${nodeData.label} inserted into workflow!`);
  }, [setNodes, setEdges]);

  // Add node to a specific branch of a conditional node
  const handleAddNodeToBranch = useCallback((conditionNodeIndex: number, branchType: 'branch1' | 'otherwise', action: NodeData, insertIndex?: number, isReplacement?: boolean) => {
    setNodes(prev => prev.map((node, index) => {
      if (index === conditionNodeIndex && node.type === 'condition') {
        const branchNodes = (node.data as any).branchNodes || { branch1: [], otherwise: [] };

        // For branch nodes, always create as 'action' type, even if it's an evaluate condition
        // This allows each branch node to have its own specific configuration
        const nodeType = 'action';
        const nodeData = action; // Use the action data directly

        const newBranchNode = {
          id: `branch-${Date.now()}-${Math.random()}`,
          type: nodeType, // Always 'action' for branch nodes
          data: {
            ...nodeData,
            // Ensure the data.id matches the action's ID for proper configuration
            id: action.id,
            isConfigured: false // Mark as unconfigured initially
          },
        };

        const targetBranch = branchType === 'branch1' ? branchNodes.branch1 : branchNodes.otherwise;
        const newBranch = [...targetBranch];

        // Handle insertion vs replacement
        console.log(`WorkflowBuilder: insertIndex=${insertIndex}, targetBranch length=${targetBranch.length}, isReplacement=${isReplacement}`);
        if (insertIndex !== undefined && insertIndex >= 0) {
          if (isReplacement) {
            // Replace existing node at the specified index
            console.log(`Replacing node at index ${insertIndex}`);
            newBranch[insertIndex] = newBranchNode; // Replace existing node
          } else {
            // Insert new node at the specified index (plus button clicks)
            console.log(`Inserting at index ${insertIndex}`);
            newBranch.splice(insertIndex, 0, newBranchNode); // Insert new node
          }
        } else {
          console.log(`Pushing to end`);
          newBranch.push(newBranchNode);
        }
        console.log(`New branch length: ${newBranch.length}`);

        return {
          ...node,
          data: {
            ...node.data,
            branchNodes: {
              branch1: branchType === 'branch1' ? newBranch : branchNodes.branch1,
              otherwise: branchType === 'otherwise' ? newBranch : branchNodes.otherwise,
            },
          },
        };
      }
      return node;
    }));

    toast.success(`${action.label} added to ${branchType === 'branch1' ? 'Branch 1' : 'Otherwise'} branch!`);
  }, [setNodes]);

  // Handle action selection from modal
  const handleActionSelection = useCallback((action: NodeData) => {
    // Check if this is an evaluate condition action - auto-create router node
    const isEvaluateCondition = action.id && (
      action.id.includes('contact-updated-action') ||
      action.id.includes('evaluate') ||
      // Add other evaluate condition action IDs here
      action.description?.toLowerCase().includes('conditional logic')
    );

    // For evaluate conditions, create router node with the action's properties
    const nodeType = isEvaluateCondition ? 'condition' : 'action';
    const nodeData = isEvaluateCondition ? {
      ...action,
      // Router node gets the action's properties but as a condition type
      branchNodes: { branch1: [], otherwise: [] }, // Initialize empty branches
      isConfigured: false // Mark as unconfigured initially
    } : action;

    if (branchContext) {
      // Adding node to a branch of a conditional node
      handleAddNodeToBranch(branchContext.conditionNodeIndex, branchContext.branchType, action, branchContext.insertIndex, branchContext.isReplacement);
      setBranchContext(null);
    } else if (actionInsertIndex !== null) {
      // Check if this is a router replacement (only when explicitly in replacement mode)
      if (isReplacementMode) {
        // Replace the router node with the new action/router while preserving branch nodes
        setNodes(prev => prev.map((node, index) => {
          if (index === actionInsertIndex) {
            return {
              ...node,
              type: nodeType,
              data: {
                ...nodeData,
                // Preserve existing branch nodes when replacing router
                branchNodes: (node.data as any).branchNodes || (isEvaluateCondition ? { branch1: [], otherwise: [] } : undefined)
              }
            };
          }
          return node;
        }));
        toast.success(`Router replaced with ${action.label}!`);
      } else {
        // Regular node insertion (even after conditional nodes)
        handleNodeInsertion(actionInsertIndex, nodeType, nodeData);
      }
      setActionInsertIndex(null);
      setIsReplacementMode(false); // Reset replacement mode
    } else {
      handleNodeSelection(nodeType, nodeData);
    }
    setShowActionModal(false);
  }, [branchContext, actionInsertIndex, isReplacementMode, handleNodeInsertion, handleNodeSelection, handleAddNodeToBranch, nodes, setNodes, setIsReplacementMode]);

  // Open action modal for insertion
  const openActionModal = useCallback((insertIndex?: number) => {
    setActionInsertIndex(insertIndex ?? null);
    setIsReplacementMode(false); // This is insertion, not replacement
    setShowActionModal(true);
  }, [setIsReplacementMode]);

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
    console.log('onNodeClick called with node:', node.id, node.type);
    // Don't open config panel for default trigger
    const isDefaultTrigger = node.data?.id === 'trigger-default' || node.data?.label === 'Select Trigger';

    if (!isDefaultTrigger) {
      console.log('Setting selectedNode to:', node.id);
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

  // Branch node handlers
  const handleAddBranchNode = useCallback((conditionNodeIndex: number, branchType: 'branch1' | 'otherwise', insertIndex?: number) => {
    console.log(`Adding branch node to condition ${conditionNodeIndex}, branch: ${branchType}, insertIndex: ${insertIndex}`);
    // Store the context for when action modal closes
    setInsertAfterIndex(conditionNodeIndex);
    setBranchContext({ conditionNodeIndex, branchType, insertIndex });
    setShowActionModal(true);
  }, [setInsertAfterIndex, setShowActionModal]);

  const handleBranchNodeClick = useCallback((conditionNodeIndex: number, branchType: 'branch1' | 'otherwise', nodeIndex: number, branchNode: any) => {
    console.log(`Branch node clicked: condition ${conditionNodeIndex}, branch: ${branchType}, node: ${nodeIndex}`, branchNode);


    console.log("The branch data is : " , branchNode.data);
    // Create a proper Node object for the branch node configuration
    const branchNodeForConfig: Node = {
      id: branchNode.id,
      type: branchNode.type,
      position: { x: 0, y: 0 }, // Dummy position since branch nodes don't need positioning
      data: branchNode.data
    };

    // Always open configuration panel for branch nodes (treat them like action/trigger nodes)
    // This makes conditional nodes scalable and consistent with other node types

    setSelectedNode(branchNodeForConfig);
    console.log('Opening config for branch node:', branchNodeForConfig);
  }, [setSelectedNode]);


  
  console.log("The selected node is: " , selectedNode?.id);

  const handleDeleteBranchNode = useCallback((conditionNodeIndex: number, branchType: 'branch1' | 'otherwise', nodeIndex: number) => {
    console.log(`Deleting branch node: condition ${conditionNodeIndex}, branch: ${branchType}, node: ${nodeIndex}`);
    setNodes(prev => prev.map((node, index) => {
      if (index === conditionNodeIndex && node.type === 'condition') {
        const branchNodes = (node.data as any).branchNodes || { branch1: [], otherwise: [] };
        const updatedBranchNodes = { ...branchNodes };

        // Remove the node from the specified branch
        if (branchType === 'branch1') {
          updatedBranchNodes.branch1 = updatedBranchNodes.branch1.filter((_, idx) => idx !== nodeIndex);
        } else {
          updatedBranchNodes.otherwise = updatedBranchNodes.otherwise.filter((_, idx) => idx !== nodeIndex);
        }

        return {
          ...node,
          data: {
            ...node.data,
            branchNodes: updatedBranchNodes
          }
        };
      }
      return node;
    }));
    toast.success('Branch node deleted!');
  }, [setNodes]);

  // Handle router node click for configuration
  const handleRouterClick = useCallback((conditionNodeIndex: number) => {
    console.log(`Router node clicked: condition ${conditionNodeIndex}`);
    const conditionNode = nodes[conditionNodeIndex];
    if (conditionNode && conditionNode.type === 'condition') {
      // Open configuration panel for the router node
      setSelectedNode(conditionNode);
    }
  }, [nodes, setSelectedNode]);

  // Handle replace router functionality
  const handleReplaceRouter = useCallback((conditionNodeIndex: number) => {
    console.log(`Replace router clicked: condition ${conditionNodeIndex}`);
    // Store the context for when action modal closes
    setActionInsertIndex(conditionNodeIndex); // Use actionInsertIndex for replacement
    setIsReplacementMode(true); // Flag this as replacement, not insertion
    setBranchContext(null); // Clear branch context since this is router replacement
    setShowActionModal(true);
  }, [setActionInsertIndex, setIsReplacementMode, setShowActionModal]);

  // Handle replace branch node functionality
  const handleReplaceBranchNode = useCallback((conditionNodeIndex: number, branchType: 'branch1' | 'otherwise', nodeIndex: number) => {
    console.log(`Replace branch node clicked: condition ${conditionNodeIndex}, branch: ${branchType}, node: ${nodeIndex}`);
    // Store the context for when action modal closes - this will replace the specific branch node
    setBranchContext({ conditionNodeIndex, branchType, insertIndex: nodeIndex, isReplacement: true });
    setShowActionModal(true);
  }, [setShowActionModal]);

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
            onAddBranchNode={handleAddBranchNode}
            onBranchNodeClick={handleBranchNodeClick}
            onDeleteBranchNode={handleDeleteBranchNode}
            onReplaceBranchNode={handleReplaceBranchNode}
            onRouterClick={handleRouterClick}
            onReplaceRouter={handleReplaceRouter}
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
