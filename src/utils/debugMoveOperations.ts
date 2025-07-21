/**
 * Debug utilities for move operations
 */

import { useGraphStore } from '@/store/useGraphStore';
import { useWorkflowStore } from '@/hooks/useWorkflowState';

export const debugCurrentWorkflow = () => {
  const graphStore = useGraphStore.getState();
  const workflowStore = useWorkflowStore.getState();
  
  console.log('🔍 === CURRENT WORKFLOW DEBUG ===');
  
  // Show all nodes
  console.log('📊 All Nodes:');
  Object.values(graphStore.nodes).forEach(node => {
    console.log(`  ${node.id} (${node.type}):`, {
      parent: node.parent,
      children: node.children,
      branches: node.branches,
      label: node.data.label
    });
  });
  
  // Show move state
  console.log('📊 Move State:');
  console.log('  isMoveMode:', workflowStore.isMoveMode);
  console.log('  nodeToMove:', workflowStore.nodeToMove);
  console.log('  flowToMove:', workflowStore.flowToMove);
  
  // Show workflow chain
  console.log('📊 Workflow Chain:');
  const trigger = Object.values(graphStore.nodes).find(n => n.type === 'trigger');
  if (trigger) {
    const chain = [];
    let current = trigger;
    while (current) {
      chain.push(`${current.id} (${current.type})`);
      const nextId = current.children?.[0];
      current = nextId ? graphStore.nodes[nextId] : null;
    }
    console.log('  Chain:', chain.join(' → '));
  }
  
  return {
    nodes: graphStore.nodes,
    moveState: {
      isMoveMode: workflowStore.isMoveMode,
      nodeToMove: workflowStore.nodeToMove,
      flowToMove: workflowStore.flowToMove
    }
  };
};

export const debugMoveOperation = (nodeId: string, targetParentId: string, targetBeforeNodeId: string) => {
  const graphStore = useGraphStore.getState();
  
  console.log('🔍 === MOVE OPERATION DEBUG ===');
  console.log('📊 Move Parameters:');
  console.log('  nodeToMove:', nodeId);
  console.log('  targetParent:', targetParentId);
  console.log('  targetBefore:', targetBeforeNodeId);
  
  const nodeToMove = graphStore.nodes[nodeId];
  const targetParent = graphStore.nodes[targetParentId];
  const targetBefore = graphStore.nodes[targetBeforeNodeId];
  
  console.log('📊 Node Details:');
  console.log('  nodeToMove:', nodeToMove ? {
    id: nodeToMove.id,
    type: nodeToMove.type,
    parent: nodeToMove.parent,
    children: nodeToMove.children,
    label: nodeToMove.data.label
  } : 'NOT FOUND');
  
  console.log('  targetParent:', targetParent ? {
    id: targetParent.id,
    type: targetParent.type,
    children: targetParent.children,
    branches: targetParent.branches,
    label: targetParent.data.label
  } : 'NOT FOUND');
  
  console.log('  targetBefore:', targetBefore ? {
    id: targetBefore.id,
    type: targetBefore.type,
    parent: targetBefore.parent,
    label: targetBefore.data.label
  } : 'NOT FOUND');
  
  // Analyze the move logic
  console.log('📊 Move Analysis:');
  if (nodeToMove && targetParent && targetBefore) {
    console.log('  Current position: ', nodeToMove.parent, '→', nodeId, '→', nodeToMove.children);
    console.log('  Target position: ', targetParentId, '→', nodeId, '→', targetBeforeNodeId);
    
    // Check if this is a valid move
    if (nodeId === targetBeforeNodeId) {
      console.log('  ⚠️  WARNING: Trying to move node before itself!');
    }
    if (nodeToMove.parent === targetParentId && nodeToMove.children?.includes(targetBeforeNodeId)) {
      console.log('  ⚠️  WARNING: Node is already in this position!');
    }
  }
};

export const simulateMoveOperation = (nodeId: string, targetParentId: string, targetBeforeNodeId: string) => {
  console.log('🧪 === SIMULATING MOVE OPERATION ===');
  
  debugMoveOperation(nodeId, targetParentId, targetBeforeNodeId);
  
  console.log('🔧 Executing move...');
  const graphStore = useGraphStore.getState();
  graphStore.moveNode({ nodeId, targetParentId, targetBeforeNodeId });
  
  console.log('✅ Move completed. New state:');
  debugCurrentWorkflow();
};

// Export for browser console
if (typeof window !== 'undefined') {
  (window as any).debugMove = {
    debugCurrentWorkflow,
    debugMoveOperation,
    simulateMoveOperation,
    
    // Quick test functions
    testMove: () => {
      const graphStore = useGraphStore.getState();
      const nodes = Object.values(graphStore.nodes);
      const actionNode = nodes.find(n => n.type === 'action');
      const triggerNode = nodes.find(n => n.type === 'trigger');
      const endNode = nodes.find(n => n.type === 'endNode');
      
      if (actionNode && triggerNode && endNode) {
        console.log('🧪 Testing move of action node...');
        simulateMoveOperation(actionNode.id, triggerNode.id, endNode.id);
      } else {
        console.log('❌ Could not find required nodes for test');
      }
    },
    
    getCurrentState: debugCurrentWorkflow
  };
}
