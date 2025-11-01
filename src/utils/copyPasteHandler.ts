// import { Node, Edge } from '@xyflow/react';
// import { nanoid } from 'nanoid';
// import { useWorkflowStore } from '@/hooks/useWorkflowState';
// import { getSubTree } from './bfsFunction';

// export interface CopyPasteHandler {
//   // Copy operations
//   copyNode: (nodeId: string, nodes: Node[], edges: Edge[]) => void;
//   copyFlowFromNode: (nodeId: string, nodes: Node[], edges: Edge[]) => void;
  
//   // Paste operations
//   pasteFlow: (insertIndex: number, aboveNodeId: string, belowNodeId: string, nodes: Node[], edges: Edge[]) => {
//     newNodes: Node[];
//     newEdges: Edge[];
//   };
  
//   // Utility functions
//   generateNewIds: (copiedNodes: Node[], copiedEdges: Edge[]) => {
//     newNodes: Node[];
//     newEdges: Edge[];
//     idMapping: Record<string, string>;
//   };
  
//   // Plus icon click handler
//   handlePlusIconClick: (
//     index: number,
//     onOpenActionModal: (index: number) => void,
//     onPasteFlow?: (index: number) => void
//   ) => void;
// }

// export const createCopyPasteHandler = (openActionModal?: (insertIndex?: number) => void): CopyPasteHandler => {
//   const { 
//     isCopy, 
//     setCopiedNodes, 
//     setCopiedEdges, 
//     setIsCopy,
//     copiedNodes,
//     copiedEdges 
//   } = useWorkflowStore.getState();

//   /**
//    * Copy a single node with its connected edges
//    */
//   const copyNode = (nodeId: string, nodes: Node[], edges: Edge[]) => {
//     const nodeToCopy = nodes.find(node => node.id === nodeId);
//     if (!nodeToCopy) return;

//     // Get all edges connected to this node
//     const connectedEdges = edges.filter(edge => 
//       edge.source === nodeId || edge.target === nodeId
//     );

//     setCopiedNodes([nodeToCopy]);
//     setCopiedEdges(connectedEdges);
//     setIsCopy(true);

//     console.log('📋 Copied single node:', nodeToCopy.id);
//   };

//   /**
//    * Copy entire flow from a node using BFS
//    */
//   const copyFlowFromNode = (nodeId: string, nodes: Node[], edges: Edge[]) => {
//     const { subNode, subEdge } = getSubTree(nodeId, nodes, edges);

//     setCopiedNodes(subNode);
//     setCopiedEdges(subEdge);
//     setIsCopy(true);

//     console.log('📋 Copied flow from node:', nodeId, 'Nodes:', subNode.length, 'Edges:', subEdge.length);
//   };

//   /**
//    * Generate new IDs for copied nodes and edges while preserving connections
//    */
//   const generateNewIds = (copiedNodes: Node[], copiedEdges: Edge[]) => {
//     const idMapping: Record<string, string> = {};

//     // Generate new IDs for all nodes
//     copiedNodes.forEach(node => {
//       idMapping[node.id] = nanoid();
//     });

//     // Create new nodes with updated IDs
//     const newNodes = copiedNodes.map(node => ({
//       ...node,
//       id: idMapping[node.id],
//       position: { x: 0, y: 0 } // Let dagre handle positioning
//     }));

//     // Create new edges with updated source/target IDs and simple edge IDs
//     let edgeCounter = 1;
//     const newEdges = copiedEdges.map(edge => {
//       const newSourceId = idMapping[edge.source] || edge.source;
//       const newTargetId = idMapping[edge.target] || edge.target;

//       return {
//         ...edge,
//         id: `c${edgeCounter++}`, // Simple edge IDs like c1, c2, c3...
//         source: newSourceId,
//         target: newTargetId
//       };
//     }).filter(edge =>
//       // Only include edges where both source and target are in our copied nodes
//       idMapping[edge.source] && idMapping[edge.target]
//     );

//     return { newNodes, newEdges, idMapping };
//   };

