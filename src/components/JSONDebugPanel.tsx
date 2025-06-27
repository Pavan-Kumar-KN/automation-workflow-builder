import React, { useState } from 'react';
import {
  Code,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  Send
} from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWorkflowJSON } from '@/hooks/useWorkflowJSON';
import { toast } from 'sonner';

export const JSONDebugPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'frontend' | 'backend'>('backend');

  // Get viewport from ReactFlow context (this component must be inside ReactFlow)
  const { getViewport } = useReactFlow();

  const {
    generateFrontendJSON,
    generateBackendJSON,
    saveFrontendJSON,
    saveBackendJSON,
    submitToBackend,
    validateWorkflow,
    getWorkflowStats,
    debugJSON
  } = useWorkflowJSON();

  const stats = getWorkflowStats();
  const validation = validateWorkflow();

  const handleCopyJSON = (json: any) => {
    const jsonString = JSON.stringify(json, null, 2);
    navigator.clipboard.writeText(jsonString);
    toast.success('JSON copied to clipboard!');
  };

  const handleSubmitToBackend = async () => {
    try {
      await submitToBackend(54); // Default user ID
      toast.success('Workflow submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit workflow');
    }
  };

  const handleSaveFrontendJSON = () => {
    const viewport = getViewport();
    saveFrontendJSON(viewport);
  };

  const handleSaveBackendJSON = () => {
    saveBackendJSON();
  };

  const handleDebugJSON = () => {
    const viewport = getViewport();
    debugJSON(viewport);
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 left-4 z-50"
        size="sm"
      >
        <Code className="w-4 h-4 mr-2" />
        JSON Debug
      </Button>
    );
  }

  const viewport = getViewport();
  const frontendJSON = generateFrontendJSON(viewport);
  const backendJSON = generateBackendJSON();

  return (
    <div className="fixed bottom-4 left-4 w-96 max-h-[80vh] bg-white rounded-lg shadow-2xl border z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Code className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">JSON Constructor</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsVisible(false)}
        >
          <EyeOff className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="p-4 border-b bg-gray-50">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-600">Nodes:</span>
            <Badge variant="outline" className="ml-1">{stats.totalNodes}</Badge>
          </div>
          <div>
            <span className="text-gray-600">Edges:</span>
            <Badge variant="outline" className="ml-1">{stats.totalEdges}</Badge>
          </div>
          <div>
            <span className="text-gray-600">Triggers:</span>
            <Badge variant="outline" className="ml-1">{stats.triggers}</Badge>
          </div>
          <div>
            <span className="text-gray-600">Actions:</span>
            <Badge variant="outline" className="ml-1">{stats.actions}</Badge>
          </div>
        </div>
        
        {/* Validation Status */}
        <div className="mt-2 flex items-center space-x-2">
          {validation.isValid ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <span className={`text-xs font-medium ${
            validation.isValid ? 'text-green-600' : 'text-red-600'
          }`}>
            {validation.isValid ? 'Valid Workflow' : 'Invalid Workflow'}
          </span>
        </div>
        
        {!validation.isValid && (
          <div className="mt-1">
            {validation.errors.map((error, index) => (
              <div key={index} className="text-xs text-red-600">• {error}</div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('backend')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'backend'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Backend JSON
        </button>
        <button
          onClick={() => setActiveTab('frontend')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'frontend'
              ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Frontend JSON
        </button>
      </div>

      {/* JSON Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-64 overflow-y-auto p-4">
          <pre className="text-xs bg-gray-50 p-3 rounded border overflow-x-auto">
            <code>
              {JSON.stringify(
                activeTab === 'backend' ? backendJSON : frontendJSON, 
                null, 
                2
              )}
            </code>
          </pre>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t space-y-2">
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCopyJSON(activeTab === 'backend' ? backendJSON : frontendJSON)}
            className="flex-1"
          >
            <Copy className="w-3 h-3 mr-1" />
            Copy
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={activeTab === 'backend' ? handleSaveBackendJSON : handleSaveFrontendJSON}
            className="flex-1"
          >
            <Download className="w-3 h-3 mr-1" />
            Save
          </Button>
        </div>
        
        {activeTab === 'backend' && (
          <Button
            size="sm"
            onClick={handleSubmitToBackend}
            disabled={!validation.isValid}
            className="w-full"
          >
            <Send className="w-3 h-3 mr-1" />
            Submit to Backend
          </Button>
        )}
        
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDebugJSON}
          className="w-full text-xs"
        >
          <Eye className="w-3 h-3 mr-1" />
          Debug in Console
        </Button>
      </div>

      {/* Usage Instructions */}
      <div className="p-3 bg-blue-50 border-t text-xs text-blue-800">
        <div className="font-medium mb-1">Usage:</div>
        <div>• <strong>Backend JSON:</strong> For API submission</div>
        <div>• <strong>Frontend JSON:</strong> For workflow state</div>
        <div>• Auto-updates when nodes/edges change</div>
      </div>
    </div>
  );
};
