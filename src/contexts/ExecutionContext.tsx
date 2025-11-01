import React, { createContext, useContext, ReactNode } from 'react';
import { useNodeExecutionResults } from '@/hooks/useNodeExecutionResults';
import { NodeExecutionResult } from '@/hooks/useWebSocket';

interface ExecutionContextType {
  executionResults: { [nodeId: string]: NodeExecutionResult };
  isExecuting: boolean;
  currentExecutionId: string | null;
  updateNodeResult: (result: NodeExecutionResult) => void;
  getNodeResult: (nodeId: string) => NodeExecutionResult | null;
  getNodeStatus: (nodeId: string) => 'idle' | 'running' | 'completed' | 'error';
  clearResults: () => void;
  startExecution: (executionId: string) => void;
  stopExecution: () => void;
  hasRunningNodes: () => boolean;
  getExecutionSummary: () => {
    total: number;
    completed: number;
    errors: number;
    running: number;
  };
}

const ExecutionContext = createContext<ExecutionContextType | undefined>(undefined);

interface ExecutionProviderProps {
  children: ReactNode;
}

export const ExecutionProvider: React.FC<ExecutionProviderProps> = ({ children }) => {
  const executionHook = useNodeExecutionResults();

  return (
    <ExecutionContext.Provider value={executionHook}>
      {children}
    </ExecutionContext.Provider>
  );
};

export const useExecutionContext = (): ExecutionContextType => {
  const context = useContext(ExecutionContext);
  if (context === undefined) {
    throw new Error('useExecutionContext must be used within an ExecutionProvider');
  }
  return context;
};
