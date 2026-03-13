import { useEffect, useRef, useState, useCallback } from 'react';

export interface WebSocketMessage {
  type: string;
  timestamp: string;
  [key: string]: any;
}

export interface  tasksUpdateMessage extends WebSocketMessage {
  type: 'task_update';
  task_id: string;
  status: string;
  progress?: number;
  message?: string;
  error?: string;
}

export interface ProjectUpdateMessage extends WebSocketMessage {
  type: 'project_update';
  project_id: string;
  status: string;
  progress?: number;
  message?: string;
}

export interface SystemNotificationMessage extends WebSocketMessage {
  type: 'system_notification';
  notification_type: string;
  title: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
}

export interface ErrorNotificationMessage extends WebSocketMessage {
  type: 'error_notification';
  error_type: string;
  error_message: string;
  details?: any;
}

export interface  tasksProgressUpdateMessage extends WebSocketMessage {
  type: 'task_progress_update';
  task_id?: string;
  project_id: string;
  status: 'running' | 'completed' | 'failed';
  progress: number;
  step_name: string;
  message?: string;
  snapshot?: boolean; // 标记YesNo为快照Message
}

export type WebSocketEventMessage = 
  |  tasksUpdateMessage 
  | ProjectUpdateMessage 
  | SystemNotificationMessage 
  | ErrorNotificationMessage
  |  tasksProgressUpdateMessage;

