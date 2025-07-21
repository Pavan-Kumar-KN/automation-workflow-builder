/**
 * Test script to verify conditional branch move operations
 * This tests the specific case where moving the only node from a conditional branch
 * should leave a placeholder node instead of a ghost node
 */

import { useGraphStore } from '@/store/useGraphStore';
import { useWorkflowStore } from '@/hooks/useWorkflowState';

export const testConditionalMove = () => {
  console.log('🧪 Testing conditional branch move operations...');
  
  const graphStore = useGraphStore.getState();
  const workflowStore = useWorkflowStore.getState();
  
  // Reset and create test workflow
  graphStore.reset();
  
  // Create trigger
  graphStore.addNode({
    id: 'trigger-test',
    type: 'trigger',
    position: { x: 0, y: 0 },
    data: { label: 'Test Trigger' },
    children: ['condition-test'],
    parent: undefined,
  });
  
  // Create condition node
  const conditionId = 'condition-test';
  const yesPlaceholderId = 'placeholder-yes-initial';
  const noPlaceholderId = 'placeholder-no-initial';
  const actionInYesId = 'action-in-yes';
  
  graphStore.addNode({
    id: conditionId,
    type: 'condition',
    position: { x: 0, y: 150 },
    data: { 
      label: 'Test Condition',
      yesPlaceholderId,
      noPlaceholderId
    },
    parent: 'trigger-test',
    branches: {
      yes: [actionInYesId],
      no: [noPlaceholderId],
    },
  });
  
  // Create action in Yes branch
  graphStore.addNode({
    id: actionInYesId,
    type: 'action',
    position: { x: -100, y: 300 },
    data: { label: 'Action in Yes Branch' },
    parent: conditionId,
    children: ['end-test'],
  });
  
  // Create placeholder in No branch
  graphStore.addNode({
    id: noPlaceholderId,
    type: 'placeholder',
    position: { x: 100, y: 300 },
    data: { 
      label: 'Add Action',
      branchType: 'no',
      conditionNodeId: conditionId
    },
    parent: conditionId,
    children: [],
  });
  
  // Create end node
  graphStore.addNode({
    id: 'end-test',
    type: 'endNode',
    position: { x: 0, y: 450 },
    data: { label: 'End' },
    children: [],
    parent: actionInYesId,
  });
  
  console.log('📊 Initial workflow created:');
  console.log('  Trigger → Condition');
  console.log('    ├─ Yes: Action → End');
  console.log('    └─ No: Placeholder');
  
  // Show initial state
  const initialState = graphStore.nodes;
  console.log('📊 Initial nodes:', Object.keys(initialState));
  console.log('📊 Condition branches:', initialState[conditionId]?.branches);
  
  // Test: Move the action from Yes branch to main flow
  console.log('\n🔧 Testing move operation...');
  console.log('Moving action from Yes branch to main flow (after trigger)');
  
  // Set up move state
  workflowStore.setIsMoveMode(true);
  workflowStore.setNodeToMove(actionInYesId);
  workflowStore.setFlowToMove(null);
  
  // Execute move: Move action to be between trigger and condition
  graphStore.moveNode({
    nodeId: actionInYesId,
    targetParentId: 'trigger-test',
    targetBeforeNodeId: conditionId
  });
  
  // Check results
  const finalState = graphStore.nodes;
  console.log('\n📊 Final state:');
  console.log('📊 Final nodes:', Object.keys(finalState));
  
  const finalCondition = finalState[conditionId];
  console.log('📊 Final condition branches:', finalCondition?.branches);
  
  // Verify Yes branch has placeholder
  const yesBranch = finalCondition?.branches?.yes || [];
  const yesNodes = yesBranch.map(id => finalState[id]).filter(Boolean);
  
  console.log('📊 Yes branch nodes:', yesNodes.map(n => `${n.id} (${n.type})`));
  
  // Check if placeholder was created
  const hasPlaceholder = yesNodes.some(node => node.type === 'placeholder');
  const hasGhost = yesNodes.some(node => node.type === 'ghost');
  
  console.log('\n✅ Test Results:');
  console.log('  Has placeholder in Yes branch:', hasPlaceholder);
  console.log('  Has ghost in Yes branch:', hasGhost);
  console.log('  Expected: placeholder = true, ghost = false');
  console.log('  Note: ensureConditionalPlaceholders() should handle this automatically');

  const testPassed = hasPlaceholder && !hasGhost;
  console.log(`\n🎯 Test ${testPassed ? 'PASSED' : 'FAILED'}`);

  if (!testPassed) {
    console.log('❌ Expected a placeholder node in the Yes branch after moving the action');
    console.log('❌ Current Yes branch contains:', yesNodes.map(n => n.type));
    console.log('💡 The ensureConditionalPlaceholders() function should have created a placeholder');
  }
  
  // Clean up
  workflowStore.forceResetMoveState();
  
  return {
    testPassed,
    hasPlaceholder,
    hasGhost,
    yesBranchNodes: yesNodes,
    finalState
  };
};

