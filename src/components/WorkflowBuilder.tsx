
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Node } from '@xyflow/react';
// Removed unused zoom control icons - using React Flow controls now

import { NodeConfigPanel } from './node-config/NodeConfigPanel';
import { WorkflowHeader } from './WorkflowHeader';
import { TriggerCategoryModal } from './TriggerCategoryModal';
import { ActionCategoryModal } from './ActionCategoryModal';
import { BranchSelectionModal } from './modals/BranchSelectionModal';
import { RunsPanel } from './panels/RunsPanel';
import { VersionsPanel } from './panels/VersionsPanel';
import { PublishPanel } from './panels/PublishPanel';
import { useWorkflowStore } from '@/hooks/useWorkflowState';
import { useWorkflowActions } from '@/hooks/useWorkflowActions';
import { useWorkflowJSON } from '@/hooks/useWorkflowJSON';
import { useCopyPaste } from '@/hooks/useCopyPaste';
import { useGraphCutPaste } from '@/hooks/useGraphCutPaste';
import { useWorkflowGraph } from '@/hooks/useWorkflowGraph';
import { NodeData } from '@/data/types';
import { toast } from 'sonner';
import { WorkFlowCanvas } from './WorkFlowCanvas';
import { getLayoutedElements } from '@/utils/dagreFunction';

