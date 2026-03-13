/**
 * 统一Status栏Component - 替换旧的复杂Progress系统
 * 支持DownloadMedium、Processing、Completed等Status的统一显示
 */

import React, { useEffect, useState } from 'react'
import { Progress, Space, Typography, Tag } from 'antd'
import { 
  DownloadOutlined, 
  LoadingOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import { useSimpleProgressStore, getStageDisplayName, getStageColor, isCompleted, isFailed } from '../stores/useSimpleProgressStore'

const { Text } = Typography

interface UnifiedStatusBarProps {
  projectId: string
  status: string
  downloadProgress?: number
  onStatusChange?: (status: string) => void
  onDownloadProgressUpdate?: (progress: number) => void
}

export const UnifiedStatusBar: React.FC<UnifiedStatusBarProps> = ({
  projectId,
  status,
  downloadProgress = 0,
  onStatusChange,
  onDownloadProgressUpdate
}) => {
  const { getProgress, startPolling, stopPolling } = useSimpleProgressStore()
  const [isPolling, setIsPolling] = useState(false)
  const [currentDownloadProgress, setCurrentDownloadProgress] = useState(downloadProgress)
  
  const progress = getProgress(projectId)

  // Determine YesNo polling based on Status
  useEffect(() => {
    if ((status === 'processing' || status === 'pending') && !isPolling) {
      console.log(`Start PollingProcessingProgress: ${projectId}`)
      startPolling([projectId], 2000)
      setIsPolling(true)
    } else if (status !== 'processing' && status !== 'pending' && isPolling) {
      console.log(`Stop PollingProcessingProgress: ${projectId}`)
      stopPolling()
      setIsPolling(false)
    }

    return () => {
      if (isPolling) {
        console.log(`Cleanup polling: ${projectId}`)
        stopPolling()
        setIsPolling(false)
      }
    }
  }, [status, projectId, isPolling, startPolling, stopPolling])

  // DownloadProgress polling
  useEffect(() => {
    if (status === 'downloading') {
      const pollDownloadProgress = async () => {
        try {
          console.log(`Poll DownloadProgress: ${projectId}`)
          const response = await fetch(`http://localhost:8000/api/v1/projects/${projectId}`)
          if (response.ok) {
            const projectData = await response.json()
            console.log('projectsData:', projectData)
            const newProgress = projectData.processing_config?.download_progress || 0
            console.log(`DownloadProgressUpdate: ${newProgress}%`)
            setCurrentDownloadProgress(newProgress)
            onDownloadProgressUpdate?.(newProgress)
            
            // If DownloadCompleted, check YesNo needs to switch to ProcessingStatus
            if (newProgress >= 100) {
              console.log('{/* Head */}')
              setTimeout(() => {
                onStatusChange?.('processing')
              }, 1000)
            }
          } else {
            console.error('Get projectsDataFailed:', response.status, response.statusText)
          }
        } catch (error) {
          console.error('Get DownloadProgressFailed:', error)
        }
      }

      // Fetch immediately
      pollDownloadProgress()
      
      // Poll every 2 seconds
      const interval = setInterval(pollDownloadProgress, 2000)
      
      return () => clearInterval(interval)
    }
  }, [status, projectId, onDownloadProgressUpdate, onStatusChange])

  // ProcessingStatus changes
  useEffect(() => {
    if (progress && onStatusChange) {
      if (isCompleted(progress.stage)) {
        onStatusChange('completed')
      } else if (isFailed(progress.message)) {
        onStatusChange('failed')
      }
    }
  }, [progress, onStatusChange])

  // ImportMediumStatus
  if (status === 'importing') {
    return (
      <div style={{
        background: 'rgba(255, 193, 7, 0.1)',
        border: '1px solid rgba(255, 193, 7, 0.3)',
        borderRadius: '3px',
        padding: '3px 6px',
        textAlign: 'center',
        width: '100%'
      }}>
        <div style={{ 
          color: '#ffc107',
          fontSize: '11px', 
          fontWeight: 600, 
          lineHeight: '12px'
        }}>
          {Math.round(downloadProgress)}%
        </div>
        <div style={{ 
          color: '#999999', 
          fontSize: '8px', 
          lineHeight: '9px'
        }}>
          ImportMedium
        </div>
      </div>
    )
  }

  // DownloadMediumStatus
  if (status === 'downloading') {
    return (
      <div style={{
        background: 'rgba(24, 144, 255, 0.1)',
        border: '1px solid rgba(24, 144, 255, 0.3)',
        borderRadius: '3px',
        padding: '3px 6px',
        textAlign: 'center',
        width: '100%'
      }}>
        <div style={{ 
          color: '#1890ff',
          fontSize: '11px', 
          fontWeight: 600, 
          lineHeight: '12px'
        }}>
          {Math.round(currentDownloadProgress)}%
        </div>
        <div style={{ 
          color: '#999999', 
          fontSize: '8px', 
          lineHeight: '9px'
        }}>
          DownloadMedium
        </div>
      </div>
    )
  }

  // ProcessingStatus - Use the new simplified Progress system
  if (status === 'processing') {
    if (!progress) {
      // Wait for ProgressData
      return (
      <div style={{
        background: 'rgba(82, 196, 26, 0.1)',
        border: '1px solid rgba(82, 196, 26, 0.3)',
        borderRadius: '3px',
        padding: '3px 6px',
        textAlign: 'center',
        width: '100%'
      }}>
        <div style={{ 
          color: '#52c41a',
          fontSize: '11px', 
          fontWeight: 600, 
          lineHeight: '12px'
        }}>
          0%
        </div>
        <div style={{ 
          color: '#999999', 
          fontSize: '8px', 
          lineHeight: '9px'
        }}>
          InitializingMedium...
        </div>
      </div>
      )
    }

    const { stage, percent, message } = progress
    const stageDisplayName = getStageDisplayName(stage)
    const stageColor = getStageColor(stage)
    const failed = isFailed(message)

    return (
      <div style={{
        background: failed 
          ? 'rgba(255, 77, 79, 0.1)'
          : 'rgba(82, 196, 26, 0.1)',
        border: failed 
          ? '1px solid rgba(255, 77, 79, 0.3)'
          : '1px solid rgba(82, 196, 26, 0.3)',
        borderRadius: '3px',
        padding: '3px 6px',
        textAlign: 'center',
        width: '100%'
      }}>
        <div style={{ 
          color: failed ? '#ff4d4f' : '#52c41a',
          fontSize: '11px', 
          fontWeight: 600, 
          lineHeight: '12px'
        }}>
          {failed ? '✗ Failed' : `${percent}%`}
        </div>
        <div style={{ 
          color: '#999999', 
          fontSize: '8px', 
          lineHeight: '9px',
          minHeight: '9px' // Make sure FailedStatus also has a fixed High degree
        }}>
          {failed ? '' : stageDisplayName}
        </div>
      </div>
    )
  }

  // CompletedStatus
  if (status === 'completed') {
    return (
      <div style={{
        background: 'rgba(82, 196, 26, 0.1)',
        border: '1px solid rgba(82, 196, 26, 0.3)',
        borderRadius: '3px',
        padding: '3px 6px',
        textAlign: 'center',
        width: '100%'
      }}>
        <div style={{ 
          color: '#52c41a',
          fontSize: '11px', 
          fontWeight: 600, 
          lineHeight: '12px'
        }}>
          ✓
        </div>
        <div style={{ 
          color: '#999999', 
          fontSize: '8px', 
          lineHeight: '9px'
        }}>
          Completed
        </div>
      </div>
    )
  }

  // FailedStatus
  if (status === 'failed') {
    return (
      <div style={{
        background: 'rgba(255, 77, 79, 0.1)',
        border: '1px solid rgba(255, 77, 79, 0.3)',
        borderRadius: '3px',
        padding: '3px 6px',
        textAlign: 'center',
        width: '100%'
      }}>
        <div style={{ 
          color: '#ff4d4f',
          fontSize: '11px', 
          fontWeight: 600, 
          lineHeight: '12px'
        }}>
          ✗ Failed
        </div>
        <div style={{ 
          color: '#999999', 
          fontSize: '8px', 
          lineHeight: '9px',
          minHeight: '9px' // Make sure FailedStatus also has a fixed High degree
        }}>
          Failed
        </div>
      </div>
    )
  }

  // Waiting for Status
  return (
    <div style={{
      background: 'rgba(217, 217, 217, 0.1)',
      border: '1px solid rgba(217, 217, 217, 0.3)',
      borderRadius: '3px',
      padding: '3px 6px',
      textAlign: 'center',
      width: '100%'
    }}>
      <div style={{ 
        color: '#d9d9d9',
        fontSize: '11px', 
        fontWeight: 600, 
        lineHeight: '12px'
      }}>
        ○ Waiting
      </div>
      <div style={{ 
        color: '#999999', 
        fontSize: '8px', 
        lineHeight: '9px',
        minHeight: '9px' // Make sure that the waiting Status also has a fixed High degree
      }}>
        Pending
      </div>
    </div>
  )
}

// Simplified Progress bar Component - used for detailed Progress display
interface SimpleProgressDisplayProps {
  projectId: string
  status: string
  showDetails?: boolean
}

export const SimpleProgressDisplay: React.FC<SimpleProgressDisplayProps> = ({
  projectId,
  status,
  showDetails = false
}) => {
  const { getProgress } = useSimpleProgressStore()
  const progress = getProgress(projectId)

  if (status !== 'processing' || !progress || !showDetails) {
    return null
  }

  const { stage, percent, message } = progress
  const stageDisplayName = getStageDisplayName(stage)
  const stageColor = getStageColor(stage)

  return (
    <div style={{ marginTop: '8px' }}>
      <Progress
        percent={percent}
        strokeColor={stageColor}
        showInfo={true}
        size="small"
        format={(percent) => `${percent}%`}
      />
      {message && (
        <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: '4px' }}>
          {message}
        </Text>
      )}
    </div>
  )
}
