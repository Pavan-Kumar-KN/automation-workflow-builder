import React from 'react';
import { CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import { useExecutionContext } from '@/contexts/ExecutionContext';

interface NodeExecutionIndicatorProps {
  nodeId: string;
  className?: string;
}

export const NodeExecutionIndicator: React.FC<NodeExecutionIndicatorProps> = ({
  nodeId,
  className = ''
}) => {
  const { getNodeStatus, getNodeResult } = useExecutionContext();
  
  const status = getNodeStatus(nodeId);
  const result = getNodeResult(nodeId);

  if (status === 'idle') {
    return null;
  }

  const getIndicatorContent = () => {
    switch (status) {
      case 'running':
        return {
          icon: <Loader2 className="w-3 h-3 animate-spin" />,
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-600',
          borderColor: 'border-blue-200',
          label: 'Running...'
        };
      
      case 'completed':
        return {
          icon: <CheckCircle className="w-3 h-3" />,
          bgColor: 'bg-green-100',
          textColor: 'text-green-600',
          borderColor: 'border-green-200',
          label: 'Completed'
        };
      
      case 'error':
        return {
          icon: <XCircle className="w-3 h-3" />,
          bgColor: 'bg-red-100',
          textColor: 'text-red-600',
          borderColor: 'border-red-200',
          label: 'Error'
        };
      
      default:
        return {
          icon: <Clock className="w-3 h-3" />,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-600',
          borderColor: 'border-gray-200',
          label: 'Waiting'
        };
    }
  };

  const { icon, bgColor, textColor, borderColor, label } = getIndicatorContent();

  return (
    <div className={`absolute -top-2 -right-2 z-10 ${className}`}>
      <div 
        className={`
          flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium
          ${bgColor} ${textColor} ${borderColor}
        `}
        title={result?.error || label}
      >
        {icon}
        <span className="hidden sm:inline">{label}</span>
      </div>
      
      {/* Detailed result tooltip for completed/error states */}
      {(status === 'completed' || status === 'error') && result && (
        <div className="absolute top-full right-0 mt-1 w-48 p-2 bg-white border border-gray-200 rounded-lg shadow-lg text-xs z-20 opacity-0 hover:opacity-100 transition-opacity">
          <div className="font-medium mb-1">{status === 'completed' ? 'Success' : 'Error'}</div>
          {status === 'completed' && result.result && (
            <div className="text-gray-600">
              {typeof result.result === 'string' 
                ? result.result 
                : result.result.message || 'Execution completed'
              }
            </div>
          )}
          {status === 'error' && result.error && (
            <div className="text-red-600">{result.error}</div>
          )}
          <div className="text-gray-400 mt-1">
            {new Date(result.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
};
