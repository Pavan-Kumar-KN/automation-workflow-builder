import { useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { WorkflowGraph } from '@/utils/WorkflowGraph';
import { useWorkflowStore } from './useWorkflowState';
import { NodeData } from '@/data/types';

/**
 * Hook to manage workflow operations using the graph-based approach
 * This provides a clean interface between the UI and the graph operations
 */
export const useWorkflowGraph = () => {
  const { nodes, edges, setNodes, setEdges } = useWorkflowStore();

  /**
   * Create a WorkflowGraph instance from current state
   */
  const createGraph = useCallback((): WorkflowGraph => {
    return new WorkflowGraph(nodes, edges);
  }, [nodes, edges]);

  /**
   * Apply graph changes to the store
   */
  const applyGraphChanges = useCallback((newGraph: WorkflowGraph) => {
    const { nodes: newNodes, edges: newEdges } = newGraph.toReactFlow();
    setNodes(newNodes);
    setEdges(newEdges);
  }, [setNodes, setEdges]);

  /**
   * Insert a node after another node using graph operations
   */
  const insertNodeAfter = useCallback((
    targetNodeId: string,
    nodeType: string,
    nodeData: NodeData,
    openActionModal?: (insertIndex: number) => void
  ) => {
    console.log('🔍 Graph-based insertNodeAfter:', { targetNodeId, nodeType, nodeData: nodeData.label });

    const graph = createGraph();
    const newNodeId = `${nodeType}-${Date.now()}`;

    const isConditionNode = nodeType === 'condition' || nodeData.type === 'condition';
    const actualNodeType = isConditionNode ? 'condition' : nodeType;

    const newNode = {
      type: actualNodeType as any,
      data: {
        ...nodeData,
        label: nodeData.label,
        isConfigured: false,
        type: actualNodeType, // Ensure type is set correctly
        // Add proper delete handlers - will be set later
        onDelete: () => console.log('Delete:', newNodeId),
        onDuplicate: () => console.log('Duplicate:', newNodeId), // TODO: implement
      },
      position: { x: 0, y: 0 } // Temporary - dagre will handle positioning
    };

    // Insert the node (WorkflowGraph will handle condition logic internally)
    const newGraph = graph.insertNodeAfter(targetNodeId, newNode, newNodeId, openActionModal);
    applyGraphChanges(newGraph);

    console.log('✅ Node inserted successfully:', newNodeId);
    return newNodeId;
  }, [createGraph, applyGraphChanges]);

  /**
   * Delete a node and its subtree using graph operations
   */
  const deleteNodeSubtree = useCallback((nodeId: string) => {
    console.log('🔍 Graph-based deleteNodeSubtree:', nodeId);

    const graph = createGraph();
    const newGraph = graph.deleteSubtree(nodeId);
    applyGraphChanges(newGraph);

    console.log('✅ Node subtree deleted successfully:', nodeId);
  }, [createGraph, applyGraphChanges]);

  /**
   * Delete a single node and reconnect the flow (not the entire subtree)
   */
  const deleteSingleNode = useCallback((nodeId: string) => {
    console.log('🔍 Graph-based deleteSingleNode called:', nodeId);
    const graph = createGraph();
    const newGraph = graph.deleteSingleNode(nodeId);
    applyGraphChanges(newGraph);
  }, [createGraph, applyGraphChanges]);

  /**
   * Delete a node from a conditional branch and replace with placeholder
   */
  const deleteConditionalBranchNode = useCallback((
    nodeId: string,
    conditionNodeId: string,
    branchType: 'yes' | 'no',
    handleAddNodeToBranch?: (insertionIndex: number, branchType: 'yes' | 'no', conditionNodeId: string, placeholderNodeId: string, action: unknown) => void
  ) => {
    console.log('🔍 Graph-based deleteConditionalBranchNode called:', { nodeId, conditionNodeId, branchType });
    const graph = createGraph();
    const newGraph = graph.deleteConditionalBranchNode(nodeId, conditionNodeId, branchType, handleAddNodeToBranch);
    applyGraphChanges(newGraph);
  }, [createGraph, applyGraphChanges]);

  /**
   * Add a conditional node at the end of the flow (before virtual-end)
   */
  const addConditionalNodeAtEnd = useCallback((
    conditionNode: any,
    handleAddNodeToBranch?: (insertionIndex: number, branchType: 'yes' | 'no', conditionNodeId: string, placeholderNodeId: string, action: unknown) => void
  ) => {
    console.log('🔍 Graph-based addConditionalNodeAtEnd called:', conditionNode.id);
    const graph = createGraph();
    const newGraph = graph.addConditionalNodeAtEnd(conditionNode, handleAddNodeToBranch);
    applyGraphChanges(newGraph);
  }, [createGraph, applyGraphChanges]);

  /**
   * Insert a node after another node by array index (for compatibility)
   * This converts array index to node ID and calls insertNodeAfter
   */
  const insertNodeByIndex = useCallback((
    afterNodeIndex: number,
    nodeType: string,
    nodeData: NodeData,
    openActionModal?: (insertIndex: number) => void
  ) => {
    console.log('🔍 Graph-based insertNodeByIndex:', { afterNodeIndex, nodeType, nodeData: nodeData.label });

    // Get nodes in flow order (excluding placeholders and virtual nodes)
    const flowNodes = nodes.filter(node =>
      node.type !== 'placeholder' &&
      node.id !== 'virtual-end' &&
      !node.id.startsWith('placeholder-')
    );

    console.log('🔍 Flow nodes:', flowNodes.map(n => `${n.id} (${n.data?.label || n.type})`));

    // Find the target node by index in flow order
    if (afterNodeIndex < 0 || afterNodeIndex >= flowNodes.length) {
      console.error('❌ Invalid node index:', afterNodeIndex, 'flowNodes length:', flowNodes.length);
      return null;
    }

    const targetNode = flowNodes[afterNodeIndex];
    if (!targetNode) {
      console.error('❌ Target node not found at index:', afterNodeIndex);
      return null;
    }

    console.log('🔍 Converting index to node ID:', { afterNodeIndex, targetNodeId: targetNode.id, targetLabel: targetNode.data?.label });
    return insertNodeAfter(targetNode.id, nodeType, nodeData, openActionModal);
  }, [nodes, insertNodeAfter]);



  /**
   * Get downstream nodes for a given node
   */
  const getDownstreamNodes = useCallback((nodeId: string): string[] => {
    const graph = createGraph();
    return graph.getDownstreamNodes(nodeId);
  }, [createGraph]);

  /**
   * Get children nodes for a given node
   */
  const getChildren = useCallback((nodeId: string): string[] => {
    const graph = createGraph();
    return graph.getChildren(nodeId);
  }, [createGraph]);

  /**
   * Get parent nodes for a given node
   */
  const getParents = useCallback((nodeId: string): string[] => {
    const graph = createGraph();
    return graph.getParents(nodeId);
  }, [createGraph]);

  /**
   * Check if a node is a condition node
   */
  const isConditionNode = useCallback((nodeId: string): boolean => {
    const graph = createGraph();
    return graph.isConditionNode(nodeId);
  }, [createGraph]);

  /**
   * Get subtree for a node (for copy operations)
   */
  const getSubtree = useCallback((nodeId: string) => {
    const graph = createGraph();
    return graph.getSubtree(nodeId);
  }, [createGraph]);

  /**
   * Get conditional structure for a condition node
   */
  const getConditionalStructure = useCallback((conditionId: string) => {
    const graph = createGraph();
    return graph.getConditionalStructure(conditionId);
  }, [createGraph]);

  /**
   * Insert a condition node after another node with branch selection
   */
  const insertConditionNodeAfter = useCallback((
    targetNodeId: string,
    nodeData: NodeData,
    moveActionTo: 'yes' | 'no',
    openActionModal?: (insertIndex: number) => void
  ) => {
    console.log('🔍 Graph-based insertConditionNodeAfter:', {
      targetNodeId,
      nodeData: nodeData.label,
      moveActionTo
    });

    const graph = createGraph();
    const newNodeId = `condition-${Date.now()}`;

    const newConditionNode = {
      type: 'condition' as any,
      data: {
        ...nodeData,
        label: nodeData.label,
        isConfigured: false,
        type: 'condition',
        // Add proper delete handlers - will be set later
        onDelete: () => console.log('Delete condition:', newNodeId),
        onDuplicate: () => console.log('Duplicate condition:', newNodeId),
      },
      position: { x: 0, y: 0 } // Temporary - dagre will handle positioning
    };

    const newGraph = graph.insertConditionNodeAfter(
      targetNodeId,
      newConditionNode,
      newNodeId,
      moveActionTo,
      openActionModal
    );
    applyGraphChanges(newGraph);

    console.log('✅ Condition node inserted successfully:', newNodeId);
    return newNodeId;
  }, [createGraph, applyGraphChanges]);

  /**
   * Cut a single node using graph-based approach
   */
  const cutNode = useCallback((nodeId: string) => {
    console.log('🔍 Graph-based cutNode called:', nodeId);
    const graph = createGraph();
    const result = graph.cutNode(nodeId);
    applyGraphChanges(result.newGraph);
    return { cutNodes: result.cutNodes, cutEdges: result.cutEdges };
  }, [createGraph, applyGraphChanges]);

  /**
   * Cut entire flow from a node using graph-based approach
   */
  const cutFlowFromNode = useCallback((nodeId: string) => {
    console.log('🔍 Graph-based cutFlowFromNode called:', nodeId);
    const graph = createGraph();
    const result = graph.cutFlowFromNode(nodeId);
    applyGraphChanges(result.newGraph);
    return { cutNodes: result.cutNodes, cutEdges: result.cutEdges };
  }, [createGraph, applyGraphChanges]);

  /**
   * Paste cut nodes using graph-based approach
   */
  const pasteNodes = useCallback((
    cutNodes: any[],
    cutEdges: any[],
    afterNodeId: string,
    openActionModal?: (insertIndex: number) => void
  ) => {
    console.log('🔍 Graph-based pasteNodes called:', { afterNodeId, cutNodesCount: cutNodes.length });
    const graph = createGraph();
    const newGraph = graph.pasteNodes(cutNodes, cutEdges, afterNodeId, openActionModal);
    applyGraphChanges(newGraph);
  }, [createGraph, applyGraphChanges]);

  return {
    // Core operations
    insertNodeAfter,
    insertNodeByIndex,
    insertConditionNodeAfter,
    addConditionalNodeAtEnd,
    deleteNodeSubtree,
    deleteSingleNode,
    deleteConditionalBranchNode,

    // Cut/Paste operations
    cutNode,
    cutFlowFromNode,
    pasteNodes,

    // Query operations
    getDownstreamNodes,
    getChildren,
    getParents,
    isConditionNode,
    getSubtree,
    getConditionalStructure,

    // Utility
    createGraph,
    applyGraphChanges
  };
};
