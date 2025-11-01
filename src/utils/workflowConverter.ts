import { Node, Edge } from '@xyflow/react';

// Backend JSON structure
export interface BackendWorkflowJSON {
  name: string;
  user_id: number;
  triggers: BackendTrigger[];
  actions: BackendAction[];
}

export interface BackendTrigger {
  type: string;
  config: {
    child: string | null; // Node ID of next node
    options: Record<string, any>;
    last_executed: null;
    evaluationResult: null;
  };
}

export interface BackendAction {
  type: string;
  config: {
    child: string | null; // Node ID of next node
    options: Record<string, any>;
    last_executed: null;
    evaluationResult: null;
  };
}

/**
 * Simple Workflow JSON Constructor
 * 
 * This converts React Flow nodes and edges into backend JSON format.
 * Uses node IDs as child references for simple linking.
 */
export class WorkflowConverter {
  
  /**
   * Convert workflow to backend JSON format
   */
  static convertToBackendJSON(
    nodes: Node[], 
    edges: Edge[], 
    workflowName: string = 'My workflow',
    userId: number = 54
  ): BackendWorkflowJSON {
    
    const triggers: BackendTrigger[] = [];
    const actions: BackendAction[] = [];
    
    // Process each node
    nodes.forEach(node => {
      if (node.type === 'trigger') {
        triggers.push(this.createTrigger(node, edges));
      } else if (node.type === 'action') {
        actions.push(this.createAction(node, edges));
      }
      // Note: Condition nodes are handled as actions with special logic
      else if (node.type === 'condition') {
        actions.push(this.createCondition(node, edges));
      }
    });
    
    return {
      name: workflowName,
      user_id: userId,
      triggers,
      actions
    };
  }
  
  /**
   * Create trigger object
   */
  private static createTrigger(node: Node, edges: Edge[]): BackendTrigger {
    const nextNodeId = this.getNextNodeId(node.id, edges);
    
    return {
      type: this.mapNodeToBackendType(node),
      config: {
        child: nextNodeId,
        options: this.extractNodeOptions(node),
        last_executed: null,
        evaluationResult: null
      }
    };
  }
  
  /**
   * Create action object
   */
  private static createAction(node: Node, edges: Edge[]): BackendAction {
    const nextNodeId = this.getNextNodeId(node.id, edges);
    
    return {
      type: this.mapNodeToBackendType(node),
      config: {
        child: nextNodeId,
        options: this.extractNodeOptions(node),
        last_executed: null,
        evaluationResult: null
      }
    };
  }
  
  /**
   * Create condition object (special action with true/false paths)
   */
  private static createCondition(node: Node, edges: Edge[]): BackendAction {
    // For conditions, we need to handle true/false paths
    const trueNodeId = this.getConditionalNextNodeId(node.id, edges, 'true');
    const falseNodeId = this.getConditionalNextNodeId(node.id, edges, 'false');
    
    return {
      type: 'ElementCondition',
      config: {
        child: trueNodeId, // Primary path (true)
        options: {
          ...this.extractNodeOptions(node),
          false_path: falseNodeId, // Alternative path (false)
        },
        last_executed: null,
        evaluationResult: null
      }
    };
  }
  
  /**
   * Get the next node ID from edges
   */
  private static getNextNodeId(nodeId: string, edges: Edge[]): string | null {
    const outgoingEdge = edges.find(edge => edge.source === nodeId);
    return outgoingEdge ? outgoingEdge.target : null;
  }
  
  /**
   * Get conditional next node ID (for true/false paths)
   */
  private static getConditionalNextNodeId(
    nodeId: string, 
    edges: Edge[], 
    handleType: 'true' | 'false'
  ): string | null {
    const outgoingEdge = edges.find(edge => 
      edge.source === nodeId && edge.sourceHandle === handleType
    );
    return outgoingEdge ? outgoingEdge.target : null;
  }
  
  /**
   * Map frontend node to backend type
   */
  private static mapNodeToBackendType(node: Node): string {
    const nodeId = node.data?.id || '';
    
    // Trigger mappings
    if (node.type === 'trigger') {
      if (nodeId.includes('form')) return 'ElementFormTrigger';
      if (nodeId.includes('product')) return 'ElementProductTrigger';
      if (nodeId.includes('contact')) return 'ElementContactTrigger';
      return 'ElementTrigger';
    }
    
    // Action mappings
    if (node.type === 'action') {
      if (nodeId.includes('email')) return 'ElementSendEmail';
      if (nodeId.includes('sms')) return 'ElementSendSMS';
      if (nodeId.includes('whatsapp')) return 'ElementSendWhatsApp';
      if (nodeId.includes('delay')) return 'ElementDelay';
      if (nodeId.includes('tag')) return 'ElementAddTag';
      return 'ElementAction';
    }
    
    // Condition mapping
    if (node.type === 'condition') {
      return 'ElementCondition';
    }
    
    return 'ElementGeneric';
  }
  
  /**
   * Extract options from node data
   */
  private static extractNodeOptions(node: Node): Record<string, any> {
    const data = node.data || {};
    const nodeId = data.id || '';
    
    // Base options
    const options: Record<string, any> = {
      key: nodeId,
      init: true
    };
    
    // Add specific options based on node type
    if (data.templateId) options.template_id = data.templateId;
    if (data.emailTo) options.email_to = data.emailTo;
    if (data.subject) options.subject = data.subject;
    if (data.fromEmail) options.from_email = data.fromEmail;
    if (data.smsTemplate) options.sms_template = data.smsTemplate;
    if (data.phoneNumber) options.phone_number = data.phoneNumber;
    if (data.formId) options.form_id = data.formId;
    if (data.productId) options.product_id = data.productId;
    if (data.field) options.field = data.field;
    if (data.operator) options.operator = data.operator;
    if (data.value) options.condition_value = data.value;
    
    return options;
  }
  
  /**
   * Debug: Log the conversion process
   */
  static debugConversion(nodes: Node[], edges: Edge[]): void {
    console.group('🔄 Workflow Conversion Debug');
    console.log('📋 Nodes:', nodes);
    console.log('🔗 Edges:', edges);
    
    const result = this.convertToBackendJSON(nodes, edges);
    console.log('🚀 Backend JSON:', result);
    
    console.groupEnd();
  }
}
