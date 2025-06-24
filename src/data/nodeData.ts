import * as LucideIcons from 'lucide-react';

export interface NodeData {
  id: string;
  label: string;
  icon: keyof typeof LucideIcons;
  description: string;
  color: string;
}

export const triggerNodes: NodeData[] = [
  { 
    id: 'form-submission-trigger', 
    label: 'Form Submission', 
    icon: 'FileText',
    description: 'Triggered when a form is submitted',
    color: 'bg-red-50 border-red-200'
  },
  { 
    id: 'new-contact-trigger', 
    label: 'New Contact', 
    icon: 'Users',
    description: 'Triggered when a new contact is created',
    color: 'bg-red-50 border-red-200'
  },
  { 
    id: 'calendar-event-trigger', 
    label: 'Calendar Event', 
    icon: 'Calendar',
    description: 'Triggered when a calendar event starts',
    color: 'bg-red-50 border-red-200'
  },
  { 
    id: 'crm-update-trigger', 
    label: 'CRM Update', 
    icon: 'Database',
    description: 'Triggered when a CRM record is updated',
    color: 'bg-red-50 border-red-200'
  },
  { 
    id: 'subscription-trigger', 
    label: 'New Subscription', 
    icon: 'CreditCard',
    description: 'Triggered when a new subscription is created',
    color: 'bg-red-50 border-red-200'
  },
  { 
    id: 'course-enrollment-trigger', 
    label: 'Course Enrollment', 
    icon: 'GraduationCap',
    description: 'Triggered when a user enrolls in a course',
    color: 'bg-red-50 border-red-200'
  },
  { 
    id: 'api-webhook-trigger', 
    label: 'API Webhook', 
    icon: 'Webhook',
    description: 'Triggered by an incoming webhook event',
    color: 'bg-red-50 border-red-200'
  },
  { 
    id: 'schedule-trigger', 
    label: 'Scheduled Time', 
    icon: 'Clock',
    description: 'Triggered at a specific time or interval',
    color: 'bg-red-50 border-red-200'
  }
];

export const actionNodes: NodeData[] = [
  { 
    id: 'send-email-action', 
    label: 'Send Email', 
    icon: 'Mail',
    description: 'Sends an email to a specified address',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'send-whatsapp-action', 
    label: 'Send WhatsApp Message', 
    icon: 'MessageSquare',
    description: 'Sends a message via WhatsApp',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'send-sms-action', 
    label: 'Send SMS', 
    icon: 'Phone',
    description: 'Sends an SMS message to a phone number',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'delay-action', 
    label: 'Delay', 
    icon: 'Clock',
    description: 'Pauses the workflow for a specified duration',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'conditional-action', 
    label: 'Conditional Split', 
    icon: 'GitBranch',
    description: 'Splits the workflow based on conditions',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'update-contact-action', 
    label: 'Update Contact', 
    icon: 'Users',
    description: 'Updates a contact record in the CRM',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'create-crm-action', 
    label: 'Create CRM Record', 
    icon: 'Database',
    description: 'Creates a new record in the CRM',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'submit-form-action', 
    label: 'Submit Form', 
    icon: 'FileText',
    description: 'Submits a specified form',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'create-calendar-action', 
    label: 'Create Calendar Event', 
    icon: 'Calendar',
    description: 'Creates a new event in the calendar',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'grant-course-action', 
    label: 'Grant Course Access', 
    icon: 'GraduationCap',
    description: 'Grants access to a specified course',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'add-community-action', 
    label: 'Add to Community', 
    icon: 'Users',
    description: 'Adds a user to a community or group',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'execute-webhook-action', 
    label: 'Execute Webhook', 
    icon: 'Webhook',
    description: 'Triggers an external webhook',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'start-automation-action', 
    label: 'Start Automation', 
    icon: 'PlayCircle',
    description: 'Starts another automation workflow',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'add-tag-action', 
    label: 'Add Tag', 
    icon: 'Tag',
    description: 'Adds a tag to a contact or record',
    color: 'bg-blue-50 border-blue-200'
  }
];

export const conditionNodes: NodeData[] = [
  { 
    id: 'check-field-condition', 
    label: 'Check Field', 
    icon: 'Filter',
    description: 'Checks the value of a specific field',
    color: 'bg-orange-50 border-orange-200'
  },
  { 
    id: 'evaluate-condition', 
    label: 'Evaluate Condition', 
    icon: 'GitBranch',
    description: 'Evaluates a complex condition',
    color: 'bg-orange-50 border-orange-200'
  }
];

