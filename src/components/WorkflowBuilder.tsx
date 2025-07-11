
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Node } from '@xyflow/react';
import { RotateCcw, Plus, Minus, Lock, Unlock } from 'lucide-react';

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

  const nodeWidth = 340;
  const nodeHeight = 80;

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
    placeholderNodeId: string;
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
  // const handleNodeDeletion = useCallback((nodeId: string | number) => {
  //   console.log('🗑️ Deleting node:', nodeId);

  //   // Convert to string for consistent handling
  //   const nodeIdStr = String(nodeId);

  //   // Don't delete end node or trigger nodes
  //   if (nodeIdStr === 'virtual-end' || nodeIdStr.startsWith('trigger-')) {
  //     console.log('❌ Cannot delete end node or trigger nodes');
  //     return;
  //   }

  //   // Find the actual node to get its real ID
  //   const nodeToDelete = nodes.find(node => {
  //     // Check if it's a direct ID match or if it's the data.id
  //     return String(node.id) === nodeIdStr || String(node.data?.id) === nodeIdStr;
  //   });

  //   if (!nodeToDelete) {
  //     console.log('❌ Node not found:', nodeIdStr);
  //     return;
  //   }

  //   const actualNodeId = nodeToDelete.id;
  //   console.log('🔍 Found node to delete:', actualNodeId);

  //   // Remove the specific node using the actual node ID
  //   setNodes((nds) => {
  //     console.log('🔍 Before deletion - nodes:', nds.map(n => `${n.id} (${n.data?.id || 'no data.id'})`));
  //     const filteredNodes = nds.filter(node => node.id !== actualNodeId);
  //     console.log('🔍 After deletion - nodes:', filteredNodes.map(n => `${n.id} (${n.data?.id || 'no data.id'})`));
  //     return filteredNodes;
  //   });

  //   // Remove edges connected to this node
  //   setEdges((eds) => {
  //     console.log('🔍 Before edge deletion - edges:', eds.map(e => `${e.source}->${e.target}`));
  //     const filteredEdges = eds.filter(edge => edge.source !== actualNodeId && edge.target !== actualNodeId);
  //     console.log('🔍 After edge deletion - edges:', filteredEdges.map(e => `${e.source}->${e.target}`));
  //     return filteredEdges;
  //   });

  //   toast.success('Node deleted successfully!');
  // }, [setNodes, setEdges, nodes]); // Added 'nodes' to dependencies



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


  // Handle node insertion between existing nodes
  // const handleNodeInsertion = useCallback((afterNodeIndex: number, nodeType: string, nodeData: NodeData) => {

  //   const isConditionNode = nodeType === 'condition' || nodeData.type === 'condition';

  //   const actualNodeType = isConditionNode ? 'condition' : nodeType;
  //   const actualNodeData = isConditionNode
  //     ? { ...nodeData, branchNodes: { branch1: [], otherwise: [] }, isConfigured: false }
  //     : nodeData;

  //   const newNode: Node = {
  //     id: `${actualNodeType}-${Date.now()}`,
  //     type: actualNodeType,
  //     position: { x: 0, y: 0 },
  //     data: {
  //       ...actualNodeData,
  //       label: nodeData.label,
  //       openTriggerModal: actualNodeType === 'trigger' ? () => setShowTriggerModal(true) : undefined,
  //       isConfigured: false,
  //     },
  //   };

  //   setNodes((nds) => {
  //     const newNodes = [...nds];
  //     const previousNode = newNodes[afterNodeIndex];
  //     const nextNode = newNodes[afterNodeIndex + 1];

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

  //       newNodes[afterNodeIndex + 1] = newConditionalNode;

  //     } else {
  //       newNodes.splice(afterNodeIndex + 1, 0, newNode);

  //       if (isConditionNode) {
  //         const yesPlaceholder: Node = {
  //           id: `placeholder-yes-${Date.now()}`,
  //           type: 'placeholder',
  //           position: { x: 0, y: 0 }, // Hardcoded left position
  //           width: nodeWidth,
  //           height: nodeWidth,
  //           data: {
  //             label: 'Add Action',
  //             isConfigured: false,
  //             branchType: 'yes' as const,
  //             conditionNodeId: newNode.id,
  //             handleAddNodeToBranch
  //             // onAddAction: () => {
  //             //   setConditionBranchInfo({ conditionNodeId: newNode.id, branchType: 'yes' });
  //             //   setShowActionModal(true);
  //             // }
  //           }
  //         };

  //         const noPlaceholder: Node = {
  //           id: `placeholder-no-${Date.now() + 1}`,
  //           type: 'placeholder',
  //           position: { x: 0, y: 0 }, // Hardcoded left position
  //           width: nodeWidth,
  //           height: nodeWidth,
  //           data: {
  //             label: 'Add Action',
  //             isConfigured: false,
  //             branchType: 'no' as const,
  //             conditionNodeId: newNode.id,
  //             handleAddNodeToBranch
  //           }
  //         };

  //         newNodes.splice(afterNodeIndex + 2, 0, yesPlaceholder, noPlaceholder);
  //       }
  //     }

  //     setEdges((eds) => {
  //       let newEdges = [...eds];

  //       if (previousNode && nextNode) {
  //         newEdges = newEdges.filter(edge =>
  //           !(edge.source === previousNode.id && edge.target === nextNode.id)
  //         );
  //       }

  //       if (previousNode) {
  //         newEdges.push({
  //           id: `edge-${previousNode.id}-${newNode.id}`,
  //           source: previousNode.id,
  //           target: newNode.id,
  //           type: 'flowEdge',
  //           animated: false,
  //           data: {
  //             onOpenActionModal: (insertIndex: number) => {
  //               openActionModal(insertIndex);
  //             },
  //             index: afterNodeIndex,
  //           },
  //         });
  //       }

  //       if (isConditionNode) {
  //         const yesId = `placeholder-yes-${Date.now()}`;
  //         const noId = `placeholder-no-${Date.now() + 1}`;

  //         newEdges.push(
  //           {
  //             id: `edge-${newNode.id}-yes`,
  //             source: newNode.id,
  //             sourceHandle: 'yes',
  //             target: yesId,
  //             type: 'condition',
  //             label: 'Yes',
  //             data: {
  //               branchType: 'yes',
  //               // onAddNode: (branchType: string) => {
  //               //   setConditionBranchInfo({
  //               //     conditionNodeId: newNode.id,
  //               //     branchType: branchType as 'yes' | 'no',
  //               //   });
  //               //   setShowActionModal(true);
  //               // },
  //             },
  //           },
  //           {
  //             id: `edge-${newNode.id}-no`,
  //             source: newNode.id,
  //             sourceHandle: 'no',
  //             target: noId,
  //             type: 'condition',
  //             label: 'No',
  //             data: {
  //               branchType: 'no',
  //               // onAddNode: (branchType: string) => {
  //               //   setConditionBranchInfo({
  //               //     conditionNodeId: newNode.id,
  //               //     branchType: branchType as 'yes' | 'no',
  //               //   });
  //               //   setShowActionModal(true);
  //               // },
  //             },
  //           }
  //         );
  //       } else if (nextNode) {
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
  //             index: afterNodeIndex + 1,
  //           },
  //         });
  //       }

  //       return newEdges;
  //     });

  //     return newNodes;
  //   });

  //   toast.success(`${nodeData.label} inserted into workflow!`);
  // }, [setNodes, setEdges, openActionModal]);

  const handleNodeInsertion = useCallback((afterNodeIndex: number, nodeType: string, nodeData: NodeData) => {
    console.log('🔍 handleNodeInsertion called:', { afterNodeIndex, nodeType, nodeData });

    const isConditionNode = nodeType === 'condition' || nodeData.type === 'condition';

    const actualNodeType = isConditionNode ? 'condition' : nodeType;
    const actualNodeData = isConditionNode
      ? { ...nodeData, branchNodes: { branch1: [], otherwise: [] }, isConfigured: false }
      : nodeData;

    const nodeId = `${actualNodeType}-${Date.now()}`
    const newNode: Node = {
      id: nodeId,
      type: actualNodeType,
      position: { x: 0, y: 0 },
      data: {
        ...actualNodeData,
        label: nodeData.label,
        openTriggerModal: actualNodeType === 'trigger' ? () => setShowTriggerModal(true) : undefined,
        isConfigured: false,
        onDelete: isConditionNode ? () => {
          handleConditionNodeDeletion(nodeId);
        } : () => handleNodeDeletion(nodeId),
      },

    };

    console.log('🔍 Created new node:', newNode);

    // 🔑 Generate placeholder IDs ONCE at the top level
    const timestamp = Date.now();
    const yesId = `placeholder-yes-${timestamp}`;
    const noId = `placeholder-no-${timestamp + 1}`;

    setNodes((nds) => {
      console.log('🔍 Current nodes array:', nds.map(n => `${n.id} (${n.type})`));
      console.log('🔍 afterNodeIndex:', afterNodeIndex);

      const newNodes = [...nds];
      let safeIndex = afterNodeIndex;

      // 🛡 Ensure the index is valid (within bounds)
      if (safeIndex < 0 || safeIndex >= newNodes.length) {
        const triggerNode = newNodes.find(n => n.type === 'trigger');
        if (triggerNode) {
          safeIndex = newNodes.findIndex(n => n.id === triggerNode.id);
        } else {
          console.warn('No trigger node found. Inserting at start.');
          safeIndex = -1;
        }
      }

      const previousNode = safeIndex >= 0 ? newNodes[safeIndex] : newNodes.find(n => n.type === 'trigger');
      const nextNode = newNodes[safeIndex + 1];

      console.log('🔍 safeIndex:', safeIndex);
      console.log('🔍 previousNode:', previousNode?.id, previousNode?.type);
      console.log('🔍 nextNode:', nextNode?.id, nextNode?.type);

      if (isConditionNode && nextNode && nextNode.type === 'condition') {
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

        newNodes.splice(safeIndex + 1, 0, newNode);

      } else {
        newNodes.splice(safeIndex + 1, 0, newNode);


        if (isConditionNode) {
          // 🔄 CONDITIONAL RESTRUCTURING LOGIC
          // When inserting a condition node, move downstream nodes to the "Yes" branch

          if (nextNode && nextNode.id !== 'virtual-end') {
            console.log('🔄 Restructuring flow: Moving downstream to Yes branch');

            // Move the nextNode and all downstream nodes to the Yes branch
            // by replacing the Yes placeholder with the actual nextNode
            const yesNodeId = nextNode.id; // Use the existing downstream node as Yes branch

            // Update the nextNode to be part of the Yes branch
            const updatedNextNode = {
              ...nextNode,
              data: {
                ...nextNode.data,
                branchType: 'yes',
                conditionNodeId: newNode.id,
                // 🔄 Add plus button functionality for action nodes moved to Yes branch
                showBottomPlus: nextNode.type === 'action' ? true : nextNode.data.showBottomPlus,
                onInsertBelow: nextNode.type === 'action' ? (nodeId: string) => {
                  console.log('🔍 Insert below clicked in Yes branch:', nodeId);
                  setConditionBranchInfo({
                    conditionNodeId: newNode.id,
                    branchType: 'yes',
                    placeholderNodeId: `after-${nodeId}`
                  });
                  setShowActionModal(true);
                } : nextNode.data.onInsertBelow,
              }
            };

            // Replace the nextNode in the array with the updated version
            const nextNodeIndex = newNodes.findIndex(n => n.id === nextNode.id);
            if (nextNodeIndex !== -1) {
              newNodes[nextNodeIndex] = updatedNextNode;
            }

            // Create only the No placeholder (Yes branch uses the existing downstream)
            const noPlaceholder: Node = {
              id: noId,
              type: 'placeholder',
              position: { x: 0, y: 0 },
              width: nodeWidth,
              height: nodeWidth,
              data: {
                label: 'Add Action',
                isConfigured: false,
                branchType: 'no' as const,
                conditionNodeId: newNode.id,
                handleAddNodeToBranch
              }
            };

            // Add only the No placeholder
            newNodes.splice(safeIndex + 2, 0, noPlaceholder);

            // Store the Yes node ID for edge creation
            newNode.data.yesPlaceholderId = yesNodeId;
            newNode.data.noPlaceholderId = noId;

          } else {
            // No downstream nodes - create both placeholders as usual
            console.log('🔍 Creating both Yes and No placeholders (no downstream)');
            console.log('🔍 yesId:', yesId, 'noId:', noId);

            const yesPlaceholder: Node = {
              id: yesId,
              type: 'placeholder',
              position: { x: 0, y: 0 },
              width: nodeWidth,
              height: nodeWidth,
              data: {
                label: 'Add Action',
                isConfigured: false,
                branchType: 'yes' as const,
                conditionNodeId: newNode.id,
                handleAddNodeToBranch
              }
            };

            const noPlaceholder: Node = {
              id: noId,
              type: 'placeholder',
              position: { x: 0, y: 0 },
              width: nodeWidth,
              height: nodeWidth,
              data: {
                label: 'Add Action',
                isConfigured: false,
                branchType: 'no' as const,
                conditionNodeId: newNode.id,
                handleAddNodeToBranch
              }
            };

            newNodes.splice(safeIndex + 2, 0, yesPlaceholder, noPlaceholder);
            console.log('🔍 Added placeholders at index:', safeIndex + 2);

            // Store placeholder IDs for edge creation
            newNode.data.yesPlaceholderId = yesId;
            newNode.data.noPlaceholderId = noId;
            console.log('🔍 Stored placeholder IDs:', { yesPlaceholderId: yesId, noPlaceholderId: noId });
          }
        }
      }

      setEdges((eds) => {
        console.log('🔍 Current edges before insertion:', eds);
        console.log('🔍 Previous node:', previousNode);
        console.log('🔍 Next node:', nextNode);

        let newEdges = [...eds];

        if (previousNode && nextNode) {
          console.log('🔍 Removing edge between:', previousNode.id, '->', nextNode.id);
          newEdges = newEdges.filter(edge =>
            !(edge.source === previousNode.id && edge.target === nextNode.id)
          );
        }

        if (previousNode) {
          const newEdge = {
            id: `edge-${previousNode.id}-${newNode.id}`,
            source: previousNode.id,
            target: newNode.id,
            type: 'flowEdge',
            animated: false,
            data: {
              onOpenActionModal: (insertIndex: number) => {
                openActionModal(insertIndex);
              },
              index: safeIndex,
            },
          };
          console.log('🔍 Adding edge from previous to new:', newEdge);
          newEdges.push(newEdge);
        }

        if (isConditionNode) {
          // 🔄 Create condition edges based on restructuring
          const yesTargetId = String(newNode.data.yesPlaceholderId || '');
          const noTargetId = String(newNode.data.noPlaceholderId || '');

          console.log('🔍 Creating condition edges:', { yesTargetId, noTargetId });
          console.log('🔍 newNode.data:', newNode.data);

          // Create Yes branch edge
          if (yesTargetId) {
            const yesEdge = {
              id: `edge-${newNode.id}-yes`,
              source: newNode.id,
              sourceHandle: 'yes',
              target: yesTargetId,
              type: 'condition',
              label: 'Yes',
              data: {
                branchType: 'yes',
              },
            };
            newEdges.push(yesEdge);
            console.log('🔍 Added Yes edge:', yesEdge);
          } else {
            console.log('❌ No Yes target ID found!');
          }

          // Create No branch edge
          if (noTargetId) {
            const noEdge = {
              id: `edge-${newNode.id}-no`,
              source: newNode.id,
              sourceHandle: 'no',
              target: noTargetId,
              type: 'condition',
              label: 'No',
              data: {
                branchType: 'no',
              },
            };
            newEdges.push(noEdge);
            console.log('🔍 Added No edge:', noEdge);
          } else {
            console.log('❌ No No target ID found!');
          }

          // 🔧 Note: Downstream flow is now in the Yes branch
          // No additional connections needed as the restructuring handles it
        } else if (nextNode) {
          // For non-condition nodes, connect to the next node
          newEdges.push({
            id: `edge-${newNode.id}-${nextNode.id}`,
            source: newNode.id,
            target: nextNode.id,
            type: 'flowEdge',
            animated: false,
            data: {
              onOpenActionModal: (insertIndex: number) => {
                openActionModal(insertIndex);
              },
              index: safeIndex + 1,
            },
          });
        }

        return newEdges;
      });

      return newNodes;
    });

    toast.success(`${nodeData.label} inserted into workflow!`);
  }, [setNodes, setEdges, openActionModal]);


  const handleAddNodeToBranch = useCallback((branchType: string, placeholderNodeId: string, conditionNodeId: string) => {
    console.log(' Placeholder clicked:', { branchType, placeholderNodeId });

    // Save to state for modal, or directly open modal
    setConditionBranchInfo({
      conditionNodeId,
      branchType: branchType as 'yes' | 'no',
      placeholderNodeId
    });

    setShowActionModal(true);
  }, []);

  // Handle deletion of nodes inside condition branches (replace with placeholder)
  const handleConditionBranchNodeDeletion = useCallback((nodeId: string, conditionNodeId: string, branchType: 'yes' | 'no') => {
    console.log('🔍 Deleting branch node:', { nodeId, conditionNodeId, branchType });

    // Generate the placeholder ID once to use in both nodes and edges
    const newPlaceholderId = `placeholder-${branchType}-${Date.now()}`;

    setNodes((nds) => {
      // Find the node being deleted to get its position
      const deletedNode = nds.find(node => node.id === nodeId);
      const nodePosition = deletedNode ? deletedNode.position : { x: 0, y: 0 };

      // Remove the deleted node
      const filteredNodes = nds.filter(node => node.id !== nodeId);

      // Create a new placeholder to replace the deleted node
      const newPlaceholder = {
        id: newPlaceholderId,
        type: 'placeholder',
        position: nodePosition, // Use the same position as the deleted node
        width: 340,
        height: 80,
        data: {
          label: 'Add Action',
          isConfigured: false,
          branchType: branchType,
          conditionNodeId: conditionNodeId,
          handleAddNodeToBranch: handleAddNodeToBranch,
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

  const handleActionSelection = useCallback((action: NodeData) => {
    try {
      const isCondition = action.type === 'condition';

      if (conditionBranchInfo) {
        const { placeholderNodeId, branchType, conditionNodeId } = conditionBranchInfo;

        // Check if we're replacing a condition node (placeholderNodeId will be the condition node ID)
        const isReplacingCondition = nodes.some(n => n.id === placeholderNodeId && n.type === 'condition');

        if (isReplacingCondition) {
          console.log('🔍 Replacing condition node:', placeholderNodeId);

          // Replace the condition node while preserving branches
          setNodes((prevNodes) => {
            return prevNodes.map(node => {
              if (node.id === placeholderNodeId) {
                // Replace the condition node with the new one, keeping same ID and position
                return {
                  ...node,
                  data: {
                    ...action,
                    label: action.label,
                    isConfigured: false,
                    // Keep the same handlers
                    onReplace: () => handleConditionNodeReplacement(placeholderNodeId),
                    onDelete: () => handleConditionNodeDeletion(placeholderNodeId),
                    // Preserve branch-related data if it exists
                    handleAddNodeToBranch: node.data.handleAddNodeToBranch,
                  }
                };
              }
              return node;
            });
          });

          toast.success('Condition replaced successfully!');
          setConditionBranchInfo(null);
          setShowActionModal(false);
          return;
        }

        // Generate unique ID for the new node
        const newNodeId = `node-${Date.now()}`;
        // 🔑 Generate placeholder IDs ONCE at the top level
        const timestamp = Date.now();
        const yesId = `placeholder-yes-${Math.floor(Math.random() * 10001)}`;
        const noId = `placeholder-no-${Math.floor(Math.random() * 10001)}`;

        setNodes((prevNodes) => {
          const placeholder = prevNodes.find((n) => n.id === placeholderNodeId);
          if (!placeholder) {
            console.error('Placeholder not found:', placeholderNodeId);
            return prevNodes;
          }

          const newNode: Node = {
            id: newNodeId,
            type: isCondition ? 'condition' : 'action',
            position: placeholder.position, // ✅ Use exact position as placeholder
            data: {
              ...action,
              label: action.label,
              isConfigured: false,
              // 🔄 Add plus button for action nodes in condition branches
              showBottomPlus: !isCondition, // Only action nodes get plus buttons
              hasOutgoingEdge: false, // Will be updated by edges

              // Add replace handler for condition nodes
              onReplace: isCondition ? () => {
                console.log('🔍 Replacing condition node');
                handleConditionNodeReplacement(newNodeId);
              } : undefined,

              onDelete: isCondition
                ? () => {
                    console.log('🔍 Deleting condition node from branch');
                    handleConditionNodeDeletion(newNodeId);
                  }
                : () => {
                    console.log('🔍 Deleting branch node, replacing with placeholder');
                    console.log('🔍 Branch info:', { conditionNodeId: conditionBranchInfo.conditionNodeId, branchType });
                    handleConditionBranchNodeDeletion(newNodeId, conditionBranchInfo.conditionNodeId, branchType as 'yes' | 'no');
                  },

              // 🔄 Add insertion handler for action nodes in branches
              onInsertBelow: !isCondition ? (nodeId: string) => {
                console.log('🔍 Insert below clicked in condition branch:', nodeId);
                setConditionBranchInfo({
                  conditionNodeId: conditionBranchInfo.conditionNodeId,
                  branchType: branchType as 'yes' | 'no',
                  placeholderNodeId: `after-${nodeId}`
                });
                setShowActionModal(true);
              } : undefined,
            },
          };

          // Remove the placeholder that's being replaced
          let updatedNodes = prevNodes.filter((n) => n.id !== placeholderNodeId);
          updatedNodes.push(newNode);


          // If it's a condition node, add Yes/No placeholders
          if (isCondition) {
            // 🔍 Determine positioning based on parent branch context
            const parentBranchType = placeholder.data?.branchType;
            console.log('🔍 Adding condition to parent branch:', parentBranchType);

            // Calculate branch positions with consistent spacing
            const branchSpacing = 200; // Standard spacing between Yes/No branches

            // Use consistent relative positioning regardless of parent context
            // This ensures proper visual hierarchy and prevents layout issues
            let yesOffset = -branchSpacing; // Yes always to the left
            let noOffset = branchSpacing;   // No always to the right

            // Optional: Add slight adjustment based on parent context if needed
            // But keep it minimal to avoid layout issues
            if (parentBranchType === 'no') {
              // When in "No" branch, add small shift to maintain visual separation
              yesOffset = -branchSpacing + 50;  // Slightly closer to center
              noOffset = branchSpacing + 50;    // Slightly further right
            } else if (parentBranchType === 'yes') {
              // When in "Yes" branch, add small shift to maintain visual separation
              yesOffset = -branchSpacing - 50;  // Slightly further left
              noOffset = branchSpacing - 50;    // Slightly closer to center
            }

            const yesPlaceholder: Node = {
              id: yesId, // ✅ Use the same ID generated above
              type: 'placeholder',
              position: { x: newNode.position.x + yesOffset, y: newNode.position.y + 150 },
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
              position: { x: newNode.position.x + noOffset, y: newNode.position.y + 150 },
              width: nodeWidth,
              height: nodeWidth,
              data: {
                label: 'Add Action',
                branchType: 'no',
                conditionNodeId: newNodeId,
                handleAddNodeToBranch,
              },
            };

            console.log('🔍 Positioning placeholders:', {
              parentBranchType,
              yesPosition: yesPlaceholder.position,
              noPosition: noPlaceholder.position
            });

            updatedNodes.push(yesPlaceholder, noPlaceholder);

            // Store placeholder IDs on the condition node for edge creation
            newNode.data.yesPlaceholderId = yesId;
            newNode.data.noPlaceholderId = noId;
          }

          return updatedNodes;
        });

        // 🔄 Update edges - Use the exact same IDs as created above
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
            // ✅ Use the same IDs that were generated above
            console.log(`Adding condition edges: ${newNodeId} -> ${yesId} (Yes), ${newNodeId} -> ${noId} (No)`);

            // Add condition edges to the new placeholders
            updatedEdges.push(
              {
                id: `edge-${newNodeId}-yes`,
                source: newNodeId,
                sourceHandle: 'yes',
                target: yesId, // ✅ Same ID as the node
                type: 'condition',
                label: 'Yes',
                data: { branchType: 'yes' },
              },
              {
                id: `edge-${newNodeId}-no`,
                source: newNodeId,
                sourceHandle: 'no',
                target: noId, // ✅ Same ID as the node
                type: 'condition',
                label: 'No',
                data: { branchType: 'no' },
              }
            );
          }

          // 🔄 Add plus button for action nodes in condition branches
          if (!isCondition) {
            // This is an action node in a condition branch - add plus button
            const plusButtonEdge = {
              id: `edge-${newNodeId}-plus`,
              source: newNodeId,
              target: 'virtual-end',
              type: 'flowEdge',
              data: {
                onOpenActionModal: (insertIndex: number) => {
                  console.log('🔍 Plus button clicked in condition branch');
                  // Set up branch context for insertion after this node
                  setConditionBranchInfo({
                    conditionNodeId: conditionNodeId,
                    branchType: branchType as 'yes' | 'no',
                    placeholderNodeId: `after-${newNodeId}`
                  });
                  setShowActionModal(true);
                },
                index: 0,
              },
            };

            updatedEdges.push(plusButtonEdge);
            console.log('🔍 Added plus button for action node in branch:', newNodeId);
          }

          return updatedEdges;
        });

        toast.success(`${action.label} added to ${branchType || 'main'} branch!`);
        setConditionBranchInfo(null);
      } else {
        // Handle top-level insertion
        console.log('🔍 actionInsertIndex:', actionInsertIndex);
        console.log('🔍 conditionBranchInfo:', conditionBranchInfo);

        if (actionInsertIndex !== null) {
          console.log('🔍 Using handleNodeInsertion with index:', actionInsertIndex);
          // this is function is used to add the node to the workflow
          handleNodeInsertion(actionInsertIndex, action.type || 'action', action);
        } else {
          console.log('🔍 Using handleNodeSelection (adding to end)');
          handleNodeSelection(action.type || 'action', action);
        }
        // Reset actionInsertIndex after using it
        setActionInsertIndex(null);
      }
    } catch (error) {
      console.error('Error in handleActionSelection:', error);
      console.error('ConditionBranchInfo:', conditionBranchInfo);
      toast.error('Failed to add action to workflow');
    } finally {
      setShowActionModal(false);
      // Don't reset actionInsertIndex here - let each branch handle it
      setConditionBranchInfo(null);
    }
  }, [
    conditionBranchInfo,
    handleConditionNodeDeletion,
    handleConditionBranchNodeDeletion,
    handleConditionNodeReplacement,
    setConditionBranchInfo,
    setShowActionModal,
    handleNodeSelection,
    handleNodeInsertion,
    setNodes,
    setEdges,
    actionInsertIndex,
    handleAddNodeToBranch,
    nodes
  ]);


  // let nodeCounter = 0;
  // let placeholderCounter = 0;

  // // Helper function to generate unique IDs
  // const generateUniqueId = (prefix: string) => {
  //   return `${prefix}-${Date.now()}-${++nodeCounter}`;
  // };

  // const generatePlaceholderIds = () => {
  //   const baseId = ++placeholderCounter;
  //   return {
  //     yesId: `placeholder-yes-${baseId}`,
  //     noId: `placeholder-no-${baseId}`
  //   };
  // };


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
