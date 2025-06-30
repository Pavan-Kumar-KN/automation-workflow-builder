import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Plus } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkflowStore } from '@/hooks/useWorkflowState';

interface ActionNodeProps {
  data: {
    label: string;
    id: string;
    icon?: keyof typeof LucideIcons;
    description?: string;
    layoutMode?: string;
    openNodeModal?: (node: any) => void;
  };
}

export const ActionNode: React.FC<ActionNodeProps> = ({ data }) => {
  const { edges, nodes } = useWorkflowStore();

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
    // Check both ID and label for color determination
    const idLower = data.id?.toLowerCase() || '';
    const labelLower = data.label?.toLowerCase() || '';

    console.log('🎨 Node color detection:', { id: data.id, label: data.label, idLower, labelLower });

    // Communication actions
    if (idLower.includes('whatsapp') || labelLower.includes('whatsapp')) {
      console.log('🎨 Returning GREEN for WhatsApp');
      return 'green';
    }
    if (idLower.includes('sms') || idLower.includes('phone') || labelLower.includes('sms') || labelLower.includes('phone')) {
      console.log('🎨 Returning PURPLE for SMS/Phone');
      return 'purple';
    }
    if (idLower.includes('email') || idLower.includes('mail') || labelLower.includes('email') || labelLower.includes('mail')) {
      console.log('🎨 Returning BLUE for Email');
      return 'blue';
    }

    // Time-based actions
    if (idLower.includes('delay') || idLower.includes('schedule') || labelLower.includes('delay') || labelLower.includes('schedule')) {
      console.log('🎨 Returning YELLOW for Delay/Schedule');
      return 'yellow';
    }

    // Condition actions
    if (idLower.includes('condition') || idLower.includes('evaluate') || labelLower.includes('condition') || labelLower.includes('evaluate')) {
      console.log('🎨 Returning ORANGE for Condition');
      return 'orange';
    }

    // Course/Community actions
    if (idLower.includes('course') || idLower.includes('community') || labelLower.includes('course') || labelLower.includes('community')) {
      console.log('🎨 Returning INDIGO for Course/Community');
      return 'indigo';
    }

    // Tag actions
    if (idLower.includes('tag') || labelLower.includes('tag')) {
      console.log('🎨 Returning PURPLE for Tag');
      return 'purple';
    }

    console.log('🎨 Returning DEFAULT BLUE');
    return 'blue';
  };

  const IconComponent = getIcon();
  const color = getColor();
  // Handle positioning logic:
  // Horizontal mode: left/right handles (left-to-right flow)
  // Vertical mode: top/bottom handles (top-to-bottom flow)
  // Freeform mode: use vertical style (top/bottom handles)
  const isHorizontalFlow = data.layoutMode === 'horizontal';
  
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

  const handleAddNode = () => {
    console.log('🎯 ActionNode handleAddNode clicked!');
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

  return (
    <div className={`bg-white border-2 ${classes.border} rounded-lg shadow-lg min-w-[200px] hover:shadow-xl transition-all duration-200 hover:scale-[1.02]`}>

      {/* Input connection points - positioned based on layout mode */}
      {/* Horizontal mode: receive from LEFT (previous node outputs to right) */}
      {/* Vertical/Freeform mode: receive from TOP (previous node outputs to bottom) */}

      {isHorizontalFlow ? (
        <Handle
          type="target"
          position={Position.Left}
          id="input-left-center"
          className={`w-3 h-3 ${classes.handleColor} border-2 border-white shadow-md transition-colors`}
          style={{ top: '50%' }}
        />
      ) : (
        <Handle
          type="target"
          position={Position.Top}
          id="input-top-center"
          className={`w-3 h-3 ${classes.handleColor} border-2 border-white shadow-md transition-colors`}
          style={{ left: '50%' }}
        />
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

      </div>

      {/* Output connection points - positioned based on layout mode */}
      {/* Horizontal mode: output to RIGHT (next node receives from left) */}
      {/* Vertical/Freeform mode: output to BOTTOM (next node receives from top) */}
      {isHorizontalFlow ? (
        <Handle
          type="source"
          position={Position.Right}
          id="output-right"
          className={`w-3 h-3 ${classes.handleColor} border-2 border-white shadow-md transition-colors`}
          style={{ top: '50%' }}
          // Note: Connection limit (1 outgoing connection) enforced in WorkflowBuilder onConnect
        />
      ) : (
        <Handle
          type="source"
          position={Position.Bottom}
          id="output-bottom"
          className={`w-3 h-3 ${classes.handleColor} border-2 border-white shadow-md transition-colors`}
          style={{ left: '50%' }}
          // Note: Connection limit (1 outgoing connection) enforced in WorkflowBuilder onConnect
        />
      )}

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
