
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Database, 
  Calendar,
  FileText,
  Mail,
  Webhook,
  GitBranch,
  Zap,
  Plus
} from 'lucide-react';

const triggerNodes = [
  { 
    id: 'chat-trigger', 
    label: 'When chat message received', 
    icon: MessageSquare,
    description: 'Triggers when a new chat message is received',
    color: 'bg-red-50 border-red-200'
  },
  { 
    id: 'webhook-trigger', 
    label: 'Webhook received', 
    icon: Webhook,
    description: 'Triggers when webhook is called',
    color: 'bg-red-50 border-red-200'
  },
];

const actionNodes = [
  { 
    id: 'datastore-action', 
    label: 'Customer Datastore', 
    icon: Database,
    description: 'Generate or store customer data',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'process-action', 
    label: 'Set - Prepare fields', 
    icon: FileText,
    description: 'Process and prepare data fields',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'sheets-action', 
    label: 'Create or Update record in Google Sheet', 
    icon: FileText,
    description: 'Add or update Google Sheets records',
    color: 'bg-green-50 border-green-200'
  },
  { 
    id: 'calendar-action', 
    label: 'Google Calendar', 
    icon: Calendar,
    description: 'Create calendar events',
    color: 'bg-yellow-50 border-yellow-200'
  },
  { 
    id: 'email-action', 
    label: 'Send Email', 
    icon: Mail,
    description: 'Send automated emails',
    color: 'bg-purple-50 border-purple-200'
  },
];

const conditionNodes = [
  { 
    id: 'condition', 
    label: 'If/Then Condition', 
    icon: GitBranch,
    description: 'Add conditional logic to workflow',
    color: 'bg-orange-50 border-orange-200'
  },
];

export const Sidebar = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string, nodeData: any) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/nodedata', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  const NodeCategory = ({ title, nodes, nodeType }: { title: string; nodes: any[]; nodeType: string }) => (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
      <div className="space-y-2">
        {nodes.map((node) => {
          const IconComponent = node.icon;
          return (
            <Card
              key={node.id}
              className={`p-3 cursor-grab hover:shadow-md transition-shadow border-2 ${node.color}`}
              draggable
              onDragStart={(event) => onDragStart(event, nodeType, node)}
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-white shadow-sm">
                  <IconComponent className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 leading-tight">
                    {node.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {node.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Workflow Nodes</h2>
          <Badge variant="secondary">
            <Plus className="w-3 h-3 mr-1" />
            Drag to add
          </Badge>
        </div>
        <p className="text-sm text-gray-600">
          Drag and drop nodes to build your automation workflow
        </p>
      </div>

      <NodeCategory title="🔥 Triggers" nodes={triggerNodes} nodeType="trigger" />
      <NodeCategory title="⚡ Actions" nodes={actionNodes} nodeType="action" />
      <NodeCategory title="🎯 Conditions" nodes={conditionNodes} nodeType="condition" />
    </div>
  );
};
