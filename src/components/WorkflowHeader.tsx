import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Play, Save, Share, Github, Star, RotateCcw, Activity, GitBranch, Upload } from 'lucide-react';

interface WorkflowHeaderProps {
  workflowName: string;
  setWorkflowName: (name: string) => void;
  isActive: boolean;
  setIsActive: (active: boolean) => void;
  onSave: () => void;
  onExecute: () => void;
  onReset: () => void;
  onOpenRuns?: () => void;
  onOpenVersions?: () => void;
  onOpenPublish?: () => void;
}

export const WorkflowHeader: React.FC<WorkflowHeaderProps> = ({
  workflowName,
  setWorkflowName,
  isActive,
  setIsActive,
  onSave,
  onExecute,
  onReset,
  onOpenRuns,
  onOpenVersions,
  onOpenPublish,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Company Name</span>
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
          {/* Panel Buttons */}
          <Button variant="ghost" size="sm" onClick={onOpenRuns}>
            <Activity className="w-4 h-4 mr-2" />
            Runs
          </Button>

          <Button variant="ghost" size="sm" onClick={onOpenVersions}>
            <GitBranch className="w-4 h-4 mr-2" />
            Versions
          </Button>

          <Button variant="ghost" size="sm" onClick={onOpenPublish}>
            <Upload className="w-4 h-4 mr-2" />
            Publish
          </Button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300" />

          {/* Action Buttons */}
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>
    </header>
  );
};