//   /**
//    * Paste copied flow at specified insertion point
//    */
//   const pasteFlow = (
//     insertIndex: number, 
//     aboveNodeId: string, 
//     belowNodeId: string, 
//     nodes: Node[], 
//     edges: Edge[]
//   ) => {
//     if (!isCopy || copiedNodes.length === 0) {
//       return { newNodes: nodes, newEdges: edges };
//     }

//     const { newNodes: generatedNodes, newEdges: generatedEdges, idMapping } = 
//       generateNewIds(copiedNodes, copiedEdges);

//     // Find first and last nodes in the copied flow
//     const firstCopiedNodeId = findFirstNodeInFlow(generatedNodes, generatedEdges);
//     const lastCopiedNodeId = findLastNodeInFlow(generatedNodes, generatedEdges);

//     const firstCopiedNode = generatedNodes.find(node => node.id === firstCopiedNodeId);

//     console.log('🔍 Paste flow debug:', {
//       aboveNodeId,
//       belowNodeId,
//       firstCopiedNodeId,
//       lastCopiedNodeId,
//       generatedNodesCount: generatedNodes.length,
//       generatedEdgesCount: generatedEdges.length,
//       generatedNodes: generatedNodes.map(n => ({ id: n.id, type: n.type })),
//       generatedEdges: generatedEdges.map(e => ({ id: e.id, source: e.source, target: e.target }))
//     });

//     // Create connection edges
//     const connectionEdges: Edge[] = [];

//     // Connect above node to first copied node
//     if (aboveNodeId && firstCopiedNode) {
//       const connectionEdge1 = {
//         id: `c${Date.now()}_1`, // Simple connection edge ID
//         source: aboveNodeId,
//         target: firstCopiedNode.id,
//         type: 'flowEdge',
//         data: {
//           onOpenActionModal: openActionModal ?
//             (index: number) => {
//               // console.log('🔍 Plus button clicked from pasted connection edge 1, insertIndex:', index);
//               openActionModal(index);
//             } :
//             (index: number) => console.log('Plus clicked:', index),
//           index: insertIndex
//         }
//       };
//       connectionEdges.push(connectionEdge1);
//       // console.log('🔗 Created connection edge 1:', `${aboveNodeId} -> ${firstCopiedNode.id}`);
//     }

//     // Connect last copied node to below node
//     if (lastCopiedNodeId && belowNodeId) {
//       const connectionEdge2 = {
//         id: `c${Date.now()}_2`, // Simple connection edge ID
//         source: lastCopiedNodeId,
//         target: belowNodeId,
//         type: 'flowEdge',
//         data: {
//           onOpenActionModal: openActionModal ?
//             (index: number) => {
//               console.log('🔍 Plus button clicked from pasted connection edge 2, insertIndex:', index);
//               openActionModal(index);
//             } :
//             (index: number) => console.log('Plus clicked:', index),
//           index: insertIndex + generatedNodes.length
//         }
//       };
//       connectionEdges.push(connectionEdge2);
//       console.log('🔗 Created connection edge 2:', `${lastCopiedNodeId} -> ${belowNodeId}`);
//     }

//     // Remove the original edge between above and below nodes
//     const filteredEdges = edges.filter(edge => 
//       !(edge.source === aboveNodeId && edge.target === belowNodeId)
//     );

//     const finalNodes = [...nodes, ...generatedNodes];
//     const finalEdges = [...filteredEdges, ...generatedEdges, ...connectionEdges];

//     console.log('✅ Pasted flow successfully:', {
//       nodesAdded: generatedNodes.length,
//       edgesAdded: generatedEdges.length + connectionEdges.length
//     });

//     return { newNodes: finalNodes, newEdges: finalEdges };
//   };

//   /**
//    * Find the first node in a flow (node with no incoming edges)
//    */
//   const findFirstNodeInFlow = (nodes: Node[], edges: Edge[]): string | null => {
//     for (const node of nodes) {
//       const hasIncomingEdge = edges.some(edge => edge.target === node.id);
//       if (!hasIncomingEdge) {
//         return node.id;
//       }
//     }
//     return nodes.length > 0 ? nodes[0].id : null;
//   };

