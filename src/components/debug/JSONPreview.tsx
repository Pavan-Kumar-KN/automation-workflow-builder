import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWorkflowJSON } from '@/hooks/useWorkflowJSON';
import { Eye, EyeOff, Download, Send } from 'lucide-react';

export const JSONPreview: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { generateJSON, saveJSON, submitToBackend } = useWorkflowJSON();

  const currentJSON = generateJSON();

  const handleSubmitToBackend = async () => {
    try {
      await submitToBackend();
      alert('JSON submitted to backend successfully!');
    } catch (error) {
      alert('Failed to submit JSON to backend');
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
          size="sm"
        >
          <Eye className="w-4 h-4 mr-2" />
          Show JSON
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 bg-white border border-gray-300 rounded-lg shadow-xl z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <h3 className="text-sm font-semibold text-gray-800">Workflow JSON</h3>
        <div className="flex items-center gap-2">
          <Button
            onClick={saveJSON}
            variant="outline"
            size="sm"
            className="h-7 px-2"
          >
            <Download className="w-3 h-3" />
          </Button>
          <Button
            onClick={handleSubmitToBackend}
            variant="outline"
            size="sm"
            className="h-7 px-2"
          >
            <Send className="w-3 h-3" />
          </Button>
          <Button
            onClick={() => setIsVisible(false)}
            variant="ghost"
            size="sm"
            className="h-7 px-2"
          >
            <EyeOff className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* JSON Content */}
      <div className="p-3 max-h-80 overflow-auto">
        <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words">
          {JSON.stringify(currentJSON, null, 2)}
        </pre>
      </div>

      {/* Stats */}
      <div className="p-2 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="flex justify-between text-xs text-gray-600">
          <span>Triggers: {currentJSON.triggers?.length || 0}</span>
          <span>Actions: {currentJSON.actions?.length || 0}</span>
          <span>Nodes: {currentJSON.layout?.node?.length || 0}</span>
        </div>
      </div>
    </div>
  );
};
