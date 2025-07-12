import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Handle, Position } from '@xyflow/react';

interface TriggerNodeProps {
  data: {
    label: string;
    id: string;
    icon?: keyof typeof LucideIcons;
    description?: string;
    color?: string;
    type?: string;
    subtitle?: string;
    showWarning?: boolean;
    isConfigured?: boolean;
    openTriggerModal?: () => void;
  };
  isSelected?: boolean;
  onReplaceTrigger?: () => void;
  onOpenConfig?: () => void;
}

// TriggerNode Component
export const TriggerNode = ({ 
  data, 
  isSelected = false, 
  onReplaceTrigger, 
  onOpenConfig 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const IconComponent = React.useMemo(() => {
    if (!data.icon) return LucideIcons.Zap;
    if (typeof data.icon === 'string') return LucideIcons[data.icon] || LucideIcons.Zap;
    if (typeof data.icon === 'function') return data.icon;
    if (React.isValidElement(data.icon)) return () => data.icon;
    if (typeof data.icon === 'object') return data.icon;
    return LucideIcons.Zap;
  }, [data.icon]);

  const handleClick = () => {
    const isDefaultTrigger = data.id === 'trigger-default' || data.label === 'Select Trigger';
    
    if (data.isConfigured && onOpenConfig && !isDefaultTrigger) {
      onOpenConfig();
    } else if (data.openTriggerModal) {
      data.openTriggerModal();
    }
  };

  return (
    <div className="relative">
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
        onClick={handleClick}
        className={`relative bg-white rounded-xl border-2 px-4 py-3 w-[280px] transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer ${
          isSelected
            ? 'border-blue-500 ring-2 ring-blue-200 shadow-md'
            : 'border-gray-200 hover:border-gray-300'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Top colored border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-t-xl"></div>

        <div className="flex items-center gap-3">
          {/* Icon with background */}
          <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
            <IconComponent className={`w-12 h-12 ${
              !data.isConfigured ? 'text-gray-600' : data.color || 'text-blue-600'
            }`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm truncate">
                  {data.isConfigured ? data.label : 'Select Trigger'}
                </h3>
                {/* Warning icon positioned at the end of title */}
                {(!data.isConfigured || data.showWarning) && (
                  <LucideIcons.AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {data.subtitle || 'Trigger'}
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
                  {onReplaceTrigger && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onReplaceTrigger();
                      }}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <LucideIcons.RefreshCw className="w-4 h-4 mr-2" />
                      Replace Trigger
                    </DropdownMenuItem>
                  )}
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