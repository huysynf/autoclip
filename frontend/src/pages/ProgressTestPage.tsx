/**
 * Progress系统TestPage
 */

import React, { useState } from 'react'
import { Card, Button, Space, Typography, Row, Col, Input, Select, message } from 'antd'
import { PlayCircleOutlined, StopOutlined, ReloadOutlined } from '@ant-design/icons'
import { UnifiedStatusBar, SimpleProgressDisplay } from '../components/UnifiedStatusBar'
import { useSimpleProgressStore } from '../stores/useSimpleProgressStore'

const { Title, Text } = Typography
const { Option } = Select

export const ProgressTestPage: React.FC = () => {
  const { startPolling, stopPolling, isPolling, clearAllProgress } = useSimpleProgressStore()
  const [testProjectId, setTestProjectId] = useState('test-project-1')
  const [testStatus, setTestStatus] = useState('pending')
  const [downloadProgress, setDownloadProgress] = useState(0)

  // 模拟StartDownload
  const handleStartDownload = () => {
    setTestStatus('downloading')
    setDownloadProgress(0)
    
    // 模拟DownloadProgress
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setTestStatus('processing')
            message.success('DownloadCompleted，Start Processing')
          }, 1000)
          return 100
        }
        return prev + Math.random() * 20
      })
    }, 500)
  }

  // 模拟Start Processing
  const handleStartProcessing = () => {
    setTestStatus('processing')
    startPolling([testProjectId], 2000)
    message.info('Start Processing，请View后端Log')
  }

  // 模拟Completed
  const handleComplete = () => {
    setTestStatus('completed')
    stopPolling()
    message.success('Done')
  }

  // 模拟Failed
  const handleFail = () => {
    setTestStatus('failed')
    stopPolling()
    message.error('Failed')
  }

  // Reset
  const handleReset = () => {
    setTestStatus('pending')
    setDownloadProgress(0)
    stopPolling()
    clearAllProgress()
    message.info('已Reset')
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>Progress系统Test</Title>
      
      <Card title="Test控制面板" style={{ marginBottom: '24px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Text strong>projectsID:</Text>
              <Input
                value={testProjectId}
                onChange={(e) => setTestProjectId(e.target.value)}
                placeholder="输入projectsID"
                style={{ marginTop: '8px' }}
              />
            </Col>
            <Col span={12}>
              <Text strong>CurrentStatus:</Text>
              <Select
                value={testStatus}
                onChange={setTestStatus}
                style={{ width: '100%', marginTop: '8px' }}
              >
                <Option value="pending">Waiting</Option>
                <Option value="downloading">DownloadMedium</Option>
                <Option value="processing">Processing</Option>
                <Option value="completed">Completed</Option>
                <Option value="failed">Failure</Option>
              </Select>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Text strong>DownloadProgress:</Text>
              <Input
                type="number"
                value={downloadProgress}
                onChange={(e) => setDownloadProgress(Number(e.target.value))}
                min={0}
                max={100}
                style={{ marginTop: '8px' }}
              />
            </Col>
            <Col span={12}>
              <Text strong>Poll Status:</Text>
              <div style={{ marginTop: '8px' }}>
                <Text type={isPolling ? 'success' : 'secondary'}>
                  {isPolling ? 'Polling' : 'Not polling'}
                </Text>
              </div>
            </Col>
          </Row>

          <Space wrap>
            <Button 
              type="primary" 
              icon={<PlayCircleOutlined />}
              onClick={handleStartDownload}
              disabled={testStatus !== 'pending'}
            >
              StartDownload
            </Button>
            <Button 
              icon={<PlayCircleOutlined />}
              onClick={handleStartProcessing}
              disabled={testStatus !== 'downloading' && testStatus !== 'pending'}
            >
              Start Processing
            </Button>
            <Button 
              type="primary"
              onClick={handleComplete}
              disabled={testStatus !== 'processing'}
            >
              Completed
            </Button>
            <Button 
              danger
              onClick={handleFail}
              disabled={testStatus !== 'processing'}
            >
              Failed
            </Button>
            <Button 
              icon={<ReloadOutlined />}
              onClick={handleReset}
            >
              Reset
            </Button>
          </Space>
        </Space>
      </Card>

      <Card title="Status显示Test">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text strong>统一Status栏:</Text>
          <UnifiedStatusBar
            projectId={testProjectId}
            status={testStatus}
            downloadProgress={downloadProgress}
            onStatusChange={(newStatus) => {
              console.log('Status变化:', newStatus)
            }}
            onDownloadProgressUpdate={(progress) => {
              console.log('DownloadProgressUpdate:', progress)
            }}
          />

          <Text strong>详细Progress显示:</Text>
          <SimpleProgressDisplay
            projectId={testProjectId}
            status={testStatus}
            showDetails={true}
          />

          <Text strong>说明:</Text>
          <ul style={{ fontSize: '12px', color: '#666' }}>
            <li>点击"StartDownload"模拟Download过程，Progress会Auto增长</li>
            <li>DownloadCompleted后会Auto切换到"Processing"Status</li>
            <li>ProcessingStatus会轮询后端APIGet Progress</li>
            <li>可以Manual点击"Completed"或"Failed"来Test终态</li>
            <li>点击"Reset"Clear AllStatus</li>
          </ul>
        </Space>
      </Card>
    </div>
  )
}
