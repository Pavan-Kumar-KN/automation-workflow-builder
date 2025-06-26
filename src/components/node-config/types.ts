
export interface NodeConfig {
  // Common fields
  id?: string;
  label?: string;
  description?: string;
  webhookUrl?: string;
  enabled?: boolean;

  // Trigger-specific fields
  formId?: string;
  watchedFields?: string[];
  triggerCondition?: string;

  // Action-specific fields
  actionType?: string;
  targetService?: string;
  configData?: string;
  templateId?: string;
  fromEmail?: string;
  subject?: string;
  emailTo?: string;
  customContent?: string;
  smsTemplate?: string;
  phoneNumber?: string;
  listId?: string;
  updateFields?: Record<string, any>;

  // Condition-specific fields
  field?: string;
  operator?: string;
  value?: string;

  // Split-specific fields
  distributionType?: string;
  paths?: Array<{
    id: string;
    name: string;
    percentage: number;
    condition?: string;
  }>;

  // Goto-specific fields
  targetNodeId?: string;
  targetNodeLabel?: string;

  // Generic fields for extensibility
  [key: string]: any;
}

export interface ConfigComponentProps {
  config: NodeConfig;
  setConfig: (config: NodeConfig) => void;
}
