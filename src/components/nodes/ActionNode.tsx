import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { Handle, Position } from '@xyflow/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import FlowEdge from '../edges/FlowEdge';

// ActionNode Component
export const ActionNode = ({
  id,
  data,
  isSelected = false,
  onDelete
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const deleteHandler = onDelete || data.onDelete;

  const IconComponent = React.useMemo(() => {
    if (!data.icon) return LucideIcons.Phone;
    if (typeof data.icon === 'string') return LucideIcons[data.icon] || LucideIcons.Phone;
    if (typeof data.icon === 'function') return data.icon;
    if (React.isValidElement(data.icon)) return () => data.icon;
    if (typeof data.icon === 'object') return data.icon;
    return LucideIcons.Phone;
  }, [data.icon]);

  return (
    <div className="relative flex flex-col items-center w-full mt-1">
  


      {/* Top Handle */}
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        className="w-3 bg-white border-2 border-white"
        style={{ left: '50%', bottom: '-12px' }}
      />

      {/* Node Box - ActivePieces Style */}
      <div
        className={`relative bg-white rounded-xl border-2 px-4 py-3 w-[280px] h-[70px] max-w-[280px] transition-all duration-200 shadow-sm hover:shadow-md ${isSelected
          ? 'border-blue-500 ring-2 ring-blue-200 shadow-md'
          : 'border-gray-200 hover:border-gray-300'
          }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >

        <div className="flex items-center gap-3">
          {/* Icon with background */}
          <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ color: data.color }}>
            <IconComponent className={`w-8 h-8 ${data.color || 'text-blue-600'}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm truncate">
                  {data.label}
                </h3>
                {/* Warning icon positioned at the end of title */}
                {data.showWarning && (
                  <LucideIcons.AlertTriangle className="w-4 h-4  flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {data.subtitle || 'Action'}
              </p>
            </div>

            {/* Menu Button */}
            <div className="flex-shrink ml-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`p-1.5 rounded-md transition-all duration-200`}
                  >
                    <LucideIcons.ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      try {
                        deleteHandler?.(id);
                      } catch (err) {
                        console.error('Delete error:', err);
                      }
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LucideIcons.Trash2 className="w-4 h-4 mr-2" />
                    Delete Action
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>


      {/* Bottom Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        className="w-3 bg-white border-2 border-white"
        style={{ left: '50%', bottom: '-6px' }}
      />
    </div>
  );
};