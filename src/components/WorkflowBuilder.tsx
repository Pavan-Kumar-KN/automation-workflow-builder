
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
    edges,
    setNodes,
    setEdges,
  } = useWorkflowStore();

  const { executeWorkflow, saveWorkflow } = useWorkflowActions();

  // Modal states
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionInsertIndex, setActionInsertIndex] = useState<number | null>(null);
  // Removed isReplacementMode - simplified approach

  // Panel states - only one panel can be open at a time
  const [activePanel, setActivePanel] = useState<'runs' | 'versions' | 'publish' | null>(null);

  // State for condition branch management
  const [conditionBranchInfo, setConditionBranchInfo] = useState<{
    conditionNodeId: string;
    branchType: 'yes' | 'no';
  } | null>(null);



  // JSON generation (auto-updates on node changes)
  const { generateJSON } = useWorkflowJSON();

  // Debug: Log JSON when nodes change (for development)
  useEffect(() => {
    if (nodes.length > 0) {
      const json = generateJSON();
      // console.log('🔄 Current Workflow JSON:', json);
    }
  }, [nodes.length, generateJSON]);

  // Open action modal for insertion
  const openActionModal = useCallback((insertIndex?: number) => {
    setActionInsertIndex(insertIndex ?? null);
    setShowActionModal(true);
  }, []);

  // Handle condition node deletion
  const handleConditionNodeDeletion = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter(node => node.id !== nodeId));

    setEdges((eds) => {
      // Remove all edges connected to this condition node
      const newEdges = eds.filter(edge =>
        edge.source !== nodeId && edge.target !== nodeId
      );

      // Find the edge that was pointing to this condition node
      const incomingEdge = eds.find(edge => edge.target === nodeId);

      if (incomingEdge) {
        // Reconnect the previous node to virtual-end
        newEdges.push({
          id: `edge-${incomingEdge.source}-virtual-end`,
          source: incomingEdge.source,
          target: 'virtual-end',
          type: 'flowEdge',
          data: {
            onOpenActionModal: (insertIndex: number) => {
              console.log('🔍 Plus button clicked after condition deletion');
              setShowActionModal(true);
            },
          },
        });
      }

      return newEdges;
    });

    toast.success('Condition node deleted!');
  }, [setNodes, setEdges, setShowActionModal]);

  // Simple node addition handler
  const handleNodeSelection = useCallback((nodeType: string, nodeData: NodeData) => {
    const isConditionNode = nodeType === 'condition';

    const newNode: Node = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position: { x: 0, y: 0 }, // Position doesn't matter in our simple layout
      data: {
        ...nodeData,
        label: nodeData.label,
        openTriggerModal: nodeType === 'trigger' ? () => setShowTriggerModal(true) : undefined,
        isConfigured: false,
        onDelete: isConditionNode ? () => {
          console.log('🗑️ Deleting condition node:', newNode.id);
          handleConditionNodeDeletion(newNode.id);
        } : undefined,
      },
    };

    setNodes((nds) => {
      const newNodes = [...nds, newNode];
      const nodeIndex = newNodes.length - 1;

      // Create edge from previous node to new node
      if (nds.length > 0) {
        const previousNode = nds[nds.length - 1];
        const newEdge = {
          id: `edge-${previousNode.id}-${newNode.id}`,
          source: previousNode.id,
          target: newNode.id,
          type: 'flowEdge',
          data: {
            onOpenActionModal: (insertIndex: number) => {
              console.log('🔍 Plus button clicked from edge, insertIndex:', insertIndex);
              openActionModal(insertIndex);
            },
            index: nodeIndex - 1, // This will be the insert index
          },
        };

        // Find and remove any existing edge to the end node
        setEdges((eds) => {
          console.log('🔍 Setting edges, isConditionNode:', isConditionNode);
          const newEdges = eds.filter(edge => !(edge.target === 'virtual-end'));

          // Add the new edge between previous node and new node
          newEdges.push(newEdge);
          console.log('🔍 Added edge between nodes, about to check condition logic');

          // Handle condition node - create Yes/No branches with placeholder nodes
          if (isConditionNode) {
         


            // Add placeholder nodes to the workflow
            // setNodes((nds) => [...nds, yesPlaceholder, noPlaceholder]);

          } else {
            // Regular node: Add edge from new node to end node
            newEdges.push({
              id: `edge-${newNode.id}-virtual-end`,
              source: newNode.id,
              target: 'virtual-end',
              type: 'flowEdge',
              animated: false,
              data: {
                onOpenActionModal: (insertIndex: number) => {
                  console.log('🔍 Plus button clicked from edge to end, insertIndex:', insertIndex);
                  openActionModal(nodeIndex);
                },
                index: nodeIndex, // This will be the insert index
              },
            });
          }

          console.log('🔍 Final edges after condition logic:', newEdges);
          return newEdges;
        });
      }

      return newNodes;
    });
    toast.success(`${nodeData.label} added to workflow!`);
  }, [setNodes, setEdges, openActionModal]);

  // Handle node insertion between existing nodes
  const handleNodeInsertion = useCallback((afterNodeIndex: number, nodeType: string, nodeData: NodeData) => {
    console.log('🔍 handleNodeInsertion called with:', { afterNodeIndex, nodeType, nodeData });

    // Check if this is a condition node (either by nodeType or nodeData.type)
    const isConditionNode = nodeType === 'condition' || nodeData.type === 'condition';
    console.log('🔍 isConditionNode in insertion:', isConditionNode);

    const actualNodeType = isConditionNode ? 'condition' : nodeType;
    const actualNodeData = isConditionNode ? {
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
      if (isConditionNode && nextNode && nextNode.type === 'condition') {
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

        if (isConditionNode && nextNode && nextNode.type === 'condition') {
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
              type: 'flowEdge',
              animated: false,
              data: {
                onOpenActionModal: (insertIndex: number) => {
                  console.log('🔍 Plus button clicked from edge, insertIndex:', insertIndex);
                  openActionModal(insertIndex);
                },
                index: afterNodeIndex, // This will be the insert index
              },
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
              type: 'flowEdge',
              animated: false,
              data: {
                onOpenActionModal: (insertIndex: number) => {
                  console.log('🔍 Plus button clicked from edge, insertIndex:', insertIndex);
                  openActionModal(insertIndex);
                },
                index: afterNodeIndex + 1, // This will be the insert index
              },
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
              type: 'flowEdge',
              animated: false,
              data: {
                onOpenActionModal: (insertIndex: number) => {
                  console.log('🔍 Plus button clicked from edge, insertIndex:', insertIndex);
                  openActionModal(insertIndex);
                },
                index: afterNodeIndex, // This will be the insert index
              },
            });
          }

          // Add edge from new node to next
          if (nextNode) {
            if (isConditionNode) {
              // For condition nodes, create Yes/No branches directly to the next node
              newEdges.push({
                id: `edge-${newNode.id}-yes`,
                source: newNode.id,
                sourceHandle: 'yes',
                target: nextNode.id,
                type: 'condition',
                animated: false,
                data: {
                  branchType: 'yes',
                },
                label: 'Yes'
              });

              newEdges.push({
                id: `edge-${newNode.id}-no`,
                source: newNode.id,
                sourceHandle: 'no',
                target: nextNode.id,
                type: 'condition',
                animated: false,
                data: {
                  branchType: 'no',
                },
                label: 'No'
              });
            } else {
              // Regular edge for non-condition nodes
              newEdges.push({
                id: `edge-${newNode.id}-${nextNode.id}`,
                source: newNode.id,
                target: nextNode.id,
                type: 'flowEdge',
                animated: false,
                data: {
                  onOpenActionModal: (insertIndex: number) => {
                    console.log('🔍 Plus button clicked from edge, insertIndex:', insertIndex);
                    openActionModal(insertIndex);
                  },
                  index: afterNodeIndex + 1, // This will be the insert index
                },
              });
            }
          }
        }

        return newEdges;
      });

      return newNodes;
    });
    toast.success(`${nodeData.label} inserted into workflow!`);
  }, [setNodes, setEdges, openActionModal]);

  // Simplified action selection handler
  const handleActionSelection = useCallback((action: NodeData) => {
    console.log('Action selected:', action);
    console.log('Action type:', action.type);
    console.log('Is condition?', action.type === 'condition');

    // Check if this is for a condition branch
    if (conditionBranchInfo) {
      console.log('🔀 Adding action to condition branch:', conditionBranchInfo);

      // Create new action node for the branch
      const newActionNode: Node = {
        id: `action-${Date.now()}`,
        type: action.type === 'condition' ? 'condition' : 'action',
        position: { x: 0, y: 0 },
        data: {
          ...action,
          label: action.label,
          isConfigured: false,
          onDelete: action.type === 'condition' ? () => {
            console.log('🗑️ Deleting nested condition node');
            handleConditionNodeDeletion(newActionNode.id);
          } : undefined,
        },
      };

      setNodes((nds) => [...nds, newActionNode]);

      // Update the condition edge to point to the new action node
      setEdges((eds) => {
        const newEdges = eds.map(edge => {
          if (edge.source === conditionBranchInfo.conditionNodeId &&
              edge.data?.branchType === conditionBranchInfo.branchType) {
            return {
              ...edge,
              target: newActionNode.id,
            };
          }
          return edge;
        });

        // Add edge from new action to end node (or create branches if condition)
        if (action.type === 'condition') {
          // Create Yes/No branches for nested condition
          newEdges.push({
            id: `edge-${newActionNode.id}-yes`,
            source: newActionNode.id,
            sourceHandle: 'yes',
            target: 'virtual-end',
            type: 'condition',
            data: {
              branchType: 'yes',
              onAddNode: (branchType: string) => {
                console.log(`🔀 Adding node to ${branchType} branch from nested condition`);
                setConditionBranchInfo({
                  conditionNodeId: newActionNode.id,
                  branchType: branchType as 'yes' | 'no'
                });
                setShowActionModal(true);
              },
            },
            label: 'Yes'
          });

          newEdges.push({
            id: `edge-${newActionNode.id}-no`,
            source: newActionNode.id,
            sourceHandle: 'no',
            target: 'virtual-end',
            type: 'condition',
            data: {
              branchType: 'no',
              onAddNode: (branchType: string) => {
                console.log(`🔀 Adding node to ${branchType} branch from nested condition`);
                setConditionBranchInfo({
                  conditionNodeId: newActionNode.id,
                  branchType: branchType as 'yes' | 'no'
                });
                setShowActionModal(true);
              },
            },
            label: 'No'
          });
        } else {
          // Regular action edge
          newEdges.push({
            id: `edge-${newActionNode.id}-virtual-end`,
            source: newActionNode.id,
            target: 'virtual-end',
            type: 'flowEdge',
            data: {
              onOpenActionModal: () => {
                console.log('🔍 Plus button clicked from branch action');
                setShowActionModal(true);
              },
            },
          });
        }

        return newEdges;
      });

      // Clear condition branch info
      setConditionBranchInfo(null);
      toast.success(`${action.label} added to ${conditionBranchInfo.branchType} branch!`);
    } else {
      // Regular action addition
      if (actionInsertIndex !== null) {
        handleNodeInsertion(actionInsertIndex, action.type || 'action', action);
        setActionInsertIndex(null);
      } else {
        // Default: add to end of workflow
        console.log('🔍 About to call handleNodeSelection with:', action.type || 'action', action);
        handleNodeSelection(action.type || 'action', action);
      }
    }

    setShowActionModal(false);
  }, [actionInsertIndex, conditionBranchInfo, handleNodeInsertion, handleNodeSelection, handleConditionNodeDeletion, setNodes, setEdges, setConditionBranchInfo]);

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
        const newEdges = eds.filter(edge =>
          edge.source !== nodeToDelete.id && edge.target !== nodeToDelete.id
        );

        // If there are previous and next nodes, connect them
        if (previousNode && nextNode) {
          newEdges.push({
            id: `edge-${previousNode.id}-${nextNode.id}`,
            source: previousNode.id,
            target: nextNode.id,
            type: 'flowEdge',
            animated: false,
            data: {
              onOpenActionModal: (insertIndex: number) => {
                console.log('🔍 Plus button clicked from edge, insertIndex:', insertIndex);
                openActionModal(insertIndex);
              },
              index: nodeIndex - 1, // This will be the insert index
            },
          });
        }

        return newEdges;
      });

      return newNodes;
    });
  }, [setNodes, setEdges, openActionModal]);

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

  // Simplified handlers - removed complex branch logi

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

  const handlePublish = useCallback((publishData: {
    version: string;
    name: string;
    description: string;
    isPublic: boolean;
    environment: 'development' | 'staging' | 'production';
    autoActivate: boolean;
    releaseNotes: string;
  }) => {
    console.log('Publishing workflow:', publishData);
    // TODO: Implement publish logic
    toast.success(`Workflow published as v${publishData.version}`);
  }, []);





  // Fix for the useEffect in WorkflowBuilder component
