
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Plus } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkflowStore } from '@/hooks/useWorkflowState';

interface TriggerNodeProps {
  data: {
    label: string;
    id: string;
    icon?: keyof typeof LucideIcons;
    description?: string;
    layoutMode?: string;
    openNodeModal?: (node: any) => void;
    color?: string; // Add color property from node data
  };
}

export const TriggerNode: React.FC<TriggerNodeProps> = ({ data }) => {
  const { edges, nodes } = useWorkflowStore();

  const getIcon = () => {
    if (data.icon && data.icon in LucideIcons) {
      return LucideIcons[data.icon] as React.ComponentType<React.SVGProps<SVGSVGElement>>;
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

  const parseNodeColor = () => {
    // Use the actual color from node data if available
    if (data.color) {
      console.log('🎨 Using node color data:', data.color);

      // Parse Tailwind color classes to determine the color theme
      if (data.color.includes('red')) return 'red';
      if (data.color.includes('green')) return 'green';
      if (data.color.includes('blue')) return 'blue';
      if (data.color.includes('yellow')) return 'yellow';
      if (data.color.includes('purple')) return 'purple';
      if (data.color.includes('indigo')) return 'indigo';
      if (data.color.includes('orange')) return 'orange';
      if (data.color.includes('pink')) return 'pink';
      if (data.color.includes('emerald')) return 'green'; // Map emerald to green
    }

    console.log('🎨 No color data found, using default red');
    return 'red';
  };

  const IconComponent = getIcon();
  const color = parseNodeColor();
  const isHorizontalFlow = data.layoutMode === 'horizontal';

  const handleAddNode = () => {
    console.log('🎯 TriggerNode handleAddNode clicked!');
    // Find the current node and call the modal handler from props
    const currentNode = nodes.find(n => n.data === data);
    console.log('🎯 Found current node:', currentNode);
    if (currentNode && data.openNodeModal) {
      console.log('🎯 Calling openNodeModal...');
      data.openNodeModal(currentNode);
    } else {
      console.log('🎯 Missing currentNode or openNodeModal:', { currentNode: !!currentNode, openNodeModal: !!data.openNodeModal });
    }
  };

  // Check if this node already has an outgoing connection
  const hasOutgoingConnection = edges.some(edge => edge.source === data.id);

  // Color mappings for different trigger types
  const colorClasses = {
    red: {
      border: 'border-red-200',
      bg: 'from-red-50 to-red-100',
      borderB: 'border-red-200',
      iconBg: 'bg-red-100',
      iconText: 'text-red-600',
      handle: 'bg-red-500 hover:bg-red-600'
    },
    green: {
      border: 'border-green-200',
      bg: 'from-green-50 to-green-100',
      borderB: 'border-green-200',
      iconBg: 'bg-green-100',
      iconText: 'text-green-600',
      handle: 'bg-green-500 hover:bg-green-600'
    },
    blue: {
      border: 'border-blue-200',
      bg: 'from-blue-50 to-blue-100',
      borderB: 'border-blue-200',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
      handle: 'bg-blue-500 hover:bg-blue-600'
    },
    yellow: {
      border: 'border-yellow-200',
      bg: 'from-yellow-50 to-yellow-100',
      borderB: 'border-yellow-200',
      iconBg: 'bg-yellow-100',
      iconText: 'text-yellow-600',
      handle: 'bg-yellow-500 hover:bg-yellow-600'
    },
    purple: {
      border: 'border-purple-200',
      bg: 'from-purple-50 to-purple-100',
      borderB: 'border-purple-200',
      iconBg: 'bg-purple-100',
      iconText: 'text-purple-600',
      handle: 'bg-purple-500 hover:bg-purple-600'
    },
    indigo: {
      border: 'border-indigo-200',
      bg: 'from-indigo-50 to-indigo-100',
      borderB: 'border-indigo-200',
      iconBg: 'bg-indigo-100',
      iconText: 'text-indigo-600',
      handle: 'bg-indigo-500 hover:bg-indigo-600'
    },
    orange: {
      border: 'border-orange-200',
      bg: 'from-orange-50 to-orange-100',
      borderB: 'border-orange-200',
      iconBg: 'bg-orange-100',
      iconText: 'text-orange-600',
      handle: 'bg-orange-500 hover:bg-orange-600'
    },
    pink: {
      border: 'border-pink-200',
      bg: 'from-pink-50 to-pink-100',
      borderB: 'border-pink-200',
      iconBg: 'bg-pink-100',
      iconText: 'text-pink-600',
      handle: 'bg-pink-500 hover:bg-pink-600'
    }
  };

  const currentColors = colorClasses[color as keyof typeof colorClasses] || colorClasses.red;

  return (
    <div className={`bg-white border-2 ${currentColors.border} rounded-lg shadow-lg min-w-[200px] hover:shadow-xl transition-all duration-200 hover:scale-[1.02]`}>
      <div className={`bg-gradient-to-r ${currentColors.bg} px-4 py-3 rounded-t-lg border-b ${currentColors.borderB}`}>
        <div className="flex items-center space-x-2">
          <div className={`p-1.5 ${currentColors.iconBg} rounded-md shadow-sm`}>
            <IconComponent className={`w-4 h-4 ${currentColors.iconText}`} />
          </div>
          <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
            {data.label}
          </h3>
        </div>
      </div>


      {/* Single output handle - position depends on layout mode */}
      {/* Horizontal mode: output to RIGHT, Vertical/Freeform mode: output to BOTTOM */}
      <Handle
        type="source"
        position={isHorizontalFlow ? Position.Right : Position.Bottom}
        id={isHorizontalFlow ? "output-right" : "output-bottom"}
        className={`w-3 h-3 ${currentColors.handle} border-2 border-white shadow-md transition-colors`}
        style={isHorizontalFlow ? { top: '50%' } : { left: '50%' }}
      />

      {/* Embedded Plus Button - Only show if no outgoing connection */}
      {!hasOutgoingConnection && (
        <div
          className="absolute pointer-events-auto z-10"
          style={{
            right: isHorizontalFlow ? '-35px' : 'auto',
            bottom: !isHorizontalFlow ? '-35px' : 'auto',
            top: isHorizontalFlow ? '50%' : 'auto',
            left: !isHorizontalFlow ? '50%' : 'auto',
            transform: isHorizontalFlow ? 'translateY(-50%)' : 'translateX(-50%)',
          }}
        >
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 rounded-full text-xs bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-200"
            onClick={handleAddNode}
            title="Add next node"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Modal is now handled at WorkflowBuilder level */}
    </div>
  );
};
