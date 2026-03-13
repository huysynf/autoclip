import React, { useState, useEffect } from 'react'
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  Tag,
  Progress,
  message,
  Divider,
  Row,
  Col,
  Typography,
  Alert,
  Spin
} from 'antd'
import {
  UploadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import { uploadApi } from '../services/uploadApi'
import { BILIBILI_PARTITIONS } from '../services/uploadApi'

const { Option } = Select
const { TextArea } = Input
const { Text } = Typography

interface UploadModalProps {
  visible: boolean
  onCancel: () => void
  projectId: string
  clipIds: string[]
  clipTitles: string[]
  onSuccess?: () => void
}

interface UploadProgress {
  status: 'pending' | 'processing' | 'success' | 'failed'
  message: string
  progress: number
  bvid?: string
  error?: string
}

const UploadModal: React.FC<UploadModalProps> = ({
  visible,
  onCancel,
  projectId,
  clipIds,
  clipTitles,
  onSuccess
}) => {
  const [form] = Form.useForm()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    status: 'pending',
    message: '准备Upload...',
    progress: 0
  })
  const [uploadRecordId, setUploadRecordId] = useState<string>('')
  const [pollingInterval, setPollingInterval] = useState<ReturnType<typeof setInterval> | null>(null)

  // 表单初始值
  const initialValues = {
    title: clipTitles.length === 1 ? clipTitles[0] : `${clipTitles[0]} 等${clipIds.length}视频`,
    description: '',
    tags: [],
    partition_id: undefined,
    account_id: undefined
  }

  // 获取Bilibili Account列表
  const [accounts, setAccounts] = useState<any[]>([])
  useEffect(() => {
    if (visible) {
      // 调用API获取Bilibili Account列表
      uploadApi.getBilibiliAccounts()
        .then(data => {
          setAccounts(data)
        })
        .catch(error => {
          console.error('获取Bilibili Account列表失败:', error)
          // 如果API调用失败，使用默认账号
          setAccounts([
            { id: '1', name: '主账号', username: 'main_account' }
          ])
        })
    }
  }, [visible])

  // SubmitUpload
  const handleSubmit = async (values: any) => {
    // 显示开发中提示
    message.info('Bilibili upload coming soon!', 3)
    return
    
    // 原有代码已禁用
    if (!values.account_id) {
      message.error('请选择Bilibili Account')
      return
    }

    setUploading(true)
    setUploadProgress({
      status: 'pending',
      message: '正在CreateUpload任务...',
      progress: 10
    })

    try {
      // CreateUpload任务
      const response = await uploadApi.createUploadTask(projectId, {
        clip_ids: clipIds,
        account_id: values.account_id,
        title: values.title,
        description: values.description,
        tags: values.tags,
        partition_id: values.partition_id
      })

      setUploadRecordId(response.record_id)
      setUploadProgress({
        status: 'processing',
        message: `Upload任务已Create，Processing ${response.clip_count} 视频...`,
        progress: 30
      })

      // Start PollingUploadStatus
      startPolling(response.record_id)

      message.success('Upload任务Create成功！')
    } catch (error: any) {
      console.error('CreateUpload任务失败:', error)
      setUploadProgress({
        status: 'failed',
        message: `CreateUpload任务失败: ${error.message || 'Unknown error'}`,
        progress: 0,
        error: error.message
      })
      setUploading(false)
    }
  }

  // Start PollingUploadStatus
  const startPolling = (recordId: string) => {
    const interval = setInterval(async () => {
      try {
        const status = await uploadApi.getUploadRecord(recordId)
        
        if (status.status === 'success') {
          setUploadProgress({
            status: 'success',
            message: 'Upload成功！',
            progress: 100,
            bvid: status.bvid
          })
          setUploading(false)
          clearInterval(interval)
          
          // 延迟Close弹窗，让用户看到成功Status
          setTimeout(() => {
            onSuccess?.()
            onCancel()
          }, 2000)
        } else if (status.status === 'failed') {
          setUploadProgress({
            status: 'failed',
            message: `Upload失败: ${status.error_message || 'Unknown error'}`,
            progress: 0,
            error: status.error_message
          })
          setUploading(false)
          clearInterval(interval)
        } else if (status.status === 'processing') {
          setUploadProgress({
            status: 'processing',
            message: '正在Upload到B站...',
            progress: 60
          })
        } else if (status.status === 'pending') {
          setUploadProgress({
            status: 'processing',
            message: '任务排队中，Please wait...',
            progress: 40
          })
        } else {
          // 其他Status，逐步增加Progress
          setUploadProgress(prev => ({
            ...prev,
            message: `任务Status: ${status.status}`,
            progress: Math.min(prev.progress + 5, 90)
          }))
        }
      } catch (error) {
        console.error('获取UploadStatus失败:', error)
        setUploadProgress({
          status: 'failed',
          message: '获取UploadStatus失败',
          progress: 0,
          error: '网络错误'
        })
        setUploading(false)
        clearInterval(interval)
      }
    }, 2000)

    setPollingInterval(interval)
  }

  // 清理轮询
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, [pollingInterval])

  // 弹窗Close时清理Status
  const handleCancel = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval)
    }
    setUploading(false)
    setUploadProgress({
      status: 'pending',
      message: '准备Upload...',
      progress: 0
    })
    setUploadRecordId('')
    form.resetFields()
    onCancel()
  }

  // CancelUpload任务
  const handleCancelUpload = async () => {
    if (!uploadRecordId) {
      handleCancel()
      return
    }

    try {
      // 调用CancelUploadAPI
      await uploadApi.cancelUploadTask(uploadRecordId)
      
      // 清理Status
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
      setUploading(false)
      setUploadProgress({
        status: 'pending',
        message: '准备Upload...',
        progress: 0
      })
      setUploadRecordId('')
      form.resetFields()
      
      // 显示Cancel成功消息
      message.success('Upload任务已Cancel')
      onCancel()
    } catch (error) {
      console.error('CancelUpload失败:', error)
      message.error('CancelUpload失败，请Retry')
    }
  }

  // 获取Status图标
  const getStatusIcon = () => {
    switch (uploadProgress.status) {
      case 'pending':
        return <ClockCircleOutlined style={{ color: '#1890ff' }} />
      case 'processing':
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
      default:
        return <ClockCircleOutlined style={{ color: '#1890ff' }} />
    }
  }

  // 获取Progress条Status
  const getProgressStatus = () => {
    if (uploadProgress.status === 'failed') return 'exception'
    if (uploadProgress.status === 'success') return 'success'
    return 'active'
  }

  return (
    <Modal
      title={
        <Space>
          <UploadOutlined style={{ color: '#1890ff' }} />
          <span>Upload to Bilibili</span>
          {clipIds.length > 1 && (
            <Tag color="blue">{clipIds.length} 视频</Tag>
          )}
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={700}
      destroyOnClose
      maskClosable={!uploading}
      closable={!uploading}
    >
      {!uploading ? (
        // Upload表单
        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Bilibili Account"
                name="account_id"
                rules={[{ required: true, message: '请选择Bilibili Account' }]}
              >
                <Select placeholder="选择要使用的Bilibili Account">
                  {accounts.map(account => (
                    <Option key={account.id} value={account.id}>
                      {account.nickname || account.username} ({account.username})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Category"
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
            rules={[{ required: true, message: '请输入视频Description' }]}
          >
            <TextArea
              placeholder="输入视频Description"
              rows={4}
              maxLength={250}
              showCount
            />
          </Form.Item>

          <Form.Item
            label="Tags"
            name="tags"
            extra="最多Add10Tags，用逗号分隔"
          >
            <Select
              mode="tags"
              placeholder="输入Tags，按回车Confirm"
              maxTagCount={10}
              maxTagTextLength={20}
            />
          </Form.Item>

          <Divider />

          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={() => message.info('Coming soon', 3)}
                icon={<UploadOutlined />}
              >
                StartUpload
              </Button>
            </Space>
          </div>
        </Form>
      ) : (
        // UploadProgress
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ marginBottom: '24px' }}>
            {getStatusIcon()}
            <Text style={{ marginLeft: '8px', fontSize: '16px' }}>
              {uploadProgress.message}
            </Text>
          </div>

          <Progress
            percent={uploadProgress.progress}
            status={getProgressStatus()}
            strokeWidth={8}
            style={{ marginBottom: '24px' }}
          />

          {uploadProgress.status === 'success' && uploadProgress.bvid && (
            <Alert
              message="Upload成功！"
              description={`BV号: ${uploadProgress.bvid}`}
              type="success"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          )}

          {uploadProgress.status === 'failed' && uploadProgress.error && (
            <Alert
              message="Upload Failed"
              description={uploadProgress.error}
              type="error"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          )}

          {uploadProgress.status === 'processing' && (
            <div style={{ color: '#666', fontSize: '14px' }}>
              <Spin size="small" style={{ marginRight: '8px' }} />
              正在Processing，Please wait...
              {uploadRecordId && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
                  任务ID: {uploadRecordId}
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: '16px' }}>
            {uploadProgress.status === 'failed' && (
              <Button
                type="primary"
                onClick={() => {
                  setUploading(false)
                  setUploadProgress({
                    status: 'pending',
                    message: '准备Upload...',
                    progress: 0
                  })
                }}
                style={{ marginRight: '8px' }}
              >
                重新Upload
              </Button>
            )}
            
            <Button
              onClick={handleCancelUpload}
              disabled={uploadProgress.status === 'success'}
            >
              {uploadProgress.status === 'success' ? 'Close' : 'CancelUpload'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default UploadModal
