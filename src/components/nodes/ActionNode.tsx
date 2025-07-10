import React from 'react';
import * as LucideIcons from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Handle, Position } from '@xyflow/react';

interface ActionNodeProps {
  data: {
    label: string;
    id: string;
    icon?: keyof typeof LucideIcons;
    description?: string;
    color?: string;
    type?: string;
    openNodeModal?: (node: any) => void;
    onDelete?: () => void;
  };
  isSelected?: boolean;
  onDelete?: () => void;
}

export const ActionNode: React.FC<ActionNodeProps> = ({ data, isSelected = false, onDelete }) => {
  // In React Flow, onDelete might be passed in data object
  const deleteHandler = onDelete || data.onDelete;
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
      {/* Top Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        style={{ background: '#4CAF50', border: '2px solid #fff' }}
      />

      {/* Main Node Container */}
      <div className={`bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-all duration-200 px-6 py-6 w-[360px] cursor-pointer ${isSelected
          ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg'
          : 'border-gray-200 hover:border-gray-300'
        }`}>
        
        {/* Node Content */}
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <IconComponent className={`w-6 h-6 ${data.color || 'text-gray-600'}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold text-gray-900">
              {data.label}
            </div>
          </div>

          {/* 3-Dot Menu */}
          <div className="flex-shrink-0 ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
                  onClick={(e) => e.stopPropagation()} // Prevent node selection when clicking menu
                  title="More options"
                >
                  <LucideIcons.MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    try {
                      if (deleteHandler) {
                        deleteHandler();
                        console.log('✅ Delete function called successfully');
                      } 
                    } catch (error) {
                      console.error('❌ Error calling deleteHandler:', error);
                    }
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LucideIcons.Trash2 className="w-4 h-4 mr-2" />
                  Delete Action
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('🔍 Debug - onDelete prop:', onDelete);
                    console.log('🔍 Debug - data.onDelete:', data.onDelete);
                    console.log('🔍 Debug - deleteHandler:', deleteHandler);
                    console.log('🔍 Debug - data:', data);
                  }}
                  className="text-gray-600"
                >
                  <LucideIcons.Info className="w-4 h-4 mr-2" />
                  Debug Info
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>  

      {/* Bottom Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        style={{ background: '#4CAF50', border: '2px solid #fff' }}
      />
    </div>
  );
};