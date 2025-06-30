import { useEffect, useCallback } from 'react';
import { useWorkflowStore } from './useWorkflowState';
import { WorkflowConverter, BackendWorkflowJSON } from '@/utils/workflowConverter';

/**
 * Hook for real-time workflow JSON generation
 *
 * This hook automatically generates backend JSON whenever nodes or edges change.
 * Perfect for real-time updates and debugging.
 */
export const useWorkflowJSON = () => {
  const { nodes, edges, workflowName } = useWorkflowStore();

  /**
   * Generate backend JSON
   */
  const generateJSON = useCallback((): BackendWorkflowJSON => {
    return WorkflowConverter.convertToBackendJSON(
      nodes,
      edges,
      workflowName,
      54 // Default user ID
    );
  }, [nodes, edges, workflowName]);

  /**
   * Get current JSON (for immediate use)
   */
  const getCurrentJSON = useCallback(() => {
    return generateJSON();
  }, [generateJSON]);

  /**
   * Save JSON to file (for debugging)
   */
  const saveJSON = useCallback(() => {
    const json = generateJSON();
    const blob = new Blob([JSON.stringify(json, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName.replace(/\s+/g, '_')}_workflow.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [generateJSON, workflowName]);

  /**
   * Submit to backend API
   */
  const submitToBackend = useCallback(async () => {
    const json = generateJSON();

    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(json)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Workflow submitted successfully:', result);
      return result;

    } catch (error) {
      console.error('❌ Failed to submit workflow:', error);
      throw error;
    }
  }, [generateJSON]);

  /**
   * Debug current workflow
   */
  const debugWorkflow = useCallback(() => {
    WorkflowConverter.debugConversion(nodes, edges);
  }, [nodes, edges]);

  /**
   * Auto-generate JSON on changes (for debugging)
   */
  useEffect(() => {
    if (nodes.length > 0) {
      const json = generateJSON();
      console.log('🔄 Workflow JSON Updated:', json);
    }
  }, [nodes, edges, generateJSON]);

  return {
    // JSON Generation
    generateJSON,
    getCurrentJSON,

    // File Operations
    saveJSON,

    // API Operations
    submitToBackend,

    // Debug
    debugWorkflow
  };
};
