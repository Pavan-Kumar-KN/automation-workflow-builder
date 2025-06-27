import { useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { useWorkflowStore } from '@/hooks/useWorkflowState';
import {
  FrontendJSONConstructor,
  BackendJSONConstructor,
  FrontendWorkflowJSON,
  BackendWorkflowJSON
} from '@/utils/jsonConstructors';
import { toast } from 'sonner';

export const useWorkflowJSON = () => {
  const {
    nodes,
    edges,
    workflowName,
    layoutMode,
    isActive
  } = useWorkflowStore();

  /**
   * Generate Frontend JSON (for workflow builder state)
   */
  const generateFrontendJSON = useCallback((viewport = { x: 0, y: 0, zoom: 1 }): FrontendWorkflowJSON => {
    const frontendJSON = FrontendJSONConstructor.construct(
      nodes,
      edges,
      workflowName,
      viewport,
      { layoutMode, isActive }
    );

    console.log('📋 Frontend JSON Generated:', frontendJSON);
    return frontendJSON;
  }, [nodes, edges, workflowName, layoutMode, isActive]);

  /**
   * Generate Backend JSON (for API submission)
   */
  const generateBackendJSON = useCallback((userId: number = 54): BackendWorkflowJSON => {
    const backendJSON = BackendJSONConstructor.construct(
      nodes,
      edges,
      workflowName,
      userId
    );

    console.log('🚀 Backend JSON Generated:', backendJSON);
    return backendJSON;
  }, [nodes, edges, workflowName]);

  /**
   * Save Frontend JSON to file/localStorage
   */
  const saveFrontendJSON = useCallback((viewport = { x: 0, y: 0, zoom: 1 }) => {
    try {
      const json = generateFrontendJSON(viewport);
      FrontendJSONConstructor.save(json);
      toast.success('Frontend JSON saved successfully!');
      return json;
    } catch (error) {
      console.error('❌ Failed to save Frontend JSON:', error);
      toast.error('Failed to save Frontend JSON');
      return null;
    }
  }, [generateFrontendJSON]);

  /**
   * Save Backend JSON to file
   */
  const saveBackendJSON = useCallback((userId?: number) => {
    try {
      const json = generateBackendJSON(userId);
      BackendJSONConstructor.save(json);
      toast.success('Backend JSON saved successfully!');
      return json;
    } catch (error) {
      console.error('❌ Failed to save Backend JSON:', error);
      toast.error('Failed to save Backend JSON');
      return null;
    }
  }, [generateBackendJSON]);

  /**
   * Send Backend JSON to API
   */
  const submitToBackend = useCallback(async (userId?: number) => {
    try {
      const json = generateBackendJSON(userId);
      
      console.log('🚀 Submitting to Backend API...', json);
      
      // Replace with your actual API endpoint
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(json)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Backend API Response:', result);
      toast.success('Workflow submitted to backend successfully!');
      
      return result;
    } catch (error) {
      console.error('❌ Backend submission failed:', error);
      toast.error('Failed to submit workflow to backend');
      throw error;
    }
  }, [generateBackendJSON]);

  /**
   * Get workflow statistics
   */
  const getWorkflowStats = useCallback(() => {
    const triggerCount = nodes.filter(node => 
      node.type === 'trigger' || node.type.includes('trigger')
    ).length;
    
    const actionCount = nodes.filter(node => 
      node.type === 'action' || node.type.includes('action')
    ).length;
    
    const conditionCount = nodes.filter(node => 
      node.type === 'condition' || node.type.includes('condition')
    ).length;

    return {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      triggers: triggerCount,
      actions: actionCount,
      conditions: conditionCount,
      isValid: triggerCount > 0 && actionCount > 0,
      hasConnections: edges.length > 0
    };
  }, [nodes, edges]);

  /**
   * Validate workflow before submission
   */
  const validateWorkflow = useCallback(() => {
    const stats = getWorkflowStats();
    const errors: string[] = [];

    if (stats.triggers === 0) {
      errors.push('Workflow must have at least one trigger');
    }

    if (stats.actions === 0) {
      errors.push('Workflow must have at least one action');
    }

    if (stats.hasConnections === false && stats.totalNodes > 1) {
      errors.push('Nodes must be connected with edges');
    }

    // Check for orphaned nodes
    const connectedNodeIds = new Set([
      ...edges.map(e => e.source),
      ...edges.map(e => e.target)
    ]);

    const orphanedNodes = nodes.filter(node => 
      !connectedNodeIds.has(node.id) && nodes.length > 1
    );

    if (orphanedNodes.length > 0) {
      errors.push(`${orphanedNodes.length} nodes are not connected`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      stats
    };
  }, [nodes, edges, getWorkflowStats]);

  /**
   * Debug: Log both JSON formats
   */
  const debugJSON = useCallback((viewport = { x: 0, y: 0, zoom: 1 }) => {
    console.group('🔍 Workflow JSON Debug');

    const frontendJSON = generateFrontendJSON(viewport);
    const backendJSON = generateBackendJSON();
    const validation = validateWorkflow();

    console.log('📋 Frontend JSON:', frontendJSON);
    console.log('🚀 Backend JSON:', backendJSON);
    console.log('✅ Validation:', validation);

    console.groupEnd();

    return { frontendJSON, backendJSON, validation };
  }, [generateFrontendJSON, generateBackendJSON, validateWorkflow]);

  return {
    // JSON Generation
    generateFrontendJSON,
    generateBackendJSON,
    
    // File Operations
    saveFrontendJSON,
    saveBackendJSON,
    
    // API Operations
    submitToBackend,
    
    // Validation & Stats
    validateWorkflow,
    getWorkflowStats,
    
    // Debug
    debugJSON
  };
};
