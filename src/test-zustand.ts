// Test file to verify Zustand store functionality
// This file can be removed after testing

import { useWorkflowStore } from './hooks/useWorkflowState';

// Test the store functionality
export const testZustandStore = () => {
  console.log('Testing Zustand Store...');
  
  // Get the store state
  const store = useWorkflowStore.getState();
  
  console.log('Initial state:', {
    workflowName: store.workflowName,
    nodes: store.nodes.length,
    edges: store.edges.length,
    layoutMode: store.layoutMode,
  });
  
  // Test setting workflow name
  store.setWorkflowName('Test Workflow');
  console.log('After setting name:', store.workflowName);
  
  // Test adding a node
  const testNode = {
    id: 'test-node-1',
    type: 'trigger',
    position: { x: 100, y: 100 },
    data: {
      label: 'Test Trigger',
      description: 'Test node for Zustand',
    },
  };
  
  store.addNode(testNode);
  console.log('After adding node:', store.nodes.length);
  
  // Test updating node
  store.updateNode('test-node-1', { label: 'Updated Test Trigger' });
  console.log('After updating node:', store.nodes[0]?.data.label);
  
  // Test removing node
  store.removeNode('test-node-1');
  console.log('After removing node:', store.nodes.length);
  
  console.log('Zustand store test completed successfully!');
};

// Export for use in console
if (typeof window !== 'undefined') {
  (window as any).testZustandStore = testZustandStore;
}
