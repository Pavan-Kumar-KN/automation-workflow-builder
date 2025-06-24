
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { MessageSquare, Webhook, Zap } from 'lucide-react';

interface TriggerNodeProps {
  data: {
    label: string;
    id: string;
    icon?: string;
  };
}

export const TriggerNode: React.FC<TriggerNodeProps> = ({ data }) => {
  const getIcon = () => {
    if (data.id?.includes('chat')) return MessageSquare;
    if (data.id?.includes('webhook')) return Webhook;
    return Zap;
  };

  const IconComponent = getIcon();

  return (
    <div className="bg-white border-2 border-red-200 rounded-lg shadow-lg min-w-[200px] hover:shadow-xl transition-shadow">
      <div className="bg-red-50 px-4 py-2 rounded-t-lg border-b border-red-200">
        <div className="flex items-center space-x-2">
          <div className="p-1 bg-red-100 rounded">
            <IconComponent className="w-4 h-4 text-red-600" />
          </div>
          <span className="text-sm font-semibold text-red-800">TRIGGER</span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium text-gray-900 text-sm leading-tight">
          {data.label}
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          {data.id?.includes('chat') ? 'Chat System' : 'External Webhook'}
        </p>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-red-400 border-2 border-white"
      />
    </div>
  );
};
