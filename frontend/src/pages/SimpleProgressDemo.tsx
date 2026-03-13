/**
 * 简化Progress系统演示页面
 */

import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Typography, 
  Space, 
  Button, 
  Row, 
  Col, 
  Divider, 
  message,
  Input,
  Select
} from 'antd'
import { 
  PlayCircleOutlined, 
  StopOutlined, 
  ReloadOutlined,
  PlusOutlined
} from '@ant-design/icons'
import { SimpleProgressBar, BatchProgressBar } from '../components/SimpleProgressBar'
import { SimpleProjectCard } from '../components/SimpleProjectCard'
import { useSimpleProgressStore } from '../stores/useSimpleProgressStore'

const { Title, Text, Paragraph } = Typography
const { Option } = Select

// 模拟projects数据
const mockProjects = [
  {
    id: 'demo-project-1',
    title: 'AI Technology Analysis',
    description: 'Deep dive into the development of AI technology',
    status: 'pending',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    category: 'knowledge'
  },
  {
    id: 'demo-project-2', 
    title: 'Startup Experience',
    description: 'Sharing the ups and downs of entrepreneurship',
    status: 'processing',
    created_at: '2024-01-14T15:30:00Z',
    updated_at: '2024-01-15T09:45:00Z',
    category: 'business'
  },
  {
    id: 'demo-project-3',
    title: 'Game Review',
    description: 'In-depth review of the latest games',
    status: 'completed',
    created_at: '2024-01-13T20:15:00Z',
    updated_at: '2024-01-14T16:20:00Z',
    category: 'entertainment'
  }
]

export const SimpleProgressDemo: React.FC = () => {
  const { 
    startPolling, 
    stopPolling, 
    isPolling, 
    getAllProgress,
    clearAllProgress 
  } = useSimpleProgressStore()

  const [projects, setProjects] = useState(mockProjects)
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([])
  const [pollingInterval, setPollingInterval] = useState(2000)
  const [newProjectId, setNewProjectId] = useState('')

  // 模拟Start Processingprojects
  const handleStartProcessing = (projectId: string) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, status: 'processing' } : p
    ))
    message.success(`Processing started: ${projectId}`)
  }

  // 模拟ViewDetails
  const handleViewDetails = (projectId: string) => {
    message.info(`View project details: ${projectId}`)
  }

  // 模拟Deleteprojects
  const handleDelete = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId))
    message.success(`Deleted project: ${projectId}`)
  }

  // 模拟Retryprojects
  const handleRetry = (projectId: string) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, status: 'processing' } : p
    ))
    message.success(`Retrying project: ${projectId}`)
  }

  // Add新projects
  const handleAddProject = () => {
    if (!newProjectId.trim()) {
      message.warning('Please enter a project ID')
      return
    }

    const newProject = {
      id: newProjectId,
      title: `New Project ${newProjectId}`,
      description: 'This is a newly added demo project',
      status: 'pending' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      category: 'default'
    }

    setProjects(prev => [...prev, newProject])
    setNewProjectId('')
    message.success(`Added project: ${newProjectId}`)
  }

  // Start Polling选中的projects
  const handleStartPolling = () => {
    if (selectedProjectIds.length === 0) {
      message.warning('Please select projects to poll')
      return
    }
    startPolling(selectedProjectIds, pollingInterval)
    message.success(`Started polling ${selectedProjectIds.length} projects`)
  }

  // Stop Polling
  const handleStopPolling = () => {
    stopPolling()
    message.info('Polling stopped')
  }

  // Clear AllProgress
  const handleClearProgress = () => {
    clearAllProgress()
    message.success('Cleared all progress data')
  }

  const allProgress = getAllProgress()

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>Simplified Progress System Demo</Title>
      
      <Paragraph>
        This is a simplified progress system demo based on fixed stages and polling.
        The system uses 6 fixed stages, each with a fixed weight, polling the API for the latest progress.
      </Paragraph>

      <Divider />

      {/* 控制面板 */}
      <Card title="Control Panel" style={{ marginBottom: '24px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Row gutter={16}>
            <Col span={8}>
              <Text strong>Poll Interval:</Text>
              <Select
                value={pollingInterval}
                onChange={setPollingInterval}
                style={{ width: '100%', marginTop: '8px' }}
              >
                <Option value={1000}>1 second</Option>
                <Option value={2000}>2 seconds</Option>
                <Option value={3000}>3 seconds</Option>
                <Option value={5000}>5 seconds</Option>
              </Select>
            </Col>
            <Col span={8}>
              <Text strong>Poll Status:</Text>
              <div style={{ marginTop: '8px' }}>
                <Tag color={isPolling ? 'green' : 'red'}>
                  {isPolling ? 'Polling' : 'Not polling'}
                </Tag>
              </div>
            </Col>
            <Col span={8}>
              <Text strong>Progress Data:</Text>
              <div style={{ marginTop: '8px' }}>
                <Tag color="blue">
                  {Object.keys(allProgress).length} projects
                </Tag>
              </div>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Space>
                <Button 
                  type="primary" 
                  icon={<PlayCircleOutlined />}
                  onClick={handleStartPolling}
                  disabled={isPolling}
                >
                  Start Polling
                </Button>
                <Button 
                  icon={<StopOutlined />}
                  onClick={handleStopPolling}
                  disabled={!isPolling}
                >
                  Stop Polling
                </Button>
                <Button 
                  icon={<ReloadOutlined />}
                  onClick={handleClearProgress}
                >
                  Clear Progress
                </Button>
              </Space>
            </Col>
            <Col span={12}>
              <Space>
                <Input
                  placeholder="Enter project ID"
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                  onPressEnter={handleAddProject}
                />
                <Button 
                  type="dashed" 
                  icon={<PlusOutlined />}
                  onClick={handleAddProject}
                >
                  Addprojects
                </Button>
              </Space>
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <Text strong>Select projects to poll:</Text>
              <div style={{ marginTop: '8px' }}>
                <Select
                  mode="multiple"
                  placeholder="Select project"
                  value={selectedProjectIds}
                  onChange={setSelectedProjectIds}
                  style={{ width: '100%' }}
                >
                  {projects.map(project => (
                    <Option key={project.id} value={project.id}>
                      {project.title} ({project.status})
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
          </Row>
        </Space>
      </Card>

      {/* 批量Progress显示 */}
      {selectedProjectIds.length > 0 && (
        <Card title="Batch Progress View" style={{ marginBottom: '24px' }}>
          <BatchProgressBar
            projectIds={selectedProjectIds}
            autoStart={false}
            pollingInterval={pollingInterval}
            showDetails={true}
            onProgressUpdate={(projectId, progress) => {
              console.log(`projects ${projectId} ProgressUpdate:`, progress)
            }}
          />
        </Card>
      )}

      {/* projects卡片列表 */}
      <Card title="Project List">
        <Row gutter={[16, 16]}>
          {projects.map(project => (
            <Col span={24} key={project.id}>
              <SimpleProjectCard
                project={project}
                onStartProcessing={handleStartProcessing}
                onViewDetails={handleViewDetails}
                onDelete={handleDelete}
                onRetry={handleRetry}
              />
            </Col>
          ))}
        </Row>
      </Card>

      {/* 当前Progress数据 */}
      {Object.keys(allProgress).length > 0 && (
        <Card title="Current Progress Data" style={{ marginTop: '24px' }}>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '12px', 
            borderRadius: '4px',
            fontSize: '12px',
            maxHeight: '300px',
            overflow: 'auto'
          }}>
            {JSON.stringify(allProgress, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  )
}
