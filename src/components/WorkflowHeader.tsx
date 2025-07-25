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
  ArrowDown,
  ArrowRight,
  Copy,
  Move,
  X,
  Badge
} from 'lucide-react';
import { useWorkflowStore } from '@/hooks/useWorkflowState';
import { useCopyPaste } from '@/hooks/useCopyPaste';
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

  // Copy and Move state management
  const { isCopy, copiedNodes, isMoveMode, nodeToMove, flowToMove, forceResetMoveState } = useWorkflowStore();
  const { clearCopyState } = useCopyPaste();

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
      <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3">
        {/* Left Section - Workflow Info - Responsive */}
        <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6 flex-1 min-w-0">
          {/* Workflow Name & Status - Responsive */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div className="flex items-center space-x-2 min-w-0">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
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

                  {/* Status Toggle - Moved beside logo */}
                  <div className="flex items-center space-x-2 px-2 py-1 bg-gray-50 rounded-lg">
                    <Switch
                      checked={isActive}
                      onCheckedChange={setIsActive}
                      className="data-[state=checked]:bg-green-500"
                    />
                    <span className="text-xs font-medium text-gray-700">
                      {isActive ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Saved {formatLastSaved(lastSaved)}</span>
                  </span>
                  
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Copy State Indicator */}
        {isCopy && (
          <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <Copy className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              {copiedNodes.length > 1 ? 'Flow' : 'Action'} ready to paste
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCopyState}
              className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
              title="Cancel copy"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* Move State Indicator */}
        {isMoveMode && (
          <div className="flex items-center space-x-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg">
            <Move className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">
              {flowToMove ? 'Flow' : ''} ready to move
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={forceResetMoveState}
              className="h-6 w-6 p-0 text-purple-600 hover:text-purple-800 hover:bg-purple-100"
              title="Cancel move"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}

        {/* Right Section - Actions - Responsive */}
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          {/* Quick Actions - Compact on tablet */}
          <div className="hidden md:flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenRuns}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2 sm:px-3"
            >
              <Activity className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden lg:inline">Runs</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenVersions}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2 sm:px-3"
            >
              <GitBranch className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden lg:inline">History</span>
            </Button>
          </div>

          {/* Divider - Hidden on tablet */}
          <div className="hidden lg:block w-px h-6 bg-gray-300 mx-2" />

          {/* Primary Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="text-gray-600 hover:text-gray-900 border-gray-300 px-2 sm:px-3"
            >
              <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">Reset</span>
            </Button>





            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Button
                size="sm"
                onClick={onOpenPublish}
                className="bg-gradient-to-br text-white px-2 sm:px-4"
              >
                <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Publish</span>
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