export const testConditionalFlowMove = () => {
  console.log('🧪 Testing conditional branch flow move operations...');
  
  const graphStore = useGraphStore.getState();
  const workflowStore = useWorkflowStore.getState();
  
  // Reset and create test workflow with multiple actions in Yes branch
  graphStore.reset();
  
  // Create trigger
  graphStore.addNode({
    id: 'trigger-test',
    type: 'trigger',
    position: { x: 0, y: 0 },
    data: { label: 'Test Trigger' },
    children: ['condition-test'],
    parent: undefined,
  });
  
  // Create condition node
  const conditionId = 'condition-test';
  const noPlaceholderId = 'placeholder-no-initial';
  const action1Id = 'action-1-yes';
  const action2Id = 'action-2-yes';
  
  graphStore.addNode({
    id: conditionId,
    type: 'condition',
    position: { x: 0, y: 150 },
    data: { 
      label: 'Test Condition',
      noPlaceholderId
    },
    parent: 'trigger-test',
    branches: {
      yes: [action1Id],
      no: [noPlaceholderId],
    },
  });
  
  // Create action chain in Yes branch
  graphStore.addNode({
    id: action1Id,
    type: 'action',
    position: { x: -100, y: 300 },
    data: { label: 'First Action in Yes' },
    parent: conditionId,
    children: [action2Id],
  });
  
  graphStore.addNode({
    id: action2Id,
    type: 'action',
    position: { x: -100, y: 400 },
    data: { label: 'Second Action in Yes' },
    parent: action1Id,
    children: ['end-test'],
  });
  
  // Create placeholder in No branch
  graphStore.addNode({
    id: noPlaceholderId,
    type: 'placeholder',
    position: { x: 100, y: 300 },
    data: { 
      label: 'Add Action',
      branchType: 'no',
      conditionNodeId: conditionId
    },
    parent: conditionId,
    children: [],
  });
  
  // Create end node
  graphStore.addNode({
    id: 'end-test',
    type: 'endNode',
    position: { x: 0, y: 500 },
    data: { label: 'End' },
    children: [],
    parent: action2Id,
  });
  
  console.log('📊 Initial workflow created:');
  console.log('  Trigger → Condition');
  console.log('    ├─ Yes: Action1 → Action2 → End');
  console.log('    └─ No: Placeholder');
  
  // Test: Move entire flow from Yes branch
  console.log('\n🔧 Testing flow move operation...');
  console.log('Moving entire flow from Yes branch to main flow');
  
  // Set up move state
  workflowStore.setIsMoveMode(true);
  workflowStore.setNodeToMove(null);
  workflowStore.setFlowToMove(action1Id);
  
  // Execute move: Move flow to be between trigger and condition
  graphStore.moveFlow({
    startNodeId: action1Id,
    targetParentId: 'trigger-test',
    targetBeforeNodeId: conditionId
  });
  
  // Check results
  const finalState = graphStore.nodes;
  const finalCondition = finalState[conditionId];
  const yesBranch = finalCondition?.branches?.yes || [];
  const yesNodes = yesBranch.map(id => finalState[id]).filter(Boolean);
  
  console.log('\n📊 Final Yes branch nodes:', yesNodes.map(n => `${n.id} (${n.type})`));
  
  const hasPlaceholder = yesNodes.some(node => node.type === 'placeholder');
  const hasGhost = yesNodes.some(node => node.type === 'ghost');
  
  console.log('\n✅ Flow Move Test Results:');
  console.log('  Has placeholder in Yes branch:', hasPlaceholder);
  console.log('  Has ghost in Yes branch:', hasGhost);
  
  const testPassed = hasPlaceholder && !hasGhost;
  console.log(`\n🎯 Flow Move Test ${testPassed ? 'PASSED' : 'FAILED'}`);
  
  // Clean up
  workflowStore.forceResetMoveState();
  
  return {
    testPassed,
    hasPlaceholder,
    hasGhost,
    yesBranchNodes: yesNodes
  };
};

