import React, { useState, useEffect } from 'react'
import { Button, Modal, Form, Input, Table, Tag, Space, message, Popconfirm, Tabs, Alert, Typography, Select, Row, Col, Tooltip, Progress, Descriptions, Statistic, Card } from 'antd'
import { PlusOutlined, DeleteOutlined, UserOutlined, CheckCircleOutlined, CloseCircleOutlined, UploadOutlined, QuestionCircleOutlined, ReloadOutlined, EyeOutlined, RedoOutlined, StopOutlined, ExclamationCircleOutlined, ClockCircleOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { uploadApi, BilibiliAccount, BILIBILI_PARTITIONS, UploadRecord } from '../services/uploadApi'
import './BilibiliManager.css'

const { TextArea } = Input
const { Text } = Typography
const { Option } = Select
const { TabPane } = Tabs

interface BilibiliManagerProps {
  visible: boolean
  onClose: () => void
  projectId?: string
  clipIds?: string[]
  clipTitles?: string[]
  onUploadSuccess?: () => void
}

const BilibiliManager: React.FC<BilibiliManagerProps> = ({
  visible,
  onClose,
  projectId,
  clipIds = [],
  clipTitles = [],
  onUploadSuccess
}) => {
  const [activeTab, setActiveTab] = useState('upload')
  const [accounts, setAccounts] = useState<BilibiliAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddAccount, setShowAddAccount] = useState(false)
  const [cookieForm] = Form.useForm()
  const [uploadForm] = Form.useForm()
  
  // UploadStatus相关Status
  const [uploadRecords, setUploadRecords] = useState<UploadRecord[]>([])
  const [recordsLoading, setRecordsLoading] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<UploadRecord | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)

  // 获取Account List
  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const data = await uploadApi.getAccounts()
      setAccounts(data)
    } catch (error: any) {
      message.error('获取Account List失败: ' + (error.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  // 获取Upload记录
  const fetchUploadRecords = async () => {
    try {
      setRecordsLoading(true)
      const data = await uploadApi.getUploadRecords()
      setUploadRecords(data)
    } catch (error: any) {
      message.error('获取Upload记录失败: ' + (error.message || 'Unknown error'))
    } finally {
      setRecordsLoading(false)
    }
  }

  // RetryUpload
  const handleRetry = async (recordId: string | number) => {
    try {
      await uploadApi.retryUpload(recordId)
      message.success('Retry task submitted')
      fetchUploadRecords()
    } catch (error: any) {
      message.error('Retry失败: ' + (error.message || 'Unknown error'))
    }
  }

  // CancelUpload
  const handleCancel = async (recordId: string | number) => {
    try {
      await uploadApi.cancelUpload(recordId)
      message.success('Task cancelled')
      fetchUploadRecords()
    } catch (error: any) {
      message.error('Cancel失败: ' + (error.message || 'Unknown error'))
    }
  }

  // DeleteUpload
  const handleDelete = async (recordId: string | number) => {
    try {
      await uploadApi.deleteUpload(recordId)
      message.success('Task deleted')
      fetchUploadRecords()
    } catch (error: any) {
      message.error('Delete失败: ' + (error.message || 'Unknown error'))
    }
  }

  // ViewDetails
  const handleViewDetail = (record: UploadRecord) => {
    setSelectedRecord(record)
    setDetailModalVisible(true)
  }

  useEffect(() => {
    if (visible) {
      fetchAccounts()
      fetchUploadRecords()
      // 如果有切片数据，默认显示UploadTags页
      if (clipIds.length > 0) {
        setActiveTab('upload')
      } else {
        setActiveTab('accounts')
      }
    }
  }, [visible, clipIds])

  // Cookie导入登录
  const handleCookieLogin = async (values: any) => {
    try {
      setLoading(true)
      
      // 解析Cookiechars串
      const cookieStr = values.cookies.trim()
      const cookies: Record<string, string> = {}
      
      cookieStr.split(';').forEach((cookie: string) => {
        const trimmedCookie = cookie.trim()
        const equalIndex = trimmedCookie.indexOf('=')
        if (equalIndex > 0) {
          const key = trimmedCookie.substring(0, equalIndex).trim()
          const value = trimmedCookie.substring(equalIndex + 1).trim()
          if (key && value) {
            cookies[key] = value
          }
        }
      })
      
      if (Object.keys(cookies).length === 0) {
        message.error('Cookie格式不正确，请检查输入')
        return
      }
      
      await uploadApi.cookieLogin(cookies, values.nickname)
      message.success('账号Add成功！')
      setShowAddAccount(false)
      cookieForm.resetFields()
      fetchAccounts()
    } catch (error: any) {
      message.error('Add账号失败: ' + (error.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  // Delete账号
  const handleDeleteAccount = async (accountId: string) => {
    try {
      await uploadApi.deleteAccount(accountId)
      message.success('账号Delete成功')
      fetchAccounts()
    } catch (error: any) {
      message.error('Delete账号失败: ' + (error.message || 'Unknown error'))
    }
  }

  // SubmitUpload
  const handleUpload = async (values: any) => {
    // 显示开发中提示
    message.info('Bilibili upload coming soon!', 3)
    return
    
    // 原有代码已禁用
    if (!projectId || clipIds.length === 0) {
      message.error('没有选择要Upload的切片')
      return
    }

    try {
      setLoading(true)
      
      const uploadData = {
        account_id: values.account_id,
        clip_ids: clipIds,
        title: values.title,
        description: values.description || '',
        tags: values.tags ? values.tags.split(',').map((tag: string) => tag.trim()) : [],
        partition_id: values.partition_id
      }

      // 调用UploadAPI
      const response = await fetch(`/api/v1/upload/projects/${projectId}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(uploadData)
      })

      if (response.ok) {
        message.success('Upload任务已Create，正在后台Processing...')
        onUploadSuccess?.()
        onClose()
      } else {
        const error = await response.json()
        message.error('Upload失败: ' + (error.detail || 'Unknown error'))
      }
    } catch (error: any) {
      message.error('Upload失败: ' + (error.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  // 获取StatusTags
  const getStatusTag = (status: string) => {
    const statusConfig = {
      pending: { color: 'default', icon: <ClockCircleOutlined />, text: 'Waiting' },
      processing: { color: 'processing', icon: <PlayCircleOutlined />, text: 'Processing' },
      success: { color: 'success', icon: <CheckCircleOutlined />, text: 'Success' },
      completed: { color: 'success', icon: <CheckCircleOutlined />, text: 'Done' },
      failed: { color: 'error', icon: <ExclamationCircleOutlined />, text: 'Failed' },
      cancelled: { color: 'default', icon: <StopOutlined />, text: 'Cancelled' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    )
  }

  // 获取分区Name
  const getPartitionName = (partitionId: number) => {
    const partition = BILIBILI_PARTITIONS.find(p => p.id === partitionId)
    return partition ? partition.name : `Category ${partitionId}`
  }

  // 格式化文件Size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-'
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  // 格式化时长
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  // 获取统计信息
  const getStatistics = () => {
    const total = uploadRecords.length
    const success = uploadRecords.filter(r => r.status === 'success' || r.status === 'completed').length
    const failed = uploadRecords.filter(r => r.status === 'failed').length
    const processing = uploadRecords.filter(r => r.status === 'processing').length
    const pending = uploadRecords.filter(r => r.status === 'pending').length
    
    return { total, success, failed, processing, pending }
  }

  // Cookie获取指南Content
  const cookieGuideContent = (
    <div style={{ maxWidth: 300 }}>
      <div style={{ marginBottom: 8, fontWeight: 'bold' }}>Cookie获取Step：</div>
      <ol style={{ margin: 0, paddingLeft: 16 }}>
        <li>打开B站网站并登录</li>
        <li>按F12Open developer tools</li>
        <li>点击NetworkTags页</li>
        <li>Refresh Page</li>
        <li>找到任意请求，点击View</li>
        <li>在Request Headers中找到Cookie字段</li>
        <li>CopyCookie的值（不包含"Cookie: "前缀）</li>
      </ol>
    </div>
  )

  // Account Management表格列
  const accountColumns = [
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
      render: (nickname: string, record: BilibiliAccount) => (
        <Space>
          <UserOutlined />
          <span>{nickname || record.username}</span>
        </Space>
      ),
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'} icon={status === 'active' ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
          {status === 'active' ? '正常' : '异常'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_: any, record: BilibiliAccount) => (
        <Popconfirm
          title="OK要Delete这账号?"
          description="Delete后将无法恢复，请谨慎操作。"
          onConfirm={() => handleDeleteAccount(record.id)}
          okText="OK"
          cancelText="Cancel"
        >
          <Button type="text" danger icon={<DeleteOutlined />} size="small">
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ]

  // UploadStatus表格列
  const uploadStatusColumns = [
    {
      title: 'Task ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id: string | number) => <Text code>{id}</Text>
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (title: string) => (
        <Tooltip title={title}>
          <Text>{title}</Text>
        </Tooltip>
      )
    },
    {
      title: 'Upload Account',
      dataIndex: 'account_nickname',
      key: 'account_nickname',
      width: 120,
      render: (nickname: string, record: UploadRecord) => (
        <div>
          <div>{nickname || record.account_username}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.account_username}
          </Text>
        </div>
      )
    },
    {
      title: 'Category',
      dataIndex: 'partition_id',
      key: 'partition_id',
      width: 100,
      render: (partitionId: number) => (
        <Tag>{getPartitionName(partitionId)}</Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getStatusTag(status)
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      width: 120,
      render: (progress: number, record: UploadRecord) => {
        if (record.status === 'success' || record.status === 'completed') {
          return <Progress percent={100} size="small" status="success" />
        } else if (record.status === 'failed') {
          return <Progress percent={progress} size="small" status="exception" />
        } else if (record.status === 'processing') {
          return <Progress percent={progress} size="small" status="active" />
        } else {
          return <Progress percent={progress} size="small" />
        }
      }
    },
    {
      title: 'File Size',
      dataIndex: 'file_size',
      key: 'file_size',
      width: 100,
      render: (fileSize: number) => <span>{formatFileSize(fileSize)}</span>
    },
    {
      title: 'CreateTime',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date: string) => <span>{new Date(date).toLocaleString()}</span>
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_: any, record: UploadRecord) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetail(record)}
            size="small"
          >
            Details
          </Button>
          {record.status === 'failed' && (
            <Popconfirm
              title="Retry this upload task?"
              onConfirm={() => handleRetry(record.id)}
              okText="OK"
              cancelText="Cancel"
            >
              <Button 
                type="link" 
                icon={<RedoOutlined />} 
                size="small"
              >
                Retry
              </Button>
            </Popconfirm>
          )}
          {(record.status === 'pending' || record.status === 'processing') && (
            <Popconfirm
              title="Cancel this upload task?"
              onConfirm={() => handleCancel(record.id)}
              okText="OK"
              cancelText="Cancel"
            >
              <Button 
                type="link" 
                icon={<StopOutlined />} 
                danger
                size="small"
              >
                Cancel
              </Button>
            </Popconfirm>
          )}
          {(record.status === 'success' || record.status === 'completed' || record.status === 'failed' || record.status === 'cancelled') && (
            <Popconfirm
              title="Delete this upload task? This cannot be undone."
              onConfirm={() => handleDelete(record.id)}
              okText="OK"
              cancelText="Cancel"
            >
              <Button 
                type="link" 
                icon={<DeleteOutlined />} 
                danger
                size="small"
              >
                Delete
              </Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ]

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnClose
      className="bilibili-manager-modal"
    >
      {/* 自定义Title栏 */}
      <div className="bilibili-manager-header">
        <div className="bilibili-manager-header-icon">
          <UploadOutlined />
        </div>
        <div className="bilibili-manager-header-content">
          <h2 className="bilibili-manager-header-title">Bilibili Management</h2>
          <p className="bilibili-manager-header-subtitle">
            {clipIds.length > 0 
              ? `准备Upload ${clipIds.length} 切片到B站` 
              : '管理您的Bilibili Account和UploadSettings'
            }
          </p>
        </div>
      </div>

      <div className="bilibili-manager-tabs">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {/* UploadTags页 */}
        {clipIds.length > 0 && (
          <TabPane 
            tab={
              <span>
                <UploadOutlined />
                UploadUpload
              </span>
            } 
            key="upload"
          >
            <div className="bilibili-manager-content">
              <Alert
                message="Upload信息"
                description={`准备Upload ${clipIds.length} 切片到B站`}
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Form
              form={uploadForm}
              onFinish={handleUpload}
              layout="vertical"
              initialValues={{
                title: clipTitles.length === 1 ? clipTitles[0] : `${clipTitles[0]} 等${clipIds.length}视频`,
                partition_id: 4 // 默认游戏分区
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Select Account"
                    name="account_id"
                    rules={[{ required: true, message: '请选择Bilibili Account' }]}
                  >
                    <Select 
                      placeholder="选择要使用的Bilibili Account"
                      notFoundContent={
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                          <p>暂无可用账号</p>
                          <Button 
                            type="link" 
                            icon={<PlusOutlined />}
                            onClick={() => setShowAddAccount(true)}
                          >
                            Add账号
                          </Button>
                        </div>
                      }
                    >
                      {accounts.filter(acc => acc.status === 'active').map(account => (
                        <Option key={account.id} value={account.id}>
                          {account.nickname || account.username}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Video Category"
                    name="partition_id"
                    rules={[{ required: true, message: '请选择Video Category' }]}
                  >
                    <Select placeholder="选择Video Category" showSearch>
                      {BILIBILI_PARTITIONS.map(partition => (
                        <Option key={partition.id} value={partition.id}>
                          {partition.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Title"
                name="title"
                rules={[{ required: true, message: '请输入视频Title' }]}
              >
                <Input placeholder="输入视频Title" maxLength={80} showCount />
              </Form.Item>

              <Form.Item
                label="Description"
                name="description"
              >
                <TextArea
                  placeholder="输入视频Description（可选）"
                  rows={3}
                  maxLength={2000}
                  showCount
                />
              </Form.Item>

              <Form.Item
                label="Tags"
                name="tags"
              >
                <Input placeholder="输入Tags，用逗号分隔（可选）" />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button 
                    type="primary" 
                    onClick={() => message.info('Coming soon', 3)}
                    icon={<UploadOutlined />}
                  >
                    StartUpload
                  </Button>
                  <Button onClick={onClose}>
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
              </Form>
            </div>
          </TabPane>
        )}

        {/* Account ManagementTags页 */}
        <TabPane 
          tab={
            <span>
              <UserOutlined />
              Account Management
            </span>
          } 
          key="accounts"
        >
          <div className="bilibili-manager-content">
            <div style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={() => setShowAddAccount(true)}
              >
                Add账号
              </Button>
            </div>

            <Table
              columns={accountColumns}
              dataSource={accounts}
              rowKey="id"
              loading={loading}
              pagination={false}
              size="small"
            />
          </div>
        </TabPane>

        {/* UploadStatusTags页 */}
        <TabPane 
          tab={
            <span>
              <ReloadOutlined />
              UploadStatus
            </span>
          } 
          key="status"
        >
          <div className="bilibili-manager-content">
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#ffffff' }}>Upload Task Status</h3>
              <Button 
                type="primary" 
                icon={<ReloadOutlined />} 
                onClick={fetchUploadRecords}
                loading={recordsLoading}
              >
                Refresh
              </Button>
            </div>

            {/* 统计信息 */}
            {(() => {
              const stats = getStatistics()
              return (
                <Row gutter={16} style={{ marginBottom: 24 }}>
                  <Col span={6}>
                    <Card style={{ background: '#262626', border: '1px solid #404040' }}>
                      <Statistic 
                        title={<span style={{ color: '#ffffff' }}>Total Tasks</span>} 
                        value={stats.total} 
                        valueStyle={{ color: '#ffffff' }} 
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card style={{ background: '#262626', border: '1px solid #404040' }}>
                      <Statistic 
                        title={<span style={{ color: '#ffffff' }}>Success</span>} 
                        value={stats.success} 
                        valueStyle={{ color: '#52c41a' }}
                        prefix={<CheckCircleOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card style={{ background: '#262626', border: '1px solid #404040' }}>
                      <Statistic 
                        title={<span style={{ color: '#ffffff' }}>Failure</span>} 
                        value={stats.failed} 
                        valueStyle={{ color: '#ff4d4f' }}
                        prefix={<ExclamationCircleOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card style={{ background: '#262626', border: '1px solid #404040' }}>
                      <Statistic 
                        title={<span style={{ color: '#ffffff' }}>In Progress</span>} 
                        value={stats.processing + stats.pending} 
                        valueStyle={{ color: '#1890ff' }}
                        prefix={<PlayCircleOutlined />}
                      />
                    </Card>
                  </Col>
                </Row>
              )
            })()}

            {/* Task List */}
            <Table
              columns={uploadStatusColumns}
              dataSource={uploadRecords}
              rowKey="id"
              loading={recordsLoading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
              }}
              scroll={{ x: 1200 }}
              size="small"
            />
          </div>
        </TabPane>
      </Tabs>
      </div>

      {/* Add账号弹窗 */}
      <Modal
        title="AddBilibili Account"
        open={showAddAccount}
        onCancel={() => {
          setShowAddAccount(false)
          cookieForm.resetFields()
        }}
        footer={null}
        width={600}
      >
        <Alert
          message="推荐使用Cookie导入"
          description="Cookie导入是最安全、最稳定的登录方式，不会触发B站风控。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form form={cookieForm} onFinish={handleCookieLogin} layout="vertical">
          <Form.Item
            name="nickname"
            label="账号昵称"
            rules={[{ required: true, message: '请输入账号昵称' }]}
          >
            <Input placeholder="请输入账号昵称，用于识别" />
          </Form.Item>
          
          <Form.Item
            name="cookies"
            label={
              <Space>
                <span>Cookie</span>
                <Tooltip title={cookieGuideContent} placement="topLeft">
                  <Button 
                    type="link" 
                    size="small" 
                    icon={<QuestionCircleOutlined />}
                  >
                    获取指南
                  </Button>
                </Tooltip>
              </Space>
            }
            rules={[
              { required: true, message: 'Enter Cookie' },
              { min: 10, message: 'Cookie长度不能少于10chars' }
            ]}
          >
            <TextArea
              rows={4}
              placeholder="请从浏览器开发者工具中CopyCookie，格式如：SESSDATA=xxx; bili_jct=xxx; DedeUserID=xxx"
            />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Add账号
              </Button>
              <Button onClick={() => setShowAddAccount(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* UploadStatusDetails模态框 */}
      <Modal
        title="Upload Task Details"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
        className="bilibili-manager-modal"
      >
        {selectedRecord && (
          <div>
            <Descriptions 
              column={2} 
              bordered
              labelStyle={{ 
                background: '#1f1f1f', 
                color: '#ffffff',
                fontWeight: 'bold',
                borderRight: '1px solid #303030'
              }}
              contentStyle={{ 
                background: '#262626', 
                color: '#ffffff',
                borderLeft: '1px solid #303030'
              }}
              style={{ 
                background: '#262626',
                border: '1px solid #303030'
              }}
            >
              <Descriptions.Item label="Task ID" span={1}>
                <Text code>{selectedRecord.id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Status" span={1}>
                {getStatusTag(selectedRecord.status)}
              </Descriptions.Item>
              <Descriptions.Item label="Title" span={2}>
                <Text>{selectedRecord.title}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Upload Account" span={1}>
                <Text>{selectedRecord.account_nickname || selectedRecord.account_username}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Category" span={1}>
                <Tag>{getPartitionName(selectedRecord.partition_id)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Project Name" span={1}>
                <Text>{selectedRecord.project_name || '-'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Clip ID" span={1}>
                <Text code>{selectedRecord.clip_id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Progress" span={2}>
                <Progress 
                  percent={selectedRecord.progress} 
                  status={
                    selectedRecord.status === 'failed' ? 'exception' :
                    selectedRecord.status === 'success' || selectedRecord.status === 'completed' ? 'success' :
                    selectedRecord.status === 'processing' ? 'active' : 'normal'
                  }
                />
              </Descriptions.Item>
              <Descriptions.Item label="File Size" span={1}>
                <Text>{formatFileSize(selectedRecord.file_size)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Upload Duration" span={1}>
                <Text>{formatDuration(selectedRecord.upload_duration)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="BV ID" span={1}>
                {selectedRecord.bv_id ? <Text code>{selectedRecord.bv_id}</Text> : <Text>-</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="AV ID" span={1}>
                {selectedRecord.av_id ? <Text code>{selectedRecord.av_id}</Text> : <Text>-</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="CreateTime" span={1}>
                <Text>{new Date(selectedRecord.created_at).toLocaleString()}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="UpdateTime" span={1}>
                <Text>{new Date(selectedRecord.updated_at).toLocaleString()}</Text>
              </Descriptions.Item>
            </Descriptions>

            {selectedRecord.description && (
              <div style={{ marginTop: '16px' }}>
                <h4 style={{ color: '#ffffff' }}>Description</h4>
                <Text>{selectedRecord.description}</Text>
              </div>
            )}

            {selectedRecord.tags && (
              <div style={{ marginTop: '16px' }}>
                <h4 style={{ color: '#ffffff' }}>Tags</h4>
                <Text>{selectedRecord.tags}</Text>
              </div>
            )}

            {selectedRecord.error_message && (
              <div style={{ marginTop: '16px' }}>
                <h4 style={{ color: '#ffffff' }}>Error Info</h4>
                <Alert
                  message="Upload Failed"
                  description={selectedRecord.error_message}
                  type="error"
                  showIcon
                />
              </div>
            )}

            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <Space>
                {selectedRecord.status === 'failed' && (
                  <Popconfirm
                    title="Retry this upload task?"
                    onConfirm={() => {
                      handleRetry(selectedRecord.id)
                      setDetailModalVisible(false)
                    }}
                    okText="OK"
                    cancelText="Cancel"
                  >
                    <Button type="primary" icon={<RedoOutlined />}>
                      Retry
                    </Button>
                  </Popconfirm>
                )}
                <Button onClick={() => setDetailModalVisible(false)}>
                  Close
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </Modal>
  )
}

export default BilibiliManager
