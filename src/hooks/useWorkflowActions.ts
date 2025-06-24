
import { useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';
import { LayoutMode } from '@/components/LayoutModeSelector';

interface UseWorkflowActionsProps {
  nodes: Node[];
  edges: Edge[];
  workflowName: string;
  isActive: boolean;
  layoutMode: LayoutMode;
}

export const useWorkflowActions = ({
  nodes,
  edges,
  workflowName,
  isActive,
  layoutMode,
}: UseWorkflowActionsProps) => {
  const executeWorkflow = useCallback(() => {
    if (nodes.length === 0) {
      toast.error('Add nodes to your workflow first!');
      return;
    }

    toast.success('Workflow execution started!');
    console.log('Executing workflow with nodes:', nodes);
    console.log('Workflow edges:', edges);
    
    // Simulate workflow execution
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
      layoutMode,
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem('workflow', JSON.stringify(workflowData));
    toast.success('Workflow saved successfully!');
  }, [workflowName, nodes, edges, isActive, layoutMode]);

  return {
    executeWorkflow,
    saveWorkflow,
  };
};
