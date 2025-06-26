import React from 'react';
import { Node } from '@xyflow/react';

// Import specific config components
import { SendEmailConfig } from './specific/SendEmailConfig';
import { SendSMSConfig } from './specific/SendSMSConfig';

// Import generic config components
import { TriggerConfig } from './TriggerConfig';
import { ActionConfig } from './ActionConfig';
import { ConditionConfig } from './ConditionConfig';
import { SplitConfig } from './SplitConfig';
import { GotoConfig } from './GotoConfig';

import { NodeConfig } from './types';

interface DynamicNodeConfigProps {
  node: Node;
  onUpdate: (nodeId: string, data: any) => void;
  onClose: () => void;
}

export const DynamicNodeConfig: React.FC<DynamicNodeConfigProps> = ({ node, onUpdate, onClose }) => {
  // For specific node configurations based on node ID
  const getSpecificConfig = () => {
    const nodeId = node.data?.id;
    
    switch (nodeId) {
      // Trigger-specific configs
      case 'contact-updated-trigger':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">Contact Updated Trigger</h3>
            <p className="text-sm text-gray-600">Configure which form and fields to monitor for contact updates</p>
            <TriggerConfig
              config={node.data as NodeConfig}
              setConfig={(config) => onUpdate(node.id, config)}
            />
          </div>
        );
      
      case 'form-submitted-trigger':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">Form Submitted Trigger</h3>
            <p className="text-sm text-gray-600">Configure which form to monitor for submissions</p>
            {/* Add form selection logic here */}
            <TriggerConfig 
              config={node.data as NodeConfig}
              setConfig={(config) => onUpdate(node.id, config)}
            />
          </div>
        );

      // Action-specific configs  
      case 'send-email-action':
        return (
          <SendEmailConfig 
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );
        
      case 'send-sms-action':
        return (
          <SendSMSConfig
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );

      case 'update-contact-action':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">Update Contact Action</h3>
            <p className="text-sm text-gray-600">Configure which contact fields to update</p>
            {/* Add contact update config here */}
            <ActionConfig 
              config={node.data as NodeConfig}
              setConfig={(config) => onUpdate(node.id, config)}
            />
          </div>
        );

      case 'add-to-list-action':
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">Add to List Action</h3>
            <p className="text-sm text-gray-600">Select which list to add the contact to</p>
            {/* Add list selection config here */}
            <ActionConfig 
              config={node.data as NodeConfig}
              setConfig={(config) => onUpdate(node.id, config)}
            />
          </div>
        );

      // Add more specific configs as needed
      default:
        return null;
    }
  };

  // Get generic config based on node type
  const getGenericConfig = () => {
    switch (node.type) {
      case 'trigger':
        return (
          <TriggerConfig 
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );
      case 'action':
        return (
          <ActionConfig 
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );
      case 'condition':
        return (
          <ConditionConfig 
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );
      case 'split-condition':
        return (
          <SplitConfig 
            config={node.data as NodeConfig}
            setConfig={(config) => onUpdate(node.id, config)}
          />
        );
      case 'goto-node':
        return (
          <GotoConfig 
            node={node}
            onUpdate={onUpdate}
            onClose={onClose}
          />
        );
      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <p>No configuration available for this node type.</p>
          </div>
        );
    }
  };

  // Try specific config first, fall back to generic
  const specificConfig = getSpecificConfig();
  
  return (
    <div className="p-6">
      {specificConfig || getGenericConfig()}
    </div>
  );
};
