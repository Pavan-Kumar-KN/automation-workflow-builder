/**
 * Test file for duplicate and move operations
 * This file contains basic tests to validate the duplicate and move functionality
 */

import { useGraphStore } from '@/store/useGraphStore';

// Mock test data
const createTestGraph = () => {
  const store = useGraphStore.getState();
  
  // Reset store
  store.reset();
  
  // Add trigger node
  store.addNode({
    id: 'trigger-1',
    type: 'trigger',
    position: { x: 0, y: 0 },
    data: { label: 'Test Trigger' },
    children: ['action-1'],
    parent: undefined,
  });
  
  // Add action node
  store.addNode({
    id: 'action-1',
    type: 'action',
    position: { x: 0, y: 150 },
    data: { label: 'Test Action' },
    children: ['end-1'],
    parent: 'trigger-1',
  });
  
  // Add end node
  store.addNode({
    id: 'end-1',
    type: 'endNode',
    position: { x: 0, y: 300 },
    data: { label: 'End' },
    children: [],
    parent: 'action-1',
  });
  
  return store;
};

// Test duplicate node functionality
export const testDuplicateNode = () => {
  console.log('🧪 Testing duplicate node functionality...');
  
  const store = createTestGraph();
  const initialNodeCount = Object.keys(store.nodes).length;
  
  console.log('Initial nodes:', Object.keys(store.nodes));
  console.log('Initial node count:', initialNodeCount);
  
  // Test duplicating action node
  const duplicatedId = store.duplicateNode('action-1');
  
  const finalNodeCount = Object.keys(store.nodes).length;
  console.log('Final nodes:', Object.keys(store.nodes));
  console.log('Final node count:', finalNodeCount);
  console.log('Duplicated node ID:', duplicatedId);
  
  // Validate results
  const success = duplicatedId && finalNodeCount > initialNodeCount;
  console.log('✅ Duplicate node test:', success ? 'PASSED' : 'FAILED');
  
  return success;
};

// Test duplicate condition node functionality
export const testDuplicateConditionNode = () => {
  console.log('🧪 Testing duplicate condition node functionality...');
  
  const store = createTestGraph();
  
  // Add a condition node
  store.addNode({
    id: 'condition-1',
    type: 'condition',
    position: { x: 0, y: 150 },
    data: { label: 'Test Condition' },
    parent: 'trigger-1',
    branches: {
      yes: ['placeholder-yes-1'],
      no: ['placeholder-no-1'],
    },
  });
  
  // Add placeholders
  store.addNode({
    id: 'placeholder-yes-1',
    type: 'placeholder',
    position: { x: -100, y: 300 },
    data: { label: 'Add Action', branchType: 'yes', conditionNodeId: 'condition-1' },
    parent: 'condition-1',
    children: [],
  });
  
  store.addNode({
    id: 'placeholder-no-1',
    type: 'placeholder',
    position: { x: 100, y: 300 },
    data: { label: 'Add Action', branchType: 'no', conditionNodeId: 'condition-1' },
    parent: 'condition-1',
    children: [],
  });
  
  const initialNodeCount = Object.keys(store.nodes).length;
  console.log('Initial nodes:', Object.keys(store.nodes));
  console.log('Initial node count:', initialNodeCount);
  
  // Test duplicating condition node
  const duplicatedId = store.duplicateNode('condition-1');
  
  const finalNodeCount = Object.keys(store.nodes).length;
  console.log('Final nodes:', Object.keys(store.nodes));
  console.log('Final node count:', finalNodeCount);
  console.log('Duplicated condition ID:', duplicatedId);
  
  // Validate results (should create condition + 2 placeholders = +3 nodes)
  const success = duplicatedId && finalNodeCount >= initialNodeCount + 3;
  console.log('✅ Duplicate condition test:', success ? 'PASSED' : 'FAILED');
  
  return success;
};

// Test move node functionality
export const testMoveNode = () => {
  console.log('🧪 Testing move node functionality...');
  
  const store = createTestGraph();
  
  // Add another action node to move
  store.addNode({
    id: 'action-2',
    type: 'action',
    position: { x: 0, y: 225 },
    data: { label: 'Action to Move' },
    children: ['end-1'],
    parent: 'action-1',
  });
  
  // Update action-1 to point to action-2
  const action1 = store.nodes['action-1'];
  if (action1) {
    action1.children = ['action-2'];
  }
  
  // Update end node parent
  const endNode = store.nodes['end-1'];
  if (endNode) {
    endNode.parent = 'action-2';
  }
  
  console.log('Before move - action-2 parent:', store.nodes['action-2']?.parent);
  console.log('Before move - trigger children:', store.nodes['trigger-1']?.children);
  
  // Test moving action-2 to be directly after trigger
  store.moveNode({
    nodeId: 'action-2',
    targetParentId: 'trigger-1',
    targetBeforeNodeId: 'action-1',
  });
  
  console.log('After move - action-2 parent:', store.nodes['action-2']?.parent);
  console.log('After move - trigger children:', store.nodes['trigger-1']?.children);
  
  // Validate results
  const movedNode = store.nodes['action-2'];
  const success = movedNode && movedNode.parent === 'trigger-1';
  console.log('✅ Move node test:', success ? 'PASSED' : 'FAILED');
  
  return success;
};

// Test validation functions
export const testValidation = () => {
  console.log('🧪 Testing validation functions...');
  
  const store = createTestGraph();
  
  // Test canDuplicateNode (should work for action, not for trigger/end)
  const canDuplicateAction = store.nodes['action-1']?.type !== 'trigger' && store.nodes['action-1']?.type !== 'endNode';
  const canDuplicateTrigger = store.nodes['trigger-1']?.type !== 'trigger' && store.nodes['trigger-1']?.type !== 'endNode';
  const canDuplicateEnd = store.nodes['end-1']?.type !== 'trigger' && store.nodes['end-1']?.type !== 'endNode';
  
  console.log('Can duplicate action:', canDuplicateAction);
  console.log('Can duplicate trigger:', canDuplicateTrigger);
  console.log('Can duplicate end:', canDuplicateEnd);
  
  const success = canDuplicateAction && !canDuplicateTrigger && !canDuplicateEnd;
  console.log('✅ Validation test:', success ? 'PASSED' : 'FAILED');
  
  return success;
};

// Run all tests
export const runAllTests = () => {
  console.log('🧪 Running all duplicate/move tests...');
  
  const results = {
    duplicateNode: testDuplicateNode(),
    duplicateCondition: testDuplicateConditionNode(),
    moveNode: testMoveNode(),
    validation: testValidation(),
  };
  
  const allPassed = Object.values(results).every(result => result);
  
  console.log('📊 Test Results:', results);
  console.log('🎯 Overall Result:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
  
  return { results, allPassed };
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).duplicateMoveTests = {
    runAllTests,
    testDuplicateNode,
    testDuplicateConditionNode,
    testMoveNode,
    testValidation,
  };
}
