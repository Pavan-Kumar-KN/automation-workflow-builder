import { useEffect, useRef, useCallback, useState } from 'react';
import { toast } from 'sonner';

export interface WebSocketMessage {
  type: string;
  payload?: any;
  nodeId?: string;
  timestamp?: string;
}

export interface NodeExecutionResult {
  nodeId: string;
  status: 'running' | 'completed' | 'error';
  result?: any;
  error?: string;
  timestamp: string;
}

interface UseWebSocketOptions {
  url?: string;
  onMessage?: (message: WebSocketMessage) => void;
  onNodeResult?: (result: NodeExecutionResult) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  autoReconnect?: boolean;
  reconnectInterval?: number;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const {
    url = 'ws://localhost:8080/ws',
    onMessage,
    onNodeResult,
    onConnect,
    onDisconnect,
    onError,
    autoReconnect = true,
    reconnectInterval = 3000
  } = options;

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setIsConnecting(true);
    
    try {
      socketRef.current = new WebSocket(url);

      socketRef.current.onopen = () => {
        console.log('🔌 WebSocket connected');
        setIsConnected(true);
        setIsConnecting(false);
        onConnect?.();
        toast.success('Connected to workflow engine');
      };

      socketRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('📨 WebSocket message received:', message);
          
          onMessage?.(message);

          // Handle specific message types
          if (message.type === 'NODE_EXECUTION_RESULT' && message.nodeId) {
            const result: NodeExecutionResult = {
              nodeId: message.nodeId,
              status: message.payload?.status || 'completed',
              result: message.payload?.result,
              error: message.payload?.error,
              timestamp: message.timestamp || new Date().toISOString()
            };
            onNodeResult?.(result);
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      socketRef.current.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setIsConnected(false);
        setIsConnecting(false);
        onDisconnect?.();
        
        // Auto-reconnect if enabled
        if (autoReconnect) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Attempting to reconnect...');
            connect();
          }, reconnectInterval);
        }
      };

      socketRef.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setIsConnecting(false);
        onError?.(error);
        toast.error('WebSocket connection error');
      };

    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      setIsConnecting(false);
      toast.error('Failed to connect to workflow engine');
    }
  }, [url, onMessage, onNodeResult, onConnect, onDisconnect, onError, autoReconnect, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      const messageWithTimestamp = {
        ...message,
        timestamp: new Date().toISOString()
      };
      
      socketRef.current.send(JSON.stringify(messageWithTimestamp));
      console.log('📤 WebSocket message sent:', messageWithTimestamp);
      return true;
    } else {
      console.warn('⚠️ WebSocket not connected, message not sent:', message);
      toast.error('Not connected to workflow engine');
      return false;
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    sendMessage,
    socket: socketRef.current
  };
};
