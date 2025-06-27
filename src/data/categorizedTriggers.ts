import {
  MessageSquare,
  Database,
  Calendar,
  FileText,
  Webhook,
  UserCheck,
  UserPlus,
  Tag,
  Target,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  GraduationCap,
  BookOpen,
  ShoppingCart,
  Plus,
  FormInput,
  User,
  Package,
  Mail,
  Globe,
  Settings,
  Star,
  Zap
} from 'lucide-react';
import { NodeData } from './types';

export interface TriggerCategory {
  id: string;
  name: string;
  icon: any;
  description: string;
  color: string;
  triggers: NodeData[];
}

export const categorizedTriggers: TriggerCategory[] = [
  {
    id: 'form-triggers',
    name: 'Form Triggers',
    icon: FormInput,
    description: 'Triggers based on form interactions',
    color: 'bg-blue-50 border-blue-200',
    triggers: [
      {
        id: 'contact-updated-trigger',
        label: 'Contact Updated',
        icon: UserCheck,
        description: 'Triggers when a contact is updated in any form',
        color: 'bg-green-50 border-green-200'
      },
      {
        id: 'form-submitted-trigger',
        label: 'Form Submitted',
        icon: FileText,
        description: 'Triggers when any form is submitted',
        color: 'bg-blue-50 border-blue-200'
      },
      {
        id: 'form-viewed-trigger',
        label: 'Form Viewed',
        icon: Target,
        description: 'Triggers when a form is viewed by a visitor',
        color: 'bg-purple-50 border-purple-200'
      },
      {
        id: 'form-abandoned-trigger',
        label: 'Form Abandoned',
        icon: XCircle,
        description: 'Triggers when a form is started but not completed',
        color: 'bg-red-50 border-red-200'
      }
    ]
  },
  {
    id: 'contact-triggers',
    name: 'Contact Triggers',
    icon: User,
    description: 'Triggers based on contact activities',
    color: 'bg-green-50 border-green-200',
    triggers: [
      {
        id: 'contact-created-trigger',
        label: 'Contact Created',
        icon: UserPlus,
        description: 'Triggers when a new contact is created',
        color: 'bg-green-50 border-green-200'
      },
      {
        id: 'contact-tagged-trigger',
        label: 'Contact Tagged',
        icon: Tag,
        description: 'Triggers when a contact is tagged',
        color: 'bg-yellow-50 border-yellow-200'
      },
      {
        id: 'contact-unsubscribed-trigger',
        label: 'Contact Unsubscribed',
        icon: XCircle,
        description: 'Triggers when a contact unsubscribes',
        color: 'bg-red-50 border-red-200'
      },
      {
        id: 'contact-birthday-trigger',
        label: 'Contact Birthday',
        icon: Calendar,
        description: 'Triggers on contact birthday',
        color: 'bg-pink-50 border-pink-200'
      }
    ]
  },
  {
    id: 'product-triggers',
    name: 'Product Triggers',
    icon: Package,
    description: 'Triggers based on product interactions',
    color: 'bg-orange-50 border-orange-200',
    triggers: [
      {
        id: 'product-purchased-trigger',
        label: 'Product Purchased',
        icon: ShoppingCart,
        description: 'Triggers when a product is purchased',
        color: 'bg-green-50 border-green-200'
      },
      {
        id: 'product-viewed-trigger',
        label: 'Product Viewed',
        icon: Target,
        description: 'Triggers when a product page is viewed',
        color: 'bg-blue-50 border-blue-200'
      },
      {
        id: 'cart-abandoned-trigger',
        label: 'Cart Abandoned',
        icon: XCircle,
        description: 'Triggers when items are left in cart',
        color: 'bg-red-50 border-red-200'
      },
      {
        id: 'product-reviewed-trigger',
        label: 'Product Reviewed',
        icon: Star,
        description: 'Triggers when a product is reviewed',
        color: 'bg-yellow-50 border-yellow-200'
      }
    ]
  },
  {
    id: 'email-triggers',
    name: 'Email Triggers',
    icon: Mail,
    description: 'Triggers based on email activities',
    color: 'bg-purple-50 border-purple-200',
    triggers: [
      {
        id: 'email-opened-trigger',
        label: 'Email Opened',
        icon: Mail,
        description: 'Triggers when an email is opened',
        color: 'bg-blue-50 border-blue-200'
      },
      {
        id: 'email-clicked-trigger',
        label: 'Email Link Clicked',
        icon: Target,
        description: 'Triggers when a link in email is clicked',
        color: 'bg-green-50 border-green-200'
      },
      {
        id: 'email-bounced-trigger',
        label: 'Email Bounced',
        icon: XCircle,
        description: 'Triggers when an email bounces',
        color: 'bg-red-50 border-red-200'
      },
      {
        id: 'email-replied-trigger',
        label: 'Email Replied',
        icon: MessageSquare,
        description: 'Triggers when someone replies to an email',
        color: 'bg-purple-50 border-purple-200'
      }
    ]
  },
  {
    id: 'time-triggers',
    name: 'Time & Schedule',
    icon: Clock,
    description: 'Time-based and scheduled triggers',
    color: 'bg-indigo-50 border-indigo-200',
    triggers: [
      {
        id: 'schedule-trigger',
        label: 'Schedule',
        icon: Calendar,
        description: 'Triggers at specific times or intervals',
        color: 'bg-indigo-50 border-indigo-200'
      },
      {
        id: 'delay-trigger',
        label: 'Delay',
        icon: Clock,
        description: 'Adds a delay before next action',
        color: 'bg-gray-50 border-gray-200'
      },
      {
        id: 'date-trigger',
        label: 'Specific Date',
        icon: Calendar,
        description: 'Triggers on a specific date',
        color: 'bg-blue-50 border-blue-200'
      }
    ]
  },
  {
    id: 'webhook-triggers',
    name: 'Webhooks & API',
    icon: Globe,
    description: 'External system triggers',
    color: 'bg-teal-50 border-teal-200',
    triggers: [
      {
        id: 'webhook-trigger',
        label: 'Webhook',
        icon: Webhook,
        description: 'Triggers from external webhook calls',
        color: 'bg-teal-50 border-teal-200'
      },
      {
        id: 'api-trigger',
        label: 'API Call',
        icon: Globe,
        description: 'Triggers from API endpoint calls',
        color: 'bg-blue-50 border-blue-200'
      },
      {
        id: 'zapier-trigger',
        label: 'Zapier Integration',
        icon: Zap,
        description: 'Triggers from Zapier workflows',
        color: 'bg-orange-50 border-orange-200'
      }
    ]
  }
];

// Helper function to get all triggers in a flat array
export const getAllTriggers = (): NodeData[] => {
  return categorizedTriggers.flatMap(category => category.triggers);
};

// Helper function to get triggers by category
export const getTriggersByCategory = (categoryId: string): NodeData[] => {
  const category = categorizedTriggers.find(cat => cat.id === categoryId);
  return category ? category.triggers : [];
};
