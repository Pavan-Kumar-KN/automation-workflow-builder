import React from 'react';
import * as LucideIcons from 'lucide-react';

interface PlaceHolderNodeProps {
  branchType: string;
  handleAddNodeToBranch: (branchType: string) => void;
}


// Renders a plus button above a placeholder
const PlaceHolderNode: React.FC<PlaceHolderNodeProps> = ({ branchType, handleAddNodeToBranch }) => {
  return (
    <div className="flex flex-col items-center pt-6 pb-4">
      {/* Vertical line above button */}
      <div className="w-0.5 h-4 bg-gray-400" />

      {/* Plus button */}
      <button
        onClick={() => handleAddNodeToBranch(branchType)}
        className="w-6 h-6 bg-white border-2 border-gray-400 rounded-lg flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors z-10"
      >
        <LucideIcons.Plus className="w-3 h-3 text-gray-600 hover:text-blue-600" />
      </button>

      {/* Vertical line below button */}
      <div className="w-0.5 h-4 bg-gray-400" />

      {/* Placeholder box */}
      <div
        onClick={() => handleAddNodeToBranch(branchType)}
        className="mt-2 shadow-sm p-6 w-52 flex flex-col items-center justify-center cursor-pointer hover:shadow-md border border-dashed border-gray-300 rounded"
      >
        <LucideIcons.Plus className="w-4 h-4 text-gray-400 mb-2 hover:text-blue-600" />
        <p className="text-sm text-gray-500">Add action</p>
      </div>
    </div>
  );
};

export default PlaceHolderNode;
