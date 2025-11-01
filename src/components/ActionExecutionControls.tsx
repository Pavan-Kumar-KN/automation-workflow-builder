import React from 'react';
import { CheckCircle, Loader2, SkipForward, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useExecutionContext } from '@/contexts/ExecutionContext';
import { toast } from 'sonner';

interface ActionExecutionControlsProps {
  nodeId: string;
  className?: string;
}

export const ActionExecutionControls: React.FC<ActionExecutionControlsProps> = ({
  nodeId,
  className = ''
}) => {
  const { getNodeStatus, getNodeResult } = useExecutionContext();

  const status = getNodeStatus(nodeId);
  const result = getNodeResult(nodeId);

  // Don't show anything if the node is idle
  if (status === 'idle') {
    return null;
  }

  const handleSkip = () => {
    // Simulate skipping the current action
    console.log('Skipping node:', nodeId);
    toast.info(`Skipped action: ${nodeId}`);

    // You can add actual skip logic here, such as:
    // - Mark the node as completed with a "skipped" status
    // - Move to the next action in the workflow
    // - Update the execution context
  };

  const getControlContent = () => {
    switch (status) {
      case 'running':
        return (
          <div className={`flex items-center gap-1 ${className}`}>
            {/* Loading Spinner */}
            <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
              <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
            </div>

            {/* Skip Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSkip}
              className="h-6 px-2 text-xs bg-white border-gray-300 hover:bg-gray-50"
            >
              <SkipForward className="w-2 h-2 mr-1" />
              Skip
            </Button>
          </div>
        );
      
      case 'completed':
        return (
          <div
            className={`flex items-center justify-center w-6 h-6 bg-green-100 rounded-full cursor-pointer ${className}`}
            title="Action completed"
          >
            <CheckCircle className="w-3 h-3 text-green-600" />
          </div>
        );
      
      case 'error':
        return (
          <div
            className={`flex items-center justify-center w-6 h-6 bg-red-100 rounded-full cursor-pointer ${className}`}
            title={result?.error || 'Action failed'}
          >
            <XCircle className="w-3 h-3 text-red-600" />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="absolute right-2 top-2 z-20">
      {getControlContent()}
    </div>
  );
};
