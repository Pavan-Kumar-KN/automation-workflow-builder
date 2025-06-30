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

// Backend JSON structure for your API
export interface BackendWorkflowJSON {
  name: string;
  user_id: number;
  triggers: Array<{
    id?: string;
    type: string;
    child?: number | null;
    options: {
      key: string;
      [key: string]: any;
    };
    last_executed?: string | null;
    evaluationResult?: any;
  }>;
  actions: Array<{
    id: number;
    type: string;
    child: number | null;
    options: {
      key: string;
      [key: string]: any;
    };
    last_executed?: string | null;
    evaluationResult?: any;
  }>;
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
 * Constructs Backend JSON for API submission
 */
export class BackendJSONConstructor {
  static construct(
    nodes: Node[],
    edges: Edge[],
    workflowName: string,
    userId: number = 54
  ): BackendWorkflowJSON {
    
    console.log('🚀 Constructing Backend JSON...', { nodes: nodes.length, edges: edges.length });

    // Build execution chain from nodes and edges
    const executionChain = this.buildExecutionChain(nodes, edges);
    
    const triggers = executionChain.triggers.map(trigger => ({
      id: trigger.id || 'trigger',
      type: this.mapNodeTypeToBackend(trigger.nodeType),
      child: trigger.child,
      options: this.buildTriggerOptions(trigger),
      last_executed: null,
      evaluationResult: null
    }));

    const actions = executionChain.actions.map((action, index) => ({
      id: action.id || (1000000000 + index),
      type: this.mapNodeTypeToBackend(action.nodeType),
      child: action.child,
      options: this.buildActionOptions(action),
      last_executed: null,
      evaluationResult: null
    }));

    return {
      name: workflowName || 'My Automation',
      user_id: userId,
      triggers,
      actions
    };
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

  private static buildTriggerOptions(trigger: any) {
    const config = trigger.config;
    
    switch (trigger.nodeType) {
      case 'contact-updated-trigger':
        return {
          key: 'form-filled',
          form_builder_uid: [config.formId || '6836aa94ca0c9'],
          init: 'true',
          automation_uid: trigger.id
        };
      default:
        return {
          key: 'generic-trigger',
          automation_uid: trigger.id
        };
    }
  }

  private static buildActionOptions(action: any) {
    const config = action.config;
    
    switch (action.nodeType) {
      case 'send-email-action':
        return {
          key: 'send_email',
          email_uid: config.templateId || `email_${Date.now()}`,
          from_email: config.fromEmail,
          to_email: config.emailTo,
          subject: config.subject
        };
      case 'send-sms-action':
        return {
          key: 'send_sms',
          phone_number: config.phoneNumber,
          message: config.smsTemplate
        };
      default:
        return {
          key: 'generic-action'
        };
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