export const externalAppNodes: NodeData[] = [
  // Google Apps
  { 
    id: 'google-sheets-app', 
    label: 'Google Sheets', 
    icon: 'FileText',
    description: 'Connect with Google Sheets',
    color: 'bg-green-50 border-green-200'
  },
  { 
    id: 'google-drive-app', 
    label: 'Google Drive', 
    icon: 'Cloud',
    description: 'Connect with Google Drive',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'gmail-app', 
    label: 'Gmail', 
    icon: 'Mail',
    description: 'Connect with Gmail',
    color: 'bg-red-50 border-red-200'
  },
  { 
    id: 'google-calendar-app', 
    label: 'Google Calendar', 
    icon: 'Calendar',
    description: 'Connect with Google Calendar',
    color: 'bg-blue-50 border-blue-200'
  },

  // Social Media
  { 
    id: 'facebook-app', 
    label: 'Facebook', 
    icon: 'Facebook',
    description: 'Connect with Facebook',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'instagram-business-app', 
    label: 'Instagram for Business', 
    icon: 'Instagram',
    description: 'Connect with Instagram for Business',
    color: 'bg-pink-50 border-pink-200'
  },
  { 
    id: 'twitter-app', 
    label: 'Twitter', 
    icon: 'Twitter',
    description: 'Connect with Twitter',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'linkedin-app', 
    label: 'LinkedIn', 
    icon: 'User',
    description: 'Connect with LinkedIn',
    color: 'bg-blue-50 border-blue-200'
  },

  // Communication & Collaboration
  { 
    id: 'slack-app', 
    label: 'Slack', 
    icon: 'Slack',
    description: 'Connect with Slack',
    color: 'bg-purple-50 border-purple-200'
  },
  { 
    id: 'discord-app', 
    label: 'Discord', 
    icon: 'User',
    description: 'Connect with Discord',
    color: 'bg-indigo-50 border-indigo-200'
  },
  { 
    id: 'zoom-app', 
    label: 'Zoom', 
    icon: 'Camera',
    description: 'Connect with Zoom',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'microsoft-teams-app', 
    label: 'Microsoft Teams', 
    icon: 'User',
    description: 'Connect with Microsoft Teams',
    color: 'bg-purple-50 border-purple-200'
  },

  // Development & Productivity
  { 
    id: 'github-app', 
    label: 'GitHub', 
    icon: 'Github',
    description: 'Connect with GitHub',
    color: 'bg-gray-50 border-gray-200'
  },
  { 
    id: 'notion-app', 
    label: 'Notion', 
    icon: 'FileText',
    description: 'Connect with Notion',
    color: 'bg-gray-50 border-gray-200'
  },
  { 
    id: 'airtable-app', 
    label: 'Airtable', 
    icon: 'Database',
    description: 'Connect with Airtable',
    color: 'bg-orange-50 border-orange-200'
  },
  { 
    id: 'asana-app', 
    label: 'Asana', 
    icon: 'CheckCircle',
    description: 'Connect with Asana',
    color: 'bg-red-50 border-red-200'
  },
  { 
    id: 'trello-app', 
    label: 'Trello', 
    icon: 'FileText',
    description: 'Connect with Trello',
    color: 'bg-blue-50 border-blue-200'
  },

  // E-commerce & Payments
  { 
    id: 'shopify-app', 
    label: 'Shopify', 
    icon: 'ShoppingCart',
    description: 'Connect with Shopify',
    color: 'bg-green-50 border-green-200'
  },
  { 
    id: 'woocommerce-app', 
    label: 'WooCommerce', 
    icon: 'ShoppingCart',
    description: 'Connect with WooCommerce',
    color: 'bg-purple-50 border-purple-200'
  },
  { 
    id: 'stripe-app', 
    label: 'Stripe', 
    icon: 'CreditCard',
    description: 'Connect with Stripe payments',
    color: 'bg-indigo-50 border-indigo-200'
  },
  { 
    id: 'paypal-app', 
    label: 'PayPal', 
    icon: 'CreditCard',
    description: 'Connect with PayPal',
    color: 'bg-blue-50 border-blue-200'
  },

  // Email Marketing & CRM
  { 
    id: 'mailchimp-app', 
    label: 'Mailchimp', 
    icon: 'Mail',
    description: 'Connect with Mailchimp',
    color: 'bg-yellow-50 border-yellow-200'
  },
  { 
    id: 'hubspot-app', 
    label: 'HubSpot', 
    icon: 'Users',
    description: 'Connect with HubSpot CRM',
    color: 'bg-orange-50 border-orange-200'
  },
  { 
    id: 'salesforce-app', 
    label: 'Salesforce', 
    icon: 'Cloud',
    description: 'Connect with Salesforce',
    color: 'bg-blue-50 border-blue-200'
  },

  // Cloud Storage
  { 
    id: 'dropbox-app', 
    label: 'Dropbox', 
    icon: 'Cloud',
    description: 'Connect with Dropbox',
    color: 'bg-blue-50 border-blue-200'
  },
  { 
    id: 'onedrive-app', 
    label: 'OneDrive', 
    icon: 'Cloud',
    description: 'Connect with Microsoft OneDrive',
    color: 'bg-blue-50 border-blue-200'
  }
];