interface UseWebSocketOptions {
  userId: string;
  onMessage?: (message: WebSocketEventMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export interface  tasksSubscriptionStatus {
  user_id: string;
  subscribed_tasks: string[];
  total_subscriptions: number;
  active_channels: number;
}

// 全局WebSocket连接Manage
let globalWs: WebSocket | null = null;
let globalDesiredSubscriptions = new Set<string>();
let globalUserId: string | null = null;
let globalOnMessage: ((message: WebSocketEventMessage) => void) | null = null;
let globalOnConnect: (() => void) | null = null;
let globalOnDisconnect: (() => void) | null = null;
let globalOnError: ((error: Event) => void) | null = null;
let reconnectTimeoutRef: number | null = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

// 心跳机制
let heartbeatInterval: number | null = null;
let heartbeatTimeout: number | null = null;
const HEARTBEAT_INTERVAL = 25000; // 25seconds发送一次心跳
const HEARTBEAT_TIMEOUT = 5000; // 5seconds内没收到pong就重连

// 防抖机制
let syncDebounceTimeout: number | null = null;
const SYNC_DEBOUNCE_DELAY = 300; // 300ms防抖

export const useWebSocket = (options: UseWebSocketOptions) => {
  const { userId, onMessage, onConnect, onDisconnect, onError } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');

  // 心跳相Off函数
  const startHeartbeat = useCallback(() => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
    }
    
    heartbeatInterval = window.setInterval(() => {
      if (globalWs?.readyState === WebSocket.OPEN) {
        console.log('发送心跳ping');
        globalWs.send(JSON.stringify({ type: 'ping' }));
        
        // SettingspongTimeout
        if (heartbeatTimeout) {
          clearTimeout(heartbeatTimeout);
        }
        heartbeatTimeout = window.setTimeout(() => {
          console.log('心跳Timeout，准备重连');
          if (globalWs) {
            globalWs.close();
          }
        }, HEARTBEAT_TIMEOUT);
      }
    }, HEARTBEAT_INTERVAL);
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      heartbeatInterval = null;
    }
    if (heartbeatTimeout) {
      clearTimeout(heartbeatTimeout);
      heartbeatTimeout = null;
    }
  }, []);

  // 全局连接函数
  const ensureConnected = useCallback(() => {
    if (globalWs?.readyState === WebSocket.OPEN || globalWs?.readyState === WebSocket.CONNECTING) {
      return;
    }
    
    // 如果已经有连接但UserID不同，先Close旧连接
    if (globalWs && globalUserId !== userId) {
      console.log(`UserID变更: ${globalUserId} -> ${userId}，Close旧连接`);
      globalWs.close();
      globalWs = null;
    }

    setConnectionStatus('connecting');
    const wsUrl = `ws://localhost:8000/api/v1/ws/${userId}`;
    
    try {
      const ws = new WebSocket(wsUrl);
      globalWs = ws;
      globalUserId = userId;
      globalOnMessage = onMessage;
      globalOnConnect = onConnect;
      globalOnDisconnect = onDisconnect;
      globalOnError = onError;

      ws.onopen = () => {
        console.log('WebSocket connection established');
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttempts = 0;
        
        // 启动心跳
        startHeartbeat();
        
        // 重连后Auto重新订阅之前的projects
        if (globalDesiredSubscriptions.size > 0) {
          console.log('重连后重新订阅projects:', Array.from(globalDesiredSubscriptions));
          sendMessage({
            type: 'sync_subscriptions',
            project_ids: Array.from(globalDesiredSubscriptions)
          });
        }
        
        globalOnConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const data: WebSocketEventMessage = JSON.parse(event.data);
          console.log('收到WebSocket message:', data);
          
          // Processingpong响应
          if (data.type === 'pong') {
            console.log('收到心跳pong响应');
            if (heartbeatTimeout) {
              clearTimeout(heartbeatTimeout);
              heartbeatTimeout = null;
            }
            return;
          }
          
          globalOnMessage?.(data);
        } catch (error) {
          console.error('解析WebSocket messageFailed:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket连接已Close:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        // Stop心跳
        stopHeartbeat();
        
        globalOnDisconnect?.();

        // EnableAuto重连，但Limit重连次数
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          const delay = Math.min(2000 * Math.pow(2, reconnectAttempts), 15000);
          console.log(`将在 ${delay}ms 后尝试重连 (${reconnectAttempts}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef = setTimeout(() => {
            ensureConnected();
          }, delay);
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          console.log('达到Max重连次数，Stop重连');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocketError:', error);
        setConnectionStatus('error');
        globalOnError?.(error);
      };

    } catch (error) {
      console.error('CreateWebSocketConnection failed:', error);
      setConnectionStatus('error');
    }
  }, [userId, onMessage, onConnect, onDisconnect, onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef) {
      clearTimeout(reconnectTimeoutRef);
      reconnectTimeoutRef = null;
    }
    
    if (globalWs) {
      globalWs.close(1000, 'User主动Disconnected');
      globalWs = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (globalWs?.readyState === WebSocket.OPEN) {
      globalWs.send(JSON.stringify(message));
      return true;
    }
    console.warn('WebSocket未连接，None法Message sent');
    return false;
  }, []);

  const subscribeToTopic = useCallback((topic: string) => {
    return sendMessage({
      type: 'subscribe',
      topic
    });
  }, [sendMessage]);

  const unsubscribeFromTopic = useCallback((topic: string) => {
    return sendMessage({
      type: 'unsubscribe',
      topic
    });
  }, [sendMessage]);

  const ping = useCallback(() => {
    return sendMessage({
      type: 'ping'
    });
  }, [sendMessage]);

  const getStatus = useCallback(() => {
    return sendMessage({
      type: 'get_status'
    });
  }, [sendMessage]);

  const subscribeTo tasks = useCallback((taskId: string) => {
    return sendMessage({
      type: 'subscribe_task',
      task_id: taskId
    });
  }, [sendMessage]);

  const unsubscribeFrom tasks = useCallback((taskId: string) => {
    return sendMessage({
      type: 'unsubscribe_task',
      task_id: taskId
    });
  }, [sendMessage]);

  // 集合差异对齐订阅 - 核心函数（带防抖）
  const syncSubscriptions = useCallback((projectIds: string[]) => {
    const desired = new Set(projectIds);
    globalDesiredSubscriptions = desired;
    
    // 确保连接
    ensureConnected();
    
    // 防抖Processing
    if (syncDebounceTimeout) {
      clearTimeout(syncDebounceTimeout);
    }
    
    syncDebounceTimeout = window.setTimeout(() => {
      // 发送同步订阅请求
      if (globalWs?.readyState === WebSocket.OPEN) {
        console.log('同步订阅projects:', Array.from(desired));
        sendMessage({
          type: 'sync_subscriptions',
          project_ids: Array.from(desired)
        });
      }
    }, SYNC_DEBOUNCE_DELAY);
    
    return { desired: Array.from(desired) };
  }, [sendMessage, ensureConnected]);

  // 批量订阅/退订支持
  const subscribeToMany = useCallback((channels: string[]) => {
    return sendMessage({
      type: 'subscribe_many',
      channels
    });
  }, [sendMessage]);

  const unsubscribeFromMany = useCallback((channels: string[]) => {
    return sendMessage({
      type: 'unsubscribe_many',
      channels
    });
  }, [sendMessage]);

  // 同步订阅集对齐接口
  const syncSubscriptionSet = useCallback((channels: string[]) => {
    return sendMessage({
      type: 'sync_subscriptions',
      channels
    });
  }, [sendMessage]);

  // Auto连接
  useEffect(() => {
    // Delay连接，避免ComponentInitializing时的重渲染
    const timer = setTimeout(() => {
      ensureConnected();
    }, 500);

    return () => {
      clearTimeout(timer);
      // 不在这里Disconnected，保持全局连接
    };
  }, [userId, ensureConnected]);

  // 清理重连定时器
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef) {
        clearTimeout(reconnectTimeoutRef);
      }
    };
  }, []);

  return {
    isConnected,
    connectionStatus,
    connect: ensureConnected,
    disconnect,
    sendMessage,
    subscribeToTopic,
    unsubscribeFromTopic,
    subscribeTo tasks,
    unsubscribeFrom tasks,
    syncSubscriptions,
    subscribeToMany,
    unsubscribeFromMany,
    syncSubscriptionSet,
    ping,
    getStatus
  };
}; 