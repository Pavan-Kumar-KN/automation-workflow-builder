import { BackendWorkflowJSON } from './jsonConstructors';
import { WebSocketMessage } from '@/hooks/useWebSocket';

export interface TestFlowRequest {
  type: 'TEST_FLOW';
  payload: {
    workflow: BackendWorkflowJSON;
    executionId: string;
  };
}

export interface TestFlowResponse {
  type: 'TEST_FLOW_STARTED' | 'NODE_EXECUTION_RESULT' | 'TEST_FLOW_COMPLETED' | 'TEST_FLOW_ERROR';
  executionId: string;
  nodeId?: string;
  payload?: any;
}

/**
 * WebSocket Service for workflow testing
 * Handles communication with backend workflow engine
 */
export class WebSocketService {
  private static instance: WebSocketService;
  private socket: WebSocket | null = null;
  private messageHandlers: Map<string, (message: WebSocketMessage) => void> = new Map();
  private isConnected = false;

  private constructor() {}

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  /**
   * Connect to WebSocket server
   */
  connect(url: string = 'ws://localhost:8080/ws'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
          console.log('🔌 WebSocketService connected');
          this.isConnected = true;
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
          }
        };

        this.socket.onclose = () => {
          console.log('🔌 WebSocketService disconnected');
          this.isConnected = false;
        };

        this.socket.onerror = (error) => {
          console.error('❌ WebSocketService error:', error);
          this.isConnected = false;
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Send test flow request to backend
   */
  testFlow(workflow: BackendWorkflowJSON): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected || !this.socket) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const request: TestFlowRequest = {
        type: 'TEST_FLOW',
        payload: {
          workflow,
          executionId
        }
      };

      try {
        this.socket.send(JSON.stringify(request));
        console.log('📤 Test flow request sent:', { executionId, workflow: workflow.name });
        resolve(executionId);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Register message handler for specific message types
   */
  onMessage(type: string, handler: (message: WebSocketMessage) => void): void {
    this.messageHandlers.set(type, handler);
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WebSocketMessage): void {
    console.log('📨 WebSocketService message received:', message);
    
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message);
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Send raw message
   */
  sendMessage(message: WebSocketMessage): boolean {
    if (!this.isConnected || !this.socket) {
      console.warn('⚠️ WebSocket not connected, message not sent:', message);
      return false;
    }

    try {
      const messageWithTimestamp = {
        ...message,
        timestamp: new Date().toISOString()
      };
      
      this.socket.send(JSON.stringify(messageWithTimestamp));
      console.log('📤 WebSocketService message sent:', messageWithTimestamp);
      return true;
    } catch (error) {
      console.error('❌ Error sending WebSocket message:', error);
      return false;
    }
  }
}

// Export singleton instance
export const websocketService = WebSocketService.getInstance();
