import React, { useState, useEffect } from 'react'
import { Modal, Steps, Progress, Typography, Button, Alert, Space, Spin } from 'antd'
import { 
  CheckCircleOutlined, 
  LoadingOutlined, 
  ExclamationCircleOutlined, 
  ReloadOutlined,
  CloseOutlined
} from '@ant-design/icons'
import { projectApi } from '../services/api'
import { useProjectStore } from '../store/useProjectStore'

const { Text, Title } = Typography
const { Step } = Steps

interface ProcessingStatus {
  status: 'processing' | 'completed' | 'error'
  current_step: number
  total_steps: number
  step_name: string
  progress: number
  error_message?: string
}

interface  tasksProgressModalProps {
  visible: boolean
  projectId: string | null
  onClose: () => void
  onComplete?: (projectId: string) => void
}

const  tasksProgressModal: React.FC< tasksProgressModalProps> = ({
  visible,
  projectId,
  onClose,
  onComplete
}) => {
  const [status, setStatus] = useState<ProcessingStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const { updateProject } = useProjectStore()

  const steps = [
    { title: 'Outline Extraction', description: 'Extract structured outline from video transcript' },
    { title: 'Time Localization', description: 'Locate topic time intervals based on SRT subtitles' },
    { title: 'Content Scoring', description: 'Multi-dimensional evaluation of clip quality and reach' },
    { title: 'Title Generation', description: 'Generate compelling titles for high-scoring clips' },
    { title: 'Topic Clustering', description: 'Group related clips into recommended collections' },
    { title: 'Video Cutting', description: 'Generate clips and collection videos using FFmpeg' }
  ]

  useEffect(() => {
    if (!visible || !projectId) {
      setStatus(null)
      return
    }

    const checkStatus = async () => {
      try {
        const statusData = await projectApi.getProcessingStatus(projectId)
        setStatus(statusData)
        
        // UpdateprojectsStatus
        updateProject(projectId, {
          status: statusData.status,
          current_step: statusData.current_step,
          total_steps: statusData.total_steps,
          error_message: statusData.error_message
        })
        
        // 如果Done，Notifications父Component
        if (statusData.status === 'completed') {
          onComplete?.(projectId)
        }
      } catch (error) {
        console.error('Check status error:', error)
      }
    }

    // 立即检查一次Status
    checkStatus()
    
    // 如果 tasks还在In Progress，定期检查Status
    const interval = setInterval(checkStatus, 2000)
    
    return () => clearInterval(interval)
  }, [visible, projectId, updateProject, onComplete])

  const handleRetry = async () => {
    if (!projectId) return
    
    setLoading(true)
    try {
      if (status?.current_step !== undefined) {
        // 从CurrentStepRetry
        await projectApi.restartStep(projectId, status.current_step)
      } else {
        // 完全Retry
        await projectApi.retryProcessing(projectId)
      }
      // 重新StartStatus检查
      setStatus(null)
    } catch (error) {
      console.error('Retry error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStepStatus = (stepIndex: number) => {
    if (!status) return 'wait'
    
    if (status.status === 'error' && stepIndex === status.current_step) {
      return 'error'
    }
    
    if (stepIndex < status.current_step) {
      return 'finish'
    }
    
    if (stepIndex === status.current_step) {
      return status.status === 'completed' ? 'finish' : 'process'
    }
    
    return 'wait'
  }

  const getStepIcon = (stepIndex: number) => {
    const stepStatus = getStepStatus(stepIndex)
    
    if (stepStatus === 'error') {
      return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
    }
    
    if (stepStatus === 'finish') {
      return <CheckCircleOutlined style={{ color: '#52c41a' }} />
    }
    
    if (stepStatus === 'process') {
      return <LoadingOutlined style={{ color: '#1890ff' }} />
    }
    
    return null
  }

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <LoadingOutlined style={{ color: '#1890ff' }} />
          <span> tasksProcessingProgress</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        ...(status?.status === 'error' ? [
          <Button 
            key="retry" 
            type="primary" 
            icon={<ReloadOutlined />}
            loading={loading}
            onClick={handleRetry}
          >
            从CurrentStepRetry
          </Button>
        ] : [])
      ]}
      width={600}
      centered
      maskClosable={false}
      destroyOnClose
    >
      <div style={{ padding: '16px 0' }}>
        {!status ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px', color: '#666' }}>
              正在Get  tasksStatus...
            </div>
          </div>
        ) : (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* 整体Progress */}
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <Text strong>整体Progress</Text>
                <Text type="secondary">
                  {status.current_step}/{status.total_steps} Step
                </Text>
              </div>
              <Progress 
                percent={Math.round((status.current_step / status.total_steps) * 100)}
                status={status.status === 'error' ? 'exception' : 'active'}
                strokeColor={{
                  '0%': '#4facfe',
                  '100%': '#00f2fe'
                }}
              />
            </div>

            {/* CurrentStepInfo */}
            <div style={{
              background: '#f8f9fa',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                {getStepIcon(status.current_step)}
                <Text strong>CurrentStep: {status.step_name}</Text>
              </div>
              <Progress 
                percent={status.progress}
                size="small"
                status={status.status === 'error' ? 'exception' : 'active'}
              />
            </div>

            {/* ErrorInfo */}
            {status.status === 'error' && status.error_message && (
              <Alert
                message="Failed"
                description={status.error_message}
                type="error"
                showIcon
              />
            )}

            {/* StepList */}
            <div>
              <Text strong style={{ marginBottom: '16px', display: 'block' }}>Processing Steps</Text>
              <Steps
                direction="vertical"
                size="small"
                current={status.current_step}
                status={status.status === 'error' ? 'error' : 'process'}
              >
                {steps.map((step, index) => (
                  <Step
                    key={index}
                    title={step.title}
                    description={step.description}
                    status={getStepStatus(index)}
                    icon={getStepIcon(index)}
                  />
                ))}
              </Steps>
            </div>

            {/* CompletedPrompt */}
            {status.status === 'completed' && (
              <Alert
                message="Done"
                description="Video已SuccessProcessing，您可以View生成的clips和Collection。"
                type="success"
                showIcon
              />
            )}
          </Space>
        )}
      </div>
    </Modal>
  )
}

export default  tasksProgressModal