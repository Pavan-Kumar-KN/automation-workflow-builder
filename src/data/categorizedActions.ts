import {
  Clock,
  Mail,
  MessageCircle,
  MessageSquare
} from 'lucide-react';
import { NodeData } from './types';

export interface ActionCategory {
  id: string;
  name: string;
  icon: any;
  description: string;
  color: string;
  actions: NodeData[];
}

export const categorizedActions: ActionCategory[] = [
  {
    id: 'communication-actions',
    name: 'Communication',
    icon: Mail,
    description: 'Send messages and notifications',
    color: 'bg-blue-50 border-blue-200',
    actions: [
      {
        id: 'send-email-action',
        label: 'Send Email',
        icon: Mail,
        description: 'Send an email to contacts',
        color: 'bg-blue-50 border-blue-200'
      },

      {
        id: 'send-whatsapp-action',
        label: 'Send Whatsapp Message',
        icon: MessageCircle,
        description: 'Send an whatsapp message to contacts',
        color: 'bg-emerald-50 border-emerald-200 text-emerald-600'
      },
      {
        id: 'send-sms-action',
        label: 'Send SMS Message',
        icon: MessageSquare,
        description: 'Send an SMS message to contacts',
        color: 'bg-blue-50 border-blue-200 text-blue-600'
      },
      {
        id: 'delay-action',
        label: 'Delay',
        icon: Clock,
        description: 'Add a delay before or after the action',
        color: 'bg-blue-50 border-blue-200 text-blue-600'
      }
    ]
  },


];

// Helper function to get all actions in a flat array
export const getAllActions = (): NodeData[] => {
  return categorizedActions.flatMap(category => category.actions);
};

// Helper function to get actions by category
export const getActionsByCategory = (categoryId: string): NodeData[] => {
  const category = categorizedActions.find(cat => cat.id === categoryId);
  return category ? category.actions : [];
};
