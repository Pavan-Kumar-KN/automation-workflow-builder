
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import * as LucideIcons from 'lucide-react';

interface ExternalAppNodeProps {
  data: {
    label: string;
    id: string;
    icon?: keyof typeof LucideIcons;
    description?: string;
  };
}

export const ExternalAppNode: React.FC<ExternalAppNodeProps> = ({ data }) => {
  const getIcon = () => {
    if (data.icon && data.icon in LucideIcons) {
      return LucideIcons[data.icon] as React.ComponentType<any>;
    }
    
    // Fallback based on ID patterns for common external apps
    if (data.id?.includes('google')) return LucideIcons.Mail;
    if (data.id?.includes('facebook')) return LucideIcons.Facebook;
    if (data.id?.includes('instagram')) return LucideIcons.Instagram;
    if (data.id?.includes('twitter')) return LucideIcons.Twitter;
    if (data.id?.includes('slack')) return LucideIcons.Slack;
    if (data.id?.includes('github')) return LucideIcons.Github;
    if (data.id?.includes('zoom')) return LucideIcons.Video;
    if (data.id?.includes('stripe') || data.id?.includes('payment')) return LucideIcons.CreditCard;
    if (data.id?.includes('mail') || data.id?.includes('email')) return LucideIcons.Mail;
    if (data.id?.includes('calendar')) return LucideIcons.Calendar;
    if (data.id?.includes('drive') || data.id?.includes('dropbox')) return LucideIcons.Cloud;
    if (data.id?.includes('shopify') || data.id?.includes('woo')) return LucideIcons.ShoppingCart;
    return LucideIcons.Link;
  };

  const getColor = () => {
    // Brand-specific colors
    if (data.id?.includes('google')) return 'red';
    if (data.id?.includes('facebook')) return 'blue';
    if (data.id?.includes('instagram')) return 'pink';
    if (data.id?.includes('twitter')) return 'blue';
    if (data.id?.includes('slack')) return 'purple';
    if (data.id?.includes('github')) return 'gray';
    if (data.id?.includes('stripe')) return 'indigo';
    if (data.id?.includes('shopify')) return 'green';
    return 'purple'; // Default purple for external apps
  };

  const IconComponent = getIcon();
  const color = getColor();
  
  const colorClasses = {
    purple: {
      border: 'border-purple-200',
      bg: 'from-purple-50 to-purple-100',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-800',
      handleColor: 'bg-purple-500 hover:bg-purple-600'
    },
    blue: {
      border: 'border-blue-200',
      bg: 'from-blue-50 to-blue-100',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-800',
      handleColor: 'bg-blue-500 hover:bg-blue-600'
    },
    red: {
      border: 'border-red-200',
      bg: 'from-red-50 to-red-100',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      textColor: 'text-red-800',
      handleColor: 'bg-red-500 hover:bg-red-600'
    },
    green: {
      border: 'border-green-200',
      bg: 'from-green-50 to-green-100',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      textColor: 'text-green-800',
      handleColor: 'bg-green-500 hover:bg-green-600'
    },
    pink: {
      border: 'border-pink-200',
      bg: 'from-pink-50 to-pink-100',
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-600',
      textColor: 'text-pink-800',
      handleColor: 'bg-pink-500 hover:bg-pink-600'
    },
    indigo: {
      border: 'border-indigo-200',
      bg: 'from-indigo-50 to-indigo-100',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      textColor: 'text-indigo-800',
      handleColor: 'bg-indigo-500 hover:bg-indigo-600'
    },
    gray: {
      border: 'border-gray-200',
      bg: 'from-gray-50 to-gray-100',
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
      textColor: 'text-gray-800',
      handleColor: 'bg-gray-500 hover:bg-gray-600'
    }
  };

  const classes = colorClasses[color as keyof typeof colorClasses];

  return (
    <div className={`bg-white border-2 ${classes.border} rounded-lg shadow-lg min-w-[200px] hover:shadow-xl transition-all duration-200 hover:scale-[1.02]`}>
      <Handle
        type="target"
        position={Position.Left}
        className={`w-3 h-3 ${classes.handleColor} border-2 border-white shadow-md transition-colors`}
      />

      <div className={`bg-gradient-to-r ${classes.bg} px-4 py-3 rounded-t-lg border-b ${classes.border}`}>
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 ${classes.iconBg} rounded-md shadow-sm`}>
            <IconComponent className={`w-4 h-4 ${classes.iconColor}`} />
          </div>
          <span className={`text-sm font-bold ${classes.textColor} tracking-wide`}>EXTERNAL APP</span>
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

      <Handle
        type="source"
        position={Position.Right}
        className={`w-3 h-3 ${classes.handleColor} border-2 border-white shadow-md transition-colors`}
      />
    </div>
  );
};
