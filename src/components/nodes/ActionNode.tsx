
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  Database, 
  FileText, 
  Calendar, 
  Mail, 
  Settings,
  ExternalLink 
} from 'lucide-react';

interface ActionNodeProps {
  data: {
    label: string;
    id: string;
    icon?: string;
  };
}

export const ActionNode: React.FC<ActionNodeProps> = ({ data }) => {
  const getIcon = () => {
    if (data.id?.includes('datastore') || data.id?.includes('database')) return Database;
    if (data.id?.includes('calendar')) return Calendar;
    if (data.id?.includes('email') || data.id?.includes('mail')) return Mail;
    if (data.id?.includes('sheets') || data.id?.includes('google')) return ExternalLink;
    if (data.id?.includes('process') || data.id?.includes('prepare')) return FileText;
    return Settings;
  };

  const getColor = () => {
    if (data.id?.includes('sheets') || data.id?.includes('google')) return 'green';
    if (data.id?.includes('calendar')) return 'yellow';
    return 'blue';
  };

  const IconComponent = getIcon();
  const color = getColor();
  
  const colorClasses = {
    blue: {
      border: 'border-blue-200',
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-800',
      handleColor: 'bg-blue-400'
    },
    green: {
      border: 'border-green-200',
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      textColor: 'text-green-800',
      handleColor: 'bg-green-400'
    },
    yellow: {
      border: 'border-yellow-200',
      bg: 'bg-yellow-50',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      textColor: 'text-yellow-800',
      handleColor: 'bg-yellow-400'
    }
  };

  const classes = colorClasses[color as keyof typeof colorClasses];

  return (
    <div className={`bg-white border-2 ${classes.border} rounded-lg shadow-lg min-w-[200px] hover:shadow-xl transition-shadow`}>
      <Handle
        type="target"
        position={Position.Left}
        className={`w-3 h-3 ${classes.handleColor} border-2 border-white`}
      />

      <div className={`${classes.bg} px-4 py-2 rounded-t-lg border-b ${classes.border}`}>
        <div className="flex items-center space-x-2">
          <div className={`p-1 ${classes.iconBg} rounded`}>
            <IconComponent className={`w-4 h-4 ${classes.iconColor}`} />
          </div>
          <span className={`text-sm font-semibold ${classes.textColor}`}>ACTION</span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-gray-900 text-sm leading-tight">
          {data.label}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {data.id?.includes('datastore') && 'Data Management'}
          {data.id?.includes('sheets') && 'Google Workspace'}
          {data.id?.includes('calendar') && 'Schedule Management'}
          {data.id?.includes('email') && 'Email Service'}
          {data.id?.includes('process') && 'Data Processing'}
        </p>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className={`w-3 h-3 ${classes.handleColor} border-2 border-white`}
      />
    </div>
  );
};
