/**
 * Debug utilities for placeholder management
 */

import { useGraphStore } from '@/store/useGraphStore';

export const debugPlaceholders = () => {
  const graphStore = useGraphStore.getState();
  
  console.log('🔍 === PLACEHOLDER DEBUG ===');
  
  // Find all condition nodes
  const conditionNodes = Object.values(graphStore.nodes).filter(node => node.type === 'condition');
  
  console.log(`📊 Found ${conditionNodes.length} condition nodes`);
  
  conditionNodes.forEach(conditionNode => {
    console.log(`\n📊 Condition Node: ${conditionNode.id}`);
    
    if (conditionNode.branches) {
      ['yes', 'no'].forEach(branchType => {
        const branch = conditionNode.branches![branchType as 'yes' | 'no'] || [];
        console.log(`  ${branchType} branch (${branch.length} nodes):`, branch);
        
        // Analyze each node in the branch
        branch.forEach(nodeId => {
          const node = graphStore.nodes[nodeId];
          if (node) {
            console.log(`    - ${nodeId}: ${node.type} (${node.data.label || 'no label'})`);
          } else {
            console.log(`    - ${nodeId}: NODE NOT FOUND`);
          }
        });
        
        // Count placeholders
        const placeholders = branch.filter(nodeId => {
          const node = graphStore.nodes[nodeId];
          return node && node.type === 'placeholder';
        });
        
        if (placeholders.length > 1) {
          console.log(`    ⚠️  DUPLICATE PLACEHOLDERS: ${placeholders.length} found`);
        } else if (placeholders.length === 1) {
          console.log(`    ✅ Single placeholder: ${placeholders[0]}`);
        } else {
          console.log(`    ❌ No placeholders found`);
        }
        
        // Count functional nodes
        const functionalNodes = branch.filter(nodeId => {
          const node = graphStore.nodes[nodeId];
          return node && (node.type === 'action' || node.type === 'condition');
        });
        
        console.log(`    📊 Functional nodes: ${functionalNodes.length}`);
      });
    }
  });
  
  // Find all placeholder nodes
  const allPlaceholders = Object.values(graphStore.nodes).filter(node => node.type === 'placeholder');
  console.log(`\n📊 Total placeholders in graph: ${allPlaceholders.length}`);
  
  allPlaceholders.forEach(placeholder => {
    console.log(`  - ${placeholder.id}: branchType=${placeholder.data.branchType}, conditionNodeId=${placeholder.data.conditionNodeId}`);
  });
  
  return {
    conditionNodes: conditionNodes.length,
    totalPlaceholders: allPlaceholders.length,
    branches: conditionNodes.map(node => ({
      conditionId: node.id,
      yesBranch: node.branches?.yes || [],
      noBranch: node.branches?.no || []
    }))
  };
};

export const cleanupCurrentPlaceholders = () => {
  console.log('🧹 Cleaning up duplicate placeholders...');
  
  const graphStore = useGraphStore.getState();
  
  // Run the cleanup function
  graphStore.cleanupDuplicatePlaceholders();
  
  console.log('✅ Cleanup completed');
  
  // Show results
  return debugPlaceholders();
};

export const fixCurrentWorkflow = () => {
  console.log('🔧 Fixing current workflow placeholders...');
  
  const graphStore = useGraphStore.getState();
  
  // First clean up duplicates
  graphStore.cleanupDuplicatePlaceholders();
  
  // Then ensure all branches have placeholders
  graphStore.ensureConditionalPlaceholders();
  
  console.log('✅ Workflow fixed');
  
  // Show results
  return debugPlaceholders();
};

