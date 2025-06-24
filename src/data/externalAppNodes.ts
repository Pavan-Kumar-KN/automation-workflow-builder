import { 
  Mail,
  FileText,
  Calendar,
  Users,
  Database,
  Building,
  Search,
  CheckCircle,
  Share2,
  MessageSquare,
  Youtube,
  Facebook,
  Twitter,
  Slack,
  Instagram,
  ShoppingCart,
  CreditCard,
  BookOpen,
  Phone,
  Globe,
  AlertCircle,
} from 'lucide-react';
import { NodeData } from './types';

export const externalAppNodes: NodeData[] = [
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
    icon: Instagram,
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
    color: 'bg-indigo-50 border-indigo-200'
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
    icon: FileText,
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
