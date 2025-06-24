
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfigComponentProps } from './types';

export const ActionConfig: React.FC<ConfigComponentProps> = ({ config, setConfig }) => {
  return (
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
};