useEffect(() => {
  // Initialize with default trigger node if empty
  const defaultTriggerNode = {
    id: 'trigger-default',
    type: 'trigger',
    position: { x: 100, y: 100 }, // Start with some padding from edges
    data: {
      label: 'Select Trigger',
      icon: 'Zap',
      description: 'Empty Trigger',
      isConfigured: false,
      openTriggerModal: () => setShowTriggerModal(true),
    },
  };

  const endNode = {
    id: 'virtual-end',
    type: 'end',
    position: { x: 600, y: 10 }, // Increased spacing - 300px apart
    data: {
      label: 'End',
      id: 'end',
    },
  };

  setNodes([defaultTriggerNode, endNode]);

  // Set initial edge with proper data structure
  const initialEdge = {
    id: 'default-edge',
    source: defaultTriggerNode.id,
    target: 'virtual-end',
    type: 'flowEdge',
    animated: false,
    data: {
      onOpenActionModal: (insertIndex: number) => {
        console.log('🔍 Plus button clicked from edge, insertIndex:', insertIndex);
        openActionModal(insertIndex);
      },
      index: 0, // This will be the insert index
    },
  };

  console.log('🔍 Initial edge created:', initialEdge);
  setEdges([initialEdge]);
}, [setNodes, setEdges, openActionModal]);




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
            edges={edges}
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
              className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${isLocked
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
