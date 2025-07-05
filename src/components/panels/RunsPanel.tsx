import React from 'react';
import { X, Play, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RunsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WorkflowRun {
  id: string;
  status: 'running' | 'completed' | 'failed' | 'pending';
  startTime: string;
  endTime?: string;
  duration?: string;
  triggeredBy: string;
  logs: LogEntry[];
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  nodeId?: string;
  nodeName?: string;
}

// Mock data for demonstration
const mockRuns: WorkflowRun[] = [
  {
    id: 'run-001',
    status: 'completed',
    startTime: '2024-01-15 10:30:00',
    endTime: '2024-01-15 10:32:15',
    duration: '2m 15s',
    triggeredBy: 'Manual',
    logs: [
      { id: 'log-1', timestamp: '10:30:00', level: 'info', message: 'Workflow started', nodeId: 'trigger-1', nodeName: 'Form Submission' },
      { id: 'log-2', timestamp: '10:30:05', level: 'info', message: 'Processing form data', nodeId: 'action-1', nodeName: 'Send Email' },
      { id: 'log-3', timestamp: '10:32:15', level: 'success', message: 'Email sent successfully', nodeId: 'action-1', nodeName: 'Send Email' },
      { id: 'log-4', timestamp: '10:32:15', level: 'info', message: 'Workflow completed successfully' },
    ]
  },
  {
    id: 'run-002',
    status: 'failed',
    startTime: '2024-01-15 09:15:00',
    endTime: '2024-01-15 09:15:30',
    duration: '30s',
    triggeredBy: 'Schedule',
    logs: [
      { id: 'log-5', timestamp: '09:15:00', level: 'info', message: 'Workflow started', nodeId: 'trigger-1', nodeName: 'Schedule Trigger' },
      { id: 'log-6', timestamp: '09:15:15', level: 'warning', message: 'API rate limit approaching', nodeId: 'action-2', nodeName: 'API Call' },
      { id: 'log-7', timestamp: '09:15:30', level: 'error', message: 'API request failed: 429 Too Many Requests', nodeId: 'action-2', nodeName: 'API Call' },
      { id: 'log-8', timestamp: '09:15:30', level: 'error', message: 'Workflow failed' },
    ]
  },
  {
    id: 'run-003',
    status: 'running',
    startTime: '2024-01-15 11:45:00',
    triggeredBy: 'Webhook',
    logs: [
      { id: 'log-9', timestamp: '11:45:00', level: 'info', message: 'Workflow started', nodeId: 'trigger-1', nodeName: 'Webhook Trigger' },
      { id: 'log-10', timestamp: '11:45:05', level: 'info', message: 'Processing webhook payload', nodeId: 'action-1', nodeName: 'Data Transform' },
    ]
  }
];

const getStatusIcon = (status: WorkflowRun['status']) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'failed':
      return <XCircle className="w-4 h-4 text-red-600" />;
    case 'running':
      return <Play className="w-4 h-4 text-blue-600" />;
    case 'pending':
      return <Clock className="w-4 h-4 text-yellow-600" />;
    default:
      return <AlertCircle className="w-4 h-4 text-gray-600" />;
  }
};

const getStatusColor = (status: WorkflowRun['status']) => {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-50';
    case 'failed':
      return 'text-red-600 bg-red-50';
    case 'running':
      return 'text-blue-600 bg-blue-50';
    case 'pending':
      return 'text-yellow-600 bg-yellow-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

const getLogLevelColor = (level: LogEntry['level']) => {
  switch (level) {
    case 'success':
      return 'text-green-600';
    case 'error':
      return 'text-red-600';
    case 'warning':
      return 'text-yellow-600';
    case 'info':
    default:
      return 'text-gray-600';
  }
};

export const RunsPanel: React.FC<RunsPanelProps> = ({ isOpen, onClose }) => {
  const [selectedRun, setSelectedRun] = React.useState<WorkflowRun | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 left-0 w-96 bg-white shadow-xl border-r border-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Play className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Workflow Runs</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {!selectedRun ? (
          // Runs List
          <div className="h-full overflow-y-auto">
            <div className="p-4 space-y-3">
              {mockRuns.map((run) => (
                <div
                  key={run.id}
                  onClick={() => setSelectedRun(run)}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(run.status)}
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(run.status)}`}>
                        {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{run.id}</span>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Started:</span>
                      <span className="font-medium">{run.startTime}</span>
                    </div>
                    {run.duration && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{run.duration}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Triggered by:</span>
                      <span className="font-medium">{run.triggeredBy}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Run Details with Logs
          <div className="h-full flex flex-col">
            {/* Run Details Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Button variant="ghost" size="sm" onClick={() => setSelectedRun(null)}>
                  ← Back
                </Button>
                <span className="text-sm text-gray-500">{selectedRun.id}</span>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                {getStatusIcon(selectedRun.status)}
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(selectedRun.status)}`}>
                  {selectedRun.status.charAt(0).toUpperCase() + selectedRun.status.slice(1)}
                </span>
              </div>
              
              <div className="text-sm space-y-1">
                <div>Started: {selectedRun.startTime}</div>
                {selectedRun.endTime && <div>Ended: {selectedRun.endTime}</div>}
                {selectedRun.duration && <div>Duration: {selectedRun.duration}</div>}
                <div>Triggered by: {selectedRun.triggeredBy}</div>
              </div>
            </div>

            {/* Logs */}
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="text-sm font-medium mb-3">Execution Logs</h3>
              <div className="space-y-2">
                {selectedRun.logs.map((log) => (
                  <div key={log.id} className="p-2 bg-gray-50 rounded text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-500">{log.timestamp}</span>
                      <span className={`font-medium ${getLogLevelColor(log.level)}`}>
                        {log.level.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-gray-800">{log.message}</div>
                    {log.nodeName && (
                      <div className="text-gray-500 mt-1">Node: {log.nodeName}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
