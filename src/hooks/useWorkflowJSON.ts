import { useEffect, useCallback } from 'react';
import { useWorkflowStore } from './useWorkflowState';
import { BackendJSONConstructor, BackendWorkflowJSON } from '@/utils/jsonConstructors';

/**
 * Hook for real-time workflow JSON generation
 *
 * This hook automatically generates backend JSON whenever nodes or edges change.
 * Perfect for real-time updates and debugging.
 */
export const useWorkflowJSON = () => {
  const { nodes, edges, workflowName } = useWorkflowStore();

  /**
   * Generate backend JSON (matching learn.json format)
   */
  const generateJSON = useCallback((): BackendWorkflowJSON => {
    return BackendJSONConstructor.construct(
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
      // console.log('✅ Workflow submitted successfully:', result);
      return result;

    } catch (error) {
      console.error('❌ Failed to submit workflow:', error);
      throw error;
    }
  }, [generateJSON]);

  /**
   * Submit configuration update to backend (after node config submission)
   */
  const submitConfigToBackend = useCallback(async (nodeId: string, automationId: string): Promise<any> => {
    try {
      const json = generateJSON();

      // console.log('🔧 === CONFIG SUBMISSION TO BACKEND ===', {
      //   nodeId,
      //   automationId,
      //   timestamp: new Date().toISOString(),
      //   json
      // });

      // Update specific automation with new configuration
      const response = await fetch(`/api/workflows/${automationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(json)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      // console.log('✅ Config update response:', result);

      return result;
    } catch (error) {
      console.log('❌ Failed to update config:', error);
      throw error;
    }
  }, [generateJSON]);

  /**
   * Debug current workflow
   */
  const debugWorkflow = useCallback(() => {
    const json = generateJSON();
    // console.log('Current JSON:', json);
  }, [generateJSON]);

  /**
   * Auto-generate JSON and send to backend on changes
   */
  useEffect(() => {
    if (nodes.length > 0) {
      const json = generateJSON();
      console.log('🔄 Workflow JSON Updated:', json);

      // Automatically send POST request to backend
      const sendToBackend = async () => {
        try {
          const response = await fetch('/api/workflows/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(json)
          });

          if (response.ok) {
            console.log('✅ JSON successfully sent to backend');
          } else {
            console.log('❌ Failed to send JSON to backend:', response.status);
          }
        } catch (error) {
          console.log('❌ Error sending JSON to backend:', error);
        }
      };

      // Send to backend with a small delay to avoid too many requests
      const timeoutId = setTimeout(sendToBackend, 500);
      return () => clearTimeout(timeoutId);
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
    submitConfigToBackend,

    // Debug
    debugWorkflow
  };
};
