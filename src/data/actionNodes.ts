
  import {
    Clock,
    Mail,
    MessageCircle,
    MessageSquare,
  } from 'lucide-react';
  import { NodeData } from './types';

  export const actionNodes: NodeData[] = [
    // Communication Actions
    {
      id: 'send-email-action',
      label: 'Send Email',
      icon: Mail,
      description: 'Send automated email',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      id: 'send-whatsapp-action',
      label: 'Send Whatsaap Message',
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
  ];
