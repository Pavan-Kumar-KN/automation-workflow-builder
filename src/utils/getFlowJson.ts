import { Node, Edge } from '@xyflow/react';
import { BackendWorkflowJSON, BackendJSONConstructor } from './jsonConstructors';

/**
 * Utility functions for converting workflow data to JSON formats
 */

/**
 * Get workflow data in backend JSON format for testing
 * Uses the existing BackendJSONConstructor to ensure consistency
 */
export const getFlowJson = (
  nodes: Node[], 
  edges: Edge[], 
  workflowName: string = 'Test Workflow',
  userId: number = 54
): BackendWorkflowJSON => {
  
  console.log('🔄 Converting workflow to backend JSON:', {
    nodes: nodes.length,
    edges: edges.length,
    workflowName
  });

  // Use the existing BackendJSONConstructor for consistency
  const backendJson = BackendJSONConstructor.construct(
    nodes,
    edges,
    workflowName,
    userId
  );

  console.log('✅ Backend JSON generated:', {
    triggers: backendJson.triggers?.length || 0,
    actions: backendJson.actions?.length || 0,
    layoutNodes: backendJson.layout?.node?.length || 0,
    layoutEdges: backendJson.layout?.edges?.length || 0
  });

  return backendJson;
};

/**
 * Validate workflow before testing
 */
export const validateWorkflowForTesting = (workflow: BackendWorkflowJSON): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if workflow has a name
  if (!workflow.name || workflow.name.trim() === '') {
    warnings.push('Workflow has no name');
  }

  // Check if workflow has triggers
  if (!workflow.triggers || workflow.triggers.length === 0) {
    errors.push('Workflow must have at least one trigger');
  }

  // Check if workflow has actions
  if (!workflow.actions || workflow.actions.length === 0) {
    warnings.push('Workflow has no actions - only triggers will be executed');
  }

  // Check for orphaned nodes (nodes without connections)
  if (workflow.layout) {
    const nodeIds = new Set(workflow.layout.node.map(n => n.id));
    const connectedNodes = new Set();
    
    workflow.layout.edges.forEach(edge => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });

    const orphanedNodes = Array.from(nodeIds).filter(id => !connectedNodes.has(id));
    if (orphanedNodes.length > 0) {
      warnings.push(`Found ${orphanedNodes.length} disconnected nodes: ${orphanedNodes.join(', ')}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Get workflow summary for display
 */
export const getWorkflowSummary = (workflow: BackendWorkflowJSON): {
  name: string;
  triggerCount: number;
  actionCount: number;
  totalNodes: number;
  hasLayout: boolean;
} => {
  return {
    name: workflow.name || 'Unnamed Workflow',
    triggerCount: workflow.triggers?.length || 0,
    actionCount: workflow.actions?.length || 0,
    totalNodes: (workflow.triggers?.length || 0) + (workflow.actions?.length || 0),
    hasLayout: !!(workflow.layout && workflow.layout.node.length > 0)
  };
};

/**
 * Create a minimal test workflow for demonstration
 */
export const createTestWorkflow = (): BackendWorkflowJSON => {
  return {
    name: 'Sample Test Workflow',
    user_id: 'test-user',
    triggers: [
      {
        type: 'manual',
        config: {
          child: 'action-1',
          options: {
            key: 'manual-trigger',
            label: 'Manual Trigger'
          },
          last_executed: null,
          evaluationResult: null
        }
      }
    ],
    actions: [
      {
        id: 'action-1',
        type: 'log',
        config: {
          options: {
            key: 'log-action',
            message: 'Hello from test workflow!'
          },
          last_executed: null,
          evaluationResult: null
        }
      }
    ],
    layout: {
      node: [
        {
          id: 'trigger',
          type: 'trigger',
          position: { x: 100, y: 100 },
          data: { label: 'Manual Trigger' }
        },
        {
          id: 'action-1',
          type: 'action',
          position: { x: 100, y: 200 },
          data: { label: 'Log Action' }
        }
      ],
      edges: [
        {
          id: 'trigger-to-action-1',
          source: 'trigger',
          target: 'action-1'
        }
      ]
    }
  };
};
