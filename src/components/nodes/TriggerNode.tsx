
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import * as LucideIcons from 'lucide-react';

interface TriggerNodeProps {
  data: {
    label: string;
    id: string;
    icon?: keyof typeof LucideIcons;
    description?: string;
    layoutMode?: string;
  };
}

export const TriggerNode: React.FC<TriggerNodeProps> = ({ data }) => {
  const getIcon = () => {
    if (data.icon && data.icon in LucideIcons) {
      return LucideIcons[data.icon] as React.ComponentType<any>;
    }
    
    // Fallback based on ID patterns
    if (data.id?.includes('form')) return LucideIcons.FileText;
    if (data.id?.includes('contact')) return LucideIcons.Users;
    if (data.id?.includes('calendar') || data.id?.includes('appointment')) return LucideIcons.Calendar;
    if (data.id?.includes('crm') || data.id?.includes('pipeline')) return LucideIcons.Database;
    if (data.id?.includes('subscription') || data.id?.includes('payment')) return LucideIcons.CreditCard;
    if (data.id?.includes('course') || data.id?.includes('lesson')) return LucideIcons.GraduationCap;
    if (data.id?.includes('api') || data.id?.includes('webhook')) return LucideIcons.Webhook;
    if (data.id?.includes('schedule') || data.id?.includes('recurring')) return LucideIcons.Clock;
    return LucideIcons.Zap;
  };

  const IconComponent = getIcon();
  const isVertical = data.layoutMode === 'vertical';

  return (
    <div className="bg-white border-2 border-red-200 rounded-lg shadow-lg min-w-[200px] hover:shadow-xl transition-all duration-200 hover:scale-[1.02]">
      <div className="bg-gradient-to-r from-red-50 to-red-100 px-4 py-3 rounded-t-lg border-b border-red-200">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-red-100 rounded-md shadow-sm">
            <IconComponent className="w-4 h-4 text-red-600" />
          </div>
          <span className="text-sm font-bold text-red-800 tracking-wide">TRIGGER</span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
          {data.label}
        </h3>
        {data.description && (
          <p className="text-xs text-gray-500 leading-relaxed">
            {data.description}
          </p>
        )}
      </div>

      {/* Primary output handle - position depends on layout mode */}
      <Handle
        type="source"
        position={isVertical ? Position.Bottom : Position.Right}
        className="w-3 h-3 bg-red-500 border-2 border-white shadow-md hover:bg-red-600 transition-colors"
      />
      
      {/* Secondary output handle for flexibility - only in horizontal mode */}
      {!isVertical && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 bg-red-500 border-2 border-white shadow-md hover:bg-red-600 transition-colors"
          style={{ left: '50%' }}
        />
      )}
    </div>
  );
};
