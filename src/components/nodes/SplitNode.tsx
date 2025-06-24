
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Split } from 'lucide-react';

interface SplitNodeProps {
  data: {
    label: string;
    id: string;
    distributionType?: string;
    paths?: Array<{ name: string; percentage: number; id: string }>;
    description?: string;
  };
}

export const SplitNode: React.FC<SplitNodeProps> = ({ data }) => {
  const paths = data.paths || [
    { name: 'Path A', percentage: 50, id: 'a' },
    { name: 'Path B', percentage: 50, id: 'b' }
  ];

  return (
    <div className="bg-white border-2 border-purple-200 rounded-lg shadow-lg min-w-[200px] hover:shadow-xl transition-all duration-200 hover:scale-[1.02]">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-purple-500 border-2 border-white shadow-md hover:bg-purple-600 transition-colors"
      />

      <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-3 rounded-t-lg border-b border-purple-200">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-purple-100 rounded-md shadow-sm">
            <Split className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-sm font-bold text-purple-800 tracking-wide">SPLIT</span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
          {data.label}
        </h3>
        {data.description && (
          <p className="text-xs text-gray-500 leading-relaxed mb-3">
            {data.description}
          </p>
        )}
        
        <div className="space-y-2">
          {paths.map((path, index) => (
            <div key={path.id} className="flex items-center justify-between text-xs">
              <span className="text-gray-600 font-medium">{path.name}</span>
              <span className="text-purple-600 font-semibold">{path.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic handles for each path */}
      <div className="relative pb-4">
        {paths.map((path, index) => (
          <Handle
            key={path.id}
            type="source"
            position={Position.Bottom}
            id={path.id}
            className="w-3 h-3 bg-purple-500 border-2 border-white shadow-md hover:bg-purple-600 transition-colors"
            style={{ 
              left: `${20 + (index * (60 / Math.max(paths.length - 1, 1)))}%`,
              bottom: '-6px'
            }}
          />
        ))}
        
        {/* Path labels */}
        <div className="flex justify-between px-4 pt-2 text-xs text-purple-600 font-medium">
          {paths.map((path) => (
            <span key={path.id} className="text-center">{path.name}</span>
          ))}
        </div>
      </div>
    </div>
  );
};
