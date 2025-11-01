import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Square, Loader2, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useWebSocket, NodeExecutionResult } from '@/hooks/useWebSocket';
import { BackendWorkflowJSON } from '@/utils/jsonConstructors';
import { mockWebSocketServer } from '@/utils/mockWebSocketServer';
import { useExecutionContext } from '@/contexts/ExecutionContext';
import { useWorkflowStore } from '@/hooks/useWorkflowState';
import { useGraphStore } from '@/store/useGraphStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TestFlowButtonProps {
  workflow: BackendWorkflowJSON;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export const TestFlowButton: React.FC<TestFlowButtonProps> = ({
  workflow,
  disabled = false,
  className = '',
  variant = 'default',
  size = 'default'
}) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [unconfiguredNodes, setUnconfiguredNodes] = useState<string[]>([]);

  // Use execution context for managing node results
  const {
    updateNodeResult,
    clearResults,
    startExecution,
    stopExecution,
    getExecutionSummary
  } = useExecutionContext();

  // Get original nodes for validation from graph store (source of truth)
  const graphNodes = useGraphStore((state) => state.nodes);

  // Convert graph nodes to array for simulation (these have the correct IDs)
  const graphNodeArray = Object.values(graphNodes);

  // Initialize mock server on component mount - COMMENTED OUT TO PREVENT LOOPS
  // React.useEffect(() => {
  //   mockWebSocketServer.start();
  //   return () => {
  //     mockWebSocketServer.stop();
  //   };
  // }, []);

  const handleNodeResult = useCallback((result: NodeExecutionResult) => {
    console.log('📊 Node execution result:', result);

    // Update execution context
    updateNodeResult(result);

    // Removed individual node toasts to reduce noise
  }, [updateNodeResult]);

  // Validate workflow configuration
  const validateWorkflowConfiguration = useCallback((): { isValid: boolean; unconfiguredNodes: string[] } => {
    const unconfigured: string[] = [];

    // Convert graph nodes object to array
    const nodeArray = Object.values(graphNodes);

    // Check graph nodes for configuration status
    nodeArray.forEach(node => {
      // Skip endNode, End nodes, and nodes that are already configured
      const isEndNode = node.type === 'endNode' ||
                       node.data?.label === 'End' ||
                       node.id.includes('end');

      if (!isEndNode && !node.data?.isConfigured) {
        unconfigured.push(node.data?.label || node.id);
      }
    });

    return {
      isValid: unconfigured.length === 0,
      unconfiguredNodes: unconfigured
    };
  }, [graphNodes]);

  // Simulate workflow execution without WebSocket
  const simulateWorkflowExecution = useCallback(async (workflow: BackendWorkflowJSON, executionId: string) => {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      console.log('🎯 Starting simulation with graphNodeArray:', graphNodeArray);

      // Use actual graph nodes for correct nodeIds
      const triggerNodes = graphNodeArray.filter(node => node.type === 'trigger');
      const actionNodes = graphNodeArray.filter(node =>
        node.type === 'action' && node.type !== 'endNode'
      );

      console.log('🎯 Found graph nodes:', { triggerNodes, actionNodes });

      // Simulate trigger execution using actual graph node IDs
      for (const triggerNode of triggerNodes) {
        console.log('🎯 Executing trigger with Graph ID:', triggerNode.id);

        // Start running status
        handleNodeResult({
          nodeId: triggerNode.id,
          status: 'running' as const,
          timestamp: new Date().toISOString()
        });

        await delay(1000); // Longer delay to see the loading

        // Complete execution
        handleNodeResult({
          nodeId: triggerNode.id,
          status: 'completed' as const,
          result: {
            message: `Trigger executed successfully`,
            data: { triggered: true, timestamp: new Date().toISOString() }
          },
          timestamp: new Date().toISOString()
        });
      }

      // Simulate action execution using actual graph node IDs
      for (const actionNode of actionNodes) {
        console.log('🎯 Executing action with Graph ID:', actionNode.id);

        // Start running status
        handleNodeResult({
          nodeId: actionNode.id,
          status: 'running' as const,
          timestamp: new Date().toISOString()
        });

        await delay(1500); // Longer delay to see the loading

        const isSuccess = Math.random() > 0.1; // 90% success rate

        // Complete execution
        handleNodeResult({
          nodeId: actionNode.id,
          status: (isSuccess ? 'completed' : 'error') as const,
          result: isSuccess ? {
            message: `Action executed successfully`,
            data: { processed: true, timestamp: new Date().toISOString() }
          } : undefined,
          error: isSuccess ? undefined : `Simulated error in action`,
          timestamp: new Date().toISOString()
        });
      }

      // Complete execution
      await delay(300);
      setIsExecuting(false);
      setExecutionId(null);
      stopExecution();
      toast.success('✅ Workflow test completed');

    } catch (error) {
      console.error('❌ Error in workflow simulation:', error);
      setIsExecuting(false);
      setExecutionId(null);
      stopExecution();
      toast.error('❌ Workflow execution failed');
    }
  }, [handleNodeResult, stopExecution, graphNodeArray]);

  // handleMessage function removed - using direct simulation instead

  // TEMPORARILY DISABLED WebSocket to prevent connection loops
  // const { isConnected, isConnecting, sendMessage } = useWebSocket({
  //   url: 'ws://localhost:8080/ws',
  //   onMessage: handleMessage,
  //   onNodeResult: handleNodeResult,
  //   onConnect: () => {
  //     console.log('🔌 Connected to workflow engine');
  //   },
  //   onDisconnect: () => {
  //     console.log('🔌 Disconnected from workflow engine');
  //     setIsExecuting(false);
  //     setExecutionId(null);
  //   }
  // });

  // Mock connection status for now
  const isConnected = true;
  const isConnecting = false;
  const sendMessage = (message: any) => {
    console.log('📤 Mock message sent:', message);
    return true;
  };

  const handleTestFlow = useCallback(async () => {
    if (!workflow) {
      toast.error('No workflow to test');
      return;
    }

    if (isExecuting) {
      // Stop execution
      setIsExecuting(false);
      setExecutionId(null);
      stopExecution();
      clearResults();
      toast.info('Workflow execution stopped');
      return;
    }

    // Validate workflow has nodes
    const totalNodes = (workflow.triggers?.length || 0) + (workflow.actions?.length || 0);
    if (totalNodes === 0) {
      toast.error('Add nodes to your workflow before testing');
      return;
    }

    // Validate workflow configuration
    const validation = validateWorkflowConfiguration();
    if (!validation.isValid) {
      setUnconfiguredNodes(validation.unconfiguredNodes);
      setShowValidationModal(true);
      return;
    }

    try {
      setIsExecuting(true);
      clearResults();

      const newExecutionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setExecutionId(newExecutionId);
      startExecution(newExecutionId);

      console.log('🧪 Starting workflow test:', {
        name: workflow.name,
        executionId: newExecutionId,
        triggers: workflow.triggers?.length || 0,
        actions: workflow.actions?.length || 0
      });

      // Simulate workflow execution without WebSocket
      await simulateWorkflowExecution(workflow, newExecutionId);

    } catch (error) {
      console.error('❌ Error testing workflow:', error);
      setIsExecuting(false);
      setExecutionId(null);
      toast.error('Failed to start workflow test');
    }
  }, [workflow, isExecuting, validateWorkflowConfiguration, simulateWorkflowExecution, stopExecution, clearResults, startExecution]);

  const getButtonText = () => {
    if (isExecuting) {
      return 'Stop Test';
    }
    return 'Test Flow';
  };

  const getButtonIcon = () => {
    if (isExecuting) {
      return <Square className="w-4 h-4" />;
    }
    if (isConnecting) {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }
    return <Play className="w-4 h-4" />;
  };

  const getConnectionIcon = () => {
    if (isConnected) {
      return <Wifi className="w-3 h-3 text-green-500" />;
    }
    return <WifiOff className="w-3 h-3 text-red-500" />;
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Connection Status Indicator */}
        <div className="flex items-center gap-1" title={isConnected ? 'Connected' : 'Disconnected'}>
          {getConnectionIcon()}
        </div>

        {/* Test Flow Button */}
        <Button
          onClick={handleTestFlow}
          disabled={disabled || isConnecting}
          variant={isExecuting ? 'destructive' : variant}
          size={size}
          className={`flex items-center gap-2 ${className}`}
        >
          {getButtonIcon()}
          {getButtonText()}
        </Button>

        {/* Execution Status */}
        {isExecuting && executionId && (
          <div className="text-xs text-gray-500">
            Running: {executionId.split('_')[1]}
          </div>
        )}
      </div>

      {/* Validation Modal */}
      <Dialog open={showValidationModal} onOpenChange={setShowValidationModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Configuration Required
            </DialogTitle>
            <DialogDescription>
              Please configure all nodes before testing your workflow.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              The following nodes need to be configured:
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <ul className="space-y-1">
                {unconfiguredNodes.map((nodeName, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-amber-800">
                    <AlertTriangle className="w-3 h-3" />
                    {nodeName}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-gray-500">
              Click on each node to configure its settings, then try testing again.
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => setShowValidationModal(false)}
              variant="outline"
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
