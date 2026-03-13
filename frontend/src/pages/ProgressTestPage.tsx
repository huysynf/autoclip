/**
 * Progress系统Test页面
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
            message.success('Download完成，Start Processing')
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
    message.info('Start Processing，请View后端日志')
  }

  // 模拟完成
  const handleComplete = () => {
    setTestStatus('completed')
    stopPolling()
    message.success('Done')
  }

  // 模拟失败
  const handleFail = () => {
    setTestStatus('failed')
    stopPolling()
    message.error('Failed')
  }

  // 重置
  const handleReset = () => {
    setTestStatus('pending')
    setDownloadProgress(0)
    stopPolling()
    clearAllProgress()
    message.info('已重置')
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
              <Text strong>当前Status:</Text>
              <Select
                value={testStatus}
                onChange={setTestStatus}
                style={{ width: '100%', marginTop: '8px' }}
              >
                <Option value="pending">Waiting</Option>
                <Option value="downloading">Download中</Option>
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
              完成
            </Button>
            <Button 
              danger
              onClick={handleFail}
              disabled={testStatus !== 'processing'}
            >
              失败
            </Button>
            <Button 
              icon={<ReloadOutlined />}
              onClick={handleReset}
            >
              重置
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
            <li>点击"StartDownload"模拟Download过程，Progress会自动增长</li>
            <li>Download完成后会自动切换到"Processing"Status</li>
            <li>ProcessingStatus会轮询后端API获取Progress</li>
            <li>可以手动点击"完成"或"失败"来Test终态</li>
            <li>点击"重置"Clear AllStatus</li>
          </ul>
        </Space>
      </Card>
    </div>
  )
}
