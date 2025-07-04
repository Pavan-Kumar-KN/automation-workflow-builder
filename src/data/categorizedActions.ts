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
  User,
  Package,
  BarChart,
  FileText,
  Send
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
  // {
  //   id: 'communication-actions',
  //   name: 'Communication',
  //   icon: Mail,
  //   description: 'Send messages and notifications',
  //   color: 'bg-blue-50 border-blue-200',
  //   actions: [
  //     {
  //       id: 'send-email-action',
  //       label: 'Send Email',
  //       icon: Mail,
  //       description: 'Send an email to contacts',
  //       color: 'bg-blue-50 border-blue-200'
  //     },
  //     {
  //       id: 'send-sms-action',
  //       label: 'Send SMS',
  //       icon: MessageSquare,
  //       description: 'Send SMS message to contacts',
  //       color: 'bg-green-50 border-green-200'
  //     },
  //     {
  //       id: 'send-notification-action',
  //       label: 'Send Notification',
  //       icon: Bell,
  //       description: 'Send push notification',
  //       color: 'bg-purple-50 border-purple-200'
  //     },
  //     {
  //       id: 'make-phone-call-action',
  //       label: 'Make Phone Call',
  //       icon: Phone,
  //       description: 'Initiate automated phone call',
  //       color: 'bg-orange-50 border-orange-200'
  //     }
  //   ]
  // },
  // {
  //   id: 'contact-actions',
  //   name: 'Contact Management',
  //   icon: User,
  //   description: 'Manage and update contacts',
  //   color: 'bg-green-50 border-green-200',
  //   actions: [
  //     {
  //       id: 'update-contact-action',
  //       label: 'Update Contact',
  //       icon: Edit,
  //       description: 'Update contact information',
  //       color: 'bg-blue-50 border-blue-200'
  //     },
  //     {
  //       id: 'add-to-list-action',
  //       label: 'Add to List',
  //       icon: UserPlus,
  //       description: 'Add contact to a specific list',
  //       color: 'bg-green-50 border-green-200'
  //     },
  //     {
  //       id: 'remove-from-list-action',
  //       label: 'Remove from List',
  //       icon: UserCheck,
  //       description: 'Remove contact from a list',
  //       color: 'bg-red-50 border-red-200'
  //     },
  //     {
  //       id: 'tag-contact-action',
  //       label: 'Tag Contact',
  //       icon: Tag,
  //       description: 'Add tags to contact',
  //       color: 'bg-yellow-50 border-yellow-200'
  //     },
  //     {
  //       id: 'delete-contact-action',
  //       label: 'Delete Contact',
  //       icon: Trash2,
  //       description: 'Remove contact from system',
  //       color: 'bg-red-50 border-red-200'
  //     }
  //   ]
  // },
  // {
  //   id: 'ecommerce-actions',
  //   name: 'E-commerce',
  //   icon: ShoppingCart,
  //   description: 'Product and order management',
  //   color: 'bg-orange-50 border-orange-200',
  //   actions: [
  //     {
  //       id: 'create-order-action',
  //       label: 'Create Order',
  //       icon: ShoppingCart,
  //       description: 'Create a new order',
  //       color: 'bg-green-50 border-green-200'
  //     },
  //     {
  //       id: 'update-inventory-action',
  //       label: 'Update Inventory',
  //       icon: Package,
  //       description: 'Update product inventory',
  //       color: 'bg-blue-50 border-blue-200'
  //     },
  //     {
  //       id: 'apply-discount-action',
  //       label: 'Apply Discount',
  //       icon: Tag,
  //       description: 'Apply discount to customer',
  //       color: 'bg-yellow-50 border-yellow-200'
  //     },
  //     {
  //       id: 'process-refund-action',
  //       label: 'Process Refund',
  //       icon: CreditCard,
  //       description: 'Process customer refund',
  //       color: 'bg-red-50 border-red-200'
  //     }
  //   ]
  // },
  // {
  //   id: 'data-actions',
  //   name: 'Data & Analytics',
  //   icon: Database,
  //   description: 'Data management and tracking',
  //   color: 'bg-purple-50 border-purple-200',
  //   actions: [
  //     {
  //       id: 'save-to-database-action',
  //       label: 'Save to Database',
  //       icon: Database,
  //       description: 'Save data to database',
  //       color: 'bg-blue-50 border-blue-200'
  //     },
  //     {
  //       id: 'track-event-action',
  //       label: 'Track Event',
  //       icon: BarChart,
  //       description: 'Track custom analytics event',
  //       color: 'bg-green-50 border-green-200'
  //     },
  //     {
  //       id: 'create-report-action',
  //       label: 'Create Report',
  //       icon: FileText,
  //       description: 'Generate automated report',
  //       color: 'bg-purple-50 border-purple-200'
  //     },
  //     {
  //       id: 'export-data-action',
  //       label: 'Export Data',
  //       icon: Share2,
  //       description: 'Export data to external system',
  //       color: 'bg-orange-50 border-orange-200'
  //     }
  //   ]
  // },
  // {
  //   id: 'workflow-actions',
  //   name: 'Workflow Control',
  //   icon: Settings,
  //   description: 'Control workflow execution',
  //   color: 'bg-gray-50 border-gray-200',
  //   actions: [
  //     {
  //       id: 'delay-action',
  //       label: 'Add Delay',
  //       icon: Clock,
  //       description: 'Add delay before next action',
  //       color: 'bg-gray-50 border-gray-200'
  //     },
  //     {
  //       id: 'stop-workflow-action',
  //       label: 'Stop Workflow',
  //       icon: StopCircle,
  //       description: 'Stop workflow execution',
  //       color: 'bg-red-50 border-red-200'
  //     },
  //     {
  //       id: 'start-workflow-action',
  //       label: 'Start Another Workflow',
  //       icon: PlayCircle,
  //       description: 'Trigger another workflow',
  //       color: 'bg-green-50 border-green-200'
  //     },
  //     {
  //       id: 'conditional-action',
  //       label: 'Conditional Logic',
  //       icon: GitBranch,
  //       description: 'Add conditional branching',
  //       color: 'bg-purple-50 border-purple-200'
  //     }
  //   ]
  // },
  // {
  //   id: 'integration-actions',
  //   name: 'Integrations',
  //   icon: Globe,
  //   description: 'External system integrations',
  //   color: 'bg-teal-50 border-teal-200',
  //   actions: [
  //     {
  //       id: 'webhook-action',
  //       label: 'Send Webhook',
  //       icon: Webhook,
  //       description: 'Send data to external webhook',
  //       color: 'bg-teal-50 border-teal-200'
  //     },
  //     {
  //       id: 'api-call-action',
  //       label: 'API Call',
  //       icon: Globe,
  //       description: 'Make API call to external service',
  //       color: 'bg-blue-50 border-blue-200'
  //     },
  //     {
  //       id: 'zapier-action',
  //       label: 'Zapier Integration',
  //       icon: Zap,
  //       description: 'Send data to Zapier',
  //       color: 'bg-orange-50 border-orange-200'
  //     },
  //     {
  //       id: 'slack-action',
  //       label: 'Send to Slack',
  //       icon: MessageSquare,
  //       description: 'Send message to Slack channel',
  //       color: 'bg-green-50 border-green-200'
  //     }
  //   ]
  // }
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
