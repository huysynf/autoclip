import React, { useState, useEffect } from 'react';
import { useWebSocket, WebSocketEventMessage } from '../hooks/useWebSocket';

interface InlineProgressBarProps {
  projectId: string;
  currentStep?: number;
  totalSteps?: number;
  status?: string;
  onProgressUpdate?: (progress: number, step: string) => void;
}

interface ProgressData {
  progress: number;
  currentStep: number;
  totalSteps: number;
  stepName: string;
  stepDetails?: string;
}

// Pipeline step configuration
const PIPELINE_STEPS = [
  { id: 1, name: 'Outline Extraction', description: 'Extract structured outline from video transcript' },
  { id: 2, name: 'Timestamp Locator', description: 'Locate topic time ranges based on SRT subtitles' },
  { id: 3, name: 'Content Scoring', description: 'Multi-dimensional evaluation of clip quality and virality' },
  { id: 4, name: 'Title Generation', description: 'Generate engaging titles for high-score clips' },
  { id: 5, name: 'Theme Clustering', description: 'Group related clips into collection recommendations' },
  { id: 6, name: 'Video Cutting', description: 'Generate clip segments and collection videos with FFmpeg' }
];

export const InlineProgressBar: React.FC<InlineProgressBarProps> = ({
  projectId,
  currentStep = 0,
  totalSteps = 6,
  status = 'processing',
  onProgressUpdate
}) => {


  const getStepName = (stepId: number): string => {
    switch (stepId) {
      case 1: return 'Downloading audio';
      case 2: return 'Transcribing audio';
      case 3: return 'Analyzing contents';
      case 4: return 'Extracting highlights';
      case 5: return 'Generating titles';
      case 6: return 'Generating summaries';
      default: return 'Processing...';
    }
  };

  const [progressData, setProgressData] = useState<ProgressData>({
    progress: currentStep > 0 ? Math.round((currentStep / totalSteps) * 100) : 0,
    currentStep: currentStep,
    totalSteps: totalSteps,
    stepName: currentStep > 0 ? getStepName(currentStep) : 'InitializingMedium...',
    stepDetails: ''
  });

  // WebSocket connection for real-time progress updates
  const { isConnected, syncSubscriptions } = useWebSocket({
    userId: `homepage-user`, // Use unified UserID to avoid duplicate connections
    onMessage: (message: WebSocketEventMessage) => {
      console.log('InlineProgressBar received WebSocket message:', message);
      if (message.type === 'task_progress_update' && 
          message.project_id === projectId) {
        handleProgressUpdate(message);
      }
    }
  });

  // Handle progress update
  const handleProgressUpdate = (message: any) => {
    console.log('InlineProgressBar handling progress update:', message);
    
    const newProgress = message.progress || 0;
    const stepName = message.step_name || 'Processing...';
    const stepDetails = message.message || '';
    
    // Snapshot message check - prevent rollback
    if (message.snapshot && progressData.progress > newProgress) {
      console.log('Ignoring old snapshot message:', { current: progressData.progress, snapshot: newProgress });
      return;
    }
    
    console.log('Updating progress data:', { newProgress, stepName, stepDetails });
    
    setProgressData(prev => ({
      ...prev,
      progress: newProgress,
      stepName: stepName,
      stepDetails: stepDetails
    }));

    // Notify parent component
    onProgressUpdate?.(newProgress, stepName);
  };



  // Watch props changes, update progress data
  useEffect(() => {
    const newProgress = currentStep > 0 ? Math.round((currentStep / totalSteps) * 100) : 0;
    const newStepName = currentStep > 0 ? getStepName(currentStep) : 'InitializingMedium...';
    
    setProgressData(prev => ({
      ...prev,
      progress: newProgress,
      currentStep: currentStep,
      totalSteps: totalSteps,
      stepName: newStepName
    }));
  }, [currentStep, totalSteps]);

  // Subscribe to project progress updates
  useEffect(() => {
    console.log('InlineProgressBar WebSocketStatus:', { isConnected, projectId });
    if (isConnected && projectId) {
      console.log('Subscribing to project progress:', projectId);
      syncSubscriptions([projectId]);
    }
  }, [isConnected, projectId, syncSubscriptions]);

  // Calculate progress bar width percentage
  const progressPercentage = Math.min(Math.max(progressData.progress, 0), 100);
  
  // Calculate current step position in total steps
  const stepProgress = progressData.currentStep > 0 ? 
    ((progressData.currentStep - 1) / progressData.totalSteps) * 100 : 0;

  // Generate progress bar background gradient
  const getProgressGradient = () => {
    const baseColor = '#1890ff';
    const lightColor = '#40a9ff';
    const darkColor = '#096dd9';
    
    return `linear-gradient(90deg, 
      ${baseColor} 0%, 
      ${lightColor} ${progressPercentage}%, 
      rgba(24, 144, 255, 0.1) ${progressPercentage}%, 
      rgba(24, 144, 255, 0.1) 100%)`;
  };

  // Generate animation style
  const getAnimationStyle = () => {
    return {
      background: getProgressGradient()
    };
  };

  return (
    <div style={{
      background: 'rgba(24, 144, 255, 0.15)',
      border: '1px solid rgba(24, 144, 255, 0.3)',
      borderRadius: '4px',
      padding: '6px 12px',
      position: 'relative',
      overflow: 'hidden',
      height: '32px', // Fixed height
      display: 'flex',
      alignItems: 'center'
    }}>
      {/* Progress bar background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        ...getAnimationStyle()
      }} />
      
      {/* Content layer - single row layout */}
      <div style={{ 
        position: 'relative', 
        zIndex: 1,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px'
      }}>
        {/* Left: step name */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          minWidth: '0',
          flex: '1'
        }}>
          <span style={{ 
            color: '#1890ff',
            fontSize: '12px', 
            fontWeight: 600,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {progressData.stepName}
          </span>
        </div>
        
        {/* Middle: progress bar */}
        <div style={{
          width: '80px',
          height: '4px',
          background: 'rgba(24, 144, 255, 0.2)',
          borderRadius: '2px',
          overflow: 'hidden',
          flexShrink: 0
        }}>
          <div style={{
            width: `${progressPercentage}%`,
            height: '100%',
            background: status === 'processing' && progressData.progress < 100 ? 
              'linear-gradient(90deg, #1890ff, #40a9ff, #1890ff)' :
              'linear-gradient(90deg, #1890ff, #40a9ff)',
            borderRadius: '2px',
            transition: 'width 0.3s ease-in-out',
            animation: status === 'processing' && progressData.progress < 100 ? 
              'progressBarPulse 2s infinite ease-in-out' : 'none'
          }} />
        </div>
        
        {/* Right: progress info */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          flexShrink: 0
        }}>
          <span style={{ 
            color: '#1890ff',
            fontSize: '10px',
            opacity: 0.8
          }}>
            {progressData.currentStep}/{progressData.totalSteps}
          </span>
          <span style={{ 
            color: '#1890ff',
            fontSize: '10px',
            fontWeight: 600,
            minWidth: '28px'
          }}>
            {Math.round(progressPercentage)}%
          </span>
        </div>
      </div>
      
      {/* Add CSS animation */}
      
    </div>
  );
};

export default InlineProgressBar;
