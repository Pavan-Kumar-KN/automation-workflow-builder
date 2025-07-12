
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

  console.log('Node data came to main NodeConfigPanel:', node.data);

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


  return (
    <div className="w-full h-full relative z-20">
      <Card className="h-full rounded-none border-0">
        <CardHeader className="border-b border-gray-200 relative px-6 py-4 flex-shrink-0">
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

        <CardContent className="p-6 flex-1 overflow-y-auto">
          <div className="space-y-6 pb-6">
            {renderConfigForm()}

            <div className="flex space-x-3 pt-4 border-t border-gray-200 mt-6">
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full"
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
