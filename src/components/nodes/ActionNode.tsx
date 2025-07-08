import React from 'react';
import * as LucideIcons from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ActionNodeProps {
  data: {
    label: string;
    id: string;
    icon?: keyof typeof LucideIcons;
    description?: string;
    color?: string;
    type?: string;
    openNodeModal?: (node: any) => void;
  };
  isSelected?: boolean;
  onDelete?: () => void;
}

export const ActionNode: React.FC<ActionNodeProps> = ({ data, isSelected = false, onDelete }) => {
  // Handle both string icon names and direct icon components
  
  const IconComponent = React.useMemo(() => {
    if (!data.icon) {
      return LucideIcons.Phone as React.ComponentType<any>;
    }

    if (typeof data.icon === 'string') {
      return (LucideIcons[data.icon as keyof typeof LucideIcons] || LucideIcons.Phone) as React.ComponentType<any>;
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

    return LucideIcons.Phone as React.ComponentType<any>;
  }, [data.icon]);

  return (
    <div className="relative">
      {/* Main Node - Exact ActivePieces Style */}
      <div className={`bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-all duration-200 px-6 py-6 w-[360px] cursor-pointer ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg'
          : 'border-gray-200 hover:border-gray-300'
      }`}>
        {/* Node Content */}
        <div className="flex items-center gap-3">
          {/* Step Number and Icon */}
          <div className="flex items-center gap-3">
            {/* <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
              {/* {data?.icon} */}
            {/* </div>   */}
              <IconComponent className={`${data.color}`} />

            <div className="text-base font-medium text-gray-700"></div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold text-gray-900">
              {data.label}
            </div>
          </div>

          {/* Dropdown Arrow */}
          <div className="text-gray-400">
            <LucideIcons.ChevronDown className="w-4 h-4" />
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
                  Delete Action
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
};
