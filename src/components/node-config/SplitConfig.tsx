
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { ConfigComponentProps } from './types';

export const SplitConfig: React.FC<ConfigComponentProps> = ({ config, setConfig }) => {
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