export const WorkflowBuilder = () => {
  const {
    selectedNode,
    setSelectedNode,
    workflowName,
    setWorkflowName,
    isActive,
    setIsActive,
    layoutDirection,
    setLayoutDirection,
    nodes,
    edges,
    setNodes,
    setEdges,
  } = useWorkflowStore();

  const { executeWorkflow, saveWorkflow } = useWorkflowActions();

  const nodeWidth = 280;
  const nodeHeight = 60;

  // Helper functions for nested branch management
  const createBranchPath = useCallback((parentPath: string | undefined, conditionId: string, branchType: 'yes' | 'no'): string => {
    if (!parentPath) return `${conditionId}.${branchType}`;
    return `${parentPath}.${conditionId}.${branchType}`;
  }, []);

  const parseBranchPath = useCallback((branchPath: string) => {
    const parts = branchPath.split('.');
    const conditions = [];
    for (let i = 0; i < parts.length; i += 2) {
      if (parts[i] && parts[i + 1]) {
        conditions.push({
          conditionId: parts[i],
          branchType: parts[i + 1] as 'yes' | 'no'
        });
      }
    }
    return conditions;
  }, []);

  const getParentConditions = useCallback((branchPath: string): string[] => {
    const conditions = parseBranchPath(branchPath);
    return conditions.map(c => c.conditionId);
  }, [parseBranchPath]);

  const getBranchLevel = useCallback((branchPath: string): number => {
    return parseBranchPath(branchPath).length;
  }, [parseBranchPath]);

  const createGhostNodeId = useCallback((branchPath: string): string => {
    return `ghost-${branchPath.replace(/\./g, '-')}`;
  }, []);

  // Modal states
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionInsertIndex, setActionInsertIndex] = useState<number | null>(null);

  // Branch selection modal state for conditional copy-paste
  const [showBranchSelectionModal, setShowBranchSelectionModal] = useState(false);
  const [pendingConditionalPaste, setPendingConditionalPaste] = useState<{
    insertIndex: number;
    aboveNodeId: string;
    belowNodeId: string;
    downstreamNodeCount: number;
  } | null>(null);


  // Removed isReplacementMode - simplified approach

  // Panel states - only one panel can be open at a time
  const [activePanel, setActivePanel] = useState<'runs' | 'versions' | 'publish' | null>(null);

  // Enhanced state for nested condition branch management
  const [conditionBranchInfo, setConditionBranchInfo] = useState<{
    conditionNodeId: string;
    branchType: 'yes' | 'no';
    placeholderNodeId: string;
    insertionIndex?: number;
    branchPath?: string; // e.g., "condition1.yes.condition2.no" for nested tracking
    level?: number; // Nesting level (0 = root, 1 = first level, etc.)
    parentConditions?: string[]; // Array of parent condition IDs for context
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
    console.log('🔍 openActionModal called with insertIndex:', insertIndex);
    // Get current nodes from store to avoid dependency loop
    const currentNodes = useWorkflowStore.getState().nodes;
    console.log('🔍 Current nodes:', currentNodes.map((n, i) => `${i}: ${n.id} (${n.data?.label || n.type})`));

    // Filter to get flow nodes only (like in useWorkflowGraph)
    const flowNodes = currentNodes.filter(node =>
      node.type !== 'placeholder' &&
      node.id !== 'virtual-end' &&
      !node.id.startsWith('placeholder-')
    );
    console.log('🔍 Flow nodes:', flowNodes.map((n, i) => `${i}: ${n.id} (${n.data?.label || n.type})`));
    console.log('🔍 Will insert after flow node at index:', insertIndex);

    setActionInsertIndex(insertIndex ?? null);
    setShowActionModal(true);
  }, []);

  // Handle conditional paste request
  const handleConditionalPasteRequest = useCallback((insertIndex: number, aboveNodeId: string, belowNodeId: string, downstreamCount: number) => {
    setPendingConditionalPaste({
      insertIndex,
      aboveNodeId,
      belowNodeId,
      downstreamNodeCount: downstreamCount
    });
    setShowBranchSelectionModal(true);
  }, []);

  // Initialize copy-paste functionality with openActionModal and conditional paste callback
  const { clearCopyState, isCopy, pasteConditionalFlow } = useCopyPaste(openActionModal, handleConditionalPasteRequest);

  // Initialize graph-based cut-paste functionality
  const { clearCutState, isCut } = useGraphCutPaste(openActionModal);

  // Graph-based operations
  const {
    deleteNodeSubtree,
    deleteSingleNode,
    deleteConditionalBranchNode,
    addConditionalNodeAtEnd,
    insertNodeAfter,
    insertNodeByIndex,
    getDownstreamNodes,
    cutNode: graphCutNode,
    cutFlowFromNode: graphCutFlowFromNode,
    pasteNodes: graphPasteNodes
  } = useWorkflowGraph();

  // Fix edges after copy-paste operations (like duplication does)
  useEffect(() => {
    setEdges(currentEdges => {
      return currentEdges.map((edge, edgeIndex) => {
        // Fix ALL flowEdge type edges that don't have proper onOpenActionModal
        if (edge.type === 'flowEdge' && (!edge.data?.onOpenActionModal || edge.data.onOpenActionModal.toString().includes('Plus clicked:'))) {
          // Use the existing index if available, otherwise calculate it
          let insertIndex = edge.data?.index;

          if (insertIndex === undefined || insertIndex === null) {
            // Calculate the correct index based on the edge's position in the workflow
            const sourceNode = nodes.find(n => n.id === edge.source);
            if (sourceNode) {
              const sourceIndex = nodes.findIndex(n => n.id === sourceNode.id);
              insertIndex = sourceIndex >= 0 ? sourceIndex + 1 : edgeIndex;
            } else {
              insertIndex = edgeIndex;
            }
          }

          console.log('🔍 Fixing edge:', edge.id, 'using insertIndex:', insertIndex);

          return {
            ...edge,
            data: {
              ...edge.data,
              // Use the SAME pattern as duplication - direct function reference
              onOpenActionModal: (clickedIndex: number) => {
                console.log('🔍 Plus clicked from fixed edge:', edge.id, 'using stored insertIndex:', insertIndex);
                openActionModal(insertIndex); // Use the stored insertIndex, not the clicked one
              },
              // Preserve the calculated index
              index: insertIndex
            }
          };
        }
        return edge;
      });
    });
  }, [edges.length, nodes.length, openActionModal]); // Run when edges or nodes change

  // Handle branch selection for conditional paste
  const handleBranchSelection = useCallback((selectedBranch: 'yes' | 'no') => {
    if (pendingConditionalPaste) {
      pasteConditionalFlow(
        pendingConditionalPaste.insertIndex,
        pendingConditionalPaste.aboveNodeId,
        pendingConditionalPaste.belowNodeId,
        selectedBranch
      );
      setPendingConditionalPaste(null);
    }
    setShowBranchSelectionModal(false);
  }, [pendingConditionalPaste, pasteConditionalFlow]);



  const handleNodeDeletion = useCallback((nodeId: string | number) => {
    const nodeIdStr = String(nodeId);

    if (nodeIdStr === 'virtual-end' || nodeIdStr.startsWith('trigger-')) {
      return;
    }

    console.log('🔍 Graph-based single node deletion:', nodeIdStr);

    // Check if the node being deleted is currently selected and close config panel
    if (selectedNode && selectedNode.id === nodeIdStr) {
      console.log('🔍 Closing config panel for deleted node:', nodeIdStr);
      setSelectedNode(null);
    }

    // Use deleteSingleNode for regular nodes (only deletes the node, not the entire subtree)
    deleteSingleNode(nodeIdStr);

    toast.success('Node deleted successfully!');
    console.log('✅ Single node deleted successfully using graph operations');
  }, [deleteSingleNode, selectedNode, setSelectedNode]);
  // Placeholder for condition deletion functions - will be defined after handleAddNodeToBranch

  // Handle replacement of condition node (keeps branches, replaces condition)
  const handleConditionNodeReplacement = useCallback((nodeId: string) => {
    console.log('🔍 Replacing condition node:', nodeId);

    // Set the condition node for replacement and open action modal
    setConditionBranchInfo({
      conditionNodeId: nodeId,
      branchType: 'yes', // This won't be used for replacement
      placeholderNodeId: nodeId // Use the condition node ID as placeholder
    });

    setShowActionModal(true);
    toast.info('Select a new condition to replace the current one');
  }, [setConditionBranchInfo, setShowActionModal]);

  // Handle deletion of entire condition node (deletes condition + all branches) - GRAPH-BASED VERSION
  const handleConditionNodeDeletion = useCallback((nodeId: string) => {
    console.log('🔍 Graph-based condition node deletion:', nodeId);

    // Check if the node being deleted is currently selected and close config panel
    if (selectedNode && selectedNode.id === nodeId) {
      console.log('🔍 Closing config panel for deleted condition node:', nodeId);
      setSelectedNode(null);
    }

    // Use the graph-based deletion which handles all the complex logic automatically
    deleteNodeSubtree(nodeId);

    toast.success('Condition node and all branches deleted!');
    console.log('✅ Condition node deleted successfully using graph operations');
  }, [deleteNodeSubtree, selectedNode, setSelectedNode]);

  // Simple node addition handler
  const handleNodeSelection = (nodeType: string, nodeData: NodeData, shouldAutoOpenConfig: boolean = false) => {
    console.log('🔍 handleNodeSelection called:', {
      nodeType,
      label: nodeData.label,
      shouldAutoOpenConfig
    });

    const isConditionNode = nodeType === 'condition';
    const newNodeId = `${nodeType}-${Date.now()}`;

    const newNode: Node = {
      id: newNodeId,
      type: nodeType,
      position: { x: 0, y: 0 },
      data: {
        ...nodeData,
        label: nodeData.label,
        openTriggerModal: nodeType === 'trigger' ? () => setShowTriggerModal(true) : undefined,
        isConfigured: false,
        onDelete: isConditionNode ? () => {
          console.log('🔍 Deleting condition node from handleNodeSelection');
          handleConditionNodeDeletion(newNodeId);
        } : () => {
          console.log('🔍 Deleting regular node from handleNodeSelection');
          deleteSingleNode(newNodeId);
        },
        onDuplicate: () => handleNodeDuplication(newNodeId),
      },
    };


    console.log("new id of the action node is ", newNode.id);

    console.log("new id of the action node is ", newNode.id);

    setNodes((prevNodes) => {
      const updatedNodes = [...prevNodes, newNode];

      if (isConditionNode) {
        console.log('🔍 Adding conditional node using ORIGINAL array-based approach');

        const yesPlaceholder = {
          id: `placeholder-yes-${Date.now()}`,
          type: 'placeholder',
          position: { x: 0, y: 0 }, // Let dagre handle positioning
          width: nodeWidth,
          height: nodeWidth,
          data: {
            label: 'Add Action',
            isConfigured: false,
            branchType: 'yes' as const,
            conditionNodeId: newNodeId,
            handleAddNodeToBranch: handleAddNodeToBranch,
          }
        };

        const noPlaceholder = {
          id: `placeholder-no-${Date.now()}`,
          type: 'placeholder',
          position: { x: 0, y: 0 }, // Let dagre handle positioning
          width: nodeWidth,
          height: nodeWidth,
          data: {
            label: 'Add Action',
            isConfigured: false,
            branchType: 'no' as const,
            conditionNodeId: newNodeId,
            handleAddNodeToBranch,
          }
        };

        updatedNodes.push(yesPlaceholder, noPlaceholder);

        const yesEdge = {
          id: `e-yes-${yesPlaceholder.id}`,
          source: newNode.id,
          target: yesPlaceholder.id,
          label: "Yes",
          type: "condition",
        };

        const noEdge = {
          id: `e-no-${noPlaceholder.id}`,
          source: newNode.id,
          target: noPlaceholder.id,
          label: "No",
          type: "condition",
        };

        setEdges((eds) => [...eds, yesEdge, noEdge]);

      } else {
        // ✅ Only non-conditional nodes should connect to virtual-end
        // Find the node that currently connects to virtual-end (this should be the last node in the flow)
        setEdges((prevEdges) => {
          // Find the edge that currently points to virtual-end
          const edgeToEnd = prevEdges.find(edge => edge.target === 'virtual-end');

          if (edgeToEnd) {
            // Remove the edge to virtual-end
            const updatedEdges = prevEdges.filter(edge => edge.target !== 'virtual-end');

            // Connect the previous node to the new node
            updatedEdges.push({
              id: `edge-${edgeToEnd.source}-${newNode.id}`,
              source: edgeToEnd.source,
              target: newNode.id,
              type: 'flowEdge',
              data: {
                onOpenActionModal: (insertIndex: number) => {
                  console.log('🔍 Plus clicked (new)', insertIndex);
                  openActionModal(insertIndex);
                },
                index: updatedNodes.length - 2,
              },
            });

            // Connect new node to virtual-end
            updatedEdges.push({
              id: `edge-${newNode.id}-virtual-end`,
              source: newNode.id,
              target: 'virtual-end',
              type: 'flowEdge',
              data: {
                onOpenActionModal: (insertIndex: number) => {
                  openActionModal(updatedNodes.length - 1);
                },
                index: updatedNodes.length - 1,
              },
            });
            console.log('🔗 Connected new action node to flow:', `${edgeToEnd.source} -> ${newNode.id} -> virtual-end`);

            return updatedEdges;
          } else {
            // Fallback: if no edge to virtual-end exists, just connect new node to virtual-end
            const updatedEdges = [...prevEdges];

            updatedEdges.push({
              id: `edge-${newNode.id}-virtual-end`,
              source: newNode.id,
              target: 'virtual-end',
              type: 'flowEdge',
              data: {
                onOpenActionModal: (insertIndex: number) => {
                  openActionModal(updatedNodes.length - 1);
                },
                index: updatedNodes.length - 1,
              },
            });
            console.log('🔗 Fallback: Connected new action node directly to virtual-end');

            return updatedEdges;
          }
        });
      }

      return updatedNodes;
    });



    toast.success(`${nodeData.label} added to workflow!`);

    // ✅ Auto-open configuration panel for all nodes
    if (shouldAutoOpenConfig && (nodeType === 'action' || nodeType === 'condition' || !nodeType)) {
      console.log('🔍 Auto-opening config for node:', newNodeId, nodeData.label);
      // Use setTimeout to ensure the node is added to state before opening config
      setTimeout(() => {
        console.log('🔍 Finding and setting selected node:', newNodeId);
        // Get the latest nodes from the store and find the newly added node
        const currentNodes = useWorkflowStore.getState().nodes;
        const addedNode = currentNodes.find(n => n.id === newNodeId);
        if (addedNode) {
          console.log('🔍 Found node, setting as selected:', addedNode.id);
          setSelectedNode(addedNode);
        } else {
          console.log('❌ Node not found in state:', newNodeId);
        }
      }, 100); // Increased timeout to ensure state update
    }
  };

  // ✅ Removed useCallback to avoid circular dependencies
  const handleAddNodeToBranch = useCallback((branchType: string, placeholderNodeId: string, conditionNodeId: string, existingBranchPath?: string) => {
    console.log('🔍 Placeholder clicked:', { branchType, placeholderNodeId, conditionNodeId, existingBranchPath });

    // Create or extend the branch path for nested conditions
    const branchPath = existingBranchPath || createBranchPath(undefined, conditionNodeId, branchType as 'yes' | 'no');
    const parentConditions = getParentConditions(branchPath);
    const level = getBranchLevel(branchPath);

    // Save enhanced context for modal
    setConditionBranchInfo({
      conditionNodeId,
      branchType: branchType as 'yes' | 'no',
      placeholderNodeId,
      branchPath,
      level,
      parentConditions
    });

    setShowActionModal(true);
  }, [createBranchPath, getParentConditions, getBranchLevel]);


  // Handle node insertion using graph-based operations - SIMPLIFIED VERSION
  const handleNodeInsertion = useCallback((afterNodeIndex: number, nodeType: string, nodeData: NodeData) => {
    console.log('🔍 Simple handleNodeInsertion called:', {
      afterNodeIndex,
      nodeType,
      nodeData: nodeData.label,
      currentNodesCount: nodes.length
    });

    // Debug: Show current flow nodes
    const flowNodes = nodes.filter(node =>
      node.type !== 'placeholder' &&
      node.id !== 'virtual-end' &&
      !node.id.startsWith('placeholder-')
    );
    console.log('🔍 Current flow nodes in handleNodeInsertion:', flowNodes.map((n, i) => `${i}: ${n.id} (${n.data?.label || n.type})`));
    console.log('🔍 Will insert after node at index:', afterNodeIndex, 'which is:', flowNodes[afterNodeIndex]?.id);

    // Simple insertion - no complex automation.js logic
    const newNodeId = insertNodeByIndex(afterNodeIndex, nodeType, nodeData, openActionModal);

    if (newNodeId) {
      toast.success(`${nodeData.label} inserted into workflow!`);

      // Auto-open configuration panel for action and condition nodes
      if (nodeType === 'action' || nodeType === 'condition' || !nodeType) {
        console.log('🔍 Auto-opening config for inserted node:', newNodeId, nodeData.label);
        setTimeout(() => {
          const currentNodes = useWorkflowStore.getState().nodes;
          const insertedNode = currentNodes.find(n => n.id === newNodeId);
          if (insertedNode) {
            console.log('🔍 Found inserted node, setting as selected:', insertedNode.id);
            setSelectedNode(insertedNode);
          } else {
            console.log('❌ Inserted node not found in state:', newNodeId);
          }
        }, 100);
      }
    } else {
      toast.error('Failed to insert node - invalid position');
    }
  }, [insertNodeByIndex, setSelectedNode, openActionModal, nodes.length]);

  // Fix placeholder nodes after graph operations to set proper handleAddNodeToBranch
  useEffect(() => {
    setNodes(currentNodes => {
      return currentNodes.map(node => {
        // Fix placeholder nodes that don't have proper handleAddNodeToBranch
        if (node.type === 'placeholder' && node.data?.branchType && node.data?.conditionNodeId) {
          const hasProperHandler = node.data.handleAddNodeToBranch &&
            !node.data.handleAddNodeToBranch.toString().includes('handleAddNodeToBranch not properly set');

          if (!hasProperHandler) {
            console.log('🔍 Fixing placeholder node with missing handleAddNodeToBranch:', node.id);

            return {
              ...node,
              data: {
                ...node.data,
                handleAddNodeToBranch: (branchType: string, placeholderNodeId: string, conditionNodeId: string) => {
                  console.log('🔍 Fixed placeholder clicked:', { branchType, placeholderNodeId, conditionNodeId });
                  handleAddNodeToBranch(branchType, placeholderNodeId, conditionNodeId);
                }
              }
            };
          }
        }

        return node;
      });
    });
  }, [nodes.length, handleAddNodeToBranch]); // Run when nodes change

  const handleConditionBranchNodeDeletion = useCallback((nodeId: string, conditionNodeId: string, branchType: 'yes' | 'no') => {
    console.log('🔍 Graph-based conditional branch node deletion:', { nodeId, conditionNodeId, branchType });

    // Check if the node being deleted is currently selected and close config panel
    if (selectedNode && selectedNode.id === nodeId) {
      console.log('🔍 Closing config panel for deleted branch node:', nodeId);
      setSelectedNode(null);
    }

    // Use the graph-based deletion for conditional branch nodes
    // Create a wrapper function that matches the graph method signature
    const graphHandleAddNodeToBranch = (insertionIndex: number, branchType: 'yes' | 'no', conditionNodeId: string, placeholderNodeId: string, action: unknown) => {
      // Call the original handleAddNodeToBranch with the correct signature
      handleAddNodeToBranch(branchType, placeholderNodeId, conditionNodeId);
    };

    deleteConditionalBranchNode(nodeId, conditionNodeId, branchType, graphHandleAddNodeToBranch);

    toast.success('Branch node replaced with placeholder!');
    console.log('✅ Conditional branch node deleted successfully using graph operations');
  }, [deleteConditionalBranchNode, handleAddNodeToBranch, selectedNode, setSelectedNode]);

  // Unified delete function that automatically detects node type and calls appropriate deletion
  const handleUnifiedNodeDeletion = useCallback((nodeId: string | number) => {
    const nodeIdStr = String(nodeId);
    console.log('🔍 Unified delete called for node:', nodeIdStr);

    // Don't delete end node or trigger nodes
    if (nodeIdStr === 'virtual-end' || nodeIdStr.startsWith('trigger-')) {
      console.log('❌ Cannot delete end node or trigger nodes');
      return;
    }

    // Find the node in the current nodes array
    const nodeToDelete = nodes.find(n => n.id === nodeIdStr);
    if (!nodeToDelete) {
      console.warn(`Node with ID ${nodeIdStr} not found.`);
      return;
    }

    // Check if this node is connected to a condition branch
    const incomingEdge = edges.find(edge => edge.target === nodeIdStr);

    if (incomingEdge) {
      // Find the source node of the incoming edge
      const sourceNode = nodes.find(n => n.id === incomingEdge.source);

      // Check if the source is a condition node
      if (sourceNode && sourceNode.type === 'condition') {
        // This is a branch node - determine which branch (yes/no)
        const branchType = String(incomingEdge.label)?.toLowerCase() === 'yes' ? 'yes' :
          String(incomingEdge.label)?.toLowerCase() === 'no' ? 'no' :
            incomingEdge.sourceHandle === 'yes' ? 'yes' : 'no';

        console.log('🔍 Detected branch node deletion:', { nodeId: nodeIdStr, conditionNodeId: sourceNode.id, branchType });
        handleConditionBranchNodeDeletion(nodeIdStr, sourceNode.id, branchType as 'yes' | 'no');
        return;
      }
    }

    // Check if this IS a condition node itself
    if (nodeToDelete.type === 'condition') {
      console.log('🔍 Detected condition node deletion:', nodeIdStr);
      handleConditionNodeDeletion(nodeIdStr);
      return;
    }

    // Default to regular node deletion
    console.log('🔍 Detected regular node deletion:', nodeIdStr);
    handleNodeDeletion(nodeIdStr);
  }, [nodes, edges, handleConditionBranchNodeDeletion, handleConditionNodeDeletion, handleNodeDeletion]);

  // Handle node duplication - creates a copy of the node below the original
  const handleNodeDuplication = useCallback((nodeId: string) => {
    console.log('🔍 Duplicating node:', nodeId);

    const originalNode = nodes.find(n => n.id === nodeId);
    if (!originalNode) {
      console.error('Original node not found:', nodeId);
      return;
    }

    // Generate new ID for the duplicate
    const timestamp = Date.now();
    const duplicateId = `${originalNode.type}-${timestamp}`;

    // Special handling for condition nodes - duplicate goes to Yes branch
    if (originalNode.type === 'condition') {
      console.log('🔍 Duplicating condition node to Yes branch');

      // Find the Yes placeholder for this condition
      const yesPlaceholder = nodes.find(n =>
        n.type === 'placeholder' &&
        n.data?.branchType === 'yes' &&
        n.data?.conditionNodeId === nodeId
      );

      if (yesPlaceholder) {
        // Create new placeholders for the duplicated condition
        const newYesId = `placeholder-yes-${timestamp}`;
        const newNoId = `placeholder-no-${timestamp}`;

        // Create the duplicate condition in the Yes branch
        const duplicateCondition: Node = {
          id: duplicateId,
          type: 'condition',
          position: { x: 0, y: 0 },
          data: {
            ...originalNode.data,
            isConfigured: false,
            branchType: 'yes',
            conditionNodeId: nodeId,
            // Store placeholder IDs for consistent edge creation
            yesPlaceholderId: newYesId,
            noPlaceholderId: newNoId,
            onDelete: () => handleConditionBranchNodeDeletion(duplicateId, nodeId, 'yes'),
            onDuplicate: () => handleNodeDuplication(duplicateId),
          },
        };

        const newYesPlaceholder: Node = {
          id: newYesId,
          type: 'placeholder',
          position: { x: 0, y: 0 },
          width: nodeWidth,
          height: nodeWidth,
          data: {
            label: 'Add Action',
            branchType: 'yes',
            conditionNodeId: duplicateId,
            handleAddNodeToBranch,
          },
        };

        const newNoPlaceholder: Node = {
          id: newNoId,
          type: 'placeholder',
          position: { x: 0, y: 0 },
          width: nodeWidth,
          height: nodeWidth,
          data: {
            label: 'Add Action',
            branchType: 'no',
            conditionNodeId: duplicateId,
            handleAddNodeToBranch,
          },
        };

        // Update nodes - replace Yes placeholder with duplicate condition and add new placeholders
        setNodes((nds) => {
          const filteredNodes = nds.filter(n => n.id !== yesPlaceholder.id);
          return [...filteredNodes, duplicateCondition, newYesPlaceholder, newNoPlaceholder];
        });

        // Update edges
        setEdges((eds) => {
          let newEdges = [...eds];

          // Remove edge to old Yes placeholder
          newEdges = newEdges.filter(edge => edge.target !== yesPlaceholder.id);

          // Add edge from original condition to duplicate condition (Yes branch)
          newEdges.push({
            id: `edge-${nodeId}-yes`,
            source: nodeId,
            sourceHandle: 'yes',
            target: duplicateId,
            type: 'condition',
            label: 'Yes',
            data: { branchType: 'yes' },
          });

          // Add edges from duplicate condition to its placeholders
          newEdges.push({
            id: `edge-${duplicateId}-yes`,
            source: duplicateId,
            sourceHandle: 'yes',
            target: newYesId,
            type: 'condition',
            label: 'Yes',
            data: { branchType: 'yes' },
          });

          newEdges.push({
            id: `edge-${duplicateId}-no`,
            source: duplicateId,
            sourceHandle: 'no',
            target: newNoId,
            type: 'condition',
            label: 'No',
            data: { branchType: 'no' },
          });

          return newEdges;
        });

        toast.success('Condition duplicated to Yes branch!');
        return;
      }
    }

    // Regular node duplication logic (for action nodes)
    const duplicateNode: Node = {
      id: duplicateId,
      type: originalNode.type,
      position: { x: 0, y: 0 }, // Let dagre handle positioning
      data: {
        ...originalNode.data,
        isConfigured: false, // Reset configuration state
        onDelete: () => deleteSingleNode(duplicateId),
        onDuplicate: () => handleNodeDuplication(duplicateId), // Add duplicate handler to new node
      },
    };

    setNodes((nds) => {
      // Find the original node index
      const originalIndex = nds.findIndex(n => n.id === nodeId);
      if (originalIndex === -1) return nds;

      // Insert duplicate after the original node
      const newNodes = [...nds];
      newNodes.splice(originalIndex + 1, 0, duplicateNode);
      return newNodes;
    });

    setEdges((eds) => {
      // Find the outgoing edge from the original node
      const outgoingEdge = eds.find(edge => edge.source === nodeId);

      if (outgoingEdge) {
        // Calculate the correct index for the duplicate node
        const originalNodeIndex = nodes.findIndex(n => n.id === nodeId);
        const duplicateIndex = originalNodeIndex + 1;

        // Create new edge from original to duplicate with correct index
        const originalToDuplicate = {
          id: `edge-${nodeId}-${duplicateId}`,
          source: nodeId,
          target: duplicateId,
          type: 'flowEdge',
          animated: false,
          data: {
            onOpenActionModal: (insertIndex: number) => openActionModal(insertIndex),
            index: duplicateIndex, // Use the correct index for the duplicate
          },
        };

        // Update the outgoing edge to come from duplicate instead with incremented index
        const duplicateToNext = {
          ...outgoingEdge,
          id: `edge-${duplicateId}-${outgoingEdge.target}`,
          source: duplicateId,
          data: {
            ...outgoingEdge.data,
            index: duplicateIndex + 1, // Increment index for the next edge
          },
        };

        // Remove original outgoing edge and add new edges
        const newEdges = eds.filter(edge => edge.id !== outgoingEdge.id);
        newEdges.push(originalToDuplicate, duplicateToNext);

        return newEdges;
      }

      return eds;
    });

    toast.success('Node duplicated successfully!');
  }, [nodes, handleConditionNodeDeletion, handleNodeDeletion, openActionModal, setNodes, setEdges]);


  // Handle insertion logic when a node is inserted between existing nodes
  const handleNodeInsertionInBranch = useCallback((insertionIndex: number, branchType: 'yes' | 'no', conditionNodeId: string, placeholderNodeId: string, action: NodeData) => {
    const timestamp = Date.now();
    const newNodeId = `node-${timestamp}`;
    const newPlaceholderId = `placeholder-next-${timestamp}`;

    setNodes((prevNodes) => {
      const placeholder = prevNodes.find((n) => n.id === placeholderNodeId);
      if (!placeholder) {
        return prevNodes;
      }

      const newNode: Node = {
        id: newNodeId,
        type: 'action',
        position: placeholder.position,
        data: {
          ...action,
          label: action.label,
          isConfigured: false,
          nextPlaceholderId: newPlaceholderId,
          branchType,
          conditionNodeId,
        },
      };

      // Create the next placeholder in the sequence
      const nextPlaceholder: Node = {
        id: newPlaceholderId,
        type: 'placeholder',
        position: { x: placeholder.position.x, y: placeholder.position.y + 100 },
        width: nodeWidth,
        height: nodeWidth,
        data: {
          label: 'Add Action',
          branchType,
          conditionNodeId,
          handleAddNodeToBranch,
        },
      };

      // Remove the old placeholder and add the new node and next placeholder
      let updatedNodes = prevNodes.filter((n) => n.id !== placeholderNodeId);
      updatedNodes.push(newNode, nextPlaceholder);

      // Update positions of subsequent nodes in the branch
      const branchNodes = updatedNodes.filter(node =>
        node.data.branchType === branchType &&
        node.data.conditionNodeId === conditionNodeId
      );

      // Reposition nodes that come after the insertion point
      branchNodes.forEach((node, index) => {
        if (index > insertionIndex) {
          node.position.y += 100; // Shift down to make room
        }
      });

      return updatedNodes;
    });

    setEdges((prevEdges) => {
      // Find the edge that was pointing to the old placeholder
      const incomingEdge = prevEdges.find(edge => edge.target === placeholderNodeId);

      // Update edges
      let updatedEdges = prevEdges.map((edge) => {
        if (edge.target === placeholderNodeId) {
          // Point the incoming edge to the new node
          return { ...edge, target: newNodeId };
        }
        return edge;
      });

      // Add the new edge from the new node to the next placeholder
      updatedEdges.push({
        id: `edge-${newNodeId}-${newPlaceholderId}`,
        source: newNodeId,
        target: newPlaceholderId,
        type: 'flowEdge',
        animated: false,
        data: {
          onOpenActionModal: () => {
            setConditionBranchInfo({
              conditionNodeId,
              branchType,
              placeholderNodeId: newPlaceholderId,
              insertionIndex: insertionIndex + 1,
            });
            setShowActionModal(true);
          },
          index: insertionIndex + 1,
          branchType,
          conditionNodeId,
        },
      });

      // Update indices of subsequent edges in the branch
      updatedEdges = updatedEdges.map(edge => {
        if (edge.data?.branchType === branchType &&
          edge.data?.conditionNodeId === conditionNodeId &&
          typeof edge.data?.index === 'number' &&
          edge.data.index > insertionIndex) {
          return {
            ...edge,
            data: {
              ...edge.data,
              index: edge.data.index + 1,
            },
          };
        }
        return edge;
      });

      return updatedEdges;
    });
  }, [setNodes, setEdges, setConditionBranchInfo, setShowActionModal, handleAddNodeToBranch]);

  const handleActionSelection = useCallback((action: NodeData) => {
    try {
      const isCondition = action.type === 'condition';

      console.log('🔍 handleActionSelection called:', {
        action: action.label,
        type: action.type,
        conditionBranchInfo,
        actionInsertIndex
      });

      if (conditionBranchInfo) {
        const { placeholderNodeId, branchType, conditionNodeId, branchPath } = conditionBranchInfo;

        // ✅ Handle insertion after existing nodes in branches
        if (placeholderNodeId.startsWith('after-')) {
          const sourceNodeId = placeholderNodeId.replace('after-', '');
          console.log('🔍 Inserting node after existing node:', sourceNodeId);

          const timestamp = Date.now();
          const newNodeId = `node-${timestamp}`;
          const yesId = `placeholder-yes-${timestamp}`;
          const noId = `placeholder-no-${timestamp}`;

          setNodes((prevNodes) => {
            const sourceNode = prevNodes.find(n => n.id === sourceNodeId);
            if (!sourceNode) {
              console.error('Source node not found:', sourceNodeId);
              return prevNodes;
            }

            // Find the next node after the source node (if any) BEFORE creating the new node
            const sourceToNextEdge = edges.find(edge => edge.source === sourceNodeId);
            const nextNodeId = sourceToNextEdge?.target;
            const nextNode = nextNodeId ? prevNodes.find(n => n.id === nextNodeId) : null;

            const newNode: Node = {
              id: newNodeId,
              type: isCondition ? 'condition' : 'action',
              position: { x: 0, y: 0 }, // Let dagre handle positioning
              data: {
                ...action,
                label: action.label,
                isConfigured: false,
                branchType,
                conditionNodeId,
                branchPath,
                level: conditionBranchInfo?.level,
                parentConditions: conditionBranchInfo?.parentConditions,
                onDelete: isCondition
                  ? () => handleConditionNodeDeletion(newNodeId)
                  : () => handleConditionBranchNodeDeletion(newNodeId, conditionNodeId, branchType),
                onDuplicate: () => handleNodeDuplication(newNodeId),
                // ✅ Store placeholder IDs for conditional nodes - determine targets upfront
                ...(isCondition && {
                  yesPlaceholderId: nextNode && nextNode.id !== 'virtual-end' ? nextNode.id : yesId,
                  noPlaceholderId: noId,
                }),
              },
            };

            // ✅ If it's a conditional node, handle downstream nodes like main flow insertion
            if (isCondition) {
              // Create nested branch paths for the new condition
              const newYesBranchPath = createBranchPath(branchPath, newNodeId, 'yes');
              const newNoBranchPath = createBranchPath(branchPath, newNodeId, 'no');
              const newLevel = (conditionBranchInfo?.level || 0) + 1;
              const newParentConditions = [...(conditionBranchInfo?.parentConditions || []), newNodeId];

              // Find the next node after the source node (if any)
              const sourceToNextEdge = edges.find(edge => edge.source === sourceNodeId);
              const nextNodeId = sourceToNextEdge?.target;
              const nextNode = nextNodeId ? prevNodes.find(n => n.id === nextNodeId) : null;

              if (nextNode && nextNode.id !== 'virtual-end') {
                // ✅ Move the downstream node to the Yes branch (like main flow insertion)
                const updatedNextNode = {
                  ...nextNode,
                  data: {
                    ...nextNode.data,
                    branchType: 'yes',
                    conditionNodeId: newNodeId,
                    branchPath: newYesBranchPath,
                    level: newLevel,
                    parentConditions: newParentConditions,
                    onDelete: nextNode.type === 'condition'
                      ? () => handleConditionNodeDeletion(nextNode.id)
                      : () => handleConditionBranchNodeDeletion(nextNode.id, newNodeId, 'yes'),
                  }
                };

                // Update the next node in the array
                const nextNodeIndex = prevNodes.findIndex(n => n.id === nextNode.id);
                if (nextNodeIndex !== -1) {
                  prevNodes[nextNodeIndex] = updatedNextNode;
                }

                // ✅ Update ALL downstream nodes to have Yes branch context
                // We need to find downstream nodes by traversing the current edge structure
                const findDownstreamNodes = (startNodeId: string, currentEdges: typeof edges) => {
                  const downstreamNodes: string[] = [];
                  const visited = new Set<string>();
                  const queue = [startNodeId];

                  while (queue.length > 0) {
                    const currentNodeId = queue.shift()!;
                    if (visited.has(currentNodeId)) continue;
                    visited.add(currentNodeId);

                    // Find all outgoing edges from current node
                    const outgoingEdges = currentEdges.filter(edge => edge.source === currentNodeId);
                    outgoingEdges.forEach(edge => {
                      if (edge.target !== 'virtual-end' && !visited.has(edge.target)) {
                        downstreamNodes.push(edge.target);
                        queue.push(edge.target);
                      }
                    });
                  }

                  return downstreamNodes;
                };

                // Find all downstream nodes from the next node
                const sourceToNextEdge = edges.find(edge => edge.source === sourceNodeId);
                if (sourceToNextEdge) {
                  const downstreamNodeIds = findDownstreamNodes(sourceToNextEdge.target, edges);

                  // Update all downstream nodes to be in the Yes branch
                  downstreamNodeIds.forEach(nodeId => {
                    const nodeIndex = prevNodes.findIndex(n => n.id === nodeId);
                    if (nodeIndex !== -1) {
                      prevNodes[nodeIndex] = {
                        ...prevNodes[nodeIndex],
                        data: {
                          ...prevNodes[nodeIndex].data,
                          branchType: 'yes',
                          conditionNodeId: newNodeId,
                          branchPath: newYesBranchPath,
                          level: newLevel,
                          parentConditions: newParentConditions,
                          onDelete: prevNodes[nodeIndex].type === 'condition'
                            ? () => handleConditionNodeDeletion(prevNodes[nodeIndex].id)
                            : () => handleConditionBranchNodeDeletion(prevNodes[nodeIndex].id, newNodeId, 'yes'),
                        }
                      };
                    }
                  });
                }

                // Create only the No placeholder (Yes branch uses existing downstream)
                const noPlaceholder: Node = {
                  id: noId,
                  type: 'placeholder',
                  position: { x: 0, y: 0 }, // Let dagre handle positioning
                  width: nodeWidth,
                  height: nodeWidth,
                  data: {
                    label: 'Add Node',
                    branchType: 'no',
                    conditionNodeId: newNodeId,
                    branchPath: newNoBranchPath,
                    level: newLevel,
                    parentConditions: newParentConditions,
                    handleAddNodeToBranch: (branchType: string, placeholderNodeId: string, conditionNodeId: string) =>
                      handleAddNodeToBranch(branchType, placeholderNodeId, conditionNodeId, newNoBranchPath),
                  },
                };

                return [...prevNodes, newNode, noPlaceholder];
              } else {
                // No downstream nodes - create both Yes and No placeholders
                const yesPlaceholder: Node = {
                  id: yesId,
                  type: 'placeholder',
                  position: { x: 0, y: 0 }, // Let dagre handle positioning
                  width: nodeWidth,
                  height: nodeWidth,
                  data: {
                    label: 'Add Node',
                    branchType: 'yes',
                    conditionNodeId: newNodeId,
                    branchPath: newYesBranchPath,
                    level: newLevel,
                    parentConditions: newParentConditions,
                    handleAddNodeToBranch: (branchType: string, placeholderNodeId: string, conditionNodeId: string) =>
                      handleAddNodeToBranch(branchType, placeholderNodeId, conditionNodeId, newYesBranchPath),
                  },
                };

                const noPlaceholder: Node = {
                  id: noId,
                  type: 'placeholder',
                  position: { x: 0, y: 0 }, // Let dagre handle positioning
                  width: nodeWidth,
                  height: nodeWidth,
                  data: {
                    label: 'Add Node',
                    branchType: 'no',
                    conditionNodeId: newNodeId,
                    branchPath: newNoBranchPath,
                    level: newLevel,
                    parentConditions: newParentConditions,
                    handleAddNodeToBranch: (branchType: string, placeholderNodeId: string, conditionNodeId: string) =>
                      handleAddNodeToBranch(branchType, placeholderNodeId, conditionNodeId, newNoBranchPath),
                  },
                };

                return [...prevNodes, newNode, yesPlaceholder, noPlaceholder];
              }
            }

            return [...prevNodes, newNode];
          });

          setEdges((prevEdges) => {
            // Find the edge from source to next node
            const sourceToNextEdge = prevEdges.find(edge => edge.source === sourceNodeId);

            if (!sourceToNextEdge) {
              console.warn('No outgoing edge found for source node:', sourceNodeId);
              return prevEdges;
            }

            // Remove the old edge and create new ones
            const filteredEdges = prevEdges.filter(edge => edge.id !== sourceToNextEdge.id);

            const newEdges = [
              ...filteredEdges,
              // Edge from source to new node
              {
                id: `edge-${sourceNodeId}-${newNodeId}`,
                source: sourceNodeId,
                target: newNodeId,
                type: 'flowEdge',
                animated: false,
                data: {
                  onOpenActionModal: () => {
                    setConditionBranchInfo({
                      conditionNodeId,
                      branchType,
                      placeholderNodeId: `after-${sourceNodeId}`,
                    });
                    setShowActionModal(true);
                  },
                  branchType,
                  conditionNodeId,
                },
              }
            ];

            // ✅ Handle conditional vs action node differently
            if (isCondition) {
              // For conditional nodes, we need to get the updated node to access stored target IDs
              // Since we can't access the updated nodes state here, we'll reconstruct the logic

              // Determine target IDs based on whether there was a downstream node
              const hasDownstreamNode = sourceToNextEdge.target && sourceToNextEdge.target !== 'virtual-end';
              const actualYesTargetId = hasDownstreamNode ? sourceToNextEdge.target : yesId;
              const actualNoTargetId = noId;

              console.log(`🔍 Creating condition edges: ${newNodeId} -> ${actualYesTargetId} (Yes), ${newNodeId} -> ${actualNoTargetId} (No)`);

              // Create Yes edge (either to existing downstream node or placeholder)
              newEdges.push({
                id: `edge-${newNodeId}-yes`,
                source: newNodeId,
                sourceHandle: 'yes',
                target: actualYesTargetId,
                type: 'condition',
                label: 'Yes',
                data: { branchType: 'yes' },
              });

              // Create No edge (always to placeholder)
              newEdges.push({
                id: `edge-${newNodeId}-no`,
                source: newNodeId,
                sourceHandle: 'no',
                target: actualNoTargetId,
                type: 'condition',
                label: 'No',
                data: { branchType: 'no' },
              });
            } else {
              // For action nodes, create edge to next node
              newEdges.push({
                id: `edge-${newNodeId}-${sourceToNextEdge.target}`,
                source: newNodeId,
                target: sourceToNextEdge.target,
                type: 'flowEdge',
                animated: false,
                data: {
                  onOpenActionModal: () => {
                    setConditionBranchInfo({
                      conditionNodeId,
                      branchType,
                      placeholderNodeId: `after-${newNodeId}`,
                    });
                    setShowActionModal(true);
                  },
                  branchType,
                  conditionNodeId,
                },
              });
            }

            return newEdges;
          });

          toast.success(`${action.label} inserted into ${branchType} branch!`);
          setConditionBranchInfo(null);
          setShowActionModal(false);
          return;
        }

        // 🔑 GENERATE ALL IDs UPFRONT - This is the key fix
        const timestamp = Date.now();
        const newNodeId = `node-${timestamp}`;
        const yesId = `placeholder-yes-${timestamp}`;
        const noId = `placeholder-no-${timestamp}`;

        setNodes((prevNodes) => {
          const placeholder = prevNodes.find((n) => n.id === placeholderNodeId);
          if (!placeholder) {
            console.error('Placeholder not found:', placeholderNodeId);
            return prevNodes;
          }

          const newNode: Node = {
            id: newNodeId,
            type: isCondition ? 'condition' : 'action',
            position: placeholder.position,
            data: {
              ...action,
              label: action.label,
              isConfigured: false,
              onDelete: isCondition
                ? () => handleConditionNodeDeletion(newNodeId)
                : undefined,
              onDuplicate: () => handleNodeDuplication(newNodeId),
              // Store the placeholder IDs for edge creation
              ...(isCondition && {
                yesPlaceholderId: yesId,
                noPlaceholderId: noId,
              }),
            },
          };

          // Remove the placeholder that's being replaced
          const filteredNodes = prevNodes.filter((n) => n.id !== placeholderNodeId);
          const updatedNodes = [...filteredNodes, newNode];

          // If it's a condition node, add Yes/No placeholders
          if (isCondition) {
            const yesPlaceholder: Node = {
              id: yesId, // ✅ Use the same ID generated above
              type: 'placeholder',
              position: { x: 0, y: 0 }, // Let dagre handle positioning
              width: nodeWidth,
              height: nodeWidth,
              data: {
                label: 'Add Action',
                branchType: 'yes',
                conditionNodeId: newNodeId,
                handleAddNodeToBranch,
              },
            };

            const noPlaceholder: Node = {
              id: noId, // ✅ Use the same ID generated above
              type: 'placeholder',
              position: { x: 0, y: 0 }, // Let dagre handle positioning
              width: nodeWidth,
              height: nodeWidth,
              data: {
                label: 'Add Action',
                branchType: 'no',
                conditionNodeId: newNodeId,
                handleAddNodeToBranch,
              },
            };

            return [...updatedNodes, yesPlaceholder, noPlaceholder];
          } else {
            // ✅ For action nodes in branches, create a ghost node
            const ghostNodeId = createGhostNodeId(branchPath || `${conditionNodeId}.${branchType}`);

            // Check if ghost node already exists
            const existingGhostNode = prevNodes.find(node =>
              node.type === 'ghost' && node.id === ghostNodeId
            );

            if (!existingGhostNode) {
              // Use dynamic dimensions based on layout direction
              const isHorizontal = layoutDirection === 'LR';
              const ghostNode: Node = {
                id: ghostNodeId,
                type: 'ghost',
                position: { x: 0, y: 0 }, // Let dagre handle positioning
                width: isHorizontal ? 20 : 5,   // Wider for horizontal
                height: isHorizontal ? 5 : 20,  // Taller for vertical
                data: {},
              };

              // Store ghost node ID in the action node's data
              newNode.data.ghostNodeId = ghostNodeId;

              return [...updatedNodes, ghostNode];
            }

            // Store ghost node ID in the action node's data
            newNode.data.ghostNodeId = ghostNodeId;
            return updatedNodes;
          }
        });

        // Update edges with THE SAME IDs
        setEdges((prevEdges) => {
          // Replace edges targeting the old placeholder with edges targeting the new node
          const updatedEdges = prevEdges.map((edge) => {
            if (edge.target === placeholderNodeId) {
              console.log(`Updating edge from ${edge.source} -> ${placeholderNodeId} to ${edge.source} -> ${newNodeId}`);
              return { ...edge, target: newNodeId };
            }
            return edge;
          });

          if (isCondition) {
            // ✅ Use the EXACT SAME IDs that were generated above
            console.log(`Adding condition edges: ${newNodeId} -> ${yesId} (Yes), ${newNodeId} -> ${noId} (No)`);

            // Add condition edges to the new placeholders
            updatedEdges.push(
              {
                id: `edge-${newNodeId}-yes`,
                source: newNodeId,
                sourceHandle: 'yes',
                target: yesId, // ✅ Same ID as node creation
                type: 'condition',
                label: 'Yes',
                data: { branchType: 'yes' },
              },
              {
                id: `edge-${newNodeId}-no`,
                source: newNodeId,
                sourceHandle: 'no',
                target: noId, // ✅ Same ID as node creation
                type: 'condition',
                label: 'No',
                data: { branchType: 'no' },
              }
            );
          } else {
            // ✅ Connect action node to ghost node using nested branch path
            const ghostNodeId = createGhostNodeId(branchPath || `${conditionNodeId}.${branchType}`);

            // Create edge from new action node to ghost node
            updatedEdges.push({
              id: `edge-${newNodeId}-${ghostNodeId}`,
              source: newNodeId,
              target: ghostNodeId,
              type: 'flowEdge',
              animated: false,
              data: {
                onOpenActionModal: () => {
                  // Set up for insertion after this node with full branch context
                  setConditionBranchInfo({
                    conditionNodeId: conditionNodeId,
                    branchType: branchType,
                    placeholderNodeId: `after-${newNodeId}`,
                    branchPath: branchPath,
                    level: conditionBranchInfo?.level,
                    parentConditions: conditionBranchInfo?.parentConditions
                  });
                  setShowActionModal(true);
                },
                branchType: branchType,
                conditionNodeId: conditionNodeId,
                branchPath: branchPath,
                level: conditionBranchInfo?.level,
                parentConditions: conditionBranchInfo?.parentConditions,
              },
            });
          }

          return updatedEdges;
        });

        toast.success(`${action.label} added to ${branchType || 'main'} branch!`);

        // ✅ Auto-open configuration panel for all nodes added to branches
        if (action.type === 'action' || action.type === 'condition' || !action.type) {
          console.log('🔍 Auto-opening config for branch node:', newNodeId, action.label);
          // Find the newly added node and open its config
          setTimeout(() => {
            console.log('🔍 Finding branch node in state:', newNodeId);
            const currentNodes = useWorkflowStore.getState().nodes;
            const addedNode = currentNodes.find(n => n.id === newNodeId);
            if (addedNode) {
              console.log('🔍 Found branch node, setting as selected:', addedNode.id);
              setSelectedNode(addedNode);
            } else {
              console.log('❌ Branch node not found in state:', newNodeId);
            }
          }, 100);
        }

        setConditionBranchInfo(null);
      } else {
        // Handle top-level insertion
        if (actionInsertIndex !== null) {
          handleNodeInsertion(actionInsertIndex, action.type || 'action', action);
          setActionInsertIndex(null);
        } else {
          // ✅ Auto-open configuration panel for all nodes
          const shouldAutoOpen = action.type === 'action' || action.type === 'condition' || !action.type;
          handleNodeSelection(action.type || 'action', action, shouldAutoOpen);
        }
      }
    } catch (error) {
      console.error('Error in handleActionSelection:', error);
      console.error('ConditionBranchInfo:', conditionBranchInfo);
      toast.error('Failed to add action to workflow');
    } finally {
      setShowActionModal(false);
      setActionInsertIndex(null);
      setConditionBranchInfo(null);
    }
  }, [
    conditionBranchInfo,
    handleConditionNodeDeletion,
    handleConditionBranchNodeDeletion,
    setConditionBranchInfo,
    setShowActionModal,
    handleNodeSelection,
    handleNodeInsertion,
    setNodes,
    setEdges,
    actionInsertIndex,
    handleAddNodeToBranch,
    setActionInsertIndex,
    createGhostNodeId,
    createBranchPath,
    edges,
    setSelectedNode // ✅ Keep setSelectedNode dependency
  ]);

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
      // Reset to initial state with default trigger and virtual end
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

      const endNode: Node = {
        id: 'virtual-end',
        type: 'end',
        position: { x: 0, y: 0 },
        data: {
          label: 'End',
          id: 'end',
        },
      };

      // Set initial nodes
      setNodes([defaultTriggerNode, endNode]);

      // Set initial edge connecting trigger to end
      const initialEdge = {
        id: 'default-edge',
        source: defaultTriggerNode.id,
        target: 'virtual-end',
        type: 'flowEdge',
        animated: false,
        data: {
          onOpenActionModal: (insertIndex: number) => {
            openActionModal(insertIndex);
          },
          index: 0, // This will be the insert index
        },
      };

      setEdges([initialEdge]);
      setSelectedNode(null);
      toast.success('Workflow reset successfully!');
    }
  }, [setNodes, setEdges, setSelectedNode, openActionModal]);

  // Old zoom controls removed - now using React Flow controls with reset button

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
      position: { x: 0, y: 0 }, // Start with some padding from edges
      width: nodeWidth,
      height: nodeHeight,
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
      position: { x: 0, y: 0 }, // Increased spacing - 300px apart
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

  // Add keyboard event listener for Escape key to clear copy state
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isCopy) {
        clearCopyState();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCopy, clearCopyState]);

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
          <WorkFlowCanvas
            nodes={nodes}
            edges={edges}
            selectedNodeId={selectedNode?.id}
            onSelectNode={handleNodeSelection}
            onNodeClick={onNodeClick}
            onOpenTriggerModal={() => setShowTriggerModal(true)}
            onOpenActionModal={openActionModal}
            onInsertNode={handleNodeInsertion}
            onDeleteNode={handleUnifiedNodeDeletion}
            onDuplicateNode={handleNodeDuplication}
            onReplaceTrigger={handleReplaceTrigger}
            onOpenTriggerConfig={handleOpenTriggerConfig}
          />
        </div>

        {/* Old controls removed - now using React Flow controls with reset button */}

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
                  // ✅ Handle node deletion from config panel
                  const nodeToDelete = nodes.find(n => n.id === nodeId);
                  if (nodeToDelete) {
                    if (nodeToDelete.type === 'condition') {
                      handleConditionNodeDeletion(nodeId);
                    } else if (nodeToDelete.data?.branchType && nodeToDelete.data?.conditionNodeId) {
                      // This is a branch node
                      handleConditionBranchNodeDeletion(nodeId, nodeToDelete.data.conditionNodeId as string, nodeToDelete.data.branchType as 'yes' | 'no');
                    } else {
                      // Regular node
                      handleNodeDeletion(nodeId);
                    }
                  }
                  setSelectedNode(null); // Close config panel after deletion
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

      {/* Branch Selection Modal for Conditional Paste */}
      <BranchSelectionModal
        isOpen={showBranchSelectionModal}
        onClose={() => {
          setShowBranchSelectionModal(false);
          setPendingConditionalPaste(null);
        }}
        onSelectBranch={handleBranchSelection}
        downstreamNodeCount={pendingConditionalPaste?.downstreamNodeCount || 0}
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
