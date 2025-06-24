import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  MessageSquare, 
  Database, 
  Calendar,
  FileText,
  Mail,
  Webhook,
  GitBranch,
  Zap,
  Plus,
  Users,
  CreditCard,
  BookOpen,
  Phone,
  Clock,
  Target,
  UserCheck,
  Building,
  ShoppingCart,
  GraduationCap,
  Bell,
  Settings,
  Send,
  Tag,
  UserPlus,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Star,
  Globe,
  PlayCircle,
  StopCircle,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Share2,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Youtube,
  Facebook,
  Twitter,
  Slack,
  Trello
} from 'lucide-react';

const triggerNodes = [
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
    icon: Share2,
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

const actionNodes = [
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

const conditionNodes = [
  { 
    id: 'condition', 
    label: 'If/Then Condition', 
    icon: GitBranch,
    description: 'Add conditional logic to workflow',
    color: 'bg-orange-50 border-orange-200'
  },
  { 
    id: 'filter-condition', 
    label: 'Filter Condition', 
    icon: Filter,
    description: 'Filter contacts based on criteria',
    color: 'bg-orange-50 border-orange-200'
  },
];

const externalAppNodes = [
  // Google Apps
  { 
    id: 'gmail-app', 
    label: 'Gmail', 
    icon: Mail,
    description: 'Connect with Gmail email service',
    color: 'bg-red-50 border-red-200'
  },
  { 
    id: 'google-sheets-app', 
    label: 'Google Sheets', 
    icon: FileText,
    description: 'Connect with Google Sheets',
    color: 'bg-green-50 border-green-200'
  },
  { 
    id: 'google-calendar-app', 
    label: 'Google Calendar', 
    icon: Calendar,
    description: 'Connect with Google Calendar',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'google-contacts-app', 
    label: 'Google Contacts', 
    icon: Users,
    description: 'Connect with Google Contacts',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'google-docs-app', 
    label: 'Google Docs', 
    icon: FileText,
    description: 'Connect with Google Docs',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'google-drive-app', 
    label: 'Google Drive', 
    icon: Database,
    description: 'Connect with Google Drive',
    color: 'bg-yellow-50 border-yellow-200'
  },
  { 
    id: 'google-forms-app', 
    label: 'Google Forms', 
    icon: FileText,
    description: 'Connect with Google Forms',
    color: 'bg-purple-50 border-purple-200'
  },
  { 
    id: 'google-my-business-app', 
    label: 'Google My Business', 
    icon: Building,
    description: 'Connect with Google My Business',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'google-search-console-app', 
    label: 'Google Search Console', 
    icon: Search,
    description: 'Connect with Google Search Console',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'google-slides-app', 
    label: 'Google Slides', 
    icon: FileText,
    description: 'Connect with Google Slides',
    color: 'bg-orange-50 border-orange-200'
  },
  { 
    id: 'google-tasks-app', 
    label: 'Google Tasks', 
    icon: CheckCircle,
    description: 'Connect with Google Tasks',
    color: 'bg-blue-50 border-blue-200'
  },

  // Microsoft Apps
  { 
    id: 'microsoft-excel-app', 
    label: 'Microsoft Excel 365', 
    icon: FileText,
    description: 'Connect with Microsoft Excel 365',
    color: 'bg-green-50 border-green-200'
  },
  { 
    id: 'microsoft-onedrive-app', 
    label: 'Microsoft OneDrive', 
    icon: Database,
    description: 'Connect with Microsoft OneDrive',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'microsoft-outlook-app', 
    label: 'Microsoft Outlook', 
    icon: Mail,
    description: 'Connect with Microsoft Outlook',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'microsoft-calendar-app', 
    label: 'Microsoft Calendar', 
    icon: Calendar,
    description: 'Connect with Microsoft Calendar',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'microsoft-sharepoint-app', 
    label: 'Microsoft SharePoint', 
    icon: Share2,
    description: 'Connect with Microsoft SharePoint',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'microsoft-teams-app', 
    label: 'Microsoft Teams', 
    icon: Users,
    description: 'Connect with Microsoft Teams',
    color: 'bg-purple-50 border-purple-200'
  },
  { 
    id: 'microsoft-todo-app', 
    label: 'Microsoft To Do', 
    icon: CheckCircle,
    description: 'Connect with Microsoft To Do',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'microsoft-dynamics-365-app', 
    label: 'Microsoft Dynamics 365 Business Central', 
    icon: Database,
    description: 'Connect with Microsoft Dynamics 365',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'microsoft-dynamics-crm-app', 
    label: 'Microsoft Dynamics CRM', 
    icon: Users,
    description: 'Connect with Microsoft Dynamics CRM',
    color: 'bg-blue-50 border-blue-200'
  },

  // Social Media & Communication
  { 
    id: 'facebook-pages-app', 
    label: 'Facebook Pages', 
    icon: Facebook,
    description: 'Connect with Facebook Pages',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'instagram-business-app', 
    label: 'Instagram for Business', 
    icon: Users,
    description: 'Connect with Instagram for Business',
    color: 'bg-pink-50 border-pink-200'
  },
  { 
    id: 'linkedin-app', 
    label: 'LinkedIn', 
    icon: Users,
    description: 'Connect with LinkedIn',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'twitter-app', 
    label: 'Twitter', 
    icon: Twitter,
    description: 'Connect with Twitter',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'telegram-bot-app', 
    label: 'Telegram Bot', 
    icon: MessageSquare,
    description: 'Connect with Telegram Bot',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'whatsapp-business-app', 
    label: 'WhatsApp Business', 
    icon: MessageSquare,
    description: 'Connect with WhatsApp Business',
    color: 'bg-green-50 border-green-200'
  },
  { 
    id: 'slack-app', 
    label: 'Slack', 
    icon: Slack,
    description: 'Connect with Slack',
    color: 'bg-purple-50 border-purple-200'
  },
  { 
    id: 'youtube-app', 
    label: 'YouTube', 
    icon: Youtube,
    description: 'Connect with YouTube',
    color: 'bg-red-50 border-red-200'
  },
  { 
    id: 'reddit-app', 
    label: 'Reddit', 
    icon: MessageSquare,
    description: 'Connect with Reddit',
    color: 'bg-orange-50 border-orange-200'
  },

  // CRM & Sales
  { 
    id: 'hubspot-app', 
    label: 'HubSpot', 
    icon: Database,
    description: 'Connect with HubSpot CRM',
    color: 'bg-orange-50 border-orange-200'
  },
  { 
    id: 'salesforce-app', 
    label: 'Salesforce', 
    icon: Database,
    description: 'Connect with Salesforce CRM',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'pipedrive-app', 
    label: 'Pipedrive', 
    icon: Database,
    description: 'Connect with Pipedrive CRM',
    color: 'bg-green-50 border-green-200'
  },
  { 
    id: 'lead-connector-app', 
    label: 'Lead Connector', 
    icon: Users,
    description: 'Connect with Lead Connector',
    color: 'bg-blue-50 border-blue-200'
  },

  // E-commerce & Payments
  { 
    id: 'shopify-app', 
    label: 'Shopify', 
    icon: ShoppingCart,
    description: 'Connect with Shopify',
    color: 'bg-green-50 border-green-200'
  },
  { 
    id: 'woocommerce-app', 
    label: 'WooCommerce', 
    icon: ShoppingCart,
    description: 'Connect with WooCommerce',
    color: 'bg-purple-50 border-purple-200'
  },
  { 
    id: 'stripe-app', 
    label: 'Stripe', 
    icon: CreditCard,
    description: 'Connect with Stripe payments',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'razorpay-app', 
    label: 'Razorpay', 
    icon: CreditCard,
    description: 'Connect with Razorpay',
    color: 'bg-blue-50 border-blue-200'
  },

  // Marketing & Email
  { 
    id: 'mailchimp-app', 
    label: 'MailChimp', 
    icon: Mail,
    description: 'Connect with MailChimp',
    color: 'bg-yellow-50 border-yellow-200'
  },
  { 
    id: 'convertkit-app', 
    label: 'ConvertKit', 
    icon: Mail,
    description: 'Connect with ConvertKit',
    color: 'bg-pink-50 border-pink-200'
  },
  { 
    id: 'sendgrid-app', 
    label: 'SendGrid', 
    icon: Mail,
    description: 'Connect with SendGrid',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'manychat-app', 
    label: 'ManyChat', 
    icon: MessageSquare,
    description: 'Connect with ManyChat',
    color: 'bg-blue-50 border-blue-200'
  },

  // Productivity & Project Management
  { 
    id: 'notion-app', 
    label: 'Notion', 
    icon: FileText,
    description: 'Connect with Notion',
    color: 'bg-gray-50 border-gray-200'
  },
  { 
    id: 'trello-app', 
    label: 'Trello', 
    icon: Trello,
    description: 'Connect with Trello',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'monday-app', 
    label: 'Monday.com', 
    icon: Calendar,
    description: 'Connect with Monday.com',
    color: 'bg-red-50 border-red-200'
  },
  { 
    id: 'jira-cloud-app', 
    label: 'Jira Cloud', 
    icon: AlertCircle,
    description: 'Connect with Jira Cloud',
    color: 'bg-blue-50 border-blue-200'
  },

  // Forms & Surveys
  { 
    id: 'typeform-app', 
    label: 'Typeform', 
    icon: FileText,
    description: 'Connect with Typeform',
    color: 'bg-gray-50 border-gray-200'
  },
  { 
    id: 'jotform-app', 
    label: 'Jotform', 
    icon: FileText,
    description: 'Connect with Jotform',
    color: 'bg-orange-50 border-orange-200'
  },
  { 
    id: 'surveymonkey-app', 
    label: 'SurveyMonkey', 
    icon: FileText,
    description: 'Connect with SurveyMonkey',
    color: 'bg-green-50 border-green-200'
  },

  // Communication & Support
  { 
    id: 'intercom-app', 
    label: 'Intercom', 
    icon: MessageSquare,
    description: 'Connect with Intercom',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'zendesk-app', 
    label: 'Zendesk', 
    icon: Users,
    description: 'Connect with Zendesk',
    color: 'bg-green-50 border-green-200'
  },
  { 
    id: 'zoom-app', 
    label: 'Zoom', 
    icon: Users,
    description: 'Connect with Zoom',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'twilio-app', 
    label: 'Twilio', 
    icon: Phone,
    description: 'Connect with Twilio',
    color: 'bg-red-50 border-red-200'
  },

  // Calendly & Scheduling
  { 
    id: 'calendly-app', 
    label: 'Calendly', 
    icon: Calendar,
    description: 'Connect with Calendly',
    color: 'bg-blue-50 border-blue-200'
  },

  // Zoho Suite
  { 
    id: 'zoho-books-app', 
    label: 'Zoho Books', 
    icon: BookOpen,
    description: 'Connect with Zoho Books',
    color: 'bg-orange-50 border-orange-200'
  },
  { 
    id: 'zoho-crm-app', 
    label: 'Zoho CRM', 
    icon: Database,
    description: 'Connect with Zoho CRM',
    color: 'bg-orange-50 border-orange-200'
  },
  { 
    id: 'zoho-desk-app', 
    label: 'Zoho Desk', 
    icon: Users,
    description: 'Connect with Zoho Desk',
    color: 'bg-orange-50 border-orange-200'
  },
  { 
    id: 'zoho-invoice-app', 
    label: 'Zoho Invoice', 
    icon: FileText,
    description: 'Connect with Zoho Invoice',
    color: 'bg-orange-50 border-orange-200'
  },
  { 
    id: 'zoho-mail-app', 
    label: 'Zoho Mail', 
    icon: Mail,
    description: 'Connect with Zoho Mail',
    color: 'bg-orange-50 border-orange-200'
  },

  // Others
  { 
    id: 'odoo-app', 
    label: 'Odoo', 
    icon: Database,
    description: 'Connect with Odoo ERP',
    color: 'bg-purple-50 border-purple-200'
  },
  { 
    id: 'webflow-app', 
    label: 'Webflow', 
    icon: Globe,
    description: 'Connect with Webflow',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'wordpress-app', 
    label: 'WordPress', 
    icon: Globe,
    description: 'Connect with WordPress',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'zerobounce-app', 
    label: 'ZeroBounce', 
    icon: Mail,
    description: 'Connect with ZeroBounce',
    color: 'bg-green-50 border-green-200'
  },
];

export const Sidebar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [triggersOpen, setTriggersOpen] = useState(true);
  const [actionsOpen, setActionsOpen] = useState(true);
  const [conditionsOpen, setConditionsOpen] = useState(true);
  const [externalAppsOpen, setExternalAppsOpen] = useState(true);

  const onDragStart = (event: React.DragEvent, nodeType: string, nodeData: any) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/nodedata', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  const filterNodes = (nodes: any[], search: string) => {
    if (!search.trim()) return nodes;
    
    const searchLower = search.toLowerCase();
    return nodes.filter(node => {
      const label = node.label.toLowerCase();
      const description = node.description.toLowerCase();
      
      // Check if search term is contained in label or description
      const containsMatch = label.includes(searchLower) || description.includes(searchLower);
      
      // Check if search term matches first letter or word
      const words = label.split(' ');
      const firstLetterMatch = label.startsWith(searchLower);
      const firstWordMatch = words.some(word => word.toLowerCase().startsWith(searchLower));
      
      return containsMatch || firstLetterMatch || firstWordMatch;
    });
  };

  const filteredTriggers = useMemo(() => filterNodes(triggerNodes, searchTerm), [searchTerm]);
  const filteredActions = useMemo(() => filterNodes(actionNodes, searchTerm), [searchTerm]);
  const filteredConditions = useMemo(() => filterNodes(conditionNodes, searchTerm), [searchTerm]);
  const filteredExternalApps = useMemo(() => filterNodes(externalAppNodes, searchTerm), [searchTerm]);

  const NodeCategory = ({ title, nodes, nodeType, emoji, isOpen, setIsOpen }: { 
    title: string; 
    nodes: any[]; 
    nodeType: string; 
    emoji: string;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
  }) => {
    if (nodes.length === 0) return null;
    
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-6">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between w-full group hover:bg-gray-50 p-2 rounded-md transition-colors">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="text-base">{emoji}</span>
              {title} ({nodes.length})
            </h3>
            {isOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <div className="space-y-2">
            {nodes.map((node) => {
              const IconComponent = node.icon;
              return (
                <Card
                  key={node.id}
                  className={`p-3 cursor-grab hover:shadow-md transition-all duration-200 border-2 ${node.color} hover:scale-[1.02]`}
                  draggable
                  onDragStart={(event) => onDragStart(event, nodeType, node)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-white shadow-sm flex-shrink-0">
                      <IconComponent className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 leading-tight">
                        {node.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {node.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto h-full">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Workflow Builder</h2>
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
            <Plus className="w-3 h-3 mr-1" />
            Drag to add
          </Badge>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Build powerful automation workflows by dragging and dropping components
        </p>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search triggers and actions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9 text-sm"
          />
        </div>
      </div>

      <NodeCategory 
        title="Triggers" 
        nodes={filteredTriggers} 
        nodeType="trigger" 
        emoji="🔥" 
        isOpen={triggersOpen}
        setIsOpen={setTriggersOpen}
      />
      <NodeCategory 
        title="Actions" 
        nodes={filteredActions} 
        nodeType="action" 
        emoji="⚡" 
        isOpen={actionsOpen}
        setIsOpen={setActionsOpen}
      />
      <NodeCategory 
        title="Conditions" 
        nodes={filteredConditions} 
        nodeType="condition" 
        emoji="🎯" 
        isOpen={conditionsOpen}
        setIsOpen={setConditionsOpen}
      />
      <NodeCategory 
        title="External Apps" 
        nodes={filteredExternalApps} 
        nodeType="external-app" 
        emoji="🔗" 
        isOpen={externalAppsOpen}
        setIsOpen={setExternalAppsOpen}
      />
      
      {searchTerm && filteredTriggers.length === 0 && filteredActions.length === 0 && filteredConditions.length === 0 && filteredExternalApps.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No components found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};
