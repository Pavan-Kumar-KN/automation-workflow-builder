
import {
  Clock,
  Edit,
  Layers,
  Mail,
  MessageCircle,
  MessageSquare,
  Star,
  Tag,
  UserPlus,
  Users,
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
  },

  // Evalulate actions
  {
    id: 'contact-updated-action',
    label: 'Contact Updated',
    icon: Edit,
    description: 'Add conditional logic based on contact data',
    color: 'bg-orange-50 border-orange-200'
  },
  {
    id: 'contact-tagged-action',
    label: 'Contact Tagged',
    icon: Tag, // Replace Users with Tag
    description: 'Add conditional logic based on contact data',
    color: 'bg-orange-50 border-orange-200'
  },
  {
    id: 'contact-type-action',
    label: 'Contact Type',
    icon: Layers, // Best for categorization
    description: 'Add conditional logic based on contact data',
    color: 'bg-orange-50 border-orange-200'
  },

  // * CRM sub category options 
  {
    id: 'lead-quality',
    label: 'Lead Quality',
    icon: Star, // or BarChart
    description: 'Add conditional logic to workflow',
    color: 'bg-orange-50 border-orange-200'
  },
  {
    id: 'assigned-staff',
    label: 'Assigned Staff',
    icon: UserPlus, // or UserCheck
    description: 'Add conditional logic to workflow',
    color: 'bg-orange-50 border-orange-200'
  }

  // * Forms sub
];
