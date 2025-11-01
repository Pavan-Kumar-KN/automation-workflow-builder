import { BackendWorkflowJSON } from './jsonConstructors';

/**
 * Mock WebSocket Server for testing workflow execution
 * Simulates backend workflow engine responses
 */
export class MockWebSocketServer {
  private static instance: MockWebSocketServer;
  private connections: Set<WebSocket> = new Set();
  private isRunning = false;

  private constructor() {}

  static getInstance(): MockWebSocketServer {
    if (!MockWebSocketServer.instance) {
      MockWebSocketServer.instance = new MockWebSocketServer();
    }
    return MockWebSocketServer.instance;
  }

  /**
   * Start the mock server (simulates WebSocket server behavior)
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🚀 Mock WebSocket Server started');
    
    // Override WebSocket constructor to intercept connections
    this.interceptWebSocketConnections();
  }

  /**
   * Stop the mock server
   */
  stop(): void {
    this.isRunning = false;
    this.connections.clear();
    console.log('🛑 Mock WebSocket Server stopped');
  }

  /**
   * Intercept WebSocket connections for simulation
   */
  private interceptWebSocketConnections(): void {
    const originalWebSocket = window.WebSocket;
    const mockServer = this;

    // Override WebSocket constructor
    window.WebSocket = class extends EventTarget {
      public readyState: number = WebSocket.CONNECTING;
      public url: string;
      public onopen: ((event: Event) => void) | null = null;
      public onclose: ((event: CloseEvent) => void) | null = null;
      public onmessage: ((event: MessageEvent) => void) | null = null;
      public onerror: ((event: Event) => void) | null = null;

      constructor(url: string) {
        super();
        this.url = url;
        
        // Simulate connection delay
        setTimeout(() => {
          if (mockServer.isRunning) {
            this.readyState = WebSocket.OPEN;
            mockServer.connections.add(this as any);
            
            const openEvent = new Event('open');
            this.onopen?.(openEvent);
            this.dispatchEvent(openEvent);
            
            console.log('🔌 Mock WebSocket connection established');
          }
        }, 100);
      }

      send(data: string): void {
        if (this.readyState !== WebSocket.OPEN) {
          throw new Error('WebSocket is not open');
        }

        try {
          const message = JSON.parse(data);
          console.log('📨 Mock server received:', message);
          
          // Handle different message types
          if (message.type === 'TEST_FLOW') {
            mockServer.handleTestFlow(this as any, message);
          }
        } catch (error) {
          console.error('❌ Error parsing message in mock server:', error);
        }
      }

      close(): void {
        this.readyState = WebSocket.CLOSED;
        mockServer.connections.delete(this as any);
        
        const closeEvent = new CloseEvent('close');
        this.onclose?.(closeEvent);
        this.dispatchEvent(closeEvent);
      }

      // WebSocket constants
      static readonly CONNECTING = 0;
      static readonly OPEN = 1;
      static readonly CLOSING = 2;
      static readonly CLOSED = 3;
    } as any;

    // Copy static properties
    Object.assign(window.WebSocket, {
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3
    });
  }

  /**
   * Handle test flow execution simulation
   */
  private async handleTestFlow(socket: any, message: any): Promise<void> {
    const { workflow, executionId } = message.payload;
    
    console.log('🧪 Simulating workflow execution:', {
      name: workflow.name,
      executionId,
      triggers: workflow.triggers?.length || 0,
      actions: workflow.actions?.length || 0
    });

    // Send test flow started response
    this.sendMessage(socket, {
      type: 'TEST_FLOW_STARTED',
      executionId,
      payload: {
        message: 'Workflow execution started',
        workflow: workflow.name
      }
    });

    // Simulate execution of each node
    await this.simulateWorkflowExecution(socket, workflow, executionId);
  }

  /**
   * Simulate workflow execution with realistic delays
   */
  private async simulateWorkflowExecution(
    socket: any, 
    workflow: BackendWorkflowJSON, 
    executionId: string
  ): Promise<void> {
    
    // Simulate trigger execution
    if (workflow.triggers && workflow.triggers.length > 0) {
      for (const trigger of workflow.triggers) {
        await this.delay(500);
        
        this.sendMessage(socket, {
          type: 'NODE_EXECUTION_RESULT',
          executionId,
          nodeId: 'trigger',
          payload: {
            status: 'completed',
            result: {
              message: `Trigger "${trigger.type}" executed successfully`,
              data: { triggered: true, timestamp: new Date().toISOString() }
            }
          }
        });
      }
    }

    // Simulate action execution
    if (workflow.actions && workflow.actions.length > 0) {
      for (const action of workflow.actions) {
        await this.delay(800);
        
        const isSuccess = Math.random() > 0.1; // 90% success rate
        
        this.sendMessage(socket, {
          type: 'NODE_EXECUTION_RESULT',
          executionId,
          nodeId: action.id,
          payload: {
            status: isSuccess ? 'completed' : 'error',
            result: isSuccess ? {
              message: `Action "${action.type}" executed successfully`,
              data: { processed: true, timestamp: new Date().toISOString() }
            } : undefined,
            error: isSuccess ? undefined : `Simulated error in action "${action.type}"`
          }
        });
      }
    }

    // Send completion message
    await this.delay(300);
    this.sendMessage(socket, {
      type: 'TEST_FLOW_COMPLETED',
      executionId,
      payload: {
        message: 'Workflow execution completed',
        totalNodes: (workflow.triggers?.length || 0) + (workflow.actions?.length || 0),
        duration: '2.3s'
      }
    });
  }

  /**
   * Send message to WebSocket client
   */
  private sendMessage(socket: any, message: any): void {
    const messageWithTimestamp = {
      ...message,
      timestamp: new Date().toISOString()
    };

    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify(messageWithTimestamp)
    });

    socket.onmessage?.(messageEvent);
    socket.dispatchEvent(messageEvent);
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const mockWebSocketServer = MockWebSocketServer.getInstance();
