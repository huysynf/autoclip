import { useState, useCallback, useRef, useEffect } from 'react';
import { useWebSocket,  tasksProgressUpdateMessage } from './useWebSocket';
import { projectApi } from '../services/api';

export interface TaskProgressState {
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

export interface UseTaskProgressOptions {
  userId: string;
  taskId: string;
  onProgressUpdate?: (state: TaskProgressState) => void;
  onTaskComplete?: (state: TaskProgressState) => void;
  onTaskFailed?: (state: TaskProgressState) => void;
}

export const useTaskProgress = (options: UseTaskProgressOptions) => {
  const { userId, taskId, onProgressUpdate, onTaskComplete, onTaskFailed } = options;
  
  const [taskState, setTaskState] = useState< TaskProgressState | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [lastSeq, setLastSeq] = useState(0);
  const [lastTs, setLastTs] = useState(0);
  const finalStateChecked = useRef(false);

  // ProcessingWebSocket message
  const handleWebSocketMessage = useCallback((message: any) => {
    if (message.type === 'task_progress_update' && message.task_id === taskId) {
      const progressMessage = message as  tasksProgressUpdateMessage;
      
      // Message deduplication and Sort check
      if (progressMessage.seq <= lastSeq && progressMessage.ts <= lastTs) {
        console.log(`Ignore expired Message: seq=${progressMessage.seq}, ts=${progressMessage.ts}`);
        return;
      }
      
      // UpdateStatus
      const newState: TaskProgressState = {
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
      
      setTaskState(newState);
      setLastSeq(progressMessage.seq);
      setLastTs(progressMessage.ts);
      
      // Trigger callback
      onProgressUpdate?.(newState);
      
      // Check final state
      if (progressMessage.status === 'completed') {
        onTaskComplete?.(newState);
        // Delay for final state calibration
        setTimeout(() => performFinalStateCheck(), 1000);
      } else if (progressMessage.status === 'failed') {
        onTaskFailed?.(newState);
        // Delay for final state calibration
        setTimeout(() => performFinalStateCheck(), 1000);
      }
    }
  }, [taskId, lastSeq, lastTs, onProgressUpdate, onTaskComplete, onTaskFailed]);

  // WebSocket connection
  const { 
    isConnected, 
    subscribeToTask, 
    unsubscribeFromTask,
    connect,
    disconnect 
  } = useWebSocket({
    userId,
    onMessage: handleWebSocketMessage
  });

  // Final state calibration: Get the latest Status from HTTP API
  const performFinalStateCheck = useCallback(async () => {
    if (finalStateChecked.current) return;
    finalStateChecked.current = true;
    
    try {
      console.log(`Perform final state calibration: ${taskId}`);
      const response = await (projectApi as any).getTaskProgress(taskId) // as any;
      
      if (response.data) {
        const apiState: TaskProgressState = {
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
        
        setTaskState(apiState);
        console.log('Final state calibrationCompleted:', apiState);
      }
    } catch (error) {
      console.error('Final state calibration Failed:', error);
    }
  }, [taskId, lastSeq]);

  // Subscribe toTaskProgress
  const subscribe = useCallback(() => {
    if (isConnected && !isSubscribed) {
      const success = subscribeToTask(taskId);
      if (success) {
        setIsSubscribed(true);
        console.log(`Subscribed toTaskProgress: ${taskId}`);
      }
    }
  }, [isConnected, isSubscribed, subscribeToTask, taskId]);

  // CancelSubscriptionTaskProgress
  const unsubscribe = useCallback(() => {
    if (isConnected && isSubscribed) {
      const success = unsubscribeFromTask(taskId);
      if (success) {
        setIsSubscribed(false);
        console.log(`Cancel subscriptionTaskProgress: ${taskId}`);
      }
    }
  }, [isConnected, isSubscribed, unsubscribeFromTask, taskId]);

  // Auto subscription/Cancel subscription
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

  // Clean up when Component is uninstalled
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

