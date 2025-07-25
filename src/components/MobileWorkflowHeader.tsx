import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Save,
  RotateCcw,
  Upload,
  Zap,
  Clock,
  Copy,
  Move,
  X,
  Badge
} from 'lucide-react';
import { useWorkflowStore } from '@/hooks/useWorkflowState';
import { useCopyPaste } from '@/hooks/useCopyPaste';

interface MobileWorkflowHeaderProps {
  workflowName: string;
  setWorkflowName: (name: string) => void;
  isActive: boolean;
  setIsActive: (active: boolean) => void;
  onSave: () => void;
  onExecute: () => void;
  onReset: () => void;
  onOpenPublish?: () => void;
}

export const MobileWorkflowHeader: React.FC<MobileWorkflowHeaderProps> = ({
  workflowName,
  setWorkflowName,
  isActive,
  setIsActive,
  onSave,
  onExecute,
  onReset,
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
      {/* Main Header Row - More Compact */}
      <div className="flex items-center justify-between px-3 py-2">
        {/* Left Section - Workflow Info */}
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {/* Workflow Icon & Name */}
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="w-3 h-3 text-white" />
            </div>

            <div className="flex items-center space-x-2 min-w-0 flex-1">
              {isEditingName ? (
                <Input
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                  className="text-sm font-semibold border-none shadow-none p-0 h-auto focus-visible:ring-0 bg-transparent min-w-0"
                  autoFocus
                />
              ) : (
                <h1
                  className="text-sm font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors truncate min-w-0"
                  onClick={() => setIsEditingName(true)}
                >
                  {workflowName}
                </h1>
              )}
            </div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-1 flex-shrink-0">
          {/* Draft Toggle */}
          <Button
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => setIsActive(!isActive)}
            className={`px-2 py-1 h-7 text-xs ${
              isActive
                ? "bg-green-500 text-white hover:bg-green-600"
                : "text-gray-600 hover:text-gray-900 border-gray-300"
            }`}
          >
            {isActive ? "Active" : "Draft"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="text-gray-600 hover:text-gray-900 border-gray-300 px-2 py-1 h-7"
          >
            <RotateCcw className="w-3 h-3" />
          </Button>

          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Button
              size="sm"
              onClick={onOpenPublish}
              className="bg-gradient-to-br text-white px-2 py-1 h-7"
            >
              <Upload className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Copy/Move State Indicators - More Compact */}
      {(isCopy || isMoveMode) && (
        <div className="px-3 pb-1">
          {/* Copy State Indicator */}
          {isCopy && (
            <div className="flex items-center justify-between px-2 py-1 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center space-x-2">
                <Copy className="w-3 h-3 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">
                  {copiedNodes.length > 1 ? 'Flow' : 'Action'} ready to paste
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCopyState}
                className="h-4 w-4 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                title="Cancel copy"
              >
                <X className="w-2.5 h-2.5" />
              </Button>
            </div>
          )}

          {/* Move State Indicator */}
          {isMoveMode && (
            <div className="flex items-center justify-between px-2 py-1 bg-purple-50 border border-purple-200 rounded-md mt-1">
              <div className="flex items-center space-x-2">
                <Move className="w-3 h-3 text-purple-600" />
                <span className="text-xs font-medium text-purple-700">
                  {flowToMove ? 'Flow' : 'Node'} ready to move
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={forceResetMoveState}
                className="h-4 w-4 p-0 text-purple-600 hover:text-purple-800 hover:bg-purple-100"
                title="Cancel move"
              >
                <X className="w-2.5 h-2.5" />
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
