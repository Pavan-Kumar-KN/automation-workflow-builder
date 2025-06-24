
export interface NodeConfig {
  label?: string;
  webhookUrl?: string;
  enabled?: boolean;
  actionType?: string;
  targetService?: string;
  configData?: string;
  field?: string;
  operator?: string;
  value?: string;
  distributionType?: string;
  paths?: Array<{ name: string; percentage: number; id: string }>;
}

export interface ConfigComponentProps {
  config: NodeConfig;
  setConfig: (config: NodeConfig) => void;
}
