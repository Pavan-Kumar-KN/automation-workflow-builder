
import React, { useState } from 'react';
import { Node } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { DynamicNodeConfig } from './DynamicNodeConfig';
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
    return (
      <DynamicNodeConfig
        node={node}
        onUpdate={onUpdate}
        onClose={onClose}
      />
    );
  };

  const getNodeIcon = () => {
    switch (node.type) {
      case 'trigger': return '🔥';
      case 'action': return '⚡';
      case 'condition': return '🎯';
      case 'split-condition': return '🔀';
      case 'goto-node': return '🧭';
      default: return '⚙️';
    }
  };

  return (
    <div className="w-96 bg-white border-l border-gray-200 shadow-xl relative z-20">
      <Card className="h-full rounded-none border-0">
        <CardHeader className="border-b border-gray-200 relative px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              {/* <span className="text-lg">{getNodeIcon()}</span> */}
              <CardTitle className="text-lg truncate">
                Configure {node.type === 'split-condition' ? 'Split' : node.type?.charAt(0).toUpperCase() + node.type?.slice(1)}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="z-30 hover:bg-gray-100 flex-shrink-0 h-8 w-8 p-0"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-6">
            {renderConfigForm()}
            
            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
