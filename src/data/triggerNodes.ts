import {
  MessageSquare,
  Database,
  Calendar,
  FileText,
  Webhook,
  UserCheck,
  UserPlus,
  UserX,
  Tag,
  Clock,
  XCircle,
  ShoppingCart,
  ArrowRight,
  CalendarX,
  FilePlus,
  BadgeCheck,
  Ban,
  Receipt,
  CreditCard,
  GraduationCap,
  CheckCircle,
  Server,
  Plus,
  CalendarClock,
  Repeat,
  CalendarRange,
  Zap
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
    id: 'product-enquiry-trigger',
    label: 'Product Enquired',
    icon: ShoppingCart,
    description: 'When product enquiry form is submitted',
    color: 'bg-red-50 border-red-200',
  },
  {
    id: 'form-submitted-trigger',
    label: 'Forms',
    icon: FileText,
    description: 'Triggers when any form is submitted',
    color: 'bg-blue-50 border-blue-200',
  },
  {
    id: 'facebook-form-trigger',
    label: 'Facebook Form',
    icon: UserCheck,
    description: 'Triggers when a contact is updated in any form',
    color: 'bg-green-50 border-green-200',
  },

  // Contact Triggers
  {
    id: 'contact-source-trigger',
    label: 'Contact Source',
    icon: UserPlus,
    description: 'When new contact added via the selected source to send welcome message and more',
    color: 'bg-green-50 border-green-200',
  },
  {
    id: 'contact-updated-trigger',
    label: 'Contact Update',
    icon: UserPlus,
    description: 'Send a cheer message to contact whenever contact is updated in system even with other automation',
    color: 'bg-green-50 border-green-200',
  },
  {
    id: 'contact-tagged-trigger',
    label: 'Contact Tagged',
    icon: Tag,
    description: 'When a contact is tagged automation will trigger',
    color: 'bg-yellow-50 border-yellow-200',
  },
  {
    id: 'happy-birthday-trigger',
    label: 'Say "Happy Birthday"',
    icon: UserPlus,
    description: 'Celebrate with an exclusive offer or cheerful message that sends based on the birthday field in your audience',
    color: 'bg-green-50 border-green-200',
  },

  // CRM Triggers
  {
    id: 'added-to-pipeline-trigger',
    label: 'Added to Pipeline',
    icon: UserPlus,
    description: 'When a contact is added to selected pipeline automation will trigger',
    color: 'bg-green-50 border-green-200'
  },
  {
    id: 'stage-changed-trigger',
    label: 'Stage Changed',
    icon: ArrowRight,
    description: 'When a contact stage is changed in selected pipeline automation will trigger',
    color: 'bg-blue-50 border-blue-200'
  },
  {
    id: 'follow-up-trigger',
    label: 'Follow UP',
    icon: Clock,
    description: 'Triggers after a specified time period for follow-up actions',
    color: 'bg-yellow-50 border-yellow-200'
  },
  {
    id: 'notes-added-trigger',
    label: 'Note Added',
    icon: FileText,
    description: 'When a note added to contact automation will trigger',
    color: 'bg-yellow-50 border-yellow-200'
  },

  // Calendar Triggers
  {
    id: 'appointment-booked-trigger',
    label: 'Appointment Booked',
    icon: UserPlus,
    description: 'Appointment booked will run the workflow',
    color: 'bg-green-50 border-green-200'
  },
  {
    id: 'appointment-cancelled-trigger',
    label: 'Appointment Cancelled',
    icon: XCircle,
    description: 'Appointment cancelled will run the workflow',
    color: 'bg-red-50 border-red-200'
  },
  {
    id: 'appointment-rescheduled-trigger',
    label: 'Appointment Rescheduled',
    icon: Calendar,
    description: 'Appointment rescheduled will run the workflow',
    color: 'bg-blue-50 border-blue-200'
  },
  {
    id: 'no-show-trigger',
    label: 'No-Show Appointment',
    icon: UserX,
    description: 'No-show appointment will run the workflow',
    color: 'bg-orange-50 border-orange-200'
  },
  {
    id: 'show-up-trigger',
    label: 'Show Up Appointment',
    icon: UserCheck,
    description: 'Show Appointment within 24 hours will run the workflow',
    color: 'bg-green-50 border-green-200'
  },

  // Finance Triggers
  {
    id: 'subcription-created-trigger',
    label: 'Subscription Created',
    icon: FilePlus,
    description: 'Select the product/plan where subscription is created and you want to automate',
    color: 'bg-green-50 border-green-200'
  },
  {
    id: 'subcription-overdue-trigger',
    label: 'Subscription Overdue',
    icon: CalendarX,
    description: 'Select the product/plan where subscription is overdue and you want to automate',
    color: 'bg-red-50 border-red-200'
  },
  {
    id: 'subcription-paid-trigger',
    label: 'Subscription Paid',
    icon: BadgeCheck,
    description: 'Select the product/plan where subscription is paid and you want to automate',
    color: 'bg-green-50 border-green-200'
  },
  {
    id: 'subcription-cancelled-trigger',
    label: 'Subscription Cancelled',
    icon: Ban,
    description: 'Select the product/plan where subscription is cancelled and you want to automate',
    color: 'bg-red-50 border-red-200'
  },

  // Installment Triggers
  {
    id: 'installment-created-trigger',
    label: 'Instalment Created',
    icon: FilePlus,
    description: 'Select the product/plan where instalment is created and you want to automate',
    color: 'bg-green-50 border-green-200'
  },
  {
    id: 'installment-paid-trigger',
    label: 'Instalment Paid',
    icon: BadgeCheck,
    description: 'Select the product/plan where instalment is paid and you want to automate',
    color: 'bg-green-50 border-green-200'
  },
  {
    id: 'installment-overdue-trigger',
    label: 'Instalment Overdue',
    icon: CalendarX,
    description: 'Select the product/plan where instalment is overdue and you want to automate',
    color: 'bg-red-50 border-red-200'
  },
  {
    id: 'installment-cancelled-trigger',
    label: 'Instalment Cancelled',
    icon: Ban,
    description: 'Select the product/plan where instalment is cancelled and you want to automate',
    color: 'bg-red-50 border-red-200'
  },

  // Payment and Invoice Triggers
  {
    id: 'payment-failed-trigger',
    label: 'Payment Failed',
    icon: CreditCard,
    description: 'Select the product/plan where payment failed and you want to automate',
    color: 'bg-red-50 border-red-200'
  },
  {
    id: 'invoice-paid-trigger',
    label: 'Invoice Paid',
    icon: Receipt,
    description: 'Select the product which you need to automate when invoice paid',
    color: 'bg-green-50 border-green-200'
  },

  // LMS Triggers
  {
    id: 'lesson-completed-trigger',
    label: 'Lesson Completed',
    icon: CheckCircle,
    description: 'Select the course which lessons is completed',
    color: 'bg-green-50 border-green-200'
  },
  {
    id: 'course-completed-trigger',
    label: 'Course Completed',
    icon: GraduationCap,
    description: 'Select the course which is completed you want to automate',
    color: 'bg-green-50 border-green-200'
  },
  {
    id: 'comment-added-trigger',
    label: 'Comment Added',
    icon: MessageSquare,
    description: 'Select the course where comment is added and you want to automate',
    color: 'bg-yellow-50 border-yellow-200'
  },

  // API Triggers
  {
    id: 'api-trigger',
    label: 'API 1.0',
    icon: Webhook,
    description: 'Automation is triggered manually or from another application using API 1.0. Make an HTTP POST request to the API endpoint below',
    color: 'bg-blue-50 border-blue-200',
    category: 'webhooks'
  },

  // Schedule Triggers
  {
    id: 'specific-date-trigger',
    label: 'Specific date',
    icon: CalendarClock,
    description: 'Start a marketing campaign immediately or schedule it for a particular date/time. Automation will be triggered accordingly for all contacts in the selected contact group',
    color: 'bg-blue-50 border-blue-200',
    category: 'schedule'
  },
  {
    id: 'weekly-recurring-trigger',
    label: 'Weekly Recurring',
    icon: Repeat,
    description: 'Select the days of the week and time to run the workflow',
    color: 'bg-green-50 border-green-200',
    category: 'schedule'
  },
  {
    id: 'monthly-recurring-trigger',
    label: 'Monthly Recurring',
    icon: CalendarRange,
    description: 'Select the days of the month and time to run the workflow',
    color: 'bg-yellow-50 border-yellow-200',
    category: 'schedule'
  },
  {
    id: 'event-date-trigger',
    label: 'Event date',
    icon: Zap,
    description: 'Start now or schedule — automation runs for all selected contacts',
    color: 'bg-purple-50 border-purple-200',
    category: 'schedule'
  },

  // Table Triggers
  {
    id: 'database-record-trigger',
    label: 'Database Record',
    icon: Database,
    description: 'Trigger when a new record is added to database',
    color: 'bg-blue-50 border-blue-200',
    category: 'tables'
  }

];