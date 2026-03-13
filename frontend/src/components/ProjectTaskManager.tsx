import React, { useState, useEffect } from 'react'
import { Card, Table, Tag, Progress, Space, Typography, Button, Modal, message, Row, Col, Statistic } from 'antd'
import { ReloadOutlined, EyeOutlined, ExclamationCircleOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { use tasksStatus } from '../hooks/use tasksStatus'
import {  tasksStatus as  tasksStatusType } from '../hooks/use tasksStatus'

const { Title, Text } = Typography
const { confirm } = Modal

interface Project tasksManagerProps {
  projectId: string
  projectName?: string
}

export const Project tasksManager: React.FC<Project tasksManagerProps> = ({ 
  projectId, 
  projectName 
}) => {
  const { getAll taskss, loading } = use tasksStatus()
  const [selected tasks, setSelected tasks] = useState< tasksStatusType | null>(null)
  const [taskDetailVisible, set tasksDetailVisible] = useState(false)

  // Get Currentprojects的 tasks
  const project taskss = getAll taskss().filter(task => task.project_id === projectId)
  const active taskss = project taskss.filter(task => 
    task.status === 'running' || task.status === 'pending'
  )
  const completed taskss = project taskss.filter(task => task.status === 'completed')
  const failed taskss = project taskss.filter(task => task.status === 'failed')

  // Refresh tasks List
  const handleRefresh = () => {
    message.success(' tasks List已Refresh')
  }

  // View tasksDetails
  const handleView tasks = (task:  tasksStatusType) => {
    setSelected tasks(task)
    set tasksDetailVisible(true)
  }

  // Delete tasks
  const handleDelete tasks = (taskId: string) => {
    confirm({
      title: 'ConfirmDelete',
      icon: <ExclamationCircleOutlined />,
      content: 'OK要Delete这 tasks?Delete后None法恢复。',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        message.success(' tasks deleted')
      }
    })
  }

  // Get StatusIcon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />
      case 'running':
        return <ClockCircleOutlined style={{ color: '#1890ff' }} />
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
      case 'pending':
        return <ClockCircleOutlined style={{ color: '#faad14' }} />
      default:
        return <ClockCircleOutlined style={{ color: '#d9d9d9' }} />
    }
  }

  // Get StatusColor
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'running':
        return 'processing'
      case 'failed':
        return 'error'
      case 'pending':
        return 'warning'
      default:
        return 'default'
    }
  }

  // Table column definitions
  const columns = [
    {
      title: ' tasksName',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record:  tasksStatusType) => (
        <Space>
          {getStatusIcon(record.status)}
          <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status === 'completed' ? 'Completed' :
           status === 'running' ? 'In Progress' :
           status === 'failed' ? 'Failed' :
           status === 'pending' ? 'Waiting' : status}
        </Tag>
      )
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number, record:  tasksStatusType) => (
        <Progress 
          percent={Math.round(progress)} 
          size="small"
          status={record.status === 'failed' ? 'exception' : 'normal'}
        />
      )
    },
    {
      title: 'CurrentStep',
      dataIndex: 'current_step',
      key: 'current_step',
      render: (step: string) => step || '-'
    },
    {
      title: 'CreateTime',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (timestamp: string) => (
        <Text type="secondary">
          {new Date(timestamp).toLocaleString('zh-CN')}
        </Text>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record:  tasksStatusType) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView tasks(record)}
            title="ViewDetails"
          />
          <Button
            type="text"
            size="small"
            icon={<ExclamationCircleOutlined />}
            onClick={() => handleDelete tasks(record.id)}
            title="Delete tasks"
            danger
          />
        </Space>
      )
    }
  ]

  if (project taskss.length === 0) {
    return (
      <Card title=" tasks Management" size="small">
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Text type="secondary">该projectsNo tasksRecords</Text>
        </div>
      </Card>
    )
  }

  return (
    <Card 
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span> tasks Management</span>
          <Button 
            type="primary" 
            size="small"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      }
      size="small"
    >
      {/*  tasksStatistics */}
      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col span={6}>
          <Statistic
            title="总 tasks数"
            value={project taskss.length}
            prefix={<ClockCircleOutlined />}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="活跃 tasks"
            value={active taskss.length}
            valueStyle={{ color: '#1890ff' }}
            prefix={<ClockCircleOutlined />}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Completed"
            value={completed taskss.length}
            valueStyle={{ color: '#52c41a' }}
            prefix={<CheckCircleOutlined />}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Failed tasks"
            value={failed taskss.length}
            valueStyle={{ color: '#ff4d4f' }}
            prefix={<CloseCircleOutlined />}
          />
        </Col>
      </Row>

      {/* 活跃 tasks */}
      {active taskss.length > 0 && (
        <Card 
          size="small" 
          style={{ marginBottom: '16px' }}
          title={`活跃 tasks (${active taskss.length})`}
        >
          <Space wrap>
            {active taskss.map(task => (
              <div key={task.id} style={{ marginBottom: '8px' }}>
                <Text>{task.message || task.id}</Text>
                <Progress percent={task.progress} size="small" />
              </div>
            ))}
          </Space>
        </Card>
      )}

      {/*  tasks List */}
      <Table
        columns={columns}
        dataSource={project taskss}
        rowKey="id"
        pagination={{
          pageSize: 5,
          showSizeChanger: false,
          showTotal: (total, range) => 
            `第 ${range[0]}-${range[1]} 条，Total ${total} 条`
        }}
        size="small"
        loading={loading}
      />

      {/*  tasksDetails弹窗 */}
      <Modal
        title=" tasksDetails"
        open={taskDetailVisible}
        onCancel={() => set tasksDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => set tasksDetailVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {selected tasks && (
          <div>
            <Text> tasksID: {selected tasks.id}</Text>
            <br />
            <Text>Status: {selected tasks.status}</Text>
            <br />
            <Text>Progress: {selected tasks.progress}%</Text>
            <br />
            <Text>Message: {selected tasks.message}</Text>
          </div>
        )}
      </Modal>
    </Card>
  )
}
