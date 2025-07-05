import React from 'react';

interface EndNodeProps {
  data: {
    label: string;
    id: string;
  };
}

export const EndNode: React.FC<EndNodeProps> = ({ data }) => {
  return (
    <div className="relative">
      {/* Main Node */}
      <div className="bg-gray-100 rounded-lg border border-gray-300 px-4 py-3 min-w-[120px] cursor-default">
        {/* Node Content */}
        <div className="flex items-center justify-center">
          <div className="text-sm font-medium text-gray-600">
            End
          </div>
        </div>
      </div>
    </div>
  );
};
