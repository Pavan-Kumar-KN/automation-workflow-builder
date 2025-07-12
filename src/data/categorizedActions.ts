import {
  Clock,
  Mail,
  MessageCircle,
  MessageSquare,
  GitBranch,
  Webhook,
  Users,
  Settings,
  Tag,
  Edit,
  Layers,
  UserPlus,
  Star,
  Box,
  Sparkles,
  Facebook,
  ReceiptText,
  BarChart2,
  XCircle,
  Calendar,
  UserX,
  UserCheck,
  UserMinus,
  CalendarClock,
  CalendarX,
  CalendarCheck,
  Share2,
  Bell,
  Repeat2,
  ListTree,
  Database,
  BookOpen,
  BookX,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { NodeData } from './types';

export interface ActionSubcategory {
  id: string;
  name: string;
  description: string;
  icon?: any;
  actions: NodeData[];
}

export interface ActionCategory {
  id: string;
  name: string;
  icon?: any;
  description: string;
  color: string;
  actions?: NodeData[];
  subcategories?: ActionSubcategory[];
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
        color: 'border-blue-200'
      },

      {
        id: 'send-whatsapp-action',
        label: 'Send Whatsapp Message',
        icon: MessageCircle,
        description: 'Send an whatsapp message to contacts',
        color: 'border-emerald-200 text-emerald-600'
      },
      {
        id: 'send-sms-action',
        label: 'Send SMS Message',
        icon: MessageSquare,
        description: 'Send an SMS message to contacts',
        color: 'border-blue-200 text-blue-600'
      },
      {
        id: 'delay-action',
        label: 'Delay',
        icon: Clock,
        description: 'Add a delay before or after the action',
        color: 'border-blue-200 text-blue-600'
      }
    ]
  },

  {
    id: 'evaluation-actions',
    name: 'Evaluate',
    icon: GitBranch,
    description: 'Add conditional logic and flow control',
    color: 'bg-orange-50 border-orange-200',
    subcategories: [
      {
        id: 'contact-subcategory',
        name: 'Contact',
        description: 'Contact-related evaluations',
        actions: [
          {
            id: 'contact-updated-action',
            label: 'Contact Updated',
            icon: Edit,
            description: 'Add conditional logic based on contact data',
            color: 'bg-orange-50 border-orange-200',
            type: 'condition'
          },
          {
            id: 'contact-tagged-action',
            label: 'Contact Tagged',
            icon: Tag, // Replace Users with Tag
            description: 'Add conditional logic based on contact data',
            color: 'bg-orange-50 border-orange-200',
            type: 'condition'
          },
          {
            id: 'contact-type-action',
            label: 'Contact Type',
            icon: Layers, // Best for categorization
            description: 'Add conditional logic based on contact data',
            color: 'bg-orange-50 border-orange-200',
            type: 'condition'
          }
        ]
      },
      {
        id: 'crm-subcategory',
        name: 'CRM',
        description: 'CRM-related evaluations',
        actions: [
          {
            id: 'lead-quality',
            label: 'Lead Quality',
            icon: Star, // or BarChart
            description: 'Add conditional logic to workflow',
            color: 'bg-orange-50 border-orange-200',
            type: 'condition'
          },
          {
            id: 'assigned-staff',
            label: 'Assigned Staff',
            icon: UserPlus, // or UserCheck
            description: 'Add conditional logic to workflow',
            color: 'bg-orange-50 border-orange-200',
            type: 'condition'
          }

        ]
      },
      {
        id: 'forms-subcategory',
        name: 'Forms',
        description: 'form-related evaluations',
        actions: [
          {
            id: 'product-form',
            label: 'Product Form',
            icon: Box, // Represents a product/package
            description: 'Add conditional logic to workflow',
            color: 'bg-indigo-50 border-indigo-200',
            type: 'condition'
          },
          {
            id: 'magic-form',
            label: 'Magic Form',
            icon: Sparkles, // Represents something magical or special
            description: 'Add conditional logic to workflow',
            color: 'bg-purple-50 border-purple-200',
            type: 'condition'

          },
          {
            id: 'facebook-form',
            label: 'Facebook Form',
            icon: Facebook, // Lucide has a Facebook icon
            description: 'Add conditional logic to workflow',
            color: 'bg-blue-50 border-blue-200',
            type: 'condition'

          }

        ]
      },


      {
        id: 'sales-subcategory',
        name: 'Sales',
        description: 'Sales-related evaluations',
        icon: BarChart2, // Icon for main Sales category
        actions: [
          {
            id: 'invoice-form',
            label: 'Invoice Amount',
            icon: ReceiptText, // Best for invoice-related actions
            description: 'Add conditional logic to workflow',
            color: '#4F46E5', // Indigo-600
            type: 'condition'
          }
        ]
      },


      // Calendar
      {
        id: 'calendar-subcategory',
        name: 'Calendar',
        description: 'Calendar-related evaluations',
        icon: 'CalendarDays', // Better icon for a calendar-based category
        actions: [
          {
            id: 'appointment-booked-action',
            label: 'Appointment Booked',
            icon: CalendarCheck, // Check-marked calendar for booked
            description: 'Appointment booked will run the workflow',
            color: '#10B981',
            type: 'condition'

          },
          {
            id: 'appointment-cancelled-action',
            label: 'Appointment Cancelled',
            icon: CalendarX, // Cancelled calendar icon
            description: 'Appointment cancelled will run the workflow',
            color: '#EF4444',
            type: 'condition'

          },
          {
            id: 'appointment-rescheduled-action',
            label: 'Appointment Rescheduled',
            icon: CalendarClock, // Clock icon + calendar = reschedule
            description: 'Appointment rescheduled will run the workflow',
            color: '#6366F1',
            type: 'condition'

          },
          {
            id: 'no-show-action',
            label: 'No-Show Appointment',
            icon: UserMinus, // Clear visual for missing user
            description: 'No-show appointment will run the workflow',
            color: '#F59E0B',
            type: 'condition'

          },
          {
            id: 'show-up-action',
            label: 'Show Up Appointment',
            icon: UserCheck, // Perfect for confirmed attendance
            description: 'Show appointment within 24 hours will run the workflow',
            color: '#10B981',
            type: 'condition'

          }
        ]
      },


      // // Coming soon actions 
      // {
      //   id: 'custom-fields-subcategory',
      //   name: 'Custom Fields',
      //   description: 'Actions that are coming soon',
      //   icon: Settings2, // Represents configuration/customization
      //   actions: [
      //     {
      //       id: 'custom-field-action',
      //       label: 'Coming Soon',
      //       icon: Clock, // Still relevant for pending features
      //       description: 'This action is coming soon',
      //       color: '#F59E0B',
      //       type: 'condition'
      //     }
      //   ]
      // },


      // {
      //   id: 'lms-subcategory',
      //   name: 'LMS',
      //   description: 'Coming Soon',
      //   icon: GraduationCap, // Represents learning/education
      //   actions: [
      //     {
      //       id: 'lms-coming-soon-action',
      //       label: 'Coming Soon',
      //       icon: Clock, // Feature not available yet
      //       description: 'This action is coming soon',
      //       color: '#F59E0B',
      //       type: 'condition'
      //     }
      //   ]
      // }



    ]
  },

  {
    id: 'webhook-actions',
    name: 'Webhook',
    icon: Share2, // Represents sending data externally
    description: 'Send data to another application',
    color: '#3B82F6', // Blue-500: clear, trustworthy, connected
    actions: [
      {
        id: 'webhook-basic-action',
        label: 'Webhook',
        icon: Share2, // Consistent with category icon
        description: 'Send data to another application',
        color: '#3B82F6'
      },
      {
        id: 'webhook-advance-action',
        label: 'Webhook (Advance)',
        icon: Share2,
        description: 'Send data to another application',
        color: '#3B82F6'
      }
    ]
  },

  {
    id: 'workflow-actions',
    name: 'Workflow',
    icon: XCircle,
    description: 'Remove workflow from contact',
    color: '#EF4444',
    actions: [
      {
        id: 'remove-workflow-action',
        label: 'Remove Workflow',
        icon: XCircle,
        description: 'Remove workflow from contact',
        color: '#EF4444'
      }
    ]
  },

  {
    id: 'internal-notification-actions',
    name: 'Internal Notification',
    icon: Bell,
    description: 'Internal notification',
    color: '#F97316', // Orange-500: draws attention, not error-level
    actions: [
      {
        id: 'internal-notification-action',
        label: 'Internal Notification',
        icon: Bell,
        description: 'Internal notification',
        color: '#F97316'
      }
    ]
  },

  // ? Opearations 
  {
    id: 'operations-actions',
    name: 'Operations',
    icon: Settings,
    description: 'Operations-related actions',
    color: '#10B981',
    actions: [
      {
        id: 'update-contact-attribute-action',
        label: 'Update Contact Attribute',
        icon: Settings,
        description: 'Update Contact attribute related actions',
        color: '#253530ff'
      },
      {
        id: 'convert-lead-to-customer-action',
        label: 'Convert Lead to Customer',
        icon: Repeat2, // Symbolizes transformation or conversion
        description: 'Convert from lead to customer or vice versa',
        color: '#6366F1' // Indigo-500: represents change or transition
      },
      {
        id: 'contact-tagged-operation-action',
        label: 'Contact Tagged',
        icon: Tag, // Perfect fit for tagging
        description: 'Add or remove tags from contact in operations',
        color: '#3B82F6' // Blue-500: action/interaction
      },
      {
        id: 'remove-tag-operation-action',
        label: 'Remove Tag',
        icon: Tag, // Clearly shows a tag being removed (Lucide icon)
        description: 'Remove tag on operation',
        color: '#EF4444' // Red-500: indicates removal/destructive action
      },

      {
        id: 'contact-group-operation-action',
        label: 'Contact to Group',
        icon: ListTree, // Represents hierarchy/movement within groups
        description: 'Copy or move the contact to another list. Optionally delete from the current list.',
        color: '#3B82F6' // Blue-500: active list operation (not destructive by default)
      },
      {
        id: 'remove-contact-operation-action',
        label: 'Remove Contact',
        icon: UserMinus, // Clearly indicates contact removal
        description: 'Remove the contact from a list or group.',
        color: '#EF4444' // Red-500: destructive action (removal)
      },
      {
        id: 'add-update-to-crm-action',
        label: 'Add/Update to CRM',
        icon: Database, // Represents database or CRM
        description: 'Add or update contact in CRM',
        color: '#10B981' // Green-500: positive action
      },
      {
        id: 'remove-from-crm-action',
        label: 'Remove from CRM',
        icon: Database, // Represents database or CRM
        description: 'Remove contact from CRM',
        color: '#EF4444' // Red-500: destructive action (removal)
      },
      {
        id: 'course-access-operation-action',
        label: 'Course Access',
        icon: BookOpen, // Represents learning/education
        description: 'Grant or revoke course access',
        color: '#F97316' // Orange-500: draws attention, not error-level
      },
      {
        id: 'course-revoke-operation-action',
        label: 'Course Revoke',
        icon: BookX, // Clear revoke/removal of course
        description: 'Revoke course access',
        color: '#EF4444' // Red-500: destructive action
      },

      {
        id: "lead-quality-operation-action",
        label: 'Lead Quality',
        icon: Star, // or BarChart
        description: 'Change lead quality in CRM',
        color: '#F97316' // Orange-500: draws attention, not error-level
      },
      {
        id: "execute-automation-operation-action",
        label: 'Execute Automation',
        icon: Star, // or BarChart
        description: 'Change lead quality in CRM',
        color: '#F97316' // Orange-500: draws attention, not error-level
      },

      {
        id: 'event-start-operation-action',
        label: 'Event Start',
        icon: CalendarClock, // Clear indication of scheduled start
        description: 'Event/Webinar time when it starts',
        color: '#F97316' // Orange-500: highlights time sensitivity
      },
      {
        id: 'appointment-status-change-action',
        label: 'Appointment Status Change',
        icon: RefreshCw, // Indicates change/update
        description: 'Appointment status change will run the workflow',
        color: '#3B82F6',
        type: 'condition'
      },
      {
        id: "exit-workflow-operation-action",
        label: 'Exit Workflow',
        icon: XCircle,
        description: 'Exit workflow from contact',
        color: '#EF4444'
      },

      // Staff Operations 
      {
        id: 'assign-to-staff-operation-action',
        label: 'Assign To Staff',
        icon: UserPlus, // Represents assignment to a staff member
        description: 'Assign contact to a staff member',
        color: '#3B82F6' // Blue-500: action/interaction
      },
      {
        id: 'remove-assigned-staff-operation-action',
        label: 'Remove Assigned Staff',
        icon: UserMinus, // Represents removal of assignment
        description: 'Remove assigned staff from contact',
        color: '#EF4444' // Red-500: destructive action
      },

      {
        id: 'community-access-operation-action',
        label: 'Community Access',
        icon: Users, // Represents community or group
        description: 'Grant community access',
        color: '#F97316' // Orange-500: draws attention, not error-level
      },
      {
        id: 'community-revoke-operation-action',
        label: 'Community Revoke',
        icon: Users, // Represents community or group
        description: 'Revoke community access',
        color: '#EF4444' // Red-500: destructive action
      },

      {
        id: "chatgroup-access-operation-action",
        label: 'Chatgroup Access',
        icon: Users, // Represents community or group
        description: 'Grant chatgroup access',
        color: '#F97316' // Orange-500: draws attention, not error-level
      },
      {
        id: 'chatgroup-revoke-operation-action',
        label: 'Chatgroup Revoke',
        icon: Users, // Represents community or group
        description: 'Revoke chatgroup access',
        color: '#EF4444' // Red-500: destructive action
      }
    ]

  }

];

// Helper function to get all actions in a flat array
export const getAllActions = (): NodeData[] => {
  return categorizedActions.flatMap(category => {
    if (category.actions) {
      return category.actions;
    }
    if (category.subcategories) {
      return category.subcategories.flatMap(sub => sub.actions);
    }
    return [];
  });
};

// Helper function to get actions by category
export const getActionsByCategory = (categoryId: string): NodeData[] => {
  const category = categorizedActions.find(cat => cat.id === categoryId);
  if (!category) return [];

  if (category.actions) {
    return category.actions;
  }
  if (category.subcategories) {
    return category.subcategories.flatMap(sub => sub.actions);
  }
  return [];
};

// Helper function to get actions by subcategory
export const getActionsBySubcategory = (categoryId: string, subcategoryId: string): NodeData[] => {
  const category = categorizedActions.find(cat => cat.id === categoryId);
  if (!category?.subcategories) return [];

  const subcategory = category.subcategories.find(sub => sub.id === subcategoryId);
  return subcategory ? subcategory.actions : [];
};
