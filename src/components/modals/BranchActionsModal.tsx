import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useGraphStore } from '@/store/useGraphStore';

interface BranchActionsMenuProps {
  children: React.ReactNode;
  nodeId?: string;
  nodeTitle?: string;
  isLoading?: boolean;
}

export const BranchActionsModal: React.FC<BranchActionsMenuProps> = ({
  children,
  nodeId,
  nodeTitle,
  isLoading = false
}) => {
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const handleDeleteConditonalNode = useGraphStore((state) => state.handleDeleteConditionNode);

  const handleAction = async (actionType: 'yes' | 'no' | 'all') => {
    setActionInProgress(actionType);
    try {
      handleDeleteConditonalNode(nodeId, actionType);
    } catch (error) {
      console.error(`Error performing ${actionType}:`, error);
    } finally {
      setActionInProgress(null);
    }
  };

  const isActionDisabled = isLoading || actionInProgress !== null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="right" className="w-56">

        <DropdownMenuItem
          onClick={() => handleAction('yes')}
          disabled={isActionDisabled}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Move YES branch up</span>
          </div>
          {actionInProgress === 'yes' && (
            <div className="w-3 h-3 border border-green-500 border-t-transparent rounded-full animate-spin"></div>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleAction('no')}
          disabled={isActionDisabled}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Move NO branch up</span>
          </div>
          {actionInProgress === 'no' && (
            <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => handleAction('all')}
          disabled={isActionDisabled}
          className="flex items-center justify-between text-red-600 focus:text-red-600"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Delete all children nodes</span>
          </div>
          {actionInProgress === 'all' && (
            <div className="w-3 h-3 border border-red-500 border-t-transparent rounded-full animate-spin"></div>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};