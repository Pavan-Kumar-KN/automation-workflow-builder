import { Node, Edge } from '@xyflow/react';
import { NodeConfig } from '@/components/node-config/types';

// Frontend JSON structure for workflow builder state
export interface FrontendWorkflowJSON {
  id: string;
  name: string;
  description?: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  nodes: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    data: NodeConfig & {
      label: string;
      icon?: string;
      color?: string;
      backendId?: string;
    };
    selected?: boolean;
    dragging?: boolean;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    type?: string;
    animated?: boolean;
    style?: any;
    markerEnd?: any;
  }>;
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  settings: {
    layoutMode: string;
    isActive: boolean;
  };
}

// Backend JSON structure matching learn.json format (SEGREGATED STRUCTURE)
export interface BackendWorkflowJSON {
  name: string;
  user_id: string;
  triggers: Array<{
    type: string;
    config: {
      child: string | null;
      options: {
        key: string;
        automation_uid?: string;
        [key: string]: any;
      };
      last_executed: null;
      evaluationResult: null;
    };
  }>;
  actions: Array<{
    id: string;
    type: string;
    config: {
      type?: string;
      options: {
        key: string;
        [key: string]: any;
      };
      last_executed: null;
      evaluationResult: null;
    };
  }>;
  layout: {
    node: Array<{
      id: string;
      type: string;
      position: { x: number; y: number };
      data: any;
    }>;
    edges: Array<{
      id: string;
      source: string;
      target: string;
      type?: string;
      animated?: boolean;
    }>;
  };
}

// Node type mapping for backend
const NODE_TYPE_MAPPING = {
  'contact-updated-trigger': 'ElementTrigger',
  'form-submitted-trigger': 'ElementTrigger',
  'send-email-action': 'ElementSendEmail',
  'send-sms-action': 'ElementSendSMS',
  'add-to-list-action': 'ElementAddToList',
  'update-contact-action': 'ElementUpdateContact',
  'condition': 'ElementCondition',
  'split-condition': 'ElementSplit',
  'goto-node': 'ElementGoto'
};

/**
 * Constructs Frontend JSON for workflow builder state
 */
export class FrontendJSONConstructor {
  static construct(
    nodes: Node[],
    edges: Edge[],
    workflowName: string,
    viewport: { x: number; y: number; zoom: number },
    settings: { layoutMode: string; isActive: boolean },
    workflowId?: string
  ): FrontendWorkflowJSON {
    console.log('🏗️ Constructing Frontend JSON...', { nodes: nodes.length, edges: edges.length });

    return {
      id: workflowId || `workflow_${Date.now()}`,
      name: workflowName || 'Untitled Workflow',
      description: `Workflow with ${nodes.length} nodes and ${edges.length} connections`,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          ...node.data,
          label: node.data.label || 'Unnamed Node',
          icon: node.data.icon?.name || undefined,
          color: node.data.color || undefined,
          backendId: node.data.backendId || undefined
        },
        selected: node.selected || false,
        dragging: node.dragging || false
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type || 'default',
        animated: edge.animated || false,
        style: edge.style || {},
        markerEnd: edge.markerEnd || {}
      })),
      viewport,
      settings
    };
  }

  static save(json: FrontendWorkflowJSON): void {
    const jsonString = JSON.stringify(json, null, 2);
    console.log('💾 Frontend JSON:', jsonString);
    
    // Save to localStorage for persistence
    localStorage.setItem(`workflow_frontend_${json.id}`, jsonString);
    
    // Also save to a downloadable file
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${json.name}_frontend.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);                                                                                   
    URL.revokeObjectURL(url);
  }

  static load(workflowId: string): FrontendWorkflowJSON | null {
    const jsonString = localStorage.getItem(`workflow_frontend_${workflowId}`);
    if (!jsonString) return null;
    
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('❌ Failed to parse Frontend JSON:', error);
      return null;
    }
  }
}

/**
 * Constructs Backend JSON for API submission (FLAT ARRAY FORMAT)
 */
