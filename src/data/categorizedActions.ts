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
  Facebook
} from 'lucide-react';
import { NodeData } from './types';

export interface ActionSubcategory {
  id: string;
  name: string;
  description: string;
  actions: NodeData[];
}

export interface ActionCategory {
  id: string;
  name: string;
  icon: any;
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
        color: 'bg-blue-50 border-blue-200'
      },

      {
        id: 'send-whatsapp-action',
        label: 'Send Whatsapp Message',
        icon: MessageCircle,
        description: 'Send an whatsapp message to contacts',
        color: 'bg-emerald-50 border-emerald-200 text-emerald-600'
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
            color: 'bg-orange-50 border-orange-200'
          },
          {
            id: 'contact-tagged-action',
            label: 'Contact Tagged',
            icon: Tag, // Replace Users with Tag
            description: 'Add conditional logic based on contact data',
            color: 'bg-orange-50 border-orange-200'
          },
          {
            id: 'contact-type-action',
            label: 'Contact Type',
            icon: Layers, // Best for categorization
            description: 'Add conditional logic based on contact data',
            color: 'bg-orange-50 border-orange-200'
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
            color: 'bg-orange-50 border-orange-200'
          },
          {
            id: 'assigned-staff',
            label: 'Assigned Staff',
            icon: UserPlus, // or UserCheck
            description: 'Add conditional logic to workflow',
            color: 'bg-orange-50 border-orange-200'
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
            color: 'bg-indigo-50 border-indigo-200'
          },
          {
            id: 'magic-form',
            label: 'Magic Form',
            icon: Sparkles, // Represents something magical or special
            description: 'Add conditional logic to workflow',
            color: 'bg-purple-50 border-purple-200'
          },
          {
            id: 'facebook-form',
            label: 'Facebook Form',
            icon: Facebook, // Lucide has a Facebook icon
            description: 'Add conditional logic to workflow',
            color: 'bg-blue-50 border-blue-200'
          }
          ,

        ]
      },



    ]
  },


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
