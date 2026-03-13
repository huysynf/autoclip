import { useState, useCallback, useRef, useEffect } from 'react';
import { useWebSocket,  tasksProgressUpdateMessage } from './useWebSocket';
import { projectApi } from '../services/api';

export interface  tasksProgressState {
  task_id: string;
  progress: number;
  step: number;
  total: number;
  phase: string;
  message: string;
  status: string;
  seq: number;
  ts: number;
  meta?: any;
  last_updated: number;
}

export interface Use tasksProgressOptions {
  userId: string;
  taskId: string;
  onProgressUpdate?: (state:  tasksProgressState) => void;
  on tasksComplete?: (state:  tasksProgressState) => void;
  on tasksFailed?: (state:  tasksProgressState) => void;
}

export const use tasksProgress = (options: Use tasksProgressOptions) => {
  const { userId, taskId, onProgressUpdate, on tasksComplete, on tasksFailed } = options;
  
  const [taskState, set tasksState] = useState< tasksProgressState | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [lastSeq, setLastSeq] = useState(0);
  const [lastTs, setLastTs] = useState(0);
  const finalStateChecked = useRef(false);

  // ProcessingWebSocket message
  const handleWebSocketMessage = useCallback((message: any) => {
    if (message.type === 'task_progress_update' && message.task_id === taskId) {
      const progressMessage = message as  tasksProgressUpdateMessage;
      
      // Message去重和Sort检查
      if (progressMessage.seq <= lastSeq && progressMessage.ts <= lastTs) {
        console.log(`忽略过期Message: seq=${progressMessage.seq}, ts=${progressMessage.ts}`);
        return;
      }
      
      // UpdateStatus
      const newState:  tasksProgressState = {
        task_id: progressMessage.task_id,
        progress: progressMessage.progress,
        step: progressMessage.step,
        total: progressMessage.total,
        phase: progressMessage.phase,
        message: progressMessage.message,
        status: progressMessage.status,
        seq: progressMessage.seq,
        ts: progressMessage.ts,
        meta: progressMessage.meta,
        last_updated: Date.now()
      };
      
      set tasksState(newState);
      setLastSeq(progressMessage.seq);
      setLastTs(progressMessage.ts);
      
      // 触发回调
      onProgressUpdate?.(newState);
      
      // 检查终态
      if (progressMessage.status === 'DONE') {
        on tasksComplete?.(newState);
        // Delay进行终态校准
        setTimeout(() => performFinalStateCheck(), 1000);
      } else if (progressMessage.status === 'FAIL') {
        on tasksFailed?.(newState);
        // Delay进行终态校准
        setTimeout(() => performFinalStateCheck(), 1000);
      }
    }
  }, [taskId, lastSeq, lastTs, onProgressUpdate, on tasksComplete, on tasksFailed]);

  // WebSocket连接
  const { 
    isConnected, 
    subscribeTo tasks, 
    unsubscribeFrom tasks,
    connect,
    disconnect 
  } = useWebSocket({
    userId,
    onMessage: handleWebSocketMessage
  });

  // 终态校准：从HTTP APIGet 最新Status
  const performFinalStateCheck = useCallback(async () => {
    if (finalStateChecked.current) return;
    finalStateChecked.current = true;
    
    try {
      console.log(`执行终态校准: ${taskId}`);
      const response = await projectApi.get tasksProgress(taskId);
      
      if (response.data) {
        const apiState:  tasksProgressState = {
          task_id: taskId,
          progress: response.data.progress || 0,
          step: response.data.current_step || 0,
          total: 6,
          phase: 'unknown',
          message: response.data.current_step || 'Unknown status',
          status: response.data.status || 'unknown',
          seq: lastSeq + 1,
          ts: Date.now() / 1000,
          last_updated: Date.now()
        };
        
        set tasksState(apiState);
        console.log('终态校准Completed:', apiState);
      }
    } catch (error) {
      console.error('终态校准Failed:', error);
    }
  }, [taskId, lastSeq]);

  // 订阅 tasksProgress
  const subscribe = useCallback(() => {
    if (isConnected && !isSubscribed) {
      const success = subscribeTo tasks(taskId);
      if (success) {
        setIsSubscribed(true);
        console.log(`已订阅 tasksProgress: ${taskId}`);
      }
    }
  }, [isConnected, isSubscribed, subscribeTo tasks, taskId]);

  // Cancel订阅 tasksProgress
  const unsubscribe = useCallback(() => {
    if (isConnected && isSubscribed) {
      const success = unsubscribeFrom tasks(taskId);
      if (success) {
        setIsSubscribed(false);
        console.log(`已Cancel订阅 tasksProgress: ${taskId}`);
      }
    }
  }, [isConnected, isSubscribed, unsubscribeFrom tasks, taskId]);

  // Auto订阅/Cancel订阅
  useEffect(() => {
    if (isConnected) {
      subscribe();
    } else {
      setIsSubscribed(false);
    }
    
    return () => {
      if (isSubscribed) {
        unsubscribe();
      }
    };
  }, [isConnected, subscribe, unsubscribe, isSubscribed]);

  // Component卸载时清理
  useEffect(() => {
    return () => {
      if (isSubscribed) {
        unsubscribe();
      }
    };
  }, [isSubscribed, unsubscribe]);

  return {
    taskState,
    isConnected,
    isSubscribed,
    subscribe,
    unsubscribe,
    performFinalStateCheck
  };
};