export const testGhostNodeCleanup = () => {
  console.log('🧪 Testing ghost node cleanup during move operations...');

  const graphStore = useGraphStore.getState();
  const workflowStore = useWorkflowStore.getState();

  // Reset and create test workflow with ghost nodes
  graphStore.reset();

  // Create trigger
  graphStore.addNode({
    id: 'trigger-test',
    type: 'trigger',
    position: { x: 0, y: 0 },
    data: { label: 'Test Trigger' },
    children: ['condition-test'],
    parent: undefined,
  });

  // Create condition node
  const conditionId = 'condition-test';
  const actionInNoId = 'action-in-no';
  const ghostNodeId = 'ghost-after-action';

  graphStore.addNode({
    id: conditionId,
    type: 'condition',
    position: { x: 0, y: 150 },
    data: { label: 'Test Condition' },
    parent: 'trigger-test',
    branches: {
      yes: ['placeholder-yes-initial'],
      no: [actionInNoId],
    },
  });

  // Create action in No branch with a ghost node child
  graphStore.addNode({
    id: actionInNoId,
    type: 'action',
    position: { x: 100, y: 300 },
    data: { label: 'Action in No Branch' },
    parent: conditionId,
    children: [ghostNodeId],
  });

  // Create ghost node (this should be cleaned up during move)
  graphStore.addNode({
    id: ghostNodeId,
    type: 'ghost',
    position: { x: 100, y: 400 },
    data: { label: 'Ghost Node' },
    parent: actionInNoId,
    children: [],
  });

  // Create placeholder in Yes branch
  graphStore.addNode({
    id: 'placeholder-yes-initial',
    type: 'placeholder',
    position: { x: -100, y: 300 },
    data: {
      label: 'Add Action',
      branchType: 'yes',
      conditionNodeId: conditionId
    },
    parent: conditionId,
    children: [],
  });

  console.log('📊 Initial workflow with ghost node created');
  console.log('  Trigger → Condition');
  console.log('    ├─ Yes: Placeholder');
  console.log('    └─ No: Action → Ghost');

  // Check initial state
  const initialState = graphStore.nodes;
  const initialGhostExists = !!initialState[ghostNodeId];
  console.log('📊 Initial ghost node exists:', initialGhostExists);

  // Test: Move the action from No branch to main flow
  console.log('\n🔧 Testing move with ghost node cleanup...');

  // Set up move state
  workflowStore.setIsMoveMode(true);
  workflowStore.setNodeToMove(actionInNoId);
  workflowStore.setFlowToMove(null);

  // Execute move
  graphStore.moveNode({
    nodeId: actionInNoId,
    targetParentId: 'trigger-test',
    targetBeforeNodeId: conditionId
  });

  // Check results
  const finalState = graphStore.nodes;
  const finalCondition = finalState[conditionId];
  const noBranch = finalCondition?.branches?.no || [];
  const noNodes = noBranch.map(id => finalState[id]).filter(Boolean);

  const finalGhostExists = !!finalState[ghostNodeId];
  const hasPlaceholder = noNodes.some(node => node.type === 'placeholder');

  console.log('\n📊 Final state:');
  console.log('📊 Ghost node still exists:', finalGhostExists);
  console.log('📊 No branch has placeholder:', hasPlaceholder);
  console.log('📊 No branch nodes:', noNodes.map(n => `${n.id} (${n.type})`));

  const testPassed = !finalGhostExists && hasPlaceholder;
  console.log(`\n🎯 Ghost Cleanup Test ${testPassed ? 'PASSED' : 'FAILED'}`);

  if (!testPassed) {
    if (finalGhostExists) {
      console.log('❌ Ghost node was not cleaned up during move operation');
    }
    if (!hasPlaceholder) {
      console.log('❌ Placeholder was not created for empty No branch');
    }
  }

  // Clean up
  workflowStore.forceResetMoveState();

  return {
    testPassed,
    ghostCleanedUp: !finalGhostExists,
    placeholderCreated: hasPlaceholder,
    noBranchNodes: noNodes
  };
};

// Export for browser console
if (typeof window !== 'undefined') {
  (window as any).testConditionalMove = {
    testConditionalMove,
    testConditionalFlowMove,
    testGhostNodeCleanup,
    runAllTests: () => {
      console.log('🧪 Running all conditional move tests...');
      const test1 = testConditionalMove();
      const test2 = testConditionalFlowMove();
      const test3 = testGhostNodeCleanup();

      const allPassed = test1.testPassed && test2.testPassed && test3.testPassed;
      console.log(`\n🎯 All Tests ${allPassed ? 'PASSED' : 'FAILED'}`);

      return { test1, test2, test3, allPassed };
    }
  };
}
