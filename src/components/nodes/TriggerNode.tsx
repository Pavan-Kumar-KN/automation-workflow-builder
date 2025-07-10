import React from 'react';
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
    isConfigured?: boolean;
    openTriggerModal?: () => void;
  };
  isSelected?: boolean;
  onReplaceTrigger?: () => void;
  onOpenConfig?: () => void;
}

export const TriggerNode: React.FC<TriggerNodeProps> = ({ data, isSelected = false, onReplaceTrigger, onOpenConfig }) => {
  // Handle both string icon names and direct icon components
  const IconComponent = React.useMemo(() => {
    if (!data.icon) {
      return LucideIcons.Zap as React.ComponentType<any>;
    }

    if (typeof data.icon === 'string') {
      return (LucideIcons[data.icon as keyof typeof LucideIcons] || LucideIcons.Zap) as React.ComponentType<any>;
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

    return LucideIcons.Zap as React.ComponentType<any>;
  }, [data.icon]);

  // Extract colors from the color string (e.g., "bg-red-50 border-red-200")
  const getIconColors = () => {
    if (!data.isConfigured) {
      return {
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-600'
      };
    }

    if (data.color) {
      // Extract the base color from the color string
      const colorMatch = data.color.match(/bg-(\w+)-\d+/);
      if (colorMatch) {
        const baseColor = colorMatch[1];
        return {
          bgColor: `bg-${baseColor}-100`,
          textColor: `text-${baseColor}-600`
        };
      }
    }

    // Fallback to red if no color is specified
    return {
      bgColor: 'bg-red-100',
      textColor: 'text-red-600'
    };
  };

  const { bgColor, textColor } = getIconColors();

  const handleClick = () => {
    // Check if this is the default trigger (by ID or label)
    const isDefaultTrigger = data.id === 'trigger-default' || data.label === 'Select Trigger';

    // Only open config panel if configured AND not the default trigger
    if (data.isConfigured && onOpenConfig && !isDefaultTrigger) {
      onOpenConfig();
    } else if (data.openTriggerModal) {
      // For default trigger or unconfigured triggers, open trigger selection modal
      data.openTriggerModal();
    }
  };

  const handleReplaceTrigger = () => {
    if (onReplaceTrigger) {
      onReplaceTrigger();
    }
  };

  return (
    <div className="relative">
      {/* Input Handle - for connections coming INTO this node */}
      <Handle
        type="target"
        position={Position.Top}
        id="in"
        style={{ 
          background: 'transparent',
          border: 'none',
          width: 1,
          height: 1,
          minWidth: 1,
          minHeight: 1,
          top: -1
        }}
      />

      {/* Main Node - Exact ActivePieces Style */}
      <div
        onClick={handleClick}
        className={`bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-all duration-200 px-6 py-6 w-[360px] cursor-pointer ${isSelected
            ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg'
            : 'border-gray-200 hover:border-gray-300'
          }`}
      >
        {/* Node Content */}
        <div className="flex items-center gap-3">
          {/* Step Number and Icon */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${bgColor}`}>
              <IconComponent className={`w-5 h-5 ${textColor}`} />
            </div>
            <div className="text-base font-medium text-gray-700">1.</div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold text-gray-900">
              {data.isConfigured ? data.label : 'Select Trigger'}
            </div>
          </div>

          {/* Dropdown Arrow */}
          <div className="text-gray-400">
            <LucideIcons.ChevronDown className="w-4 h-4" />
          </div>

          {/* Warning Icon - Only show if not configured */}
          {!data.isConfigured && (
            <div className="text-orange-500">
              <LucideIcons.AlertTriangle className="w-4 h-4" />
            </div>
          )}

          {/* 3-Dot Menu - Show for all triggers */}
          {onReplaceTrigger && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                  title="More options"
                >
                  <LucideIcons.MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReplaceTrigger();
                  }}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <LucideIcons.RefreshCw className="w-4 h-4 mr-2" />
                  Replace Trigger
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Output Handle - for connections going OUT of this node */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="out"
        style={{ 
          background: 'transparent',
          border: 'none',
          width: 1,
          height: 1,
          minWidth: 1,
          minHeight: 1,
          bottom: -1
        }}
      />
    </div>
  );
};