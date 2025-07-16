import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GitBranch, ArrowRight, ArrowDown } from 'lucide-react';

interface BranchSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBranch: (branch: 'yes' | 'no') => void;
  downstreamNodeCount: number;
}

export const BranchSelectionModal: React.FC<BranchSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectBranch,
  downstreamNodeCount
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-orange-500" />
            Choose Branch for Downstream Flow
          </DialogTitle>
          <DialogDescription>
            You're pasting a conditional node that will affect {downstreamNodeCount} downstream node{downstreamNodeCount !== 1 ? 's' : ''}. 
            Which branch should the existing downstream flow be moved to?
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <Button
            onClick={() => onSelectBranch('yes')}
            variant="outline"
            className="flex items-center justify-between p-4 h-auto border-green-200 hover:border-green-300 hover:bg-green-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="text-left">
                <div className="font-medium text-green-700">Yes Branch</div>
                <div className="text-sm text-green-600">Move downstream flow to the "Yes" path</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-green-500" />
          </Button>

          <Button
            onClick={() => onSelectBranch('no')}
            variant="outline"
            className="flex items-center justify-between p-4 h-auto border-red-200 hover:border-red-300 hover:bg-red-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="text-left">
                <div className="font-medium text-red-700">No Branch</div>
                <div className="text-sm text-red-600">Move downstream flow to the "No" path</div>
              </div>
            </div>
            <ArrowDown className="w-4 h-4 text-red-500" />
          </Button>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
