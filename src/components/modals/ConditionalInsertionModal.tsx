import React from 'react';
import { X } from 'lucide-react';

interface ConditionalInsertionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBranch: (branch: 'yes' | 'no') => void;
  downstreamNodeCount: number;
}

export const ConditionalInsertionModal: React.FC<ConditionalInsertionModalProps> = ({
  isOpen,
  onClose,
  onSelectBranch,
  downstreamNodeCount
}) => {
  if (!isOpen) return null;

  const handleBranchSelection = (branch: 'yes' | 'no') => {
    onSelectBranch(branch);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Insert Condition Node
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-700 mb-2">
              You're inserting a condition node that will affect the downstream flow.
            </p>
            <p className="text-sm text-gray-600 mb-4">
              {downstreamNodeCount > 0 
                ? `${downstreamNodeCount} downstream node(s) will be moved to the selected branch.`
                : 'No downstream nodes will be affected.'
              }
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleBranchSelection('yes')}
              className="w-full p-4 text-left border-2 border-green-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-green-700 group-hover:text-green-800">
                    Move to YES Branch
                  </div>
                  <div className="text-sm text-green-600 group-hover:text-green-700">
                    Downstream nodes will continue when condition is true
                  </div>
                </div>
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              </div>
            </button>

            <button
              onClick={() => handleBranchSelection('no')}
              className="w-full p-4 text-left border-2 border-red-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-red-700 group-hover:text-red-800">
                    Move to NO Branch
                  </div>
                  <div className="text-sm text-red-600 group-hover:text-red-700">
                    Downstream nodes will continue when condition is false
                  </div>
                </div>
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              </div>
            </button>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
