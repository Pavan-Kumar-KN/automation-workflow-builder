import React, { useState, useEffect } from 'react';
import { Node } from '@xyflow/react';
import { Navigation, Target, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useWorkflowStore } from '@/hooks/useWorkflowState';

interface GotoConfigProps {
  node: Node;
  onUpdate: (nodeId: string, data: any) => void;
  onClose: () => void;
}

export const GotoConfig: React.FC<GotoConfigProps> = ({ node, onUpdate, onClose }) => {
  const { nodes } = useWorkflowStore();
  const [targetNodeId, setTargetNodeId] = useState(node.data.targetNodeId || '');
  const [description, setDescription] = useState(node.data.description || '');

  // Get available target nodes (exclude current node and goto nodes)
  const availableNodes = nodes.filter(n => 
    n.id !== node.id && 
    n.type !== 'goto-node' && 
    n.type !== 'add-trigger'
  );

  const selectedTargetNode = availableNodes.find(n => n.id === targetNodeId);

  const handleSave = () => {
    const targetNode = availableNodes.find(n => n.id === targetNodeId);
    
    onUpdate(node.id, {
      ...node.data,
      targetNodeId,
      targetNodeLabel: targetNode?.data?.label || '',
      description,
    });
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="p-6 bg-white">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Navigation className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Configure Goto Node</h2>
          <p className="text-sm text-gray-500">Set up flow redirection</p>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="space-y-6">
        {/* Target Node Selection */}
        <div className="space-y-2">
          <Label htmlFor="target-node" className="text-sm font-medium text-gray-700">
            Target Node
          </Label>
          <Select value={targetNodeId} onValueChange={setTargetNodeId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a node to redirect to..." />
            </SelectTrigger>
            <SelectContent>
              {availableNodes.length === 0 ? (
                <SelectItem value="" disabled>
                  No available nodes to redirect to
                </SelectItem>
              ) : (
                availableNodes.map((targetNode) => (
                  <SelectItem key={targetNode.id} value={targetNode.id}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        targetNode.type === 'trigger' ? 'bg-red-400' :
                        targetNode.type === 'action' ? 'bg-blue-400' :
                        targetNode.type === 'condition' ? 'bg-orange-400' :
                        targetNode.type === 'split-condition' ? 'bg-purple-400' :
                        'bg-gray-400'
                      }`} />
                      <span>{targetNode.data?.label || `${targetNode.type} node`}</span>
                      <span className="text-xs text-gray-500">({targetNode.type})</span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          
          {/* Selected target preview */}
          {selectedTargetNode && (
            <div className="mt-2 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-800">
                  Will redirect to: {selectedTargetNode.data?.label}
                </span>
              </div>
              <div className="mt-1 text-xs text-indigo-600">
                Node Type: {selectedTargetNode.type} | ID: {selectedTargetNode.id}
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium text-gray-700">
            Description (Optional)
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe when this redirect should happen..."
            className="min-h-[80px]"
          />
        </div>

        {/* Usage Instructions */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-amber-800">How to use Goto Node:</h4>
              <ul className="mt-2 text-xs text-amber-700 space-y-1">
                <li>• Connect this node as a "failure" path from condition nodes</li>
                <li>• When the condition fails, flow will redirect to the selected target node</li>
                <li>• This prevents having to duplicate actions or messages</li>
                <li>• Great for creating loops or retry mechanisms</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Flow Visualization */}
        {selectedTargetNode && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Flow Preview:</h4>
            <div className="flex items-center space-x-2 text-sm">
              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">
                Condition Fails
              </span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded">
                Goto Node
              </span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                {selectedTargetNode.data?.label}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          disabled={!targetNodeId}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Save Configuration
        </Button>
      </div>
    </div>
  );
};
