
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Node } from '@xyflow/react';
// Removed unused zoom control icons - using React Flow controls now

import { NodeConfigPanel } from './node-config/NodeConfigPanel';
import { WorkflowHeader } from './WorkflowHeader';
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
    setActionInsertIndex(insertIndex ?? null);
    setShowActionModal(true);
  }, []);

  const handleNodeDeletion = useCallback((nodeId: string | number) => {
    const nodeIdStr = String(nodeId);

    if (nodeIdStr === 'virtual-end' || nodeIdStr.startsWith('trigger-')) {
      return;
    }

    const parsedNode = nodes.find(n => n.id === nodeIdStr);
    if (!parsedNode) {
      console.warn(`Node with ID ${nodeIdStr} not found.`);
      return;
    }

    setNodes((nds) => nds.filter(node => node.id !== nodeIdStr));

    setEdges((eds) => {
      const incomingEdge = eds.find(edge => edge.target === nodeIdStr);
      const outgoingEdge = eds.find(edge => edge.source === nodeIdStr);

      let newEdges = eds.filter(edge => edge.source !== nodeIdStr && edge.target !== nodeIdStr);

      if (incomingEdge && outgoingEdge) {
        // Find the index of the source node for proper insertion
        const sourceNodeIndex = nodes.findIndex(n => n.id === incomingEdge.source);

        newEdges.push({
          id: `edge-${incomingEdge.source}-${outgoingEdge.target}`,
          source: incomingEdge.source,
          target: outgoingEdge.target,
          type: 'flowEdge',
          data: {
            onOpenActionModal: (insertIndex: number) => {
              console.log('🔍 Plus button clicked after deletion, insertIndex:', insertIndex);
              openActionModal(insertIndex);
            },
            index: sourceNodeIndex, // ✅ Add the missing index
          },
        });
      }

      return newEdges;
    });

    toast.success('Node deleted successfully!');
  }, [setNodes, setEdges, nodes]);
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

  // Handle deletion of entire condition node (deletes condition + all branches)
  const handleConditionNodeDeletion = useCallback((nodeId: string) => {
    console.log('🔍 Deleting entire condition node:', nodeId);

    setNodes((nds) => {
      console.log('🔍 Current nodes before deletion:', nds.map(n => `${n.id} (${n.type})`));

      // 🚀 Fast Descendant Traversal (Breadth-First)
      function getDescendantNodeIds(startNodeId: string, edges: any[]) {
        const queue = [startNodeId];
        const visited = new Set([startNodeId]); // Start with the root node

        while (queue.length > 0) {
          const current = queue.shift()!;

          for (const edge of edges) {
            if (edge.source === current && !visited.has(edge.target) && edge.target !== 'virtual-end') {
              visited.add(edge.target);
              queue.push(edge.target);
            }
          }
        }

        return visited; // Set of all node IDs to delete
      }

      // 🚮 Get all nodes to delete using fast traversal
      const nodesToDelete = getDescendantNodeIds(nodeId, edges);

      // Also add any placeholders that belong to this condition by conditionNodeId
      console.log('🔍 Checking all nodes for placeholders belonging to condition:', nodeId);
      nds.forEach(node => {
        console.log('🔍 Checking node:', node.id, 'type:', node.type, 'conditionNodeId:', node.data?.conditionNodeId);
        if (node.type === 'placeholder' && node.data?.conditionNodeId === nodeId) {
          console.log('🔍 Found placeholder belonging to condition:', node.id);
          nodesToDelete.add(node.id);

          // Also get descendants of this placeholder
          const placeholderDescendants = getDescendantNodeIds(node.id, edges);
          placeholderDescendants.forEach(descendantId => nodesToDelete.add(descendantId));
        }
      });

      console.log('🔍 All nodes to delete:', Array.from(nodesToDelete));

      // 🚮 Filter out all nodes that should be removed
      const remainingNodes = nds.filter(node => !nodesToDelete.has(node.id));
      console.log('🔍 Remaining nodes after deletion:', remainingNodes.map(n => `${n.id} (${n.type})`));

      return remainingNodes;
    });

    setEdges((eds) => {
      console.log('🔍 Current edges before deletion:', eds.map(e => `${e.source} -> ${e.target}`));

      // Find the edge that was pointing to this condition node
      const incomingEdge = eds.find(edge => edge.target === nodeId);
      console.log('🔍 Incoming edge to condition:', incomingEdge);

      // 🚀 Fast Descendant Traversal (same as in setNodes)
      function getDescendantNodeIds(startNodeId: string, edges: any[]) {
        const queue = [startNodeId];
        const visited = new Set([startNodeId]);

        while (queue.length > 0) {
          const current = queue.shift()!;

          for (const edge of edges) {
            if (edge.source === current && !visited.has(edge.target) && edge.target !== 'virtual-end') {
              visited.add(edge.target);
              queue.push(edge.target);
            }
          }
        }

        return visited;
      }

      // 🚮 Get all nodes to delete using fast traversal
      const nodesToDelete = getDescendantNodeIds(nodeId, eds);

      // Also add any placeholders that belong to this condition by conditionNodeId
      nodes.forEach(node => {
        if (node.type === 'placeholder' && node.data?.conditionNodeId === nodeId) {
          nodesToDelete.add(node.id);

          // Also get descendants of this placeholder
          const placeholderDescendants = getDescendantNodeIds(node.id, eds);
          placeholderDescendants.forEach(descendantId => nodesToDelete.add(descendantId));
        }
      });

      console.log('🔍 All nodes to delete (for edge cleanup):', Array.from(nodesToDelete));

      // 🚮 Remove all edges connected to any of the nodes that will be removed
      const newEdges = eds.filter(edge => {
        const shouldRemove = nodesToDelete.has(edge.source) || nodesToDelete.has(edge.target);
        if (shouldRemove) {
          console.log('🔍 Removing edge:', `${edge.source} -> ${edge.target}`);
        }
        return !shouldRemove;
      });

      // Reconnect the previous node to virtual-end if there was an incoming edge
      if (incomingEdge) {
        const sourceNodeIndex = nodes.findIndex(n => n.id === incomingEdge.source);

        newEdges.push({
          id: `edge-${incomingEdge.source}-virtual-end`,
          source: incomingEdge.source,
          target: 'virtual-end',
          type: 'flowEdge',
          data: {
            onOpenActionModal: (insertIndex: number) => {
              console.log('🔍 Plus button clicked after condition deletion');
              openActionModal(insertIndex);
            },
            index: sourceNodeIndex,
          },
        });

        console.log('🔍 Added reconnection edge:', `${incomingEdge.source} -> virtual-end`);
      }

      console.log('🔍 Final edges after deletion:', newEdges.map(e => `${e.source} -> ${e.target}`));
      return newEdges;
    });

    toast.success('Condition node and all branches deleted!');
  }, [setNodes, setEdges, openActionModal, nodes, edges]);


  // Simple node addition handler
  const handleNodeSelection = useCallback((nodeType: string, nodeData: NodeData) => {
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
          handleNodeDeletion(newNodeId);
        },
      },
    };


    console.log("new id of the action node is ", newNode.id);


    setNodes((prevNodes) => {
      const updatedNodes = [...prevNodes, newNode];

      if (isConditionNode) {


        const yesPlaceholder = {
          id: `placeholder-yes-${Date.now()}`,
          type: 'placeholder',
          position: { x: 0, y: 0 }, // Hardcoded left position
          width: nodeWidth,
          height: nodeWidth,
          data: {
            label: 'Add Action',
            isConfigured: false,
            branchType: 'yes' as const,
            conditionNodeId: newNodeId, // or newNode.id
            handleAddNodeToBranch: handleAddNodeToBranch,
            // onAddAction: () => {
            //   setConditionBranchInfo({ conditionNodeId: newNodeId, branchType: 'yes' });
            //   setShowActionModal(true);
            // }
          }
        };

        const noPlaceholder = {
          id: `placeholder-no-${Date.now()}`,
          type: 'placeholder',
          position: { x: 0, y: 0 }, // Hardcoded left position
          width: nodeWidth,
          height: nodeWidth,
          data: {
            label: 'Add Action',
            isConfigured: false,
            branchType: 'no' as const,
            conditionNodeId: newNodeId, // or newNode.id
            handleAddNodeToBranch,
            // onAddAction: () => {
            //   setConditionBranchInfo({ conditionNodeId: newNodeId, branchType: 'no' });
            //   setShowActionModal(true);
            // }
          }
        };


        updatedNodes.push(yesPlaceholder, noPlaceholder);

        // Update the condition node to show embedded placeholders


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

            // Connect the new node to virtual-end
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

            console.log('🔗 Connected new node to flow:', `${edgeToEnd.source} -> ${newNode.id} -> virtual-end`);
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

            console.log('🔗 Fallback: Connected new node directly to virtual-end');
            return updatedEdges;
          }
        });
      }

      return updatedNodes;
    });

    toast.success(`${nodeData.label} added to workflow!`);
  }, [setNodes, setEdges, openActionModal, setShowActionModal, setConditionBranchInfo, handleConditionNodeDeletion]);

  // ? Version 1 code 
  // const handleNodeInsertion = useCallback((afterNodeIndex: number, nodeType: string, nodeData: NodeData) => {
  //   console.log('🔍 handleNodeInsertion called:', { afterNodeIndex, nodeType, nodeData });

  //   const isConditionNode = nodeType === 'condition' || nodeData.type === 'condition';

  //   const actualNodeType = isConditionNode ? 'condition' : nodeType;
  //   const actualNodeData = isConditionNode
  //     ? { ...nodeData, branchNodes: { branch1: [], otherwise: [] }, isConfigured: false }
  //     : nodeData;

  //   const nodeId = `${actualNodeType}-${Date.now()}`
  //   const newNode: Node = {
  //     id: nodeId,
  //     type: actualNodeType,
  //     position: { x: 0, y: 0 },
  //     data: {
  //       ...actualNodeData,
  //       label: nodeData.label,
  //       openTriggerModal: actualNodeType === 'trigger' ? () => setShowTriggerModal(true) : undefined,
  //       isConfigured: false,
  //       onDelete: isConditionNode ? () => {
  //         handleConditionNodeDeletion(nodeId);
  //       } : () => handleNodeDeletion(nodeId),
  //     },

  //   };

  //   console.log('🔍 Created new node:', newNode);

  //   // 🔑 Generate placeholder IDs ONCE at the top level
  //   const timestamp = Date.now();
  //   const yesId = `placeholder-yes-${timestamp}`;
  //   const noId = `placeholder-no-${timestamp + 1}`;

  //   setNodes((nds) => {
  //     console.log('🔍 Current nodes array:', nds.map(n => `${n.id} (${n.type})`));
  //     console.log('🔍 afterNodeIndex:', afterNodeIndex);

  //     const newNodes = [...nds];
  //     let safeIndex = afterNodeIndex;

  //     // 🛡 Ensure the index is valid (within bounds)
  //     if (safeIndex < 0 || safeIndex >= newNodes.length) {
  //       const triggerNode = newNodes.find(n => n.type === 'trigger');
  //       if (triggerNode) {
  //         safeIndex = newNodes.findIndex(n => n.id === triggerNode.id);
  //       } else {
  //         console.warn('No trigger node found. Inserting at start.');
  //         safeIndex = -1;
  //       }
  //     }

  //     const previousNode = safeIndex >= 0 ? newNodes[safeIndex] : newNodes.find(n => n.type === 'trigger');
  //     const nextNode = newNodes[safeIndex + 1];

  //     console.log('🔍 safeIndex:', safeIndex);
  //     console.log('🔍 previousNode:', previousNode?.id, previousNode?.type);
  //     console.log('🔍 nextNode:', nextNode?.id, nextNode?.type);

  //     if (isConditionNode && nextNode && nextNode.type === 'condition') {
  //       const newConditionalNode: Node = {
  //         ...newNode,
  //         data: {
  //           ...newNode.data,
  //           branchNodes: {
  //             branch1: [{
  //               id: nextNode.id,
  //               type: nextNode.type,
  //               data: nextNode.data
  //             }],
  //             otherwise: []
  //           }
  //         }
  //       };

  //       newNodes.splice(safeIndex + 1, 0, newNode);

  //     } else {
  //       newNodes.splice(safeIndex + 1, 0, newNode);


  //       if (isConditionNode) {
  //         // 🔄 CONDITIONAL RESTRUCTURING LOGIC
  //         // When inserting a condition node, move downstream nodes to the "Yes" branch

  //         if (nextNode && nextNode.id !== 'virtual-end') {
  //           console.log('🔄 Restructuring flow: Moving downstream to Yes branch');

  //           // Move the nextNode and all downstream nodes to the Yes branch
  //           // by replacing the Yes placeholder with the actual nextNode
  //           const yesNodeId = nextNode.id; // Use the existing downstream node as Yes branch

  //           // Update the nextNode to be part of the Yes branch
  //           const updatedNextNode = {
  //             ...nextNode,
  //             data: {
  //               ...nextNode.data,
  //               branchType: 'yes',
  //               conditionNodeId: newNode.id,
  //               // 🔄 Add plus button functionality for action nodes moved to Yes branch
  //               showBottomPlus: nextNode.type === 'action' ? true : nextNode.data.showBottomPlus,
  //               onInsertBelow: nextNode.type === 'action' ? (nodeId: string) => {
  //                 console.log('🔍 Insert below clicked in Yes branch:', nodeId);
  //                 setConditionBranchInfo({
  //                   conditionNodeId: newNode.id,
  //                   branchType: 'yes',
  //                   placeholderNodeId: `after-${nodeId}`
  //                 });
  //                 setShowActionModal(true);
  //               } : nextNode.data.onInsertBelow,
  //             }
  //           };

  //           // Replace the nextNode in the array with the updated version
  //           const nextNodeIndex = newNodes.findIndex(n => n.id === nextNode.id);
  //           if (nextNodeIndex !== -1) {
  //             newNodes[nextNodeIndex] = updatedNextNode;
  //           }

  //           // Create only the No placeholder (Yes branch uses the existing downstream)
  //           const noPlaceholder: Node = {
  //             id: noId,
  //             type: 'placeholder',
  //             position: { x: 0, y: 0 },
  //             width: nodeWidth,
  //             height: nodeWidth,
  //             data: {
  //               label: 'Add Action',
  //               isConfigured: false,
  //               branchType: 'no' as const,
  //               conditionNodeId: newNode.id,
  //               handleAddNodeToBranch
  //             }
  //           };

  //           // Add only the No placeholder
  //           newNodes.splice(safeIndex + 2, 0, noPlaceholder);

  //           // Store the Yes node ID for edge creation
  //           newNode.data.yesPlaceholderId = yesNodeId;
  //           newNode.data.noPlaceholderId = noId;

  //         } else {
  //           // No downstream nodes - create both placeholders as usual
  //           console.log('🔍 Creating both Yes and No placeholders (no downstream)');
  //           console.log('🔍 yesId:', yesId, 'noId:', noId);

  //           const yesPlaceholder: Node = {
  //             id: yesId,
  //             type: 'placeholder',
  //             position: { x: 0, y: 0 },
  //             width: nodeWidth,
  //             height: nodeWidth,
  //             data: {
  //               label: 'Add Action',
  //               isConfigured: false,
  //               branchType: 'yes' as const,
  //               conditionNodeId: newNode.id,
  //               handleAddNodeToBranch
  //             }
  //           };

  //           const noPlaceholder: Node = {
  //             id: noId,
  //             type: 'placeholder',
  //             position: { x: 0, y: 0 },
  //             width: nodeWidth,
  //             height: nodeWidth,
  //             data: {
  //               label: 'Add Action',
  //               isConfigured: false,
  //               branchType: 'no' as const,
  //               conditionNodeId: newNode.id,
  //               handleAddNodeToBranch
  //             }
  //           };

  //           newNodes.splice(safeIndex + 2, 0, yesPlaceholder, noPlaceholder);
  //           console.log('🔍 Added placeholders at index:', safeIndex + 2);

  //           // Store placeholder IDs for edge creation
  //           newNode.data.yesPlaceholderId = yesId;
  //           newNode.data.noPlaceholderId = noId;
  //           console.log('🔍 Stored placeholder IDs:', { yesPlaceholderId: yesId, noPlaceholderId: noId });
  //         }
  //       }
  //     }

  //     setEdges((eds) => {
  //       console.log('🔍 Current edges before insertion:', eds);
  //       console.log('🔍 Previous node:', previousNode);
  //       console.log('🔍 Next node:', nextNode);

  //       let newEdges = [...eds];

  //       if (previousNode && nextNode) {
  //         console.log('🔍 Removing edge between:', previousNode.id, '->', nextNode.id);
  //         newEdges = newEdges.filter(edge =>
  //           !(edge.source === previousNode.id && edge.target === nextNode.id)
  //         );
  //       }

  //       if (previousNode) {
  //         const newEdge = {
  //           id: `edge-${previousNode.id}-${newNode.id}`,
  //           source: previousNode.id,
  //           target: newNode.id,
  //           type: 'flowEdge',
  //           animated: false,
  //           data: {
  //             onOpenActionModal: (insertIndex: number) => {
  //               openActionModal(insertIndex);
  //             },
  //             index: safeIndex,
  //           },
  //         };
  //         console.log('🔍 Adding edge from previous to new:', newEdge);
  //         newEdges.push(newEdge);
  //       }

  //       if (isConditionNode) {
  //         // 🔄 Create condition edges based on restructuring
  //         const yesTargetId = String(newNode.data.yesPlaceholderId || '');
  //         const noTargetId = String(newNode.data.noPlaceholderId || '');

  //         console.log('🔍 Creating condition edges:', { yesTargetId, noTargetId });
  //         console.log('🔍 newNode.data:', newNode.data);

  //         // Create Yes branch edge
  //         if (yesTargetId) {
  //           const yesEdge = {
  //             id: `edge-${newNode.id}-yes`,
  //             source: newNode.id,
  //             sourceHandle: 'yes',
  //             target: yesTargetId,
  //             type: 'condition',
  //             label: 'Yes',
  //             data: {
  //               branchType: 'yes',
  //             },
  //           };
  //           newEdges.push(yesEdge);
  //           console.log('🔍 Added Yes edge:', yesEdge);
  //         } else {
  //           console.log('❌ No Yes target ID found!');
  //         }

  //         // Create No branch edge
  //         if (noTargetId) {
  //           const noEdge = {
  //             id: `edge-${newNode.id}-no`,
  //             source: newNode.id,
  //             sourceHandle: 'no',
  //             target: noTargetId,
  //             type: 'condition',
  //             label: 'No',
  //             data: {
  //               branchType: 'no',
  //             },
  //           };
  //           newEdges.push(noEdge);
  //           console.log('🔍 Added No edge:', noEdge);
  //         } else {
  //           console.log('❌ No No target ID found!');
  //         }

  //         // 🔧 Note: Downstream flow is now in the Yes branch
  //         // No additional connections needed as the restructuring handles it
  //       } else if (nextNode) {
  //         // For non-condition nodes, connect to the next node
  //         newEdges.push({
  //           id: `edge-${newNode.id}-${nextNode.id}`,
  //           source: newNode.id,
  //           target: nextNode.id,
  //           type: 'flowEdge',
  //           animated: false,
  //           data: {
  //             onOpenActionModal: (insertIndex: number) => {
  //               openActionModal(insertIndex);
  //             },
  //             index: safeIndex + 1,
  //           },
  //         });
  //       }

  //       return newEdges;
  //     });

  //     return newNodes;
  //   });

  //   toast.success(`${nodeData.label} inserted into workflow!`);
  // }, [setNodes, setEdges, openActionModal]);


  const handleAddNodeToBranch = useCallback((branchType: string, placeholderNodeId: string, conditionNodeId: string, existingBranchPath?: string) => {
    console.log('🔍 Placeholder clicked:', { branchType, placeholderNodeId, conditionNodeId, existingBranchPath });

    // Create or extend the branch path for nested conditions
    const branchPath = existingBranchPath || createBranchPath(undefined, conditionNodeId, branchType as 'yes' | 'no');
    const parentConditions = getParentConditions(branchPath);
    const level = getBranchLevel(branchPath);

    console.log('🌳 Branch context:', { branchPath, parentConditions, level });

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

  //     const handleAddNodeToBranch = useCallback((branchType: string, conditionNodeId: string, placeholderNodeId: string) => {
  //   console.log(`Adding node to branch: ${branchType} of condition: ${conditionNodeId}`);

  //   // Find the placeholder node to get its position and context
  //   const placeholderNode = nodes.find(n => n.id === placeholderNodeId);
  //   if (!placeholderNode) {
  //     console.error('Placeholder node not found');
  //     return;
  //   }

  //   // Calculate the insertion index within the branch
  //   const branchEdges = edges.filter(edge => 
  //     edge.data?.branchType === branchType && 
  //     edge.data?.conditionNodeId === conditionNodeId &&
  //     edge.type === 'flowEdge'
  //   );

  //   // Find the position of this placeholder in the branch sequence
  //   const insertionIndex = branchEdges.findIndex(edge => 
  //     edge.target === placeholderNodeId
  //   );

  //   // If this is an insertion between nodes, we need to handle it differently
  //   const isInsertionBetweenNodes = insertionIndex >= 0;

  //   if (isInsertionBetweenNodes) {
  //     // This is an insertion between existing nodes
  //     console.log(`Inserting node between existing nodes at index: ${insertionIndex}`);

  //     // Update the branch info to include insertion context
  //     setConditionBranchInfo({
  //       conditionNodeId,
  //       branchType,
  //       placeholderNodeId,
  //       insertionIndex, // Add insertion index for proper positioning
  //     });
  //     setShowActionModal(true);

  //   } else {
  //     // This is adding to the end of the branch
  //     console.log(`Adding node to end of branch: ${branchType}`);

  //     setConditionBranchInfo({
  //       conditionNodeId,
  //       branchType,
  //       placeholderNodeId,
  //     });

  //     setShowActionModal(true);

  //   }

  //   setShowActionModal(true);
  // }, [nodes, edges, setConditionBranchInfo, setShowActionModal]);

  const handleNodeInsertion = useCallback((afterNodeIndex: number, nodeType: string, nodeData: NodeData) => {
    const isConditionNode = nodeType === 'condition' || nodeData.type === 'condition';
    const actualNodeType = isConditionNode ? 'condition' : nodeType;
    const actualNodeData = isConditionNode
      ? { ...nodeData, branchNodes: { branch1: [], otherwise: [] }, isConfigured: false }
      : nodeData;

    // 🔑 GENERATE ALL IDs UPFRONT - This is the key fix
    const timestamp = Date.now();
    const nodeId = `${actualNodeType}-${timestamp}`;
    const yesId = `placeholder-yes-${timestamp}`;
    const noId = `placeholder-no-${timestamp}`;

    const newNode: Node = {
      id: nodeId,
      type: actualNodeType,
      position: { x: 0, y: 0 },
      data: {
        ...actualNodeData,
        label: nodeData.label,
        openTriggerModal: actualNodeType === 'trigger' ? () => setShowTriggerModal(true) : undefined,
        isConfigured: false,
        onDelete: isConditionNode ? () => handleConditionNodeDeletion(nodeId) : () => handleNodeDeletion(nodeId),
        // Store the placeholder IDs for consistent edge creation
        ...(isConditionNode && {
          yesPlaceholderId: yesId,
          noPlaceholderId: noId,
        }),
      },
    };

    setNodes((nds) => {
      const newNodes = [...nds];
      let safeIndex = afterNodeIndex;

      // 🔐 Ensure valid index
      if (safeIndex < 0 || safeIndex >= newNodes.length) {
        const triggerNode = newNodes.find(n => n.type === 'trigger');
        safeIndex = triggerNode ? newNodes.findIndex(n => n.id === triggerNode.id) : -1;
      }

      const previousNode = safeIndex >= 0 ? newNodes[safeIndex] : newNodes.find(n => n.type === 'trigger');
      const nextNode = newNodes[safeIndex + 1];

      // Insert the new node
      newNodes.splice(safeIndex + 1, 0, newNode);

      // ✅ CONDITIONAL NODE STRUCTURE LOGIC - USING YOUR ORIGINAL APPROACH
      if (isConditionNode) {
        if (nextNode && nextNode.id !== 'virtual-end') {
          // Move the immediate next node to the "Yes" branch
          const updatedNextNode = {
            ...nextNode,
            data: {
              ...nextNode.data,
              branchType: 'yes',
              conditionNodeId: nodeId,
              showBottomPlus: nextNode.type === 'action' ? true : nextNode.data.showBottomPlus,
              onInsertBelow: nextNode.type === 'action' ? (nodeId: string) => {
                setConditionBranchInfo({
                  conditionNodeId: nodeId,
                  branchType: 'yes',
                  placeholderNodeId: `after-${nodeId}`
                });
                setShowActionModal(true);
              } : nextNode.data.onInsertBelow,
            }
          };

          const nextNodeIndex = newNodes.findIndex(n => n.id === nextNode.id);
          if (nextNodeIndex !== -1) {
            newNodes[nextNodeIndex] = updatedNextNode;
          }

          // ✅ Update ALL downstream nodes to have Yes branch context
          // All nodes after the moved node should also be in the Yes branch
          for (let i = nextNodeIndex + 1; i < newNodes.length; i++) {
            if (newNodes[i] && newNodes[i].id !== 'virtual-end') {
              newNodes[i] = {
                ...newNodes[i],
                data: {
                  ...newNodes[i].data,
                  branchType: 'yes',
                  conditionNodeId: nodeId,
                  onDelete: newNodes[i].type === 'condition'
                    ? () => handleConditionNodeDeletion(newNodes[i].id)
                    : () => handleConditionBranchNodeDeletion(newNodes[i].id, nodeId, 'yes'),
                }
              };
            }
          }

          // Create "No" branch placeholder
          const noPlaceholder: Node = {
            id: noId, // ✅ Use the same ID generated above
            type: 'placeholder',
            position: { x: 0, y: 0 },
            width: nodeWidth,
            height: nodeWidth,
            data: {
              label: 'Add Action',
              isConfigured: false,
              branchType: 'no',
              conditionNodeId: nodeId,
              handleAddNodeToBranch,
            },
          };

          newNodes.splice(safeIndex + 2, 0, noPlaceholder);
          // Store the actual node IDs for edge creation
          newNode.data.yesPlaceholderId = nextNode.id;
          newNode.data.noPlaceholderId = noId;

        } else {
          // No next node, create both placeholders
          const yesPlaceholder: Node = {
            id: yesId, // ✅ Use the same ID generated above
            type: 'placeholder',
            position: { x: 0, y: 0 },
            width: nodeWidth,
            height: nodeWidth,
            data: {
              label: 'Add Action',
              isConfigured: false,
              branchType: 'yes',
              conditionNodeId: nodeId,
              handleAddNodeToBranch,
            },
          };

          const noPlaceholder: Node = {
            id: noId, // ✅ Use the same ID generated above
            type: 'placeholder',
            position: { x: 0, y: 0 },
            width: nodeWidth,
            height: nodeWidth,
            data: {
              label: 'Add Action',
              isConfigured: false,
              branchType: 'no',
              conditionNodeId: nodeId,
              handleAddNodeToBranch,
            },
          };

          newNodes.splice(safeIndex + 2, 0, yesPlaceholder, noPlaceholder);
          // Store the placeholder IDs for edge creation
          newNode.data.yesPlaceholderId = yesId;
          newNode.data.noPlaceholderId = noId;
        }
      }

      // ✅ Update edges after node insertion
      setEdges((eds) => {
        let newEdges = [...eds];

        // 🧹 Remove edge between previous ➝ next
        if (previousNode && nextNode) {
          newEdges = newEdges.filter(edge =>
            !(edge.source === previousNode.id && edge.target === nextNode.id)
          );
        }

        // ➕ Add edge: previous ➝ new
        if (previousNode) {
          newEdges.push({
            id: `edge-${previousNode.id}-${nodeId}`,
            source: previousNode.id,
            target: nodeId,
            type: 'flowEdge',
            animated: false,
            data: {
              onOpenActionModal: (insertIndex: number) => openActionModal(insertIndex),
              index: safeIndex,
            },
          });
        }

        if (isConditionNode) {
          // ➕ Condition edges using the stored target IDs
          const yesTargetId = String(newNode.data.yesPlaceholderId || '');
          const noTargetId = String(newNode.data.noPlaceholderId || '');

          console.log(`🔍 Creating condition edges: ${nodeId} -> ${yesTargetId} (Yes), ${nodeId} -> ${noTargetId} (No)`);

          // ✅ Create Yes edge (either to existing node or placeholder)
          if (yesTargetId) {
            newEdges.push({
              id: `edge-${nodeId}-yes`,
              source: nodeId,
              sourceHandle: 'yes',
              target: yesTargetId,
              type: 'condition',
              label: 'Yes',
              data: { branchType: 'yes' },
            });
          }

          // ✅ Create No edge (always to placeholder)
          if (noTargetId) {
            newEdges.push({
              id: `edge-${nodeId}-no`,
              source: nodeId,
              sourceHandle: 'no',
              target: noTargetId,
              type: 'condition',
              label: 'No',
              data: { branchType: 'no' },
            });
          }

          // Note: Ghost node logic removed as requested - not needed for main flow insertion

        } else if (nextNode) {
          // // ➕ Add edge: new ➝ next
          newEdges.push({
            id: `edge-${nodeId}-${nextNode.id}`,
            source: nodeId,
            target: nextNode.id,
            type: 'flowEdge',
            animated: false,
            data: {
              onOpenActionModal: (insertIndex: number) => openActionModal(insertIndex),
              index: safeIndex + 1,
            },
          });
        }

        return newEdges;
      });

      return newNodes;
    });

    toast.success(`${nodeData.label} inserted into workflow!`);
  }, [setNodes, setEdges, openActionModal, handleAddNodeToBranch, handleConditionNodeDeletion, handleNodeDeletion]);

//  const handleNodeInsertion = useCallback((afterNodeIndex: number, nodeType: string, nodeData: NodeData) => {
//   const isConditionNode = nodeType === 'condition' || nodeData.type === 'condition';
//   const actualNodeType = isConditionNode ? 'condition' : nodeType;
//   const actualNodeData = isConditionNode
//     ? { ...nodeData, branchNodes: { branch1: [], otherwise: [] }, isConfigured: false }
//     : nodeData;

//   // 🔑 GENERATE ALL IDs UPFRONT - This is the key fix
//   const timestamp = Date.now();
//   const nodeId = `${actualNodeType}-${timestamp}`;
//   const yesId = `placeholder-yes-${timestamp}`;
//   const noId = `placeholder-no-${timestamp}`;

//   const newNode: Node = {
//     id: nodeId,
//     type: actualNodeType,
//     position: { x: 0, y: 0 },
//     data: {
//       ...actualNodeData,
//       label: nodeData.label,
//       openTriggerModal: actualNodeType === 'trigger' ? () => setShowTriggerModal(true) : undefined,
//       isConfigured: false,
//       onDelete: isConditionNode ? () => handleConditionNodeDeletion(nodeId) : () => handleNodeDeletion(nodeId),
//       // Store the placeholder IDs for consistent edge creation
//       ...(isConditionNode && {
//         yesPlaceholderId: yesId,
//         noPlaceholderId: noId,
//       }),
//     },
//   };

//   setNodes((nds) => {
//     const newNodes = [...nds];
//     let safeIndex = afterNodeIndex;

//     // 🔐 Ensure valid index
//     if (safeIndex < 0 || safeIndex >= newNodes.length) {
//       const triggerNode = newNodes.find(n => n.type === 'trigger');
//       safeIndex = triggerNode ? newNodes.findIndex(n => n.id === triggerNode.id) : -1;
//     }

//     const previousNode = safeIndex >= 0 ? newNodes[safeIndex] : newNodes.find(n => n.type === 'trigger');
//     const nextNode = newNodes[safeIndex + 1];

//     // Insert the new node
//     newNodes.splice(safeIndex + 1, 0, newNode);

//     // ✅ CONDITIONAL NODE STRUCTURE LOGIC
//     if (isConditionNode) {
//       if (nextNode && nextNode.id !== 'virtual-end') {
//         // Move the next node to the "Yes" branch
//         const updatedNextNode = {
//           ...nextNode,
//           data: {
//             ...nextNode.data,
//             branchType: 'yes',
//             conditionNodeId: nodeId,
//             showBottomPlus: nextNode.type === 'action' ? true : nextNode.data.showBottomPlus,
//             onInsertBelow: nextNode.type === 'action' ? (nodeId: string) => {
//               setConditionBranchInfo({
//                 conditionNodeId: nodeId,
//                 branchType: 'yes',
//                 placeholderNodeId: `after-${nodeId}`
//               });
//               setShowActionModal(true);
//             } : nextNode.data.onInsertBelow,
//           }
//         };

//         const nextNodeIndex = newNodes.findIndex(n => n.id === nextNode.id);
//         if (nextNodeIndex !== -1) {
//           newNodes[nextNodeIndex] = updatedNextNode;
//         }

//         // Create "No" branch placeholder
//         const noPlaceholder: Node = {
//           id: noId, // ✅ Use the same ID generated above
//           type: 'placeholder',
//           position: { x: 0, y: 0 },
//           width: nodeWidth,
//           height: nodeWidth,
//           data: {
//             label: 'Add Action',
//             isConfigured: false,
//             branchType: 'no',
//             conditionNodeId: nodeId,
//             handleAddNodeToBranch,
//           },
//         };

//         newNodes.splice(safeIndex + 2, 0, noPlaceholder);
//         // Store the actual node IDs for edge creation
//         newNode.data.yesPlaceholderId = nextNode.id;
//         newNode.data.noPlaceholderId = noId;

//       } else {
//         // No next node, create both placeholders
//         const yesPlaceholder: Node = {
//           id: yesId, // ✅ Use the same ID generated above
//           type: 'placeholder',
//           position: { x: 0, y: 0 },
//           width: nodeWidth,
//           height: nodeWidth,
//           data: {
//             label: 'Add Action',
//             isConfigured: false,
//             branchType: 'yes',
//             conditionNodeId: nodeId,
//             handleAddNodeToBranch,
//           },
//         };

//         const noPlaceholder: Node = {
//           id: noId, // ✅ Use the same ID generated above
//           type: 'placeholder',
//           position: { x: 0, y: 0 },
//           width: nodeWidth,
//           height: nodeWidth,
//           data: {
//             label: 'Add Action',
//             isConfigured: false,
//             branchType: 'no',
//             conditionNodeId: nodeId,
//             handleAddNodeToBranch,
//           },
//         };

//         newNodes.splice(safeIndex + 2, 0, yesPlaceholder, noPlaceholder);
//         // Store the placeholder IDs for edge creation
//         newNode.data.yesPlaceholderId = yesId;
//         newNode.data.noPlaceholderId = noId;
//       }
//     }

//     // ✅ Update edges after node insertion
//     setEdges((eds) => {
//       let newEdges = [...eds];

//       // 🧹 Remove edge between previous ➝ next
//       if (previousNode && nextNode) {
//         newEdges = newEdges.filter(edge =>
//           !(edge.source === previousNode.id && edge.target === nextNode.id)
//         );
//       }

//       // ➕ Add edge: previous ➝ new
//       if (previousNode) {
//         newEdges.push({
//           id: `edge-${previousNode.id}-${nodeId}`,
//           source: previousNode.id,
//           target: nodeId,
//           type: 'flowEdge',
//           animated: false,
//           data: {
//             onOpenActionModal: (insertIndex: number) => openActionModal(insertIndex),
//             index: safeIndex,
//           },
//         });
//       }

//       if (isConditionNode) {
//         // ➕ Condition edges using the SAME IDs
//         const yesTargetId = String(newNode.data.yesPlaceholderId || '');
//         const noTargetId = String(newNode.data.noPlaceholderId || '');

//         console.log(`🔍 Creating condition edges: ${nodeId} -> ${yesTargetId} (Yes), ${nodeId} -> ${noTargetId} (No)`);

//         if (yesTargetId) {
//           newEdges.push({
//             id: `edge-${nodeId}-yes`,
//             source: nodeId,
//             sourceHandle: 'yes',
//             target: yesTargetId, // ✅ Same ID as node creation
//             type: 'condition',
//             label: 'Yes',
//             data: { branchType: 'yes' },
//           });
//         }

//         if (noTargetId) {
//           newEdges.push({
//             id: `edge-${nodeId}-no`,
//             source: nodeId,
//             sourceHandle: 'no',
//             target: noTargetId, // ✅ Same ID as node creation
//             type: 'condition',
//             label: 'No',
//             data: { branchType: 'no' },
//           });
//         }

//       } else if (nextNode) {
//         // // ➕ Add edge: new ➝ next
//         newEdges.push({
//           id: `edge-${nodeId}-${nextNode.id}`,
//           source: nodeId,
//           target: nextNode.id,
//           type: 'flowEdge',
//           animated: false,
//           data: {
//             onOpenActionModal: (insertIndex: number) => openActionModal(insertIndex),
//             index: safeIndex + 1,
//           },
//         });
//       }

//       return newEdges;
//     });

//     return newNodes;
//   });

//   toast.success(`${nodeData.label} inserted into workflow!`);
// }, [setNodes, setEdges, openActionModal, handleAddNodeToBranch, handleConditionNodeDeletion, handleNodeDeletion]);

// const handleNodeInsertion = useCallback((afterNodeIndex: number, nodeType: string, nodeData: NodeData) => {
//   const isConditionNode = nodeType === 'condition' || nodeData.type === 'condition';
//   const actualNodeType = isConditionNode ? 'condition' : nodeType;
//   const actualNodeData = isConditionNode
//     ? { ...nodeData, branchNodes: { branch1: [], otherwise: [] }, isConfigured: false }
//     : nodeData;

//   // 🔑 GENERATE ALL IDs UPFRONT - This is the key fix
//   const timestamp = Date.now();
//   const nodeId = `${actualNodeType}-${timestamp}`;
//   const yesId = `placeholder-yes-${timestamp}`;
//   const noId = `placeholder-no-${timestamp}`;

//   const newNode: Node = {
//     id: nodeId,
//     type: actualNodeType,
//     position: { x: 0, y: 0 },
//     data: {
//       ...actualNodeData,
//       label: nodeData.label,
//       openTriggerModal: actualNodeType === 'trigger' ? () => setShowTriggerModal(true) : undefined,
//       isConfigured: false,
//       onDelete: isConditionNode ? () => handleConditionNodeDeletion(nodeId) : () => handleNodeDeletion(nodeId),
//       // Store the placeholder IDs for consistent edge creation
//       ...(isConditionNode && {
//         yesPlaceholderId: yesId,
//         noPlaceholderId: noId,
//       }),
//     },
//   };

//   setNodes((nds) => {
//     const newNodes = [...nds];
//     let safeIndex = afterNodeIndex;

//     // 🔐 Ensure valid index
//     if (safeIndex < 0 || safeIndex >= newNodes.length) {
//       const triggerNode = newNodes.find(n => n.type === 'trigger');
//       safeIndex = triggerNode ? newNodes.findIndex(n => n.id === triggerNode.id) : -1;
//     }

//     const previousNode = safeIndex >= 0 ? newNodes[safeIndex] : newNodes.find(n => n.type === 'trigger');
//     const nextNode = newNodes[safeIndex + 1];

//     // Insert the new node
//     newNodes.splice(safeIndex + 1, 0, newNode);

//     // ✅ CONDITIONAL NODE STRUCTURE LOGIC
//     if (isConditionNode) {
//       if (nextNode && nextNode.id !== 'virtual-end') {
//         // Move the next node to the "Yes" branch
//         const updatedNextNode = {
//           ...nextNode,
//           data: {
//             ...nextNode.data,
//             branchType: 'yes',
//             conditionNodeId: nodeId,
//             showBottomPlus: nextNode.type === 'action' ? true : nextNode.data.showBottomPlus,
//             onInsertBelow: nextNode.type === 'action' ? (nodeId: string) => {
//               setConditionBranchInfo({
//                 conditionNodeId: nodeId,
//                 branchType: 'yes',
//                 placeholderNodeId: `after-${nodeId}`
//               });
//               setShowActionModal(true);
//             } : nextNode.data.onInsertBelow,
//           }
//         };

//         const nextNodeIndex = newNodes.findIndex(n => n.id === nextNode.id);
//         if (nextNodeIndex !== -1) {
//           newNodes[nextNodeIndex] = updatedNextNode;
//         }

//         // 🔑 CREATE GHOST NODE FOR CONDITION NODES - FIXED LOGIC
//         let ghostNodeId = null;
//         if (nextNode.type === 'condition') {
//           ghostNodeId = `ghost-yes-${timestamp}`;
//           const yesGhostNode: Node = {
//             id: ghostNodeId,
//             type: 'ghost',
//             position: { x: 0, y: 0 },
//             width: 5,
//             height: 5,
//             data: {},
//           };
          
//           // Insert ghost node after the moved condition node
//           newNodes.splice(nextNodeIndex + 1, 0, yesGhostNode);

//           // Store ghost node ID in the moved node's data
//           updatedNextNode.data.ghostNodeId = ghostNodeId;
//           newNodes[nextNodeIndex] = updatedNextNode;
//         }

//         // Create "No" branch placeholder
//         const noPlaceholder: Node = {
//           id: noId,
//           type: 'placeholder',
//           position: { x: 0, y: 0 },
//           width: nodeWidth,
//           height: nodeWidth,
//           data: {
//             label: 'Add Action',
//             isConfigured: false,
//             branchType: 'no',
//             conditionNodeId: nodeId,
//             handleAddNodeToBranch,
//           },
//         };

//         newNodes.splice(safeIndex + 2, 0, noPlaceholder);
        
//         // Store the actual node IDs for edge creation
//         newNode.data.yesPlaceholderId = nextNode.id;
//         newNode.data.noPlaceholderId = noId;
//         newNode.data.ghostNodeId = ghostNodeId; // Store ghost node ID in condition node

//       } else {
//         // No next node, create both placeholders
//         const yesPlaceholder: Node = {
//           id: yesId,
//           type: 'placeholder',
//           position: { x: 0, y: 0 },
//           width: nodeWidth,
//           height: nodeWidth,
//           data: {
//             label: 'Add Action',
//             isConfigured: false,
//             branchType: 'yes',
//             conditionNodeId: nodeId,
//             handleAddNodeToBranch,
//           },
//         };

//         const noPlaceholder: Node = {
//           id: noId,
//           type: 'placeholder',
//           position: { x: 0, y: 0 },
//           width: nodeWidth,
//           height: nodeWidth,
//           data: {
//             label: 'Add Action',
//             isConfigured: false,
//             branchType: 'no',
//             conditionNodeId: nodeId,
//             handleAddNodeToBranch,
//           },
//         };

//         newNodes.splice(safeIndex + 2, 0, yesPlaceholder, noPlaceholder);
        
//         // Store the placeholder IDs for edge creation
//         newNode.data.yesPlaceholderId = yesId;
//         newNode.data.noPlaceholderId = noId;
//       }
//     }

//     // ✅ Update edges after node insertion
//     setEdges((eds) => {
//       let newEdges = [...eds];

//       // 🧹 Remove edge between previous ➝ next
//       if (previousNode && nextNode) {
//         newEdges = newEdges.filter(edge =>
//           !(edge.source === previousNode.id && edge.target === nextNode.id)
//         );
//       }

//       // ➕ Add edge: previous ➝ new
//       if (previousNode) {
//         newEdges.push({
//           id: `edge-${previousNode.id}-${nodeId}`,
//           source: previousNode.id,
//           target: nodeId,
//           type: 'flowEdge',
//           animated: false,
//           data: {
//             onOpenActionModal: (insertIndex: number) => openActionModal(insertIndex),
//             index: safeIndex,
//           },
//         });
//       }

//       if (isConditionNode) {
//         // ➕ Condition edges using the SAME IDs
//         const yesTargetId = String(newNode.data.yesPlaceholderId || '');
//         const noTargetId = String(newNode.data.noPlaceholderId || '');
//         const ghostNodeId = newNode.data.ghostNodeId;

//         console.log(`🔍 Creating condition edges: ${nodeId} -> ${yesTargetId} (Yes), ${nodeId} -> ${noTargetId} (No)`);

//         if (yesTargetId) {
//           newEdges.push({
//             id: `edge-${nodeId}-yes`,
//             source: nodeId,
//             sourceHandle: 'yes',
//             target: yesTargetId,
//             type: 'condition',
//             label: 'Yes',
//             data: { branchType: 'yes' },
//           });
//         }

//         if (noTargetId) {
//           newEdges.push({
//             id: `edge-${nodeId}-no`,
//             source: nodeId,
//             sourceHandle: 'no',
//             target: noTargetId,
//             type: 'condition',
//             label: 'No',
//             data: { branchType: 'no' },
//           });
//         }

//         // ✅ FIXED: Create edge from moved CONDITION node to its ghost node
//         if (ghostNodeId && yesTargetId && yesTargetId !== noTargetId) {
//           console.log(`🔍 Creating ghost edge: ${yesTargetId} -> ${ghostNodeId}`);
          
//           newEdges.push({
//             id: `edge-${yesTargetId}-${ghostNodeId}`,
//             source: yesTargetId,
//             target: ghostNodeId,
//             type: 'flowEdge',
//             animated: false,
//             data: {
//               onOpenActionModal: () => {
//                 // Create a temporary placeholder for insertion after this moved condition node
//                 const tempPlaceholderId = `temp-placeholder-${Date.now()}`;

//                 setNodes(prevNodes => {
//                   const tempPlaceholder: Node = {
//                     id: tempPlaceholderId,
//                     type: 'placeholder',
//                     position: { x: 0, y: 0 },
//                     width: nodeWidth,
//                     height: nodeWidth,
//                     data: {
//                       label: 'Add Action',
//                       branchType: 'yes',
//                       conditionNodeId: nodeId,
//                       handleAddNodeToBranch,
//                       isTemporary: true,
//                     },
//                   };
//                   return [...prevNodes, tempPlaceholder];
//                 });

//                 setConditionBranchInfo({
//                   conditionNodeId: nodeId,
//                   branchType: 'yes',
//                   placeholderNodeId: tempPlaceholderId
//                 });
//                 setShowActionModal(true);
//               },
//               index: 0,
//             },
//           });
//         }

//       } else if (nextNode) {
//         // ➕ Add edge: new ➝ next
//         newEdges.push({
//           id: `edge-${nodeId}-${nextNode.id}`,
//           source: nodeId,
//           target: nextNode.id,
//           type: 'flowEdge',
//           animated: false,
//           data: {
//             onOpenActionModal: (insertIndex: number) => openActionModal(insertIndex),
//             index: safeIndex + 1,
//           },
//         });
//       }

//       return newEdges;
//     });

//     return newNodes;
//   });

//   toast.success(`${nodeData.label} inserted into workflow!`);

// }, [setNodes, setEdges, openActionModal, handleAddNodeToBranch, handleConditionNodeDeletion, handleNodeDeletion]);

  const handleConditionBranchNodeDeletion = useCallback((nodeId: string, conditionNodeId: string, branchType: 'yes' | 'no') => {
    console.log('🔍 Deleting branch node:', { nodeId, conditionNodeId, branchType });

    // Generate the placeholder ID once to use in both nodes and edges
    const newPlaceholderId = `placeholder-${branchType}-${Date.now()}`;

    setNodes((nds) => {
      // Find the node being deleted to get its position and branch context
      const deletedNode = nds.find(node => node.id === nodeId);
      if (!deletedNode) {
        console.log('❌ Node to delete not found:', nodeId);
        return nds;
      }

      const nodePosition = deletedNode.position;

      // Extract branch context from the deleted node
      const branchPath = deletedNode.data?.branchPath;
      const level = deletedNode.data?.level || 0;
      const parentConditions = deletedNode.data?.parentConditions || [];

      console.log('🌳 Preserving branch context:', { branchPath, level, parentConditions });

      // Remove the deleted node
      const filteredNodes = nds.filter(node => node.id !== nodeId);

      // Create a new placeholder to replace the deleted node with full branch context
      const newPlaceholder = {
        id: newPlaceholderId,
        type: 'placeholder',
        position: nodePosition,
        width: 340,
        height: 80,
        data: {
          label: 'Add Node',
          isConfigured: false,
          branchType: branchType,
          conditionNodeId: conditionNodeId,
          branchPath: branchPath,
          level: level,
          parentConditions: parentConditions,
          handleAddNodeToBranch: (branchType: string, placeholderNodeId: string, conditionNodeId: string) =>
            handleAddNodeToBranch(branchType, placeholderNodeId, conditionNodeId, branchPath || undefined),
        }
      };

      filteredNodes.push(newPlaceholder);
      return filteredNodes;
    });

    setEdges((eds) => {
      console.log('🔍 Updating edges for deleted node:', nodeId);
      console.log('🔍 Current edges:', eds.map(e => `${e.source} -> ${e.target}`));

      return eds.map(edge => {
        if (edge.target === nodeId) {
          // Edge pointing to deleted node should now point to new placeholder
          console.log('🔍 Redirecting edge to placeholder:', `${edge.source} -> ${newPlaceholderId}`);
          return {
            ...edge,
            target: newPlaceholderId,
            id: `edge-${edge.source}-${newPlaceholderId}`
          };
        }
        if (edge.source === nodeId) {
          // Edge from deleted node should be removed (placeholder will handle new connections)
          console.log('🔍 Removing outgoing edge from deleted node');
          return null;
        }
        return edge;
      }).filter(Boolean); // Remove null edges
    });

    toast.success('Node replaced with placeholder!');
  }, [setNodes, setEdges, handleAddNodeToBranch]);

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

          const newNode: Node = {
            id: newNodeId,
            type: isCondition ? 'condition' : 'action',
            position: { x: sourceNode.position.x, y: sourceNode.position.y + 120 },
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
              // ✅ Store placeholder IDs for conditional nodes
              ...(isCondition && {
                yesPlaceholderId: yesId,
                noPlaceholderId: noId,
              }),
            },
          };

          // ✅ If it's a conditional node, create Yes/No placeholders with nested branch context
          if (isCondition) {
            // Create nested branch paths for the new condition
            const newYesBranchPath = createBranchPath(branchPath, newNodeId, 'yes');
            const newNoBranchPath = createBranchPath(branchPath, newNodeId, 'no');
            const newLevel = (conditionBranchInfo?.level || 0) + 1;
            const newParentConditions = [...(conditionBranchInfo?.parentConditions || []), newNodeId];

            const yesPlaceholder: Node = {
              id: yesId,
              type: 'placeholder',
              position: { x: newNode.position.x - 200, y: newNode.position.y + 150 },
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
              position: { x: newNode.position.x + 200, y: newNode.position.y + 150 },
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
            // For conditional nodes, create condition edges to Yes/No placeholders
            newEdges.push(
              {
                id: `edge-${newNodeId}-yes`,
                source: newNodeId,
                sourceHandle: 'yes',
                target: yesId,
                type: 'condition',
                label: 'Yes',
                data: { branchType: 'yes' },
              },
              {
                id: `edge-${newNodeId}-no`,
                source: newNodeId,
                sourceHandle: 'no',
                target: noId,
                type: 'condition',
                label: 'No',
                data: { branchType: 'no' },
              }
            );
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
            position: { x: newNode.position.x - 200, y: newNode.position.y + 150 },
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
            position: { x: newNode.position.x + 200, y: newNode.position.y + 150 },
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
            const ghostNode: Node = {
              id: ghostNodeId,
              type: 'ghost',
              position: { x: newNode.position.x, y: newNode.position.y + 100 },
              width: 5,
              height: 5,
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
      setConditionBranchInfo(null);
    } else {
      // Handle top-level insertion
      if (actionInsertIndex !== null) {
        handleNodeInsertion(actionInsertIndex, action.type || 'action', action);
        setActionInsertIndex(null);
      } else {
        handleNodeSelection(action.type || 'action', action);
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
  createBranchPath
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