// Export for browser console
if (typeof window !== 'undefined') {
  (window as any).debugPlaceholders = {
    debug: debugPlaceholders,
    cleanup: cleanupCurrentPlaceholders,
    fix: fixCurrentWorkflow,

    // Quick fix for current issue
    quickFix: () => {
      console.log('🚀 Quick fix for placeholder issues...');
      const result = fixCurrentWorkflow();

      if (result.totalPlaceholders > result.conditionNodes * 2) {
        console.log('⚠️  Still have extra placeholders, running additional cleanup...');
        cleanupCurrentPlaceholders();
      }

      return debugPlaceholders();
    },

    // Test copy/paste functionality
    testCopyPaste: () => {
      console.log('🧪 Testing copy/paste functionality...');
      const graphStore = useGraphStore.getState();

      // Find first action node
      const actionNodes = Object.values(graphStore.nodes).filter(node => node.type === 'action');
      if (actionNodes.length === 0) {
        console.log('❌ No action nodes found to test copy');
        return;
      }

      const testNode = actionNodes[0];
      console.log('📋 Testing copy of action node:', testNode.id);

      // Copy the node
      graphStore.copyNode(testNode.id);

      // Check clipboard
      const hasData = graphStore.hasClipboardData();
      console.log('📋 Clipboard has data:', hasData);
      console.log('📋 Clipboard type:', graphStore.clipboard.type);

      return {
        testNodeId: testNode.id,
        clipboardHasData: hasData,
        clipboardType: graphStore.clipboard.type
      };
    },

    // Test flow copy
    testFlowCopy: () => {
      console.log('🧪 Testing flow copy functionality...');
      const graphStore = useGraphStore.getState();

      // Find first action node
      const actionNodes = Object.values(graphStore.nodes).filter(node => node.type === 'action');
      if (actionNodes.length === 0) {
        console.log('❌ No action nodes found to test flow copy');
        return;
      }

      const testNode = actionNodes[0];
      console.log('📋 Testing flow copy starting from:', testNode.id);

      // Copy the flow
      graphStore.copyFlow(testNode.id);

      // Check clipboard
      const hasData = graphStore.hasClipboardData();
      console.log('📋 Clipboard has data:', hasData);
      console.log('📋 Clipboard type:', graphStore.clipboard.type);
      console.log('📋 Flow nodes count:', Array.isArray(graphStore.clipboard.data) ? graphStore.clipboard.data.length : 0);

      return {
        testNodeId: testNode.id,
        clipboardHasData: hasData,
        clipboardType: graphStore.clipboard.type,
        flowNodesCount: Array.isArray(graphStore.clipboard.data) ? graphStore.clipboard.data.length : 0
      };
    },

    // Test duplicate in place
    testDuplicate: () => {
      console.log('🧪 Testing duplicate in place functionality...');
      const graphStore = useGraphStore.getState();

      // Find first action node
      const actionNodes = Object.values(graphStore.nodes).filter(node => node.type === 'action');
      if (actionNodes.length === 0) {
        console.log('❌ No action nodes found to test duplicate');
        return;
      }

      const testNode = actionNodes[0];
      console.log('🔄 Testing duplicate of action node:', testNode.id);
      console.log('🔍 Original node before duplicate:', {
        id: testNode.id,
        parent: testNode.parent,
        children: testNode.children,
        type: testNode.type
      });

      // Duplicate the node
      const duplicateId = graphStore.duplicateNodeInPlace(testNode.id);

      // Check the result
      const updatedNodes = graphStore.nodes;
      const originalAfter = updatedNodes[testNode.id];
      const duplicateAfter = updatedNodes[duplicateId!];

      console.log('✅ Duplicate created:', duplicateId);
      console.log('🔍 Original node after duplicate:', {
        id: originalAfter?.id,
        parent: originalAfter?.parent,
        children: originalAfter?.children,
        type: originalAfter?.type
      });
      console.log('🔍 Duplicate node:', {
        id: duplicateAfter?.id,
        parent: duplicateAfter?.parent,
        children: duplicateAfter?.children,
        type: duplicateAfter?.type
      });

      return {
        originalNodeId: testNode.id,
        duplicateNodeId: duplicateId,
        success: !!duplicateId,
        originalChildren: originalAfter?.children,
        duplicateChildren: duplicateAfter?.children
      };
    },



    // Analyze current workflow structure
    analyzeWorkflow: () => {
      console.log('🔍 === WORKFLOW ANALYSIS ===');
      const graphStore = useGraphStore.getState();
      const nodes = graphStore.nodes;

      // Find all nodes by type
      const nodesByType = {
        trigger: Object.values(nodes).filter(n => n.type === 'trigger'),
        action: Object.values(nodes).filter(n => n.type === 'action'),
        condition: Object.values(nodes).filter(n => n.type === 'condition'),
        endNode: Object.values(nodes).filter(n => n.type === 'endNode'),
        ghost: Object.values(nodes).filter(n => n.type === 'ghost'),
        placeholder: Object.values(nodes).filter(n => n.type === 'placeholder')
      };

      console.log('📊 Node counts:', {
        trigger: nodesByType.trigger.length,
        action: nodesByType.action.length,
        condition: nodesByType.condition.length,
        endNode: nodesByType.endNode.length,
        ghost: nodesByType.ghost.length,
        placeholder: nodesByType.placeholder.length
      });

      // Trace the main flow
      console.log('\n🔗 Main Flow Trace:');
      const triggerNode = nodesByType.trigger[0];
      if (triggerNode) {
        let currentNode = triggerNode;
        let depth = 0;
        const visited = new Set();

        while (currentNode && depth < 10 && !visited.has(currentNode.id)) {
          visited.add(currentNode.id);
          const indent = '  '.repeat(depth);
          console.log(`${indent}${depth}: ${currentNode.type} (${currentNode.id})`);
          console.log(`${indent}   parent: ${currentNode.parent || 'none'}`);
          console.log(`${indent}   children: ${currentNode.children?.join(', ') || 'none'}`);

          // Move to first child
          if (currentNode.children && currentNode.children.length > 0) {
            const nextNodeId = currentNode.children[0];
            currentNode = nodes[nextNodeId];
            depth++;
          } else {
            break;
          }
        }
      }

      return {
        nodesByType,
        totalNodes: Object.keys(nodes).length,
        hasValidFlow: !!triggerNode?.children?.length
      };
    }
  };
}
