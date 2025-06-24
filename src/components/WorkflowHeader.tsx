import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Play, Save, Share, Github, Star } from 'lucide-react';

interface WorkflowHeaderProps {
  workflowName: string;
  setWorkflowName: (name: string) => void;
  isActive: boolean;
  setIsActive: (active: boolean) => void;
  onSave: () => void;
  onExecute: () => void;
}

export const WorkflowHeader: React.FC<WorkflowHeaderProps> = ({
  workflowName,
  setWorkflowName,
  isActive,
  setIsActive,
  onSave,
  onExecute,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">👤 Personal</span>
            <span className="text-gray-400">/</span>
            <Input
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="border-none shadow-none text-lg font-medium p-0 h-auto focus-visible:ring-0"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Inactive</span>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
          
          <Button size="sm" onClick={onSave}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          
          <Button variant="default" size="sm" onClick={onExecute}>
            <Play className="w-4 h-4 mr-2" />
            Execute
          </Button>

          <div className="flex items-center space-x-2 ml-4">
            <Button variant="outline" size="sm">
              <Github className="w-4 h-4 mr-2" />
              <Star className="w-4 h-4" />
              111,276
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
