import { useState, useCallback } from 'react';
import { NodeExecutionResult } from './useWebSocket';

interface ExecutionResultsState {
  [nodeId: string]: NodeExecutionResult;
}

/**
 * Hook to manage node execution results during workflow testing
 */
export const useNodeExecutionResults = () => {
  const [executionResults, setExecutionResults] = useState<ExecutionResultsState>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentExecutionId, setCurrentExecutionId] = useState<string | null>(null);

  /**
   * Update execution result for a specific node
   */
  const updateNodeResult = useCallback((result: NodeExecutionResult) => {
    setExecutionResults(prev => ({
      ...prev,
      [result.nodeId]: result
    }));
  }, []);

  /**
   * Get execution result for a specific node
   */
  const getNodeResult = useCallback((nodeId: string): NodeExecutionResult | null => {
    return executionResults[nodeId] || null;
  }, [executionResults]);

  /**
   * Clear all execution results
   */
  const clearResults = useCallback(() => {
    setExecutionResults({});
    setIsExecuting(false);
    setCurrentExecutionId(null);
  }, []);

  /**
   * Start execution tracking
   */
  const startExecution = useCallback((executionId: string) => {
    setIsExecuting(true);
    setCurrentExecutionId(executionId);
    setExecutionResults({});
  }, []);

  /**
   * Stop execution tracking
   */
  const stopExecution = useCallback(() => {
    setIsExecuting(false);
    setCurrentExecutionId(null);
  }, []);

  /**
   * Get execution status for a node
   */
  const getNodeStatus = useCallback((nodeId: string): 'idle' | 'running' | 'completed' | 'error' => {
    const result = executionResults[nodeId];
    if (!result) {
      return isExecuting ? 'idle' : 'idle';
    }
    return result.status;
  }, [executionResults, isExecuting]);

  /**
   * Check if any node is currently executing
   */
  const hasRunningNodes = useCallback((): boolean => {
    return Object.values(executionResults).some(result => result.status === 'running');
  }, [executionResults]);

  /**
   * Get summary of execution results
   */
  const getExecutionSummary = useCallback(() => {
    const results = Object.values(executionResults);
    return {
      total: results.length,
      completed: results.filter(r => r.status === 'completed').length,
      errors: results.filter(r => r.status === 'error').length,
      running: results.filter(r => r.status === 'running').length
    };
  }, [executionResults]);

  return {
    executionResults,
    isExecuting,
    currentExecutionId,
    updateNodeResult,
    getNodeResult,
    getNodeStatus,
    clearResults,
    startExecution,
    stopExecution,
    hasRunningNodes,
    getExecutionSummary
  };
};