//   /**
//    * Find the last node in a flow (node with no outgoing edges)
//    */
//   const findLastNodeInFlow = (nodes: Node[], edges: Edge[]): string | null => {
//     for (const node of nodes) {
//       const hasOutgoingEdge = edges.some(edge => edge.source === node.id);
//       if (!hasOutgoingEdge) {
//         return node.id;
//       }
//     }
//     return nodes.length > 0 ? nodes[nodes.length - 1].id : null;
//   };

//   /**
//    * Handle plus icon click - show dropdown if copy mode, otherwise normal flow
//    */
//   const handlePlusIconClick = (
//     index: number,
//     onOpenActionModal: (index: number) => void,
//     onPasteFlow?: (index: number) => void
//   ) => {
//     const currentState = useWorkflowStore.getState();
    
//     if (currentState.isCopy) {
//       // In copy mode - this will be handled by the dropdown in the edge component
//       console.log('📋 Copy mode active - showing dropdown for index:', index);
//       return;
//     } else {
//       // Normal mode - open action modal
//       onOpenActionModal(index);
//     }
//   };

//   return {
//     copyNode,
//     copyFlowFromNode,
//     pasteFlow,
//     generateNewIds,
//     handlePlusIconClick
//   };
// };

// // Export singleton instance
// export const copyPasteHandler = createCopyPasteHandler();
      

import { Node, Edge } from '@xyflow/react';
import { nanoid } from 'nanoid';
import { useWorkflowStore } from '@/hooks/useWorkflowState';
import { getSubTree } from './bfsFunction';

export interface CopyPasteHandler {
  copyNode: (nodeId: string, nodes: Node[], edges: Edge[]) => void;
  copyFlowFromNode: (nodeId: string, nodes: Node[], edges: Edge[]) => void;
  pasteFlow: (insertIndex: number, aboveNodeId: string, belowNodeId: string, nodes: Node[], edges: Edge[]) => {
    newNodes: Node[];
    newEdges: Edge[];
  };
  pasteConditionalFlow: (insertIndex: number, aboveNodeId: string, belowNodeId: string, selectedBranch: 'yes' | 'no', nodes: Node[], edges: Edge[]) => {
    newNodes: Node[];
    newEdges: Edge[];
  };
  cutNode: (nodeId: string, nodes: Node[], edges: Edge[]) => {
    newNodes: Node[];
    newEdges: Edge[];
  };
  cutFlowFromNode: (nodeId: string, nodes: Node[], edges: Edge[]) => {
    newNodes: Node[];
    newEdges: Edge[];
  };
  pasteCutFlow: (insertIndex: number, aboveNodeId: string, belowNodeId: string, nodes: Node[], edges: Edge[]) => {
    newNodes: Node[];
    newEdges: Edge[];
  };
  generateNewIds: (copiedNodes: Node[], copiedEdges: Edge[], insertIndex: number) => {
    newNodes: Node[];
    newEdges: Edge[];
    idMapping: Record<string, string>;
  };
  handlePlusIconClick: (
    index: number,
    onOpenActionModal: (index: number) => void,
    onPasteFlow?: (index: number) => void
  ) => void;
}

