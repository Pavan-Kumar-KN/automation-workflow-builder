import { useGraphStore } from '@/store/useGraphStore';
import { toast } from 'sonner';

export interface DuplicateMoveHandler {
  // Duplicate operations
  duplicateNode: (nodeId: string) => void;
  duplicateFlow: (nodeId: string) => void;
  
  // Move operations
  moveNode: (nodeId: string, targetParentId: string, targetBeforeNodeId: string) => void;
  moveFlow: (nodeId: string, targetParentId: string, targetBeforeNodeId: string) => void;
  
  // Utility methods
  canMoveNode: (nodeId: string, targetParentId: string) => boolean;
  canDuplicateNode: (nodeId: string) => boolean;
}

export const createDuplicateMoveHandler = (): DuplicateMoveHandler => {
  const {
    duplicateNode: storeDuplicateNode,
    duplicateFlow: storeDuplicateFlow,
    moveNode: storeMoveNode,
    moveFlow: storeMoveFlow,
    nodes
  } = useGraphStore.getState();

  const duplicateNode = (nodeId: string) => {
    console.log('🔍 Duplicate handler - duplicating node:', nodeId);
    
    try {
      const duplicatedId = storeDuplicateNode(nodeId);
      if (duplicatedId) {
        toast.success('Node duplicated successfully');
        console.log('✅ Node duplicated:', nodeId, '->', duplicatedId);
      } else {
        toast.error('Failed to duplicate node');
        console.error('❌ Failed to duplicate node:', nodeId);
      }
    } catch (error) {
      console.error('❌ Error duplicating node:', error);
      toast.error('Error duplicating node');
    }
  };

  const duplicateFlow = (nodeId: string) => {
    console.log('🔍 Duplicate handler - duplicating flow from:', nodeId);
    
    try {
      const duplicatedIds = storeDuplicateFlow(nodeId);
      if (duplicatedIds && duplicatedIds.length > 0) {
        toast.success(`Flow duplicated successfully (${duplicatedIds.length} nodes)`);
        console.log('✅ Flow duplicated:', nodeId, '->', duplicatedIds);
      } else {
        toast.error('Failed to duplicate flow');
        console.error('❌ Failed to duplicate flow from:', nodeId);
      }
    } catch (error) {
      console.error('❌ Error duplicating flow:', error);
      toast.error('Error duplicating flow');
    }
  };

  const moveNode = (nodeId: string, targetParentId: string, targetBeforeNodeId: string) => {
    console.log('🔍 Move handler - moving node:', { nodeId, targetParentId, targetBeforeNodeId });
    
    if (!canMoveNode(nodeId, targetParentId)) {
      toast.error('Cannot move node to this location');
      return;
    }

    try {
      storeMoveNode({ nodeId, targetParentId, targetBeforeNodeId });
      toast.success('Node moved successfully');
      console.log('✅ Node moved:', nodeId, 'to parent:', targetParentId);
    } catch (error) {
      console.error('❌ Error moving node:', error);
      toast.error('Error moving node');
    }
  };

  const moveFlow = (nodeId: string, targetParentId: string, targetBeforeNodeId: string) => {
    console.log('🔍 Move handler - moving flow from:', { nodeId, targetParentId, targetBeforeNodeId });
    
    if (!canMoveNode(nodeId, targetParentId)) {
      toast.error('Cannot move flow to this location');
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
  };

  const canMoveNode = (nodeId: string, targetParentId: string): boolean => {
    const currentNodes = useGraphStore.getState().nodes;
    const nodeToMove = currentNodes[nodeId];
    const targetParent = currentNodes[targetParentId];

    if (!nodeToMove || !targetParent) {
      console.log('❌ Cannot move: node or target parent not found');
      return false;
    }

    // Prevent moving a node to itself or its descendants
    const isDescendant = (ancestorId: string, descendantId: string): boolean => {
      const descendant = currentNodes[descendantId];
      if (!descendant) return false;
      
      if (descendant.parent === ancestorId) return true;
      if (descendant.parent) return isDescendant(ancestorId, descendant.parent);
      return false;
    };

    if (nodeId === targetParentId || isDescendant(nodeId, targetParentId)) {
      console.log('❌ Cannot move: would create circular dependency');
      return false;
    }

    // Prevent moving trigger or end nodes
    if (nodeToMove.type === 'trigger' || nodeToMove.type === 'endNode') {
      console.log('❌ Cannot move: trigger and end nodes cannot be moved');
      return false;
    }

    return true;
  };

  const canDuplicateNode = (nodeId: string): boolean => {
    const currentNodes = useGraphStore.getState().nodes;
    const nodeToDuplicate = currentNodes[nodeId];

    if (!nodeToDuplicate) {
      console.log('❌ Cannot duplicate: node not found');
      return false;
    }

    // Prevent duplicating trigger or end nodes
    if (nodeToDuplicate.type === 'trigger' || nodeToDuplicate.type === 'endNode') {
      console.log('❌ Cannot duplicate: trigger and end nodes cannot be duplicated');
      return false;
    }

    return true;
  };

  return {
    duplicateNode,
    duplicateFlow,
    moveNode,
    moveFlow,
    canMoveNode,
    canDuplicateNode
  };
};

// Export singleton instance
export const duplicateMoveHandler = createDuplicateMoveHandler();
