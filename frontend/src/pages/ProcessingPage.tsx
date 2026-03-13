import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout, Card, Progress, Steps, Typography, Button, Alert, Space, Spin, message } from 'antd'
import { CheckCircleOutlined, LoadingOutlined, ExclamationCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { projectApi } from '../services/api'
import { useProjectStore } from '../store/useProjectStore'

const { Content } = Layout
const { Title, Text } = Typography
const { Step } = Steps

interface ProcessingStatus {
  status: 'processing' | 'completed' | 'error'
  current_step: number
  total_steps: number
  step_name: string
  progress: number
  error_message?: string
}

const ProcessingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentProject, setCurrentProject } = useProjectStore()
  const [status, setStatus] = useState<ProcessingStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const steps = [
    { title: 'Outline Extraction', description: 'Extract structured outline from video transcript' },
    { title: 'Time Localization', description: 'Locate topic time intervals based on SRT subtitles' },
    { title: 'Content Scoring', description: 'Multi-dimensional evaluation of clip quality and reach' },
    { title: 'Title Generation', description: 'Generate compelling titles for high-scoring clips' },
    { title: 'Topic Clustering', description: 'Group related clips into recommended collections' },
    { title: 'Video Cutting', description: 'Generate clips and collection videos using FFmpeg' }
  ]

  useEffect(() => {
    if (!id) return
    
    loadProject()
    const interval = setInterval(checkStatus, 2000) // 每2秒检查一次Status
    
    return () => clearInterval(interval)
  }, [id])

  const loadProject = async () => {
    if (!id) return
    
    try {
      const project = await projectApi.getProject(id)
      setCurrentProject(project)
      
      // 如果projectsCompleted，直接跳转到Details页
      if (project.status === 'completed') {
        navigate(`/project/${id}`)
        return
      }
      
      // 如果projectsStatus是Pending，Start Processing
      if (project.status === 'pending') {
        await startProcessing()
      }
    } catch (error) {
      message.error('Failed to load project')
      console.error('Load project error:', error)
    } finally {
      setLoading(false)
    }
  }

  const startProcessing = async () => {
    if (!id) return
    
    try {
      await projectApi.startProcessing(id)
      message.success('Start Processingprojects')
    } catch (error) {
      message.error('Failed to start')
      console.error('Start processing error:', error)
    }
  }

  const checkStatus = async () => {
    if (!id) return
    
    try {
      const statusData = await projectApi.getProcessingStatus(id)
      setStatus(statusData)
      
      // 如果Done，跳转到projectsDetails页
      if (statusData.status === 'completed') {
        message.success('🎉 Video processing done! Redirecting to results...')
        setTimeout(() => {
          navigate(`/project/${id}`)
        }, 2000)
      }
      
      // 如果Failed，显示详细错误信息
      if (statusData.status === 'error') {
        const errorMsg = statusData.error_message || 'An unknown error occurred during processing'
        message.error(`Failed: ${errorMsg}`)
        
        // 提供Retry选项
        message.info('You can go back home and re-upload, or contact support', 5)
      }
      
    } catch (error: any) {
      console.error('Check status error:', error)
      
      // 根据错误Type提供不同的处理建议
      if (error.response?.status === 404) {
        message.error('Project not found or has been deleted')
        setTimeout(() => navigate('/'), 2000)
      } else if (error.code === 'ECONNABORTED') {
        message.warning('Network timeout, retrying...')
      } else {
        message.error('Failed to get processing status. Please refresh the page.')
      }
    }
  }

  const getStepStatus = (stepIndex: number) => {
    if (!status) return 'wait'
    
    if (status.status === 'error') {
      return stepIndex < status.current_step ? 'finish' : 'error'
    }
    
    if (stepIndex < status.current_step) return 'finish'
    if (stepIndex === status.current_step) return 'process'
    return 'wait'
  }

  const getStepIcon = (stepIndex: number) => {
    const stepStatus = getStepStatus(stepIndex)
    
    if (stepStatus === 'finish') return <CheckCircleOutlined />
    if (stepStatus === 'process') return <LoadingOutlined />
    if (stepStatus === 'error') return <ExclamationCircleOutlined />
    return null
  }

  if (loading) {
    return (
      <Content style={{ padding: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" tip="Loading..." />
      </Content>
    )
  }

  return (
    <Content style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Title level={2}>Video Processing Progress</Title>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/')}
          >
            BackHome
          </Button>
        </div>

        {currentProject && (
          <Card>
            <Title level={4}>{currentProject.name}</Title>
            <Text type="secondary">projectsID: {currentProject.id}</Text>
          </Card>
        )}

        {status?.status === 'error' && (
          <Alert
            message="Failed"
            description={
              <div>
                <p>{status.error_message || 'An unknown error occurred during processing'}</p>
                <p style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                  Possible causes: unsupported file format, corrupted file, network issues, or server error
                </p>
              </div>
            }
            type="error"
            showIcon
            action={
              <Space>
                <Button size="small" onClick={() => window.location.reload()}>
                  Refresh Page
                </Button>
                <Button size="small" onClick={() => navigate('/')}>
                  BackHome
                </Button>
              </Space>
            }
          />
        )}

        {status && status.status === 'processing' && (
          <Card title="Processing Progress">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <Text strong>Overall Progress</Text>
                  <Text>{Math.round(status.progress)}%</Text>
                </div>
                <Progress 
                  percent={status.progress} 
                  status={status.status === 'completed' ? 'success' : status.status === 'processing' ? 'active' : 'normal'}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
              </div>

              <div>
                <Text strong>Current Step: </Text>
                <Text>{status.step_name}</Text>
              </div>

              <Steps 
                direction="vertical" 
                current={status.current_step}
                status={status.status === 'error' ? 'error' : status.status === 'processing' ? 'process' : 'wait'}
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
            </Space>
          </Card>
        )}

        {status?.status === 'completed' && (
          <Alert
            message="Done"
            description="Video processing complete, redirecting to project details..."
            type="success"
            showIcon
          />
        )}
      </Space>
    </Content>
  )
}

export default ProcessingPage