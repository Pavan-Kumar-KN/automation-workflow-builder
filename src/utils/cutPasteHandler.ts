import { Node, Edge } from '@xyflow/react';
import { useWorkflowStore } from '@/hooks/useWorkflowState';

// BFS traversal to get all nodes and edges in a subtree starting from a given node
const getSubTree = (startNodeId: string, nodes: Node[], edges: Edge[]) => {
  const visited = new Set<string>();
  const queue = [startNodeId];
  const subNodes: Node[] = [];
  const subEdges: Edge[] = [];

  while (queue.length > 0) {
    const currentNodeId = queue.shift()!;
    
    if (visited.has(currentNodeId)) continue;
    visited.add(currentNodeId);

    // Find the current node
    const currentNode = nodes.find(node => node.id === currentNodeId);
    if (currentNode) {
      subNodes.push(currentNode);
    }

    // Find all outgoing edges from current node
    const outgoingEdges = edges.filter(edge => edge.source === currentNodeId);
    
    for (const edge of outgoingEdges) {
      subEdges.push(edge);
      
      // Add target node to queue if not visited
      if (!visited.has(edge.target)) {
        queue.push(edge.target);
      }
    }
  }

  return { subNode: subNodes, subEdge: subEdges };
};

// Find the first node in a flow (node with no incoming edges from within the flow)
const findFirstNodeInFlow = (nodes: Node[], edges: Edge[]): string | null => {
  const nodeIds = new Set(nodes.map(n => n.id));
  const internalTargets = new Set(edges.filter(e => nodeIds.has(e.source)).map(e => e.target));
  
  const firstNode = nodes.find(node => !internalTargets.has(node.id));
  return firstNode?.id || null;
};

// Find the last node in a flow (node with no outgoing edges from within the flow)
const findLastNodeInFlow = (nodes: Node[], edges: Edge[]): string | null => {
  const nodeIds = new Set(nodes.map(n => n.id));
  const internalSources = new Set(edges.filter(e => nodeIds.has(e.target)).map(e => e.source));
  
  const lastNode = nodes.find(node => !internalSources.has(node.id));
  return lastNode?.id || null;
};

export interface CutPasteHandler {
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
  handlePlusIconClick: (
    index: number,
    onOpenActionModal: (index: number) => void,
    onPasteFlow?: (index: number) => void
  ) => void;
}

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

  console.log('✂️ getConditionalNodeStructure result:', {
    conditionNodeId,
    foundNodes: structureNodes.length,
    foundEdges: structureEdges.length,
    nodeDetails: structureNodes.map((n: Node) => `${n.id}:${n.type}`)
  });

  return { nodes: structureNodes, edges: structureEdges };
};

export const createCutPasteHandler = (
  openActionModal?: (insertIndex?: number) => void
): CutPasteHandler => {

  const cutNode = (nodeId: string, nodes: Node[], edges: Edge[]) => {
    const { setCutNodes, setCutEdges, setIsCut } = useWorkflowStore.getState();

    const nodeToCut = nodes.find(node => node.id === nodeId);
    if (!nodeToCut) {
      console.log('✂️ Node not found:', nodeId);
      return { newNodes: nodes, newEdges: edges };
    }

    console.log('✂️ Cutting node:', nodeId, 'from', nodes.length, 'nodes');

    // Check if it's a conditional node
    const isConditionalNode = nodeToCut.type === 'condition';

    if (isConditionalNode) {
      console.log('✂️ Cutting conditional node with full structure:', nodeId);

      // For conditional nodes, we need to cut the entire branch structure
      const conditionalStructure = getConditionalNodeStructure(nodeId, nodes, edges);
      setCutNodes(conditionalStructure.nodes);
      setCutEdges(conditionalStructure.edges);

      console.log('✂️ Conditional cut result:', {
        mainNode: nodeId,
        totalNodes: conditionalStructure.nodes.length,
        totalEdges: conditionalStructure.edges.length,
        nodeTypes: conditionalStructure.nodes.map((n: Node) => `${n.id}:${n.type}`)
      });
    } else {
      // For regular nodes, use the original logic
      const connectedEdges = edges.filter(edge => edge.source === nodeId || edge.target === nodeId);
      setCutNodes([nodeToCut]);
      setCutEdges(connectedEdges);
    }

    setIsCut(true);

    // Remove the node and its connected edges
    let newNodes = nodes.filter(node => node.id !== nodeId);
    let newEdges = edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId);

    // If the node was in the middle of a flow, reconnect the edges
    if (incomingEdge && outgoingEdge) {
      const reconnectionEdge = {
        id: `reconnect-${Date.now()}`,
        source: incomingEdge.source,
        target: outgoingEdge.target,
        type: 'flowEdge',
        animated: false,
        data: {
          onOpenActionModal: openActionModal ?
            (insertIndex: number) => openActionModal(insertIndex) :
            () => {},
          index: 0
        }
      };
      newEdges.push(reconnectionEdge);
      console.log('✂️ Reconnected:', incomingEdge.source, '->', outgoingEdge.target);
    }

    console.log('✂️ Cut complete. New nodes:', newNodes.length, 'New edges:', newEdges.length);
    return { newNodes, newEdges };
  };

  const cutFlowFromNode = (nodeId: string, nodes: Node[], edges: Edge[]) => {
    const { setCutNodes, setCutEdges, setIsCut } = useWorkflowStore.getState();

    const { subNode, subEdge } = getSubTree(nodeId, nodes, edges);

    // Filter out End node and virtual-end from being cut
    const filteredSubNodes = subNode.filter(node =>
      node.id !== 'virtual-end' &&
      node.type !== 'end' &&
      !node.id.includes('end') &&
      node.data?.label !== 'End'
    );

    // Filter out edges that connect to End node
    const filteredSubEdges = subEdge.filter(edge =>
      edge.target !== 'virtual-end' &&
      !edge.target.includes('end') &&
      !filteredSubNodes.some(node => node.id === edge.target && node.data?.label === 'End')
    );

    console.log('✂️ Cut flow from node:', {
      startNodeId: nodeId,
      originalNodes: subNode.length,
      filteredNodes: filteredSubNodes.length,
      originalEdges: subEdge.length,
      filteredEdges: filteredSubEdges.length,
      nodeIds: filteredSubNodes.map(n => n.id),
      edgeConnections: filteredSubEdges.map(e => `${e.source} -> ${e.target}`)
    });

    setCutNodes(filteredSubNodes);
    setCutEdges(filteredSubEdges);
    setIsCut(true);
    
    // Remove only the filtered cut nodes and edges from the current workflow (preserve End node)
    const cutNodeIds = new Set(filteredSubNodes.map(n => n.id));
    const cutEdgeIds = new Set(filteredSubEdges.map(e => e.id));

    const newNodes = nodes.filter(node => !cutNodeIds.has(node.id));
    const newEdges = edges.filter(edge => !cutEdgeIds.has(edge.id));

    // Also remove any edges that connect to cut nodes (but preserve connections to End node)
    let finalEdges = newEdges.filter(edge =>
      !cutNodeIds.has(edge.source) && !cutNodeIds.has(edge.target)
    );

    // If we cut a flow that was connected to End node, reconnect the previous node to End
    const endNode = nodes.find(node =>
      node.id === 'virtual-end' ||
      node.type === 'end' ||
      node.data?.label === 'End'
    );

    if (endNode) {
      // Find if any of the original edges connected to End node
      const edgeToEnd = subEdge.find(edge => edge.target === endNode.id);
      if (edgeToEnd) {
        // Find the node that was connected before the cut flow
        const incomingEdge = edges.find(edge => edge.target === nodeId);
        if (incomingEdge) {
          // Reconnect the previous node to End
          const reconnectionEdge = {
            id: `reconnect-end-${Date.now()}`,
            source: incomingEdge.source,
            target: endNode.id,
            type: 'flowEdge',
            animated: false,
            data: {
              onOpenActionModal: openActionModal ?
                (insertIndex: number) => openActionModal(insertIndex) :
                () => {},
              index: 0
            }
          };
          finalEdges.push(reconnectionEdge);
          console.log('✂️ Reconnected to End node:', incomingEdge.source, '->', endNode.id);
        }
      }
    }

    return { newNodes, newEdges: finalEdges };
  };

  const pasteCutFlow = (insertIndex: number, aboveNodeId: string, belowNodeId: string, nodes: Node[], edges: Edge[]) => {
    const { isCut, cutNodes, cutEdges, setCutNodes, setCutEdges, setIsCut } = useWorkflowStore.getState();
    if (!isCut || cutNodes.length === 0) return { newNodes: nodes, newEdges: edges };

    console.log('✂️ Paste cut flow:', {
      insertIndex,
      aboveNodeId,
      belowNodeId,
      cutNodes: cutNodes.length,
      cutEdges: cutEdges.length,
      originalNodes: nodes.length,
      originalEdges: edges.length
    });

    // For single node cut, handle it simply
    if (cutNodes.length === 1) {
      const cutNode = cutNodes[0];

      // Remove the edge between above and below nodes (if it exists)
      const cleanedEdges = edges.filter(edge => !(edge.source === aboveNodeId && edge.target === belowNodeId));

      // Create new edges to connect the cut node
      const newEdges = [...cleanedEdges];

      // Connect above node to cut node
      if (aboveNodeId) {
        console.log('✂️ Creating single node connection edge 1');
        newEdges.push({
          id: `edge-${aboveNodeId}-${cutNode.id}`,
          source: aboveNodeId,
          target: cutNode.id,
          type: 'flowEdge',
          animated: false,
          data: {
            index: insertIndex,
            onOpenActionModal: openActionModal ?
              (_clickedIndex: number) => {
                console.log('✂️ Plus clicked from single cut edge 1, insertIndex:', insertIndex);
                openActionModal(insertIndex);
              } :
              (_clickedIndex: number) => console.log('Plus clicked:', insertIndex)
          }
        });
      }

      // Connect cut node to below node (including End node)
      if (belowNodeId) {
        console.log('✂️ Creating single node connection edge 2');
        newEdges.push({
          id: `edge-${cutNode.id}-${belowNodeId}`,
          source: cutNode.id,
          target: belowNodeId,
          type: 'flowEdge',
          animated: false,
          data: {
            index: insertIndex + 1,
            onOpenActionModal: openActionModal ?
              (_clickedIndex: number) => {
                console.log('✂️ Plus clicked from single cut edge 2, insertIndex:', insertIndex + 1);
                openActionModal(insertIndex + 1);
              } :
              (_clickedIndex: number) => console.log('Plus clicked:', insertIndex + 1)
          }
        });
      }

      // Clear cut state
      setCutNodes([]);
      setCutEdges([]);
      setIsCut(false);

      console.log('✂️ Single node paste complete');

      return {
        newNodes: [...nodes, cutNode],
        newEdges: newEdges
      };
    }

    // For multiple nodes (flow), use the original logic but clean it up
    const firstNodeId = findFirstNodeInFlow(cutNodes, cutEdges);
    const lastNodeId = findLastNodeInFlow(cutNodes, cutEdges);

    const connectionEdges: Edge[] = [];

    // Connect above node to first cut node
    if (aboveNodeId && firstNodeId) {
      console.log('✂️ Creating connection edge 1 - openActionModal available:', !!openActionModal);
      connectionEdges.push({
        id: `edge-${aboveNodeId}-${firstNodeId}`,
        source: aboveNodeId,
        target: firstNodeId,
        type: 'flowEdge',
        animated: false,
        data: {
          index: insertIndex,
          onOpenActionModal: openActionModal ?
            (_clickedIndex: number) => {
              console.log('✂️ Plus clicked from cut connection edge 1, insertIndex:', insertIndex);
              openActionModal(insertIndex);
            } :
            (_clickedIndex: number) => console.log('Plus clicked:', insertIndex)
        }
      });
    }

    // Connect last cut node to below node (including End node)
    if (lastNodeId && belowNodeId) {
      console.log('✂️ Creating connection edge 2 - openActionModal available:', !!openActionModal);
      connectionEdges.push({
        id: `edge-${lastNodeId}-${belowNodeId}`,
        source: lastNodeId,
        target: belowNodeId,
        type: 'flowEdge',
        animated: false,
        data: {
          index: insertIndex + cutNodes.length,
          onOpenActionModal: openActionModal ?
            (_clickedIndex: number) => {
              console.log('✂️ Plus clicked from cut connection edge 2, insertIndex:', insertIndex + cutNodes.length);
              openActionModal(insertIndex + cutNodes.length);
            } :
            (_clickedIndex: number) => console.log('Plus clicked:', insertIndex + cutNodes.length)
        }
      });
    }

    // Remove the edge between above and below nodes
    const cleanedEdges = edges.filter(edge => !(edge.source === aboveNodeId && edge.target === belowNodeId));

    console.log('✂️ Edge cleaning logic:', {
      aboveNodeId,
      belowNodeId,
      originalEdgeCount: edges.length,
      cleanedEdgeCount: cleanedEdges.length,
      removedEdge: `${aboveNodeId} -> ${belowNodeId}`
    });

    // Clear cut state
    setCutNodes([]);
    setCutEdges([]);
    setIsCut(false);



    return {
      newNodes: [...nodes, ...cutNodes],
      newEdges: [...cleanedEdges, ...cutEdges, ...connectionEdges]
    };
  };

  const handlePlusIconClick = (index: number, onOpenActionModal: (index: number) => void, onPasteFlow?: (index: number) => void) => {
    const { isCut } = useWorkflowStore.getState();
    if (isCut && onPasteFlow) {
      onPasteFlow(index);
    } else {
      onOpenActionModal(index);
    }
  };

  return {
    cutNode,
    cutFlowFromNode,
    pasteCutFlow,
    handlePlusIconClick
  };
};
