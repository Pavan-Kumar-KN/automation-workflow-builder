
import React, { useState } from 'react';
import { Node } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Settings, Zap } from 'lucide-react';
import { toast } from 'sonner';

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
  const [config, setConfig] = useState(node.data);

  const handleSave = () => {
    onUpdate(node.id, config);
    toast.success('Node configuration saved!');
    onClose();
  };

  const renderTriggerConfig = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="trigger-name">Trigger Name</Label>
        <Input
          id="trigger-name"
          value={config.label || ''}
          onChange={(e) => setConfig({ ...config, label: e.target.value })}
          placeholder="Enter trigger name"
        />
      </div>
      
      <div>
        <Label htmlFor="webhook-url">Webhook URL</Label>
        <Input
          id="webhook-url"
          value={config.webhookUrl || ''}
          onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
          placeholder="https://your-webhook-url.com"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={config.enabled || false}
          onCheckedChange={(enabled) => setConfig({ ...config, enabled })}
        />
        <Label>Enable this trigger</Label>
      </div>
    </div>
  );

  const renderActionConfig = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="action-name">Action Name</Label>
        <Input
          id="action-name"
          value={config.label || ''}
          onChange={(e) => setConfig({ ...config, label: e.target.value })}
          placeholder="Enter action name"
        />
      </div>

      <div>
        <Label htmlFor="action-type">Action Type</Label>
        <Select value={config.actionType || ''} onValueChange={(value) => setConfig({ ...config, actionType: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select action type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="create">Create Record</SelectItem>
            <SelectItem value="update">Update Record</SelectItem>
            <SelectItem value="delete">Delete Record</SelectItem>
            <SelectItem value="send">Send Data</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="target-service">Target Service</Label>
        <Select value={config.targetService || ''} onValueChange={(value) => setConfig({ ...config, targetService: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="google-sheets">Google Sheets</SelectItem>
            <SelectItem value="google-calendar">Google Calendar</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="database">Database</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="config-data">Configuration Data</Label>
        <Textarea
          id="config-data"
          value={config.configData || ''}
          onChange={(e) => setConfig({ ...config, configData: e.target.value })}
          placeholder="Enter JSON configuration or field mappings"
          rows={4}
        />
      </div>
    </div>
  );

  const renderConditionConfig = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="condition-name">Condition Name</Label>
        <Input
          id="condition-name"
          value={config.label || ''}
          onChange={(e) => setConfig({ ...config, label: e.target.value })}
          placeholder="Enter condition name"
        />
      </div>

      <div>
        <Label htmlFor="condition-field">Field to Check</Label>
        <Input
          id="condition-field"
          value={config.field || ''}
          onChange={(e) => setConfig({ ...config, field: e.target.value })}
          placeholder="e.g., email, status, count"
        />
      </div>

      <div>
        <Label htmlFor="condition-operator">Operator</Label>
        <Select value={config.operator || ''} onValueChange={(value) => setConfig({ ...config, operator: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select operator" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="equals">Equals</SelectItem>
            <SelectItem value="not-equals">Not Equals</SelectItem>
            <SelectItem value="contains">Contains</SelectItem>
            <SelectItem value="greater-than">Greater Than</SelectItem>
            <SelectItem value="less-than">Less Than</SelectItem>
            <SelectItem value="exists">Exists</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="condition-value">Value</Label>
        <Input
          id="condition-value"
          value={config.value || ''}
          onChange={(e) => setConfig({ ...config, value: e.target.value })}
          placeholder="Enter comparison value"
        />
      </div>
    </div>
  );

  const getNodeIcon = () => {
    switch (node.type) {
      case 'trigger': return '🔥';
      case 'action': return '⚡';
      case 'condition': return '🎯';
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
                Configure {node.type?.charAt(0).toUpperCase() + node.type?.slice(1)}
              </CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-6">
            {node.type === 'trigger' && renderTriggerConfig()}
            {node.type === 'action' && renderActionConfig()}
            {node.type === 'condition' && renderConditionConfig()}
            
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
