
import React, { useState } from 'react';
import { Node } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { TriggerConfig } from './TriggerConfig';
import { ActionConfig } from './ActionConfig';
import { ConditionConfig } from './ConditionConfig';
import { SplitConfig } from './SplitConfig';
import { NodeConfig } from './types';

interface NodeConfigPanelProps {
  node: Node;
  onClose: () => void;
  onUpdate: (nodeId: string, data: any) => void;
}

export const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({
  node,
  onClose,
  onUpdate,
}) => {
  const [config, setConfig] = useState<NodeConfig>(node.data as NodeConfig);

  const handleSave = () => {
    onUpdate(node.id, config);
    toast.success('Node configuration saved!');
    onClose();
  };

  const renderConfigForm = () => {
    switch (node.type) {
      case 'trigger':
        return <TriggerConfig config={config} setConfig={setConfig} />;
      case 'action':
        return <ActionConfig config={config} setConfig={setConfig} />;
      case 'condition':
        return <ConditionConfig config={config} setConfig={setConfig} />;
      case 'split-condition':
        return <SplitConfig config={config} setConfig={setConfig} />;
      default:
        return null;
    }
  };

  const getNodeIcon = () => {
    switch (node.type) {
      case 'trigger': return '🔥';
      case 'action': return '⚡';
      case 'condition': return '🎯';
      case 'split-condition': return '🔀';
      default: return '⚙️';
    }
  };

  return (
    <div className="w-96 bg-white border-l border-gray-200 shadow-xl">
      <Card className="h-full rounded-none border-0">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getNodeIcon()}</span>
              <CardTitle className="text-lg">
                Configure {node.type === 'split-condition' ? 'Split' : node.type?.charAt(0).toUpperCase() + node.type?.slice(1)}
              </CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-6">
            {renderConfigForm()}
            
            <div className="flex space-x-3 pt-4">
              <Button onClick={handleSave} className="flex-1">
                <Settings className="w-4 h-4 mr-2" />
                Save Configuration
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
