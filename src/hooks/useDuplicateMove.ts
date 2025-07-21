import { useCallback } from 'react';
import { useGraphStore } from '@/store/useGraphStore';
import { useWorkflowStore } from '@/hooks/useWorkflowState';
import { toast } from 'sonner';

export const useDuplicateMove = () => {
  const {
    duplicateNode: storeDuplicateNode,
    duplicateFlow: storeDuplicateFlow,
    moveNode: storeMoveNode,
    moveFlow: storeMoveFlow,
    removeNode,
    nodes
  } = useGraphStore();

  // Move state management (using global state like copy-paste)
  const {
    isMoveMode,
    nodeToMove,
    flowToMove,
    setIsMoveMode,
    setNodeToMove,
    setFlowToMove,
    forceResetMoveState
  } = useWorkflowStore();

  /**
   * Duplicate a single node
   */
  const duplicateNode = useCallback((nodeId: string) => {
    console.log('🔍 Duplicating node:', nodeId);
    
    const nodeToClone = nodes[nodeId];
    if (!nodeToClone) {
      toast.error('Node not found');
      return;
    }

    // Prevent duplicating trigger or end nodes
    if (nodeToClone.type === 'trigger' || nodeToClone.type === 'endNode') {
      toast.error('Cannot duplicate trigger or end nodes');
      return;
    }

    try {
      const duplicatedId = storeDuplicateNode(nodeId);
      if (duplicatedId) {
        toast.success(`${nodeToClone.type === 'condition' ? 'Condition' : 'Action'} duplicated successfully`);
        console.log('✅ Node duplicated:', nodeId, '->', duplicatedId);
        return duplicatedId;
      } else {
        toast.error('Failed to duplicate node');
        console.error('❌ Failed to duplicate node:', nodeId);
      }
    } catch (error) {
      console.error('❌ Error duplicating node:', error);
      toast.error('Error duplicating node');
    }
  }, [nodes, storeDuplicateNode]);

  /**
   * Duplicate an entire flow starting from a node
   */
  const duplicateFlow = useCallback((nodeId: string) => {
    console.log('🔍 Duplicating flow from:', nodeId);
    
    const startNode = nodes[nodeId];
    if (!startNode) {
      toast.error('Start node not found');
      return;
    }

    // Prevent duplicating from trigger or end nodes
    if (startNode.type === 'trigger' || startNode.type === 'endNode') {
      toast.error('Cannot duplicate flow from trigger or end nodes');
      return;
    }

    try {
      const duplicatedIds = storeDuplicateFlow(nodeId);
      if (duplicatedIds && duplicatedIds.length > 0) {
        toast.success(`Flow duplicated successfully (${duplicatedIds.length} nodes)`);
        console.log('✅ Flow duplicated:', nodeId, '->', duplicatedIds);
        return duplicatedIds;
      } else {
        toast.error('Failed to duplicate flow');
        console.error('❌ Failed to duplicate flow from:', nodeId);
      }
    } catch (error) {
      console.error('❌ Error duplicating flow:', error);
      toast.error('Error duplicating flow');
    }
  }, [nodes, storeDuplicateFlow]);

  /**
   * Cut a node for moving (marks it for move operation)
   */
  const cutNode = useCallback((nodeId: string) => {
    console.log('🔍 Cutting node for move:', nodeId);

    const nodeToCut = nodes[nodeId];
    if (!nodeToCut) {
      toast.error('Node not found');
      return;
    }

    // Prevent cutting trigger or end nodes
    if (nodeToCut.type === 'trigger' || nodeToCut.type === 'endNode') {
      toast.error('Cannot move trigger or end nodes');
      return;
    }

    console.log('🔧 Setting move state:', { nodeId, isMoveMode: true });
    setNodeToMove(nodeId);
    setFlowToMove(null);
    setIsMoveMode(true);

    // Debug: Check if state was set correctly
    setTimeout(() => {
      const currentState = useWorkflowStore.getState();
      console.log('📊 Move state after setting:', {
        isMoveMode: currentState.isMoveMode,
        nodeToMove: currentState.nodeToMove,
        flowToMove: currentState.flowToMove
      });
    }, 100);

    toast.success(`${nodeToCut.type === 'condition' ? 'Condition' : 'Action'} marked for moving`);
  }, [nodes, setNodeToMove, setFlowToMove, setIsMoveMode]);

  /**
   * Cut a flow for moving (marks it for move operation)
   */
  const cutFlow = useCallback((nodeId: string) => {
    console.log('🔍 Cutting flow for move:', nodeId);

    const startNode = nodes[nodeId];
    if (!startNode) {
      toast.error('Start node not found');
      return;
    }

    // Prevent cutting from trigger or end nodes
    if (startNode.type === 'trigger' || startNode.type === 'endNode') {
      toast.error('Cannot move flow from trigger or end nodes');
      return;
    }

    setFlowToMove(nodeId);
    setNodeToMove(null);
    setIsMoveMode(true);
    toast.success('Flow marked for moving');
  }, [nodes]);

  /**
   * Paste the cut node/flow at target location
   */
  const pasteCut = useCallback((targetParentId: string, targetBeforeNodeId: string) => {
    console.log('🔍 Pasting cut item:', {
      nodeToMove,
      flowToMove,
      targetParentId,
      targetBeforeNodeId,
      isMoveMode
    });

    if (!isMoveMode || (!nodeToMove && !flowToMove)) {
      console.log('❌ Cannot paste - no item marked for moving:', { isMoveMode, nodeToMove, flowToMove });
      toast.error('No item marked for moving');
      return;
    }

    try {
      if (nodeToMove) {
        console.log('🔧 Moving single node:', nodeToMove);
        // Check for invalid move (moving node before itself)
        if (nodeToMove === targetBeforeNodeId) {
          console.log('❌ Invalid move: trying to move node before itself');
          toast.error('Cannot move node to its current position');
          return;
        }

        storeMoveNode({ nodeId: nodeToMove, targetParentId, targetBeforeNodeId });
        toast.success('Node moved successfully');
      } else if (flowToMove) {
        console.log('🔧 Moving flow from:', flowToMove);
        storeMoveFlow({ startNodeId: flowToMove, targetParentId, targetBeforeNodeId });
        toast.success('Flow moved successfully');
      }

      // Clear move state
      console.log('🔧 Clearing move state');
      forceResetMoveState();
    } catch (error) {
      console.error('❌ Error moving item:', error);
      toast.error('Error moving item');
    }
  }, [isMoveMode, nodeToMove, flowToMove, storeMoveNode, storeMoveFlow, forceResetMoveState]);

  /**
   * Cancel move operation
   */
  const cancelMove = useCallback(() => {
    forceResetMoveState();
    toast.info('Move operation cancelled');
  }, [forceResetMoveState]);

  /**
   * Move a single node to a new location
   */
  const moveNode = useCallback((nodeId: string, targetParentId: string, targetBeforeNodeId: string) => {
    console.log('🔍 Moving node:', { nodeId, targetParentId, targetBeforeNodeId });
    
    const nodeToMove = nodes[nodeId];
    const targetParent = nodes[targetParentId];
    const targetBefore = nodes[targetBeforeNodeId];

    if (!nodeToMove || !targetParent || !targetBefore) {
      toast.error('Node, target parent, or target position not found');
      return;
    }

    // Prevent moving trigger or end nodes
    if (nodeToMove.type === 'trigger' || nodeToMove.type === 'endNode') {
      toast.error('Cannot move trigger or end nodes');
      return;
    }

    // Prevent circular dependencies
    if (nodeId === targetParentId) {
      toast.error('Cannot move node to itself');
      return;
    }

    // Check if target parent is a descendant of the node being moved
    const isDescendant = (ancestorId: string, descendantId: string): boolean => {
      const descendant = nodes[descendantId];
      if (!descendant) return false;
      
      if (descendant.parent === ancestorId) return true;
      if (descendant.parent) return isDescendant(ancestorId, descendant.parent);
      return false;
    };

    if (isDescendant(nodeId, targetParentId)) {
      toast.error('Cannot move node to its own descendant');
      return;
    }

    try {
      storeMoveNode({ nodeId, targetParentId, targetBeforeNodeId });
      toast.success(`${nodeToMove.type === 'condition' ? 'Condition' : 'Action'} moved successfully`);
      console.log('✅ Node moved:', nodeId, 'to parent:', targetParentId);
    } catch (error) {
      console.error('❌ Error moving node:', error);
      toast.error('Error moving node');
    }
  }, [nodes, storeMoveNode]);

  /**
   * Move an entire flow to a new location
   */
  const moveFlow = useCallback((nodeId: string, targetParentId: string, targetBeforeNodeId: string) => {
    console.log('🔍 Moving flow from:', { nodeId, targetParentId, targetBeforeNodeId });
    
    const startNode = nodes[nodeId];
    const targetParent = nodes[targetParentId];
    const targetBefore = nodes[targetBeforeNodeId];

    if (!startNode || !targetParent || !targetBefore) {
      toast.error('Start node, target parent, or target position not found');
      return;
    }

    // Prevent moving from trigger or end nodes
    if (startNode.type === 'trigger' || startNode.type === 'endNode') {
      toast.error('Cannot move flow from trigger or end nodes');
      return;
    }

    // Prevent circular dependencies (simplified check)
    if (nodeId === targetParentId) {
      toast.error('Cannot move flow to itself');
      return;
    }

    try {
      storeMoveFlow({ startNodeId: nodeId, targetParentId, targetBeforeNodeId });
      toast.success('Flow moved successfully');
      console.log('✅ Flow moved from:', nodeId, 'to parent:', targetParentId);
    } catch (error) {
      console.error('❌ Error moving flow:', error);
      toast.error('Error moving flow');
    }
  }, [nodes, storeMoveFlow]);

  /**
   * Check if a node can be duplicated
   */
  const canDuplicateNode = useCallback((nodeId: string): boolean => {
    const node = nodes[nodeId];
    if (!node) return false;
    
    // Cannot duplicate trigger or end nodes
    return node.type !== 'trigger' && node.type !== 'endNode';
  }, [nodes]);

  /**
   * Check if a node can be moved
   */
  const canMoveNode = useCallback((nodeId: string, targetParentId?: string): boolean => {
    const node = nodes[nodeId];
    if (!node) return false;
    
    // Cannot move trigger or end nodes
    if (node.type === 'trigger' || node.type === 'endNode') return false;
    
    // If target parent is specified, check for circular dependencies
    if (targetParentId) {
      if (nodeId === targetParentId) return false;
      
      const isDescendant = (ancestorId: string, descendantId: string): boolean => {
        const descendant = nodes[descendantId];
        if (!descendant) return false;
        
        if (descendant.parent === ancestorId) return true;
        if (descendant.parent) return isDescendant(ancestorId, descendant.parent);
        return false;
      };
      
      if (isDescendant(nodeId, targetParentId)) return false;
    }
    
    return true;
  }, [nodes]);

  return {
    // Duplicate operations
    duplicateNode,
    duplicateFlow,

    // Move operations (direct)
    moveNode,
    moveFlow,

    // Move operations (cut-paste style)
    cutNode,
    cutFlow,
    pasteCut,
    cancelMove,

    // Move state
    isMoveMode,
    nodeToMove,
    flowToMove,

    // Validation
    canDuplicateNode,
    canMoveNode
  };
};
