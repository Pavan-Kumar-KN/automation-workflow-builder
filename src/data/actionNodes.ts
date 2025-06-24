
import { 
  Mail,
  MessageSquare,
  Phone,
  Clock,
  GitBranch,
  Edit,
  UserPlus,
  Tag,
  Trash2,
  UserCheck,
  Database,
  Star,
  Users,
  ShoppingCart,
  Zap,
  Share2,
  CreditCard,
  Calendar,
  XCircle,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  PlayCircle,
  StopCircle,
  Webhook,
  Globe,
  Bell,
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
    label: 'Send WhatsApp Message', 
    icon: MessageSquare,
    description: 'Send WhatsApp message',
    color: 'bg-green-50 border-green-200'
  },
  { 
    id: 'send-sms-action', 
    label: 'Send SMS', 
    icon: Phone,
    description: 'Send SMS message',
    color: 'bg-purple-50 border-purple-200'
  },
  
  // Utility Actions
  { 
    id: 'delay-action', 
    label: 'Delay', 
    icon: Clock,
    description: 'Wait for specified time',
    color: 'bg-yellow-50 border-yellow-200'
  },
  { 
    id: 'evaluate-condition-action', 
    label: 'Evaluate Condition', 
    icon: GitBranch,
    description: 'Check conditions and branch',
    color: 'bg-orange-50 border-orange-200'
  },
  
  // Contact Management Actions
  { 
    id: 'update-contact-action', 
    label: 'Update Contact Attribute', 
    icon: Edit,
    description: 'Update contact information',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'convert-lead-action', 
    label: 'Convert Lead to Customer', 
    icon: UserPlus,
    description: 'Convert lead to customer',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'tag-contact-action', 
    label: 'Tag Contact', 
    icon: Tag,
    description: 'Add tag to contact',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'remove-tag-action', 
    label: 'Remove Tag', 
    icon: Trash2,
    description: 'Remove tag from contact',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'remove-contact-action', 
    label: 'Remove Contact', 
    icon: UserCheck,
    description: 'Remove contact from group',
    color: 'bg-blue-50 border-blue-200'
  },
  
  // CRM Actions
  { 
    id: 'add-to-crm-action', 
    label: 'Add/Update to CRM', 
    icon: Database,
    description: 'Add or update CRM record',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'remove-from-crm-action', 
    label: 'Remove From CRM', 
    icon: Trash2,
    description: 'Remove from CRM system',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'change-lead-quality-action', 
    label: 'Change Lead Quality', 
    icon: Star,
    description: 'Update lead quality score',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'assign-staff-action', 
    label: 'Assign to Staff', 
    icon: Users,
    description: 'Assign contact to staff member',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'remove-staff-action', 
    label: 'Remove Assigned Staff', 
    icon: UserCheck,
    description: 'Remove staff assignment',
    color: 'bg-blue-50 border-blue-200'
  },
  
  // Forms Actions
  { 
    id: 'product-form-action', 
    label: 'Product Form', 
    icon: ShoppingCart,
    description: 'Create product enquiry form',
    color: 'bg-green-50 border-green-200'
  },
  { 
    id: 'magic-form-action', 
    label: 'Magic Form', 
    icon: Zap,
    description: 'Create dynamic form',
    color: 'bg-green-50 border-green-200'
  },
  { 
    id: 'facebook-form-action', 
    label: 'Facebook Form', 
    icon: Share2,
    description: 'Create Facebook lead form',
    color: 'bg-green-50 border-green-200'
  },
  
  // Sales Actions
  { 
    id: 'invoice-amount-action', 
    label: 'Invoice Amount', 
    icon: CreditCard,
    description: 'Set invoice amount',
    color: 'bg-green-50 border-green-200'
  },
  
  // Calendar Actions
  { 
    id: 'book-appointment-action', 
    label: 'Book Appointment', 
    icon: Calendar,
    description: 'Schedule new appointment',
    color: 'bg-yellow-50 border-yellow-200'
  },
  { 
    id: 'cancel-appointment-action', 
    label: 'Cancel Appointment', 
    icon: XCircle,
    description: 'Cancel existing appointment',
    color: 'bg-yellow-50 border-yellow-200'
  },
  { 
    id: 'reschedule-appointment-action', 
    label: 'Reschedule Appointment', 
    icon: RefreshCw,
    description: 'Change appointment time',
    color: 'bg-yellow-50 border-yellow-200'
  },
  { 
    id: 'change-appointment-status-action', 
    label: 'Change Appointment Status', 
    icon: Settings,
    description: 'Update appointment status',
    color: 'bg-yellow-50 border-yellow-200'
  },
  
  // Course Actions
  { 
    id: 'course-access-action', 
    label: 'Grant Course Access', 
    icon: Eye,
    description: 'Give access to course',
    color: 'bg-purple-50 border-purple-200'
  },
  { 
    id: 'course-revoke-action', 
    label: 'Revoke Course Access', 
    icon: EyeOff,
    description: 'Remove course access',
    color: 'bg-purple-50 border-purple-200'
  },
  
  // Community Actions
  { 
    id: 'community-access-action', 
    label: 'Grant Community Access', 
    icon: Users,
    description: 'Give community access',
    color: 'bg-indigo-50 border-indigo-200'
  },
  { 
    id: 'community-revoke-action', 
    label: 'Revoke Community Access', 
    icon: UserCheck,
    description: 'Remove community access',
    color: 'bg-indigo-50 border-indigo-200'
  },
  { 
    id: 'chat-group-action', 
    label: 'Add to Chat Group', 
    icon: MessageSquare,
    description: 'Add to chat group',
    color: 'bg-indigo-50 border-indigo-200'
  },
  { 
    id: 'chat-group-revoke-action', 
    label: 'Remove from Chat Group', 
    icon: Trash2,
    description: 'Remove from chat group',
    color: 'bg-indigo-50 border-indigo-200'
  },
  
  // Automation Actions
  { 
    id: 'execute-automation-action', 
    label: 'Execute Automation', 
    icon: PlayCircle,
    description: 'Run another automation',
    color: 'bg-gray-50 border-gray-200'
  },
  { 
    id: 'exit-workflow-action', 
    label: 'Exit Workflow', 
    icon: StopCircle,
    description: 'Stop workflow execution',
    color: 'bg-gray-50 border-gray-200'
  },
  
  // Webhook Actions
  { 
    id: 'webhook-action', 
    label: 'Send Webhook', 
    icon: Webhook,
    description: 'Send data to external service',
    color: 'bg-gray-50 border-gray-200'
  },
  { 
    id: 'webhook-advance-action', 
    label: 'Advanced Webhook', 
    icon: Globe,
    description: 'Advanced webhook configuration',
    color: 'bg-gray-50 border-gray-200'
  },
  { 
    id: 'internal-notification-action', 
    label: 'Internal Notification', 
    icon: Bell,
    description: 'Send internal notification',
    color: 'bg-gray-50 border-gray-200'
  },
  { 
    id: 'register-webinar-action', 
    label: 'Register to Webinar', 
    icon: Users,
    description: 'Register contact for webinar',
    color: 'bg-gray-50 border-gray-200'
  },
];
