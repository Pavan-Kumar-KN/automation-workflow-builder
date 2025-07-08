
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useWorkflowStore } from './useWorkflowState';

export const useWorkflowActions = () => {
  const {
    workflowName,
    nodes,
    edges,
    isActive,
  } = useWorkflowStore();
  const executeWorkflow = useCallback(() => {
    if (nodes.length === 0) {
      toast.error('Add nodes to your workflow first!');
      return;
    }

    toast.success('Workflow execution started!');
    console.log('Executing workflow with nodes:', nodes);
    console.log('Workflow edges:', edges);
    
    setTimeout(() => {
      toast.success('Workflow completed successfully! ✨');
    }, 2000);
  }, [nodes, edges]);

  const saveWorkflow = useCallback(() => {
    const workflowData = {
      name: workflowName,
      nodes,
      edges,
      isActive,
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem('workflow', JSON.stringify(workflowData));
    toast.success('Workflow saved successfully!');
  }, [workflowName, nodes, edges, isActive]);

  return {
    executeWorkflow,
    saveWorkflow,
  };
};
