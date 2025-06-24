
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfigComponentProps } from './types';

export const ConditionConfig: React.FC<ConfigComponentProps> = ({ config, setConfig }) => {
  return (
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
};
