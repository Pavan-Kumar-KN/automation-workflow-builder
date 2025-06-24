import { 
  MessageSquare, 
  Database, 
  Calendar,
  FileText,
  Webhook,
  UserCheck,
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
} from 'lucide-react';
import { NodeData } from './types';

export const triggerNodes: NodeData[] = [
  // Add New Trigger Option
  { 
    id: 'add-new-trigger', 
    label: 'Add New Trigger', 
    icon: Plus,
    description: 'Add another trigger to your workflow',
    color: 'bg-blue-50 border-blue-200'
  },
  
  // Form Triggers
  { 
    id: 'form-trigger', 
    label: 'Form Submitted', 
    icon: FileText,
    description: 'When any form is submitted',
    color: 'bg-red-50 border-red-200'
  },
  { 
    id: 'product-enquiry-trigger', 
    label: 'Product Enquiry Form', 
    icon: ShoppingCart,
    description: 'When product enquiry form is submitted',
    color: 'bg-red-50 border-red-200'
  },
  { 
    id: 'facebook-form-trigger', 
    label: 'Facebook Lead Form', 
    icon: MessageSquare,
    description: 'When Facebook lead form is submitted',
    color: 'bg-red-50 border-red-200'
  },
  
  // Contact Triggers
  { 
    id: 'contact-updated-trigger', 
    label: 'Contact Updated', 
    icon: UserCheck,
    description: 'When contact information is updated',
    color: 'bg-red-50 border-red-200'
  },
  { 
    id: 'contact-tagged-trigger', 
    label: 'Contact Tagged', 
    icon: Tag,
    description: 'When a tag is added to contact',
    color: 'bg-red-50 border-red-200'
  },
  { 
    id: 'happy-birthday-trigger', 
    label: 'Say Happy Birthday', 
    icon: Target,
    description: 'On contact birthday',
    color: 'bg-red-50 border-red-200'
  },
  
  // CRM Triggers
  { 
    id: 'pipeline-added-trigger', 
    label: 'Added to Pipeline', 
    icon: Database,
    description: 'When lead is added to CRM pipeline',
    color: 'bg-red-50 border-red-200'
  },
  { 
    id: 'stage-changed-trigger', 
    label: 'Stage Changed', 
    icon: RefreshCw,
    description: 'When pipeline stage changes',
    color: 'bg-red-50 border-red-200'
  },
  { 
    id: 'follow-up-trigger', 
    label: 'Follow Up Due', 
    icon: Clock,
    description: 'When follow up is due',
    color: 'bg-red-50 border-red-200'
  },
  { 
    id: 'note-added-trigger', 
    label: 'Note Added', 
    icon: FileText,
    description: 'When note is added to contact',
    color: 'bg-red-50 border-red-200'
  },
  
  // Calendar Triggers
  { 
    id: 'appointment-booked-trigger', 
    label: 'Appointment Booked', 
    icon: Calendar,
    description: 'When appointment is scheduled',
    color: 'bg-red-50 border-red-200'
  },
  { 
    id: 'appointment-cancelled-trigger', 
    label: 'Appointment Cancelled', 
    icon: XCircle,
    description: 'When appointment is cancelled',
    color: 'bg-red-50 border-red-200'
  },
  { 
    id: 'appointment-rescheduled-trigger', 
    label: 'Appointment Rescheduled', 
    icon: RefreshCw,
    description: 'When appointment time changes',
    color: 'bg-red-50 border-red-200'
  },
  { 
    id: 'no-show-trigger', 
    label: 'No-Show Appointment', 
    icon: AlertCircle,
    description: 'When client misses appointment',
    color: 'bg-red-50 border-red-200'
  },
  { 
    id: 'show-up-trigger', 
    label: 'Show Up Appointment', 
    icon: CheckCircle,
    description: 'When client attends appointment',
    color: 'bg-red-50 border-red-200'
  },
  
  // Finance Triggers
  { 
    id: 'subscription-created-trigger', 
    label: 'Subscription Created', 
    icon: CreditCard,
    description: 'When new subscription is created',
    color: 'bg-red-50 border-red-200'
  },
  { 
    id: 'subscription-overdue-trigger', 
    label: 'Subscription Overdue', 
    icon: AlertCircle,
    description: 'When subscription payment is overdue',
    color: 'bg-red-50 border-red-200'
  },
  { 
    id: 'subscription-paid-trigger', 
    label: 'Subscription Paid', 
    icon: CheckCircle,
    description: 'When subscription payment is received',
    color: 'bg-red-50 border-red-200'
  },
  { 
    id: 'payment-failed-trigger', 
    label: 'Payment Failed', 
    icon: XCircle,
    description: 'When payment processing fails',
    color: 'bg-red-50 border-red-200'
  },
  { 
    id: 'invoice-paid-trigger', 
    label: 'Invoice Paid', 
    icon: CheckCircle,
    description: 'When invoice is fully paid',
    color: 'bg-red-50 border-red-200'
  },
  
  // LMS Triggers
  { 
    id: 'lesson-completed-trigger', 
    label: 'Lesson Completed', 
    icon: GraduationCap,
    description: 'When student completes lesson',
    color: 'bg-red-50 border-red-200'
  },
  { 
    id: 'course-completed-trigger', 
    label: 'Course Completed', 
    icon: BookOpen,
    description: 'When student completes course',
    color: 'bg-red-50 border-red-200'
  },
  { 
    id: 'comment-added-trigger', 
    label: 'Comment Added', 
    icon: MessageSquare,
    description: 'When comment is posted',
    color: 'bg-red-50 border-red-200'
  },
  
  // API & Schedule Triggers
  { 
    id: 'api-trigger', 
    label: 'API 1.0 Called', 
    icon: Webhook,
    description: 'When API endpoint is triggered',
    color: 'bg-red-50 border-red-200'
  },
  { 
    id: 'specific-date-trigger', 
    label: 'Specific Date', 
    icon: Calendar,
    description: 'On specific date and time',
    color: 'bg-red-50 border-red-200'
  },
  { 
    id: 'weekly-recurring-trigger', 
    label: 'Weekly Recurring', 
    icon: RefreshCw,
    description: 'Every week on specific day',
    color: 'bg-red-50 border-red-200'
  },
  { 
    id: 'monthly-recurring-trigger', 
    label: 'Monthly Recurring', 
    icon: Calendar,
    description: 'Every month on specific date',
    color: 'bg-red-50 border-red-200'
  },
];
