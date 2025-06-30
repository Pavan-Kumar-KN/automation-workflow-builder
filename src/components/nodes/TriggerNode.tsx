
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

  const IconComponent = getIcon();
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
        {/* {data.description && (
          <p className="text-xs text-gray-500 leading-relaxed mb-2">
            {data.description}
          </p>
        )} */}

      </div>

      {/* Single output handle - position depends on layout mode */}
      {/* Horizontal mode: output to RIGHT, Vertical/Freeform mode: output to BOTTOM */}
      <Handle
        type="source"
        position={isHorizontalFlow ? Position.Right : Position.Bottom}
        id={isHorizontalFlow ? "output-right" : "output-bottom"}
        className="w-3 h-3 bg-red-500 border-2 border-white shadow-md hover:bg-red-600 transition-colors"
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
