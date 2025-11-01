
import {
  Bell,
  BookX,
  Box,
  CalendarCheck,
  CalendarClock,
  CalendarX,
  Clock,
  Edit,
  Facebook,
  Layers,
  ListTree,
  Mail,
  MessageCircle,
  MessageSquare,
  ReceiptText,
  RefreshCw,
  Repeat2,
  Settings,
  Share2,
  Sparkles,
  Star,
  Tag,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  XCircle,
  Zap,
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
    color: 'border-emerald-200 text-emerald-600'
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
  // Evaluate actions
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
  },

  // * CRM sub category options 
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
  },

  // Sales 
  {
    id: 'invoice-form',
    label: 'Invoice Amount',
    icon: ReceiptText, // Best for invoice-related actions
    description: 'Add conditional logic to workflow',
    color: '#4F46E5', // Indigo-600
    type: 'condition'
  },

  // * Forms sub
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

  },

  // * Calendar sub category options 
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
  },

  // Webhook actions 
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
  },
  // Remove Workflow action ,
  {
    id: 'remove-workflow-action',
    label: 'Remove Workflow',
    icon: XCircle,
    description: 'Remove workflow from contact',
    color: '#EF4444'
  },
  {
    id: 'internal-notification-action',
    label: 'Internal Notification',
    icon: Bell,
    description: 'Internal notification',
    color: '#F97316'
  },

  // Operations related actions 
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
    icon: 'Database',
    description: 'Add or update contact in CRM',
    color: '#10B981' // Green-500: success, creation
  },
  {
    id: 'remove-from-crm-action',
    label: 'Remove from CRM',
    icon: 'DatabaseX', // Clear representation of deletion from database
    description: 'Remove contact from CRM',
    color: '#EF4444' // Red-500: removal
  },
  {
    id: 'course-revoke-operation-action',
    label: 'Course Revoke',
    icon: BookX, // Clear revoke/removal of course
    description: 'Revoke course access',
    color: '#EF4444' // Red-500: destructive action
  },
  {
    id: 'execute-automation-operation-action',
    label: 'Execute Automation',
    icon: Zap, // Best fit for automation/execution
    description: 'Execute automation',
    color: '#F97316' // Orange-500: attention but not danger
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
  }

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

];
