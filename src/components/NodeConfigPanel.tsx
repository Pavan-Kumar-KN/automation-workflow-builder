import React, { useState } from 'react';
import { Node } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Settings, Zap, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface NodeConfigPanelProps {
  node: Node;
  onClose: () => void;
  onUpdate: (nodeId: string, data: any) => void;
}

interface NodeConfig {
  label?: string;
  webhookUrl?: string;
  enabled?: boolean;
  actionType?: string;
  targetService?: string;
  configData?: string;
  field?: string;
  operator?: string;
  value?: string;
  distributionType?: string;
  paths?: Array<{ name: string; percentage: number; id: string }>;
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

  const renderSplitConfig = () => {
    const paths = config.paths || [
      { name: 'Path A', percentage: 50, id: 'a' },
      { name: 'Path B', percentage: 50, id: 'b' }
    ];

    const addPath = () => {
      const newPath = {
        name: `Path ${String.fromCharCode(65 + paths.length)}`,
        percentage: 0,
        id: String.fromCharCode(97 + paths.length)
      };
      setConfig({ ...config, paths: [...paths, newPath] });
    };

    const removePath = (index: number) => {
      if (paths.length > 2) {
        const newPaths = paths.filter((_, i) => i !== index);
        setConfig({ ...config, paths: newPaths });
      }
    };

    const updatePath = (index: number, field: 'name' | 'percentage', value: string | number) => {
      const newPaths = [...paths];
      newPaths[index] = { ...newPaths[index], [field]: value };
      setConfig({ ...config, paths: newPaths });
    };

    const totalPercentage = paths.reduce((sum, path) => sum + path.percentage, 0);

    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="split-name">Split Name</Label>
          <Input
            id="split-name"
            value={config.label || ''}
            onChange={(e) => setConfig({ ...config, label: e.target.value })}
            placeholder="Enter split name"
          />
        </div>

        <div>
          <Label htmlFor="distribution-type">Distribution Type</Label>
          <Select value={config.distributionType || 'random'} onValueChange={(value) => setConfig({ ...config, distributionType: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select distribution type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="random">Random Split</SelectItem>
              <SelectItem value="weighted">Weighted Split</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <Label>Paths</Label>
            <Button variant="outline" size="sm" onClick={addPath}>
              <Plus className="w-4 h-4 mr-1" />
              Add Path
            </Button>
          </div>
          
          <div className="space-y-3">
            {paths.map((path, index) => (
              <div key={path.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                <Input
                  value={path.name}
                  onChange={(e) => updatePath(index, 'name', e.target.value)}
                  placeholder="Path name"
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={path.percentage}
                  onChange={(e) => updatePath(index, 'percentage', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-20"
                  min="0"
                  max="100"
                />
                <span className="text-sm text-gray-500">%</span>
                {paths.length > 2 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removePath(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {totalPercentage !== 100 && (
            <p className="text-sm text-amber-600 mt-2">
              Total percentage: {totalPercentage}% (should equal 100%)
            </p>
          )}
        </div>
      </div>
    );
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
            {node.type === 'trigger' && renderTriggerConfig()}
            {node.type === 'action' && renderActionConfig()}
            {node.type === 'condition' && renderConditionConfig()}
            {node.type === 'split-condition' && renderSplitConfig()}
            
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
