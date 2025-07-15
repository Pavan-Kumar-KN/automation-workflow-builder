import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

import {
  Play,
  Save,
  Share,
  MoreHorizontal,
  RotateCcw,
  Activity,
  GitBranch,
  Upload,
  Settings,
  Clock,
  Users,
  Eye,
  Star,
  ChevronDown,
  Zap,
  Badge,
  ArrowDown,
  ArrowRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

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
  const [isEditingName, setIsEditingName] = useState(false);
  const [lastSaved, setLastSaved] = useState(new Date());

  const handleSave = () => {
    onSave();
    setLastSaved(new Date());
  };

  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left Section - Workflow Info */}
        <div className="flex items-center space-x-6">
          {/* Workflow Name & Status */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>

              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  {isEditingName ? (
                    <Input
                      value={workflowName}
                      onChange={(e) => setWorkflowName(e.target.value)}
                      onBlur={() => setIsEditingName(false)}
                      onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                      className="text-lg font-semibold border-none shadow-none p-0 h-auto focus-visible:ring-0 bg-transparent"
                      autoFocus
                    />
                  ) : (
                    <h1
                      className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                      onClick={() => setIsEditingName(true)}
                    >
                      {workflowName}
                    </h1>
                  )}

                  <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
                    {isActive ? "Active" : "Draft"}
                  </Badge>
                </div>

                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Saved {formatLastSaved(lastSaved)}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>Private</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Toggle */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg">
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              className="data-[state=checked]:bg-green-500"
            />
            <span className="text-sm font-medium text-gray-700">
              {isActive ? "Published" : "Draft"}
            </span>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-2">
          {/* Quick Actions */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenRuns}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <Activity className="w-4 h-4 mr-1" />
              Runs
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenVersions}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <GitBranch className="w-4 h-4 mr-1" />
              History
            </Button>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300 mx-2" />

          {/* Primary Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="text-gray-600 hover:text-gray-900 border-gray-300"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>





            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Button
                size="sm"
                onClick={onOpenPublish}
                className="bg-gradient-to-br text-white px-4"
              >
                <Upload className="w-4 h-4 mr-1" />
                Publish
              </Button>
            </div>
          </div>

          {/* More Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="flex items-center space-x-2">
                <Share className="w-4 h-4" />
                <span>Share Workflow</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center space-x-2">
                <Star className="w-4 h-4" />
                <span>Add to Favorites</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};