export const createCopyPasteHandler = (
  openActionModal?: (insertIndex?: number) => void,
  onConditionalPasteRequest?: (insertIndex: number, aboveNodeId: string, belowNodeId: string, downstreamCount: number) => void
): CopyPasteHandler => {
  const {
    isCopy,
    setCopiedNodes,
    setCopiedEdges,
    setIsCopy,
    copiedNodes,
    copiedEdges,
    isCut,
    setCutNodes,
    setCutEdges,
    setIsCut,
    cutNodes,
    cutEdges
  } = useWorkflowStore.getState();

  const copyNode = (nodeId: string, nodes: Node[], edges: Edge[]) => {
    const nodeToCopy = nodes.find(node => node.id === nodeId);
    if (!nodeToCopy) return;

    // Check if it's a conditional node
    const isConditionalNode = nodeToCopy.type === 'condition';

    if (isConditionalNode) {
      console.log('📋 Copying conditional node with full structure:', nodeId);

      // For conditional nodes, we need to copy the entire branch structure
      const conditionalStructure = getConditionalNodeStructure(nodeId, nodes, edges);
      setCopiedNodes(conditionalStructure.nodes);
      setCopiedEdges(conditionalStructure.edges);

      console.log('📋 Conditional copy result:', {
        mainNode: nodeId,
        totalNodes: conditionalStructure.nodes.length,
        totalEdges: conditionalStructure.edges.length,
        nodeTypes: conditionalStructure.nodes.map(n => `${n.id}:${n.type}`)
      });
    } else {
      // For regular nodes, use the original logic
      const connectedEdges = edges.filter(edge => edge.source === nodeId || edge.target === nodeId);
      setCopiedNodes([nodeToCopy]);
      setCopiedEdges(connectedEdges);
    }

    setIsCopy(true);
  };

  const copyFlowFromNode = (nodeId: string, nodes: Node[], edges: Edge[]) => {
    const { subNode, subEdge } = getSubTree(nodeId, nodes, edges);
    console.log('📋 Copy flow debug:', {
      startNodeId: nodeId,
      copiedNodes: subNode.length,
      copiedEdges: subEdge.length,
      nodeIds: subNode.map(n => n.id),
      edgeConnections: subEdge.map(e => `${e.source} -> ${e.target}`)
    });
    setCopiedNodes(subNode);
    setCopiedEdges(subEdge);
    setIsCopy(true);
  };

  const generateNewIds = (copiedNodes: Node[], copiedEdges: Edge[], insertIndex: number) => {
    const idMapping: Record<string, string> = {};
    copiedNodes.forEach(node => {
      idMapping[node.id] = nanoid();
    });

    const newNodes = copiedNodes.map(node => ({
      ...node,
      id: idMapping[node.id],
      position: { x: 0, y: 0 }
    }));

    const newEdges = copiedEdges.map((edge, index) => {
      const newSource = idMapping[edge.source];
      const newTarget = idMapping[edge.target];

      // Only include edges where both source and target were copied
      if (!newSource || !newTarget) return null;

      // Calculate the correct workflow index for this edge
      let workflowIndex = insertIndex;

      // Find the position of the source node in the new nodes array
      const sourceNodeIndex = newNodes.findIndex(node => node.id === newSource);
      if (sourceNodeIndex >= 0) {
        // The edge should insert after the source node
        workflowIndex = insertIndex + sourceNodeIndex + 1;
      }

      // Fix flowEdge data to have proper onOpenActionModal function
      const edgeData = edge.type === 'flowEdge' && openActionModal ? {
        ...edge.data,
        onOpenActionModal: (_clickedIndex: number) => {
          console.log('🔍 Plus button clicked from copied internal edge, using workflowIndex:', workflowIndex);
          openActionModal(workflowIndex); // Use calculated workflow index
        },
        // Use the calculated workflow index
        index: workflowIndex
      } : edge.data;

      return {
        ...edge,
        id: `c${index + 1}`,
        source: newSource,
        target: newTarget,
        data: edgeData
      };
    }).filter(edge => edge !== null) as Edge[];

    return { newNodes, newEdges, idMapping };
  };

  const pasteFlow = (insertIndex: number, aboveNodeId: string, belowNodeId: string, nodes: Node[], edges: Edge[]) => {
    console.log('🔍 PasteFlow Debug - openActionModal available:', !!openActionModal);
    if (!isCopy || copiedNodes.length === 0) return { newNodes: nodes, newEdges: edges };

    // Check if we're pasting conditional nodes and there are downstream nodes
    const hasConditionalNodes = (copiedNodes as Node[]).some(node => node.type === 'condition');
    const hasDownstreamNodes = belowNodeId && belowNodeId !== 'virtual-end';

    if (hasConditionalNodes && hasDownstreamNodes && onConditionalPasteRequest) {
      // Count downstream nodes for the modal
      const downstreamCount = nodes.filter(node => {
        const nodeIndex = nodes.findIndex(n => n.id === node.id);
        const belowNodeIndex = nodes.findIndex(n => n.id === belowNodeId);
        return nodeIndex >= belowNodeIndex;
      }).length;

      console.log('🔍 Conditional paste detected - requesting branch selection');
      onConditionalPasteRequest(insertIndex, aboveNodeId, belowNodeId, downstreamCount);
      return { newNodes: nodes, newEdges: edges }; // Return unchanged until user selects branch
    }

    const { newNodes, newEdges } = generateNewIds(copiedNodes, copiedEdges, insertIndex);
    const firstNodeId = findFirstNodeInFlow(newNodes, newEdges);
    const lastNodeId = findLastNodeInFlow(newNodes, newEdges);

    console.log('🔍 Paste flow debug:', {
      insertIndex,
      aboveNodeId,
      belowNodeId,
      generatedNodes: newNodes.length,
      generatedEdges: newEdges.length,
      firstNodeId,
      lastNodeId,
      nodeIds: newNodes.map(n => n.id),
      edgeConnections: newEdges.map(e => `${e.source} -> ${e.target}`),
      hasConditionalNodes,
      hasDownstreamNodes
    });

    const connectionEdges: Edge[] = [];

    if (aboveNodeId && firstNodeId) {
      console.log('🔍 Creating connection edge 1 - openActionModal available:', !!openActionModal);
      connectionEdges.push({
        id: `conn-${Date.now()}-1`,
        source: aboveNodeId,
        target: firstNodeId,
        type: 'flowEdge',
        animated: false,
        data: {
          index: insertIndex,
          onOpenActionModal: openActionModal ?
            (insertIndex: number) => {
              console.log('🔍 Plus clicked from pasted connection edge 1, insertIndex:', insertIndex);
              openActionModal(insertIndex);
            } :
            (insertIndex: number) => console.log('Plus clicked:', insertIndex)
        }
      });
    }

    if (belowNodeId && lastNodeId) {
      console.log('🔍 Creating connection edge 2 - openActionModal available:', !!openActionModal);
      connectionEdges.push({
        id: `conn-${Date.now()}-2`,
        source: lastNodeId,
        target: belowNodeId,
        type: 'flowEdge',
        animated: false,
        data: {
          index: insertIndex + newNodes.length,
          onOpenActionModal: openActionModal ?
            (insertIndex: number) => {
              console.log('🔍 Plus clicked from pasted connection edge 2, insertIndex:', insertIndex);
              openActionModal(insertIndex);
            } :
            (insertIndex: number) => console.log('Plus clicked:', insertIndex)
        }
      });
    }

    // Always remove the original edge to create proper linear flow
    const cleanedEdges = edges.filter(edge => !(edge.source === aboveNodeId && edge.target === belowNodeId));

    console.log('🔍 Edge cleaning logic:', {
      aboveNodeId,
      belowNodeId,
      originalEdgeCount: edges.length,
      cleanedEdgeCount: cleanedEdges.length,
      removedEdge: `${aboveNodeId} -> ${belowNodeId}`
    });

    return {
      newNodes: [...nodes, ...newNodes],
      newEdges: [...cleanedEdges, ...newEdges, ...connectionEdges]
    };
  };

  // Helper function to get the complete structure of a conditional node
  const getConditionalNodeStructure = (conditionNodeId: string, nodes: Node[], edges: Edge[]) => {
    const structureNodes: Node[] = [];
    const structureEdges: Edge[] = [];

    // 1. Add the main condition node
    const conditionNode = nodes.find(n => n.id === conditionNodeId);
    if (!conditionNode) return { nodes: [], edges: [] };

    structureNodes.push(conditionNode);

    // 2. Find all condition edges (Yes/No branches)
    const conditionEdges = edges.filter(edge =>
      edge.source === conditionNodeId && edge.type === 'condition'
    );
    structureEdges.push(...conditionEdges);

    // 3. Find all nodes in the Yes and No branches
    for (const conditionEdge of conditionEdges) {
      const branchTargetId = conditionEdge.target;
      const branchNode = nodes.find(n => n.id === branchTargetId);

      if (branchNode) {
        // Add the direct branch target (could be placeholder or action node)
        structureNodes.push(branchNode);

        // If it's a placeholder, we're done for this branch
        // If it's an action node, we need to get all downstream nodes in this branch
        if (branchNode.type !== 'placeholder') {
          const branchSubtree = getSubTree(branchTargetId, nodes, edges);

          // Add all nodes in the branch subtree (excluding the target we already added)
          const additionalNodes = branchSubtree.subNode.filter(n => n.id !== branchTargetId);
          structureNodes.push(...additionalNodes);
          structureEdges.push(...branchSubtree.subEdge);
        }
      }
    }

    // 4. Add any regular edges connected to the condition node (non-condition edges)
    const regularEdges = edges.filter(edge =>
      (edge.source === conditionNodeId || edge.target === conditionNodeId) &&
      edge.type !== 'condition'
    );
    structureEdges.push(...regularEdges);

    console.log('📋 getConditionalNodeStructure result:', {
      conditionNodeId,
      foundNodes: structureNodes.length,
      foundEdges: structureEdges.length,
      nodeDetails: structureNodes.map((n: Node) => `${n.id}:${n.type}`)
    });

    return { nodes: structureNodes, edges: structureEdges };
  };

  const findFirstNodeInFlow = (nodes: Node[], edges: Edge[]): string | null => {
    for (const node of nodes) {
      if (!edges.some(e => e.target === node.id)) return node.id;
    }
    return nodes[0]?.id ?? null;
  };

  const findLastNodeInFlow = (nodes: Node[], edges: Edge[]): string | null => {
    for (const node of nodes) {
      if (!edges.some(e => e.source === node.id)) return node.id;
    }
    return nodes[nodes.length - 1]?.id ?? null;
  };



  const pasteConditionalFlow = (insertIndex: number, aboveNodeId: string, belowNodeId: string, selectedBranch: 'yes' | 'no', nodes: Node[], edges: Edge[]) => {
    if (!isCopy || copiedNodes.length === 0) return { newNodes: nodes, newEdges: edges };

    const { newNodes, newEdges } = generateNewIds(copiedNodes, copiedEdges, insertIndex);
    const firstNodeId = findFirstNodeInFlow(newNodes, newEdges);
    const lastNodeId = findLastNodeInFlow(newNodes, newEdges);

    console.log('🔍 Conditional paste with branch selection:', {
      selectedBranch,
      insertIndex,
      aboveNodeId,
      belowNodeId,
      generatedNodes: newNodes.length,
      generatedEdges: newEdges.length,
      firstNodeId,
      lastNodeId
    });

    // Get branch context from the above node (the node we're pasting after)
    const aboveNode = nodes.find(n => n.id === aboveNodeId);
    const branchContext = aboveNode?.data ? {
      branchType: aboveNode.data.branchType,
      conditionNodeId: aboveNode.data.conditionNodeId,
      branchPath: aboveNode.data.branchPath,
      level: aboveNode.data.level,
      parentConditions: aboveNode.data.parentConditions
    } : null;

    // ✅ Add plus button functionality to pasted action nodes in branches
    if (branchContext) {
      newNodes.forEach(node => {
        if (node.type === 'action') {
          node.data = {
            ...node.data,
            ...branchContext, // Apply branch context
            showBottomPlus: true,
            onInsertBelow: (nodeId: string) => {
              console.log('🔍 Insert below clicked on pasted node in branch:', nodeId);
              // This will be set by WorkflowBuilder when nodes are added
              // The callback will be properly bound when the component mounts
            }
          };
        }
      });
    }

    // Find the first conditional node in the pasted flow
    const firstConditionalNode = newNodes.find(node => node.type === 'condition');

    if (firstConditionalNode && belowNodeId && belowNodeId !== 'virtual-end') {
      // Update the conditional node to connect downstream flow to selected branch
      const updatedConditionalNode = {
        ...firstConditionalNode,
        data: {
          ...firstConditionalNode.data,
          [selectedBranch === 'yes' ? 'yesPlaceholderId' : 'noPlaceholderId']: belowNodeId,
          [selectedBranch === 'yes' ? 'noPlaceholderId' : 'yesPlaceholderId']: `placeholder-${selectedBranch === 'yes' ? 'no' : 'yes'}-${Date.now()}`
        }
      };

      // Replace the conditional node with updated version
      const nodeIndex = newNodes.findIndex(n => n.id === firstConditionalNode.id);
      if (nodeIndex !== -1) {
        newNodes[nodeIndex] = updatedConditionalNode;
      }

      // Create placeholder for the other branch
      const otherBranch = selectedBranch === 'yes' ? 'no' : 'yes';
      const placeholderNode: Node = {
        id: String(updatedConditionalNode.data[`${otherBranch}PlaceholderId`]),
        type: 'placeholder',
        position: { x: 0, y: 0 },
        data: {
          label: 'Add Action',
          branchType: otherBranch,
          conditionNodeId: firstConditionalNode.id,
          handleAddNodeToBranch: () => {}, // Will be set by WorkflowBuilder
        },
      };

      newNodes.push(placeholderNode);

      // Add conditional edges
      newEdges.push(
        {
          id: `edge-${firstConditionalNode.id}-${selectedBranch}`,
          source: firstConditionalNode.id,
          sourceHandle: selectedBranch,
          target: belowNodeId,
          type: 'condition',
          label: selectedBranch === 'yes' ? 'Yes' : 'No',
          data: { branchType: selectedBranch },
        },
        {
          id: `edge-${firstConditionalNode.id}-${otherBranch}`,
          source: firstConditionalNode.id,
          sourceHandle: otherBranch,
          target: placeholderNode.id,
          type: 'condition',
          label: otherBranch === 'yes' ? 'Yes' : 'No',
          data: { branchType: otherBranch },
        }
      );
    }

    const connectionEdges: Edge[] = [];

    if (aboveNodeId && firstNodeId) {
      connectionEdges.push({
        id: `conn-${Date.now()}-1`,
        source: aboveNodeId,
        target: firstNodeId,
        type: 'flowEdge',
        animated: false,
        data: {
          index: insertIndex,
          onOpenActionModal: openActionModal ?
            (insertIndex: number) => {
              console.log('🔍 Plus clicked from pasted connection edge 1, insertIndex:', insertIndex);
              openActionModal(insertIndex);
            } :
            (insertIndex: number) => console.log('Plus clicked:', insertIndex)
        }
      });
    }

    const cleanedEdges = edges.filter(edge => !(edge.source === aboveNodeId && edge.target === belowNodeId));

    return {
      newNodes: [...nodes, ...newNodes],
      newEdges: [...cleanedEdges, ...newEdges, ...connectionEdges]
    };
  };

  const cutNode = (nodeId: string, nodes: Node[], edges: Edge[]) => {
    const nodeToCut = nodes.find(node => node.id === nodeId);
    if (!nodeToCut) return { newNodes: nodes, newEdges: edges };

    const connectedEdges = edges.filter(edge => edge.source === nodeId || edge.target === nodeId);
    setCutNodes([nodeToCut]);
    setCutEdges(connectedEdges);
    setIsCut(true);

    // Remove the node and its edges from the current workflow
    const newNodes = nodes.filter(node => node.id !== nodeId);
    const newEdges = edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId);

    console.log('✂️ Cut node:', nodeId);
    return { newNodes, newEdges };
  };

  const cutFlowFromNode = (nodeId: string, nodes: Node[], edges: Edge[]) => {
    const { subNode, subEdge } = getSubTree(nodeId, nodes, edges);
    console.log('✂️ Cut flow from node:', {
      startNodeId: nodeId,
      cutNodes: subNode.length,
      cutEdges: subEdge.length,
      nodeIds: subNode.map(n => n.id),
      edgeConnections: subEdge.map(e => `${e.source} -> ${e.target}`)
    });

    setCutNodes(subNode);
    setCutEdges(subEdge);
    setIsCut(true);

    // Remove all cut nodes and edges from the current workflow
    const cutNodeIds = new Set(subNode.map(n => n.id));
    const cutEdgeIds = new Set(subEdge.map(e => e.id));

    const newNodes = nodes.filter(node => !cutNodeIds.has(node.id));
    const newEdges = edges.filter(edge => !cutEdgeIds.has(edge.id));

    // Also remove any edges that connect to cut nodes
    const finalEdges = newEdges.filter(edge =>
      !cutNodeIds.has(edge.source) && !cutNodeIds.has(edge.target)
    );

    return { newNodes, newEdges: finalEdges };
  };

  const pasteCutFlow = (insertIndex: number, aboveNodeId: string, belowNodeId: string, nodes: Node[], edges: Edge[]) => {
    if (!isCut || cutNodes.length === 0) return { newNodes: nodes, newEdges: edges };

    // For cut operation, we don't need to generate new IDs - we use the original nodes
    const firstNodeId = findFirstNodeInFlow(cutNodes, cutEdges);
    const lastNodeId = findLastNodeInFlow(cutNodes, cutEdges);

    console.log('✂️ Paste cut flow:', {
      insertIndex,
      aboveNodeId,
      belowNodeId,
      cutNodes: cutNodes.length,
      cutEdges: cutEdges.length,
      firstNodeId,
      lastNodeId
    });

    const connectionEdges: Edge[] = [];

    // Connect above node to first cut node
    if (aboveNodeId && firstNodeId) {
      connectionEdges.push({
        id: `conn-${Date.now()}-1`,
        source: aboveNodeId,
        target: firstNodeId,
        type: 'flowEdge',
        animated: false,
        data: {
          index: insertIndex,
          onOpenActionModal: openActionModal ?
            (insertIndex: number) => {
              console.log('✂️ Plus clicked from pasted cut connection edge 1, insertIndex:', insertIndex);
              openActionModal(insertIndex);
            } :
            (insertIndex: number) => console.log('Plus clicked:', insertIndex)
        }
      });
    }

    // Connect last cut node to below node
    if (lastNodeId && belowNodeId && belowNodeId !== 'virtual-end') {
      connectionEdges.push({
        id: `conn-${Date.now()}-2`,
        source: lastNodeId,
        target: belowNodeId,
        type: 'flowEdge',
        animated: false,
        data: {
          index: insertIndex + 1,
          onOpenActionModal: openActionModal ?
            (insertIndex: number) => {
              console.log('✂️ Plus clicked from pasted cut connection edge 2, insertIndex:', insertIndex);
              openActionModal(insertIndex);
            } :
            (insertIndex: number) => console.log('Plus clicked:', insertIndex)
        }
      });
    }

    // Remove the edge between above and below nodes
    const cleanedEdges = edges.filter(edge => !(edge.source === aboveNodeId && edge.target === belowNodeId));

    return {
      newNodes: [...nodes, ...cutNodes],
      newEdges: [...cleanedEdges, ...cutEdges, ...connectionEdges]
    };
  };

  const handlePlusIconClick = (index: number, onOpenActionModal: (index: number) => void, onPasteFlow?: (index: number) => void) => {
    const currentState = useWorkflowStore.getState();
    if ((currentState.isCopy || currentState.isCut) && onPasteFlow) {
      onPasteFlow(index);
    } else {
      onOpenActionModal(index);
    }
  };

  return {
    copyNode,
    copyFlowFromNode,
    pasteFlow,
    pasteConditionalFlow,
    cutNode,
    cutFlowFromNode,
    pasteCutFlow,
    generateNewIds,
    handlePlusIconClick
  };
};

export const copyPasteHandler = createCopyPasteHandler();