export class BackendJSONConstructor {
  static construct(
    nodes: Node[],
    edges: Edge[],
    workflowName: string,
    userId: number = 54
  ): BackendWorkflowJSON {

    console.log('🚀 === CONSTRUCTING SEGREGATED JSON (LEARN.JSON FORMAT) ===', {
      nodes: nodes.length,
      edges: edges.length,
      workflowName
    });

    // Separate triggers and actions
    const triggerNodes = nodes.filter(node =>
      node.type === 'trigger' || node.type.includes('trigger')
    );

    const actionNodes = nodes.filter(node =>
      !node.type.includes('trigger')
    );

    // Build triggers array
    const triggers = triggerNodes.map(triggerNode => {
      const nextEdge = edges.find(edge => edge.source === triggerNode.id);
      const nextNode = nextEdge ? nodes.find(n => n.id === nextEdge.target) : null;

      return {
        type: this.mapNodeTypeToBackend(triggerNode.type),
        config: {
          child: nextNode ? nextNode.id : null,
          options: {
            key: this.getNodeKey(triggerNode.type),
            automation_uid: 'backend-will-give',
            ...this.extractNodeConfig(triggerNode)
          },
          last_executed: null,
          evaluationResult: null
        }
      };
    });

    // Build actions array
    const actions = actionNodes.map(actionNode => {
      return {
        id: actionNode.id,
        type: this.mapNodeTypeToBackend(actionNode.type),
        config: {
          type: this.mapNodeTypeToBackend(actionNode.type),
          options: {
            key: this.getNodeKey(actionNode.type),
            ...this.extractNodeConfig(actionNode)
          },
          last_executed: null,
          evaluationResult: null
        }
      };
    });

    // Build layout object
    const layout = {
      node: nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          label: (node.data as any).label || 'Unnamed Node',
          icon: (node.data as any).icon || undefined,
          color: (node.data as any).color || undefined,
          backendId: (node.data as any).backendId || undefined,
          submitted: (node.data as any).submitted || false
        }
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: edge.type || 'default',
        animated: edge.animated || false
      }))
    };

    // Build final segregated JSON
    const segregatedJSON: BackendWorkflowJSON = {
      name: workflowName || 'take-from-state',
      user_id: 'backend-will-give',
      triggers,
      actions,
      layout
    };

    console.log('✅ === SEGREGATED JSON CONSTRUCTION COMPLETED ===', {
      timestamp: new Date().toISOString(),
      triggersCount: triggers.length,
      actionsCount: actions.length,
      layoutNodes: layout.node.length,
      layoutEdges: layout.edges.length,
      structure: 'segregated (learn.json format)'
    });

    console.log('📋 === FINAL SEGREGATED JSON OUTPUT ===');
    console.log(JSON.stringify(segregatedJSON, null, 2));

    return segregatedJSON;
  }

  /**
   * Extract configuration data from node
   */
  private static extractNodeConfig(node: Node): Record<string, any> {
    const config: Record<string, any> = {};

    // Only extract if node has submitted configuration
    if ((node.data as any).submitted) {
      // Email configuration
      if ((node.data as any).emailConfig) {
        config.email_uid = (node.data as any).selectedTemplate || `email_${Date.now()}`;
        config.fromName = (node.data as any).emailConfig.fromName;
        config.emailSubject = (node.data as any).emailConfig.emailSubject;
        config.content = (node.data as any).emailConfig.content;
        config.template = 'true';
      }

      // SMS configuration
      if ((node.data as any).smsConfig) {
        config.provider = (node.data as any).selectedProvider || 'twilio';
        config.messageContent = (node.data as any).smsConfig.messageContent;
        config.senderName = (node.data as any).smsConfig.senderName;
      }

      // WhatsApp configuration
      if ((node.data as any).whatsappConfig) {
        config.wa_template_id = (node.data as any).selectedTemplate || '134';
        config.messageContent = (node.data as any).whatsappConfig.messageContent;
        config.device = (node.data as any).selectedDevice;
      }

      // Delay configuration
      if ((node.data as any).finalDelay) {
        config.time = `${(node.data as any).finalDelay.value} ${(node.data as any).finalDelay.unit}`;
        config.delayType = (node.data as any).delayType;
      }

      // Form trigger configuration
      if ((node.data as any).selectedForm) {
        config.form_builder_uid = (node.data as any).selectedForm;
        config.init = true;
      }

      // Product enquiry configuration
      if (node.type === 'product-enquiry-trigger') {
        config.product_id = (node.data as any).productId || '260';
        config.init = true;
      }
    } else {
      // Default configurations for unconfigured nodes
      if (node.type === 'send-email-action') {
        config.init = 'true';
        config.template = 'true';
      }
      if (node.type === 'send-whatsapp-action') {
        config.wa_template_id = '134';
        config.init = true;
      }
      if (node.type.includes('trigger')) {
        config.init = true;
      }
    }

    return config;
  }

  /**
   * Process a node and its chain recursively (DEPRECATED - keeping for compatibility)
   */
  private static processNodeChain(
    node: Node,
    nodes: Node[],
    edges: Edge[],
    flatArray: any,
    processedNodes: Set<string>
  ): void {
    if (processedNodes.has(node.id)) return;

    processedNodes.add(node.id);

    // Use actual frontend node ID
    const nodeId = node.id;

    // Find next node in chain
    const nextEdge = edges.find(edge => edge.source === node.id);
    const nextNode = nextEdge ? nodes.find(n => n.id === nextEdge.target) : null;
    const childId = nextNode ? nextNode.id : null;

    // Create element matching learn.json format
    const element: any = {
      id: node.type.includes('trigger') ? 'trigger' : nodeId,
      title: this.getNodeTitle(node),
      type: this.mapNodeTypeToBackend(node.type),
      child: childId,
      options: this.buildNodeOptions(node),
      last_executed: null,
      evaluationResult: null
    };

    // Add condition-specific fields if it's a condition node
    if (node.type === 'condition' || node.type === 'split-condition') {
      const conditionEdges = edges.filter(edge => edge.source === node.id);
      if (conditionEdges.length >= 2) {
        const yesNode = nodes.find(n => n.id === conditionEdges[0].target);
        const noNode = nodes.find(n => n.id === conditionEdges[1].target);
        if (yesNode) element.childYes = yesNode.id;
        if (noNode) element.childNo = noNode.id;
      }
    }

    flatArray.push(element);

    console.log('📝 Added element to flat array:', {
      id: element.id,
      title: element.title,
      type: element.type,
      child: element.child,
      hasConfig: !!node.data.submitted,
      optionsKeys: Object.keys(element.options)
    });

    // Process next node in chain
    if (nextNode) {
      this.processNodeChain(nextNode, nodes, edges, flatArray, processedNodes);
    }

    // Process condition branches
    if (node.type === 'condition' || node.type === 'split-condition') {
      const conditionEdges = edges.filter(edge => edge.source === node.id);
      conditionEdges.forEach(edge => {
        const branchNode = nodes.find(n => n.id === edge.target);
        if (branchNode && !processedNodes.has(branchNode.id)) {
          this.processNodeChain(branchNode, nodes, edges, flatArray, processedNodes);
        }
      });
    }
  }

  /**
   * Get node title based on type and configuration
   */
  private static getNodeTitle(node: Node): string {
    if (node.data.label) return node.data.label;

    const titleMapping: Record<string, string> = {
      'form-trigger': 'Form Submitted',
      'product-enquiry-trigger': 'New Product Enquired',
      'contact-updated-trigger': 'Contact Updated',
      'send-email-action': 'Send Email',
      'send-sms-action': 'Send SMS',
      'send-whatsapp-action': 'Action: Send WhatsApp Message',
      'delay-action': 'Wait',
      'condition': 'Condition Check',
      'split-condition': 'Split Flow'
    };

    return titleMapping[node.type] || 'No title';
  }

  /**
   * Build node options from configuration data
   */
  private static buildNodeOptions(node: Node): { key: string; [key: string]: any } {
    const baseOptions = {
      key: this.getNodeKey(node.type)
    };

    // Extract configuration data if node has submitted config
    if (node.data.submitted) {
      // Email configuration
      if (node.data.emailConfig) {
        Object.assign(baseOptions, {
          email_uid: node.data.selectedTemplate || `email_${Date.now()}`,
          fromName: node.data.emailConfig.fromName,
          emailSubject: node.data.emailConfig.emailSubject,
          content: node.data.emailConfig.content,
          template: 'true'
        });
      }

      // SMS configuration
      if (node.data.smsConfig) {
        Object.assign(baseOptions, {
          provider: node.data.selectedProvider || 'twilio',
          messageContent: node.data.smsConfig.messageContent,
          senderName: node.data.smsConfig.senderName
        });
      }

      // WhatsApp configuration
      if (node.data.whatsappConfig) {
        Object.assign(baseOptions, {
          wa_template_id: node.data.selectedTemplate || '134',
          messageContent: node.data.whatsappConfig.messageContent,
          device: node.data.selectedDevice
        });
      }

      // Delay configuration
      if (node.data.finalDelay) {
        Object.assign(baseOptions, {
          time: `${node.data.finalDelay.value} ${node.data.finalDelay.unit}`,
          delayType: node.data.delayType
        });
      }

      // Form trigger configuration
      if (node.data.selectedForm) {
        Object.assign(baseOptions, {
          form_builder_uid: node.data.selectedForm,
          init: true
        });
      }

      // Product enquiry configuration
      if (node.type === 'product-enquiry-trigger') {
        Object.assign(baseOptions, {
          product_id: node.data.productId || '260',
          init: true
        });
      }
    } else {
      // Default configurations for unconfigured nodes
      if (node.type === 'send-email-action') {
        baseOptions.init = 'true';
        baseOptions.template = 'true';
      }
      if (node.type === 'send-whatsapp-action') {
        baseOptions.wa_template_id = '134';
        baseOptions.init = true;
      }
      if (node.type.includes('trigger')) {
        baseOptions.init = true;
      }
    }

    return baseOptions;
  }

  private static buildExecutionChain(nodes: Node[], edges: Edge[]) {
    console.log('🔗 Building execution chain...');
    
    // Find trigger nodes (starting points)
    const triggerNodes = nodes.filter(node => 
      node.type === 'trigger' || node.type.includes('trigger')
    );

    // Find action nodes
    const actionNodes = nodes.filter(node => 
      node.type === 'action' || node.type.includes('action')
    );

    // Build chain by following edges
    const triggers = triggerNodes.map(trigger => {
      const nextEdge = edges.find(edge => edge.source === trigger.id);
      const nextNodeId = nextEdge?.target;
      const nextNode = nextNodeId ? nodes.find(n => n.id === nextNodeId) : null;
      
      return {
        id: trigger.data.backendId || trigger.id,
        nodeType: trigger.type,
        config: trigger.data,
        child: nextNode ? this.generateNodeId(nextNode) : null
      };
    });

    const actions = actionNodes.map(action => {
      const nextEdge = edges.find(edge => edge.source === action.id);
      const nextNodeId = nextEdge?.target;
      const nextNode = nextNodeId ? nodes.find(n => n.id === nextNodeId) : null;
      
      return {
        id: this.generateNodeId(action),
        nodeType: action.type,
        config: action.data,
        child: nextNode ? this.generateNodeId(nextNode) : null
      };
    });

    return { triggers, actions };
  }

  private static generateNodeId(node: Node): number {
    // Generate consistent numeric ID from node ID
    if (node.data.backendId) return parseInt(node.data.backendId);
    
    // Create hash from node ID
    let hash = 0;
    for (let i = 0; i < node.id.length; i++) {
      const char = node.id.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) + 1000000000; // Ensure positive and large
  }

  private static mapNodeTypeToBackend(nodeType: string): string {
    return NODE_TYPE_MAPPING[nodeType as keyof typeof NODE_TYPE_MAPPING] || 'ElementGeneric';
  }

  private static getNodeKey(nodeType: string): string {
    const keyMapping: Record<string, string> = {
      'form-trigger': 'form-filled',
      'contact-updated-trigger': 'form-filled',
      'api-trigger': 'api-called',
      'send-email-action': 'send-email-action',
      'send-whatsapp-action': 'send-whatsapp-action',
      'send-sms-action': 'send-sms-action',
      'delay-action': 'delay-action',
      'condition': 'condition-check',
      'split-condition': 'split-flow'
    };

    return keyMapping[nodeType] || 'generic-action';
  }

  private static buildTriggerOptions(trigger: any) {
    const config = trigger.config;
    const baseOptions: Record<string, any> = {};

    // Extract configuration data if node has submitted config
    if (config.submitted) {
      // Form trigger configuration
      if (config.selectedForm) {
        baseOptions.form_builder_uid = config.selectedForm;
        baseOptions.formType = config.formType;
      }

      // API trigger configuration
      if (config.apiConfig) {
        baseOptions.endpoint = config.apiConfig.endpoint;
        baseOptions.method = config.apiConfig.method;
      }
    }

    switch (trigger.nodeType) {
      case 'contact-updated-trigger':
      case 'form-trigger':
        return {
          form_builder_uid: baseOptions.form_builder_uid || '6836aa94ca0c9',
          init: 'true',
          ...baseOptions
        };
      case 'api-trigger':
        return {
          endpoint: baseOptions.endpoint || '/api/trigger',
          method: baseOptions.method || 'POST',
          ...baseOptions
        };
      default:
        return baseOptions;
    }
  }

  private static buildActionOptions(action: any) {
    const config = action.config;
    const baseOptions: Record<string, any> = {};

    // Extract configuration data if node has submitted config
    if (config.submitted) {
      // Email configuration
      if (config.emailConfig) {
        baseOptions.fromName = config.emailConfig.fromName;
        baseOptions.emailSubject = config.emailConfig.emailSubject;
        baseOptions.replyTo = config.emailConfig.replyTo;
        baseOptions.content = config.emailConfig.content;
        baseOptions.selectedTemplate = config.selectedTemplate;
      }

      // SMS configuration
      if (config.smsConfig) {
        baseOptions.messageContent = config.smsConfig.messageContent;
        baseOptions.senderName = config.smsConfig.senderName;
        baseOptions.selectedProvider = config.selectedProvider;
      }

      // WhatsApp configuration
      if (config.whatsappConfig) {
        baseOptions.messageContent = config.whatsappConfig.messageContent;
        baseOptions.selectedDevice = config.selectedDevice;
        baseOptions.selectedTemplate = config.selectedTemplate;
      }

      // Delay configuration
      if (config.finalDelay) {
        baseOptions.delayType = config.delayType;
        baseOptions.delayValue = config.finalDelay.value;
        baseOptions.delayUnit = config.finalDelay.unit;
      }
    }

    switch (action.nodeType) {
      case 'send-email-action':
        return {
          email_uid: baseOptions.selectedTemplate || `email_${Date.now()}`,
          fromName: baseOptions.fromName,
          emailSubject: baseOptions.emailSubject,
          content: baseOptions.content,
          ...baseOptions
        };
      case 'send-sms-action':
        return {
          provider: baseOptions.selectedProvider || 'twilio',
          senderName: baseOptions.senderName,
          messageContent: baseOptions.messageContent,
          ...baseOptions
        };
      case 'send-whatsapp-action':
        return {
          device: baseOptions.selectedDevice || 'device1',
          messageContent: baseOptions.messageContent,
          template: baseOptions.selectedTemplate,
          ...baseOptions
        };
      case 'delay-action':
        return {
          delayType: baseOptions.delayType || 'before',
          delayValue: baseOptions.delayValue || '5',
          delayUnit: baseOptions.delayUnit || 'minutes',
          ...baseOptions
        };
      default:
        return baseOptions;
    }
  }

  static save(json: BackendWorkflowJSON): void {
    const jsonString = JSON.stringify(json, null, 2);
    console.log('🚀 Backend JSON:', jsonString);
    
    // Save for debugging
    localStorage.setItem('workflow_backend_latest', jsonString);
    
    // Download file
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${json.name}_backend.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
