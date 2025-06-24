
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ConfigComponentProps } from './types';

export const TriggerConfig: React.FC<ConfigComponentProps> = ({ config, setConfig }) => {
  return (
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
};
