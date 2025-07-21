/**
 * Test script to verify move operations work with global state
 * Run this in browser console to test the move functionality
 */

import { useWorkflowStore } from '@/hooks/useWorkflowState';
import { useDuplicateMove } from '@/hooks/useDuplicateMove';

export const testMoveOperations = () => {
  console.log('🧪 Testing move operations with global state...');
  
  // Get the stores
  const workflowStore = useWorkflowStore.getState();
  const { cutNode, cutFlow, pasteCut, cancelMove } = useDuplicateMove.getState ? useDuplicateMove.getState() : {};
  
  console.log('📊 Initial state:');
  console.log('- isMoveMode:', workflowStore.isMoveMode);
  console.log('- nodeToMove:', workflowStore.nodeToMove);
  console.log('- flowToMove:', workflowStore.flowToMove);
  
  // Test setting move mode
  console.log('\n🔧 Testing setIsMoveMode...');
  workflowStore.setIsMoveMode(true);
  workflowStore.setNodeToMove('test-node-123');
  
  console.log('📊 After setting move mode:');
  console.log('- isMoveMode:', workflowStore.isMoveMode);
  console.log('- nodeToMove:', workflowStore.nodeToMove);
  console.log('- flowToMove:', workflowStore.flowToMove);
  
  // Test reset
  console.log('\n🔧 Testing forceResetMoveState...');
  workflowStore.forceResetMoveState();
  
  console.log('📊 After reset:');
  console.log('- isMoveMode:', workflowStore.isMoveMode);
  console.log('- nodeToMove:', workflowStore.nodeToMove);
  console.log('- flowToMove:', workflowStore.flowToMove);
  
  console.log('\n✅ Move operations global state test completed!');
  
  return {
    isMoveMode: workflowStore.isMoveMode,
    nodeToMove: workflowStore.nodeToMove,
    flowToMove: workflowStore.flowToMove,
    setters: {
      setIsMoveMode: workflowStore.setIsMoveMode,
      setNodeToMove: workflowStore.setNodeToMove,
      setFlowToMove: workflowStore.setFlowToMove,
      forceResetMoveState: workflowStore.forceResetMoveState
    }
  };
};

// Export for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testMoveOperations = testMoveOperations;
  
  // Also export individual functions for manual testing
  (window as any).moveTestUtils = {
    getWorkflowStore: () => useWorkflowStore.getState(),
    testMoveState: () => {
      const store = useWorkflowStore.getState();
      console.log('Current move state:', {
        isMoveMode: store.isMoveMode,
        nodeToMove: store.nodeToMove,
        flowToMove: store.flowToMove
      });
      return store;
    },
    setMoveMode: (nodeId: string) => {
      const store = useWorkflowStore.getState();
      store.setIsMoveMode(true);
      store.setNodeToMove(nodeId);
      store.setFlowToMove(null);
      console.log('Move mode set for node:', nodeId);
    },
    resetMoveMode: () => {
      const store = useWorkflowStore.getState();
      store.forceResetMoveState();
      console.log('Move mode reset');
    }
  };
}
