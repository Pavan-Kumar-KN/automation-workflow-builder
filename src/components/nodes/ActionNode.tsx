import React from 'react';
import { Handle, Position } from '@xyflow/react';
import * as LucideIcons from 'lucide-react';

interface ActionNodeProps {
  data: {
    label: string;
    id: string;
    icon?: keyof typeof LucideIcons;
    description?: string;
    layoutMode?: string;
  };
}

export const ActionNode: React.FC<ActionNodeProps> = ({ data }) => {
  const getIcon = () => {
    if (data.icon && data.icon in LucideIcons) {
      return LucideIcons[data.icon] as React.ComponentType<React.SVGProps<SVGSVGElement>>;
    }
    
    // Fallback based on ID patterns
    if (data.id?.includes('email') || data.id?.includes('mail')) return LucideIcons.Mail;
    if (data.id?.includes('whatsapp') || data.id?.includes('message')) return LucideIcons.MessageSquare;
    if (data.id?.includes('sms') || data.id?.includes('phone')) return LucideIcons.Phone;
    if (data.id?.includes('delay') || data.id?.includes('wait')) return LucideIcons.Clock;
    if (data.id?.includes('condition') || data.id?.includes('evaluate')) return LucideIcons.GitBranch;
    if (data.id?.includes('contact') || data.id?.includes('lead')) return LucideIcons.Users;
    if (data.id?.includes('crm') || data.id?.includes('database')) return LucideIcons.Database;
    if (data.id?.includes('form')) return LucideIcons.FileText;
    if (data.id?.includes('calendar') || data.id?.includes('appointment')) return LucideIcons.Calendar;
    if (data.id?.includes('course') || data.id?.includes('access')) return LucideIcons.GraduationCap;
    if (data.id?.includes('community') || data.id?.includes('group')) return LucideIcons.Users;
    if (data.id?.includes('webhook') || data.id?.includes('api')) return LucideIcons.Webhook;
    if (data.id?.includes('automation') || data.id?.includes('execute')) return LucideIcons.PlayCircle;
    if (data.id?.includes('tag')) return LucideIcons.Tag;
    return LucideIcons.Settings;
  };

  const getColor = () => {
    // Communication actions
    if (data.id?.includes('whatsapp')) return 'green';
    if (data.id?.includes('sms') || data.id?.includes('phone')) return 'purple';
    
    // Time-based actions
    if (data.id?.includes('delay') || data.id?.includes('schedule')) return 'yellow';
    
    // Condition actions
    if (data.id?.includes('condition') || data.id?.includes('evaluate')) return 'orange';
    
    // Course/Community actions
    if (data.id?.includes('course') || data.id?.includes('community')) return 'indigo';
    
    // Default blue for most actions
    return 'blue';
  };

  const IconComponent = getIcon();
  const color = getColor();
  const isVertical = data.layoutMode === 'vertical';
  
  const colorClasses = {
    blue: {
      border: 'border-blue-200',
      bg: 'from-blue-50 to-blue-100',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-800',
      handleColor: 'bg-blue-500 hover:bg-blue-600'
    },
    green: {
      border: 'border-green-200',
      bg: 'from-green-50 to-green-100',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      textColor: 'text-green-800',
      handleColor: 'bg-green-500 hover:bg-green-600'
    },
    yellow: {
      border: 'border-yellow-200',
      bg: 'from-yellow-50 to-yellow-100',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      textColor: 'text-yellow-800',
      handleColor: 'bg-yellow-500 hover:bg-yellow-600'
    },
    purple: {
      border: 'border-purple-200',
      bg: 'from-purple-50 to-purple-100',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-800',
      handleColor: 'bg-purple-500 hover:bg-purple-600'
    },
    orange: {
      border: 'border-orange-200',
      bg: 'from-orange-50 to-orange-100',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      textColor: 'text-orange-800',
      handleColor: 'bg-orange-500 hover:bg-orange-600'
    },
    indigo: {
      border: 'border-indigo-200',
      bg: 'from-indigo-50 to-indigo-100',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      textColor: 'text-indigo-800',
      handleColor: 'bg-indigo-500 hover:bg-indigo-600'
    }
  };

  const classes = colorClasses[color as keyof typeof colorClasses];

  return (
    <div className={`bg-white border-2 ${classes.border} rounded-lg shadow-lg min-w-[200px] hover:shadow-xl transition-all duration-200 hover:scale-[1.02]`}>
      {/* Input connection points - positioned based on layout mode */}
      {/* Multiple input handles to accept connections from multiple triggers */}
      {isVertical ? (
        <>
          <Handle
            type="target"
            position={Position.Top}
            id="input-top-center"
            className={`w-3 h-3 ${classes.handleColor} border-2 border-white shadow-md transition-colors`}
            style={{ left: '50%' }}
          />
          <Handle
            type="target"
            position={Position.Top}
            id="input-top-left"
            className={`w-3 h-3 ${classes.handleColor} border-2 border-white shadow-md transition-colors`}
            style={{ left: '30%' }}
          />
          <Handle
            type="target"
            position={Position.Top}
            id="input-top-right"
            className={`w-3 h-3 ${classes.handleColor} border-2 border-white shadow-md transition-colors`}
            style={{ left: '70%' }}
          />
        </>
      ) : (
        <>
          <Handle
            type="target"
            position={Position.Left}
            id="input-left-center"
            className={`w-3 h-3 ${classes.handleColor} border-2 border-white shadow-md transition-colors`}
            style={{ top: '50%' }}
          />
          <Handle
            type="target"
            position={Position.Left}
            id="input-left-top"
            className={`w-3 h-3 ${classes.handleColor} border-2 border-white shadow-md transition-colors`}
            style={{ top: '30%' }}
          />
          <Handle
            type="target"
            position={Position.Left}
            id="input-left-bottom"
            className={`w-3 h-3 ${classes.handleColor} border-2 border-white shadow-md transition-colors`}
            style={{ top: '70%' }}
          />
          <Handle
            type="target"
            position={Position.Top}
            id="input-top"
            className={`w-3 h-3 ${classes.handleColor} border-2 border-white shadow-md transition-colors`}
            style={{ left: '50%' }}
          />
        </>
      )}

      <div className={`bg-gradient-to-r ${classes.bg} px-4 py-3 rounded-t-lg border-b ${classes.border}`}>
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 ${classes.iconBg} rounded-md shadow-sm`}>
            <IconComponent className={`w-4 h-4 ${classes.iconColor}`} />
          </div>
          <span className={`text-sm font-bold ${classes.textColor} tracking-wide`}>ACTION</span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
          {data.label}
        </h3>
        {/* {data.description && (
          <p className="text-xs text-gray-500 leading-relaxed mb-2">
            {data.description}
          </p>
        )} */}

      </div>

      {/* Output connection points - positioned based on layout mode */}
      {isVertical ? (
        <Handle
          type="source"
          position={Position.Bottom}
          id="output-bottom"
          className={`w-3 h-3 ${classes.handleColor} border-2 border-white shadow-md transition-colors`}
          style={{ left: '50%' }}
        />
      ) : (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="output-right"
            className={`w-3 h-3 ${classes.handleColor} border-2 border-white shadow-md transition-colors`}
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="output-bottom"
            className={`w-3 h-3 ${classes.handleColor} border-2 border-white shadow-md transition-colors`}
            style={{ left: '50%' }}
          />
        </>
      )}
    </div>
  );
};
