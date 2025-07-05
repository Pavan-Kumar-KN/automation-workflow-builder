import React from 'react';
import * as LucideIcons from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ConditionNodeProps {
  data: {
    label: string;
    id: string;
    icon?: keyof typeof LucideIcons;
    description?: string;
    layoutMode?: string;
    color?: string;
    type?: string;
    condition?: string;
    field?: string;
  };
  isSelected?: boolean;
  onAddNode?: (branchType: 'true' | 'false' | 'after') => void;
  onDelete?: () => void;
}

export const ConditionNode: React.FC<ConditionNodeProps> = ({ data, isSelected = false, onAddNode, onDelete }) => {

  // Handle both string icon names and direct icon components
  const IconComponent = React.useMemo(() => {
    if (!data.icon) {
      return LucideIcons.GitBranch as React.ComponentType<any>;
    }

    if (typeof data.icon === 'string') {
      return (LucideIcons[data.icon as keyof typeof LucideIcons] || LucideIcons.GitBranch) as React.ComponentType<any>;
    }

    if (typeof data.icon === 'function') {
      return data.icon as React.ComponentType<any>;
    }

    if (React.isValidElement(data.icon)) {
      // If it's already a React element, wrap it in a component
      return () => data.icon;
    }

    // If it's an object with displayName or name (Lucide icon component)
    if (data.icon && typeof data.icon === 'object' && ((data.icon as any).displayName || (data.icon as any).name)) {
      return data.icon as React.ComponentType<any>;
    }

    return LucideIcons.GitBranch as React.ComponentType<any>;
  }, [data.icon]);

  const handleAddNodeToBranch = (branchType: 'branch1' | 'otherwise') => {
    // Call the parent's onAddNode function to open action modal
    if (onAddNode) {
      onAddNode(branchType === 'branch1' ? 'true' : 'false');
    }
  };



  return (
    <div className="relative flex flex-col items-center w-full">
      {/* Main Condition Node */}
      <div
        className={`bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-all duration-200 px-6 py-4 w-[360px] cursor-pointer ${isSelected
            ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg'
            : 'border-gray-200 hover:border-gray-300'
          }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
              <IconComponent className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-base font-medium text-gray-700">3.</div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold text-gray-900">
              {data.label || 'Router'}
            </div>
          </div>
          <div className="text-gray-400">
            <LucideIcons.ChevronDown className="w-4 h-4" />
          </div>
          <div className="text-orange-500">
            <LucideIcons.AlertTriangle className="w-4 h-4" />
          </div>

          {/* Delete Menu */}
          {onDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-gray-400 hover:text-gray-600 p-1 ml-2">
                  <LucideIcons.MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LucideIcons.Trash2 className="w-4 h-4 mr-2" />
                  Delete Node
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Vertical line down */}
      <div className="w-0.5 h-8 bg-gray-300"></div>

      {/* Branching Structure with Curved Lines */}
      <div className="relative w-full max-w-[600px]">
        {/* SVG for curved branching lines */}
        <svg className="absolute inset-0 w-full pointer-events-none" viewBox="0 0 600 300" style={{ height: '300px' }}>
          {/* Top horizontal line */}
          <line x1="300" y1="0" x2="300" y2="20" stroke="#d1d5db" strokeWidth="2" />

          {/* Left branch curve */}
          <path
            d="M 300 20 Q 150 40 150 80"
            stroke="#d1d5db"
            strokeWidth="2"
            fill="none"
          />

          {/* Right branch curve */}
          <path
            d="M 300 20 Q 450 40 450 80"
            stroke="#d1d5db"
            strokeWidth="2"
            fill="none"
          />

          {/* Left vertical line */}
          <line x1="150" y1="80" x2="150" y2="200" stroke="#d1d5db" strokeWidth="2" />

          {/* Right vertical line */}
          <line x1="450" y1="200" x2="450" y2="80" stroke="#d1d5db" strokeWidth="2" />

          {/* Left convergence curve */}
          <path
            d="M 150 200 Q 150 240 300 260"
            stroke="#d1d5db"
            strokeWidth="2"
            fill="none"
          />

          {/* Right convergence curve */}
          <path
            d="M 450 200 Q 450 240 300 260"
            stroke="#d1d5db"
            strokeWidth="2"
            fill="none"
          />

          {/* Bottom vertical line */}
          <line x1="300" y1="260" x2="300" y2="300" stroke="#d1d5db" strokeWidth="2" />
        </svg>

        {/* Branch containers */}
        <div className="flex justify-between items-start pt-20 relative z-10">
          {/* Branch 1 (Left) */}
          <div className="flex flex-col items-center w-1/2">
            <div className="bg-purple-100 border border-purple-300 rounded-lg px-3 py-1 text-xs font-medium text-purple-700 mb-4">
              Branch 1 :
            </div>

            {/* Plus button for Branch 1 */}
            <button
              onClick={() => handleAddNodeToBranch('branch1')}
              className="w-12 h-12 bg-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer my-4 transition-colors"
            >
              <LucideIcons.Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Otherwise (Right) */}
          <div className="flex flex-col items-center w-1/2">
            <div className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-1 text-xs font-medium text-gray-600 mb-4">
              Otherwise
            </div>

            {/* Plus button for Otherwise */}
            <button
              onClick={() => handleAddNodeToBranch('otherwise')}
              className="w-12 h-12 bg-gray-100 border-2 border-gray-300 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer my-4 transition-colors"
            >
              <LucideIcons.Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Vertical line down from convergence */}
      <div className="w-0.5 h-8 bg-gray-300"></div>
    </div>
  );
};