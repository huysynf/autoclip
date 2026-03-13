import React, { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Progress,
  Modal,
  Form,
  Select,
  DatePicker,
  Input,
  message,
  Tooltip,
  Popconfirm,
  Typography,
  Row,
  Col,
  Statistic,
  Divider
} from 'antd'
import {
  ReloadOutlined,
  EyeOutlined,
  StopOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons'
import { uploadApi, BILIBILI_PARTITIONS } from '../services/uploadApi'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const { Option } = Select
const { Text } = Typography

interface Upload tasks {
  id: string
  project_id: string
  account_id: string
  clip_id: string
  title: string
  description: string
  tags: string
  partition_id: number
  bvid?: string
  status: string
  error_message?: string
  created_at: string
  updated_at: string
  progress?: number
  current_step?: string
}

interface Upload tasksManagerProps {
  projectId?: string
}

const Upload tasksManager: React.FC<Upload tasksManagerProps> = ({ projectId }) => {
  const [tasks, set taskss] = useState<Upload tasks[]>([])
  const [loading, setLoading] = useState(false)
  const [filtered taskss, setFiltered taskss] = useState<Upload tasks[]>([])
  const [selected tasks, setSelected tasks] = useState<Upload tasks | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    accountId: '',
    dateRange: null as any,
    keyword: ''
  })

  // Get Upload tasks List
  const fetch taskss = async () => {
    try {
      setLoading(true)
      const records = await uploadApi.getUploadRecords(projectId)
      set taskss(records)
      setFiltered taskss(records)
    } catch (error: any) {
      message.error('Get Upload tasksFailed: ' + (error.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  // RetryFailed的 tasks
  const retry tasks = async (taskId: string) => {
    message.info('Bilibili upload coming soon!', 3);
    return;
    
    // 原有代码Disabled
    try {
      // 这里需要调用RetryAPI
      message.success(' tasksRetry已启动')
      fetch taskss() // RefreshList
    } catch (error: any) {
      message.error('Retry tasksFailed: ' + (error.message || 'Unknown error'))
    }
  }

  // CancelIn Progress的 tasks
  const cancel tasks = async (taskId: string) => {
    message.info('Bilibili upload coming soon!', 3);
    return;
    
    // 原有代码Disabled
    try {
      // 这里需要调用CancelAPI
      message.success(' tasks cancelled')
      fetch taskss() // RefreshList
    } catch (error: any) {
      message.error('Cancel tasksFailed: ' + (error.message || 'Unknown error'))
    }
  }

  // View tasksDetails
  const show tasksDetail = (task: Upload tasks) => {
    setSelected tasks(task)
    setDetailModalVisible(true)
  }

  // 应用Filter条件
  const applyFilters = () => {
    let filtered = tasks

    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status)
    }

    if (filters.accountId) {
      filtered = filtered.filter(task => task.account_id === filters.accountId)
    }

    if (filters.keyword) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        task.description.toLowerCase().includes(filters.keyword.toLowerCase())
      )
    }

    if (filters.dateRange && filters.dateRange.length === 2) {
      const startDate = filters.dateRange[0].startOf('day')
      const endDate = filters.dateRange[1].endOf('day')
      filtered = filtered.filter(task => {
        const taskDate = dayjs(task.created_at)
        return taskDate.isAfter(startDate) && taskDate.isBefore(endDate)
      })
    }

    setFiltered taskss(filtered)
  }

  // ResetFilter条件
  const resetFilters = () => {
    setFilters({
      status: '',
      accountId: '',
      dateRange: null,
      keyword: ''
    })
    setFiltered taskss(tasks)
  }

  // Get status tagsColor
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'orange'
      case 'processing':
        return 'blue'
      case 'success':
        return 'green'
      case 'failed':
        return 'red'
      default:
        return 'default'
    }
  }

  // Get StatusIcon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockCircleOutlined />
      case 'processing':
        return <ExclamationCircleOutlined />
      case 'success':
        return <CheckCircleOutlined />
      case 'failed':
        return <CloseCircleOutlined />
      default:
        return null
    }
  }

  // Get Status文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending'
      case 'processing':
        return 'Processing'
      case 'success':
        return 'Success'
      case 'failed':
        return 'Failed'
      default:
        return status
    }
  }

  // 计算StatisticsData
  const getStatistics = () => {
    const total = tasks.length
    const pending = tasks.filter(t => t.status === 'pending').length
    const processing = tasks.filter(t => t.status === 'processing').length
    const success = tasks.filter(t => t.status === 'success').length
    const failed = tasks.filter(t => t.status === 'failed').length

    return { total, pending, processing, success, failed }
  }

  useEffect(() => {
    fetch taskss()
  }, [projectId])

  useEffect(() => {
    applyFilters()
  }, [filters, tasks])

  const columns = [
    {
      title: ' tasksInfo',
      key: 'task_info',
      render: (record: Upload tasks) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.title}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            projectsID: {record.project_id.slice(0, 8)}...
          </div>
        </div>
      )
    },
    {
      title: 'ClipCount',
      key: 'clip_count',
      render: (record: Upload tasks) => {
        const clipCount = record.clip_id.split(',').filter(id => id.trim()).length
        return <Tag>{clipCount} Clip</Tag>
      }
    },
    {
      title: 'Category',
      key: 'partition',
      render: (record: Upload tasks) => {
        const partition = BILIBILI_PARTITIONS.find(p => p.id === record.partition_id)
        return partition ? partition.name : `分区${record.partition_id}`
      }
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: Upload tasks) => (
        <Tag color={getStatusColor(record.status)} icon={getStatusIcon(record.status)}>
          {getStatusText(record.status)}
        </Tag>
      )
    },
    {
      title: 'Progress',
      key: 'progress',
      render: (record: Upload tasks) => {
        if (record.status === 'processing' && record.progress !== undefined) {
          return <Progress percent={record.progress} size="small" />
        } else if (record.status === 'success') {
          return <Progress percent={100} size="small" status="success" />
        } else if (record.status === 'failed') {
          return <Progress percent={0} size="small" status="exception" />
        }
        return <Progress percent={0} size="small" />
      }
    },
    {
      title: 'CreateTime',
      key: 'created_at',
      render: (record: Upload tasks) => dayjs(record.created_at).format('YYYY-MM-DD HH:mm')
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Upload tasks) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => show tasksDetail(record)}
          >
            Details
          </Button>
          
          {record.status === 'failed' && (
            <Button
              type="link"
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => retry tasks(record.id)}
            >
              Retry
            </Button>
          )}
          
          {record.status === 'processing' && (
            <Popconfirm
              title="OK要Cancel这 tasks?"
              onConfirm={() => cancel tasks(record.id)}
              okText="OK"
              cancelText="Cancel"
            >
              <Button
                type="link"
                size="small"
                danger
                icon={<StopOutlined />}
              >
                Cancel
              </Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ]

  const stats = getStatistics()

  return (
    <div style={{ padding: '24px' }}>
      {/* Statistics卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={4}>
          <Card>
            <Statistic title="总 tasks数" value={stats.total} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="Pending" value={stats.pending} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="Processing" value={stats.processing} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="Success" value={stats.success} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="Failed" value={stats.failed} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic 
              title="Success率" 
              value={stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0}
              suffix="%" 
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter栏 */}
      <Card style={{ marginBottom: '16px' }}>
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Form.Item label="Status" style={{ marginBottom: 0 }}>
              <Select
                placeholder="SelectStatus"
                value={filters.status}
                onChange={(value) => setFilters({ ...filters, status: value })}
                allowClear
              >
                <Option value="pending">Pending</Option>
                <Option value="processing">Processing</Option>
                <Option value="success">Success</Option>
                <Option value="failed">Failure</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Time范围" style={{ marginBottom: 0 }}>
              <RangePicker
                value={filters.dateRange}
                onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
                placeholder={['StartDate', 'EndDate']}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Keywords" style={{ marginBottom: 0 }}>
              <Input
                placeholder="SearchTitle或Description"
                value={filters.keyword}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Space>
              <Button type="primary" onClick={applyFilters}>
                Filter
              </Button>
              <Button onClick={resetFilters}>
                Reset
              </Button>
              <Button icon={<ReloadOutlined />} onClick={fetch taskss}>
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/*  tasks List */}
      <Card title={`Upload tasks List (${filtered taskss.length})`}>
        <Table
          columns={columns}
          dataSource={filtered taskss}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
          }}
        />
      </Card>

      {/*  tasksDetails弹窗 */}
      <Modal
        title=" tasksDetails"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {selected tasks && (
          <div>
            <Row gutter={16}>
              <Col span={12}>
                <div><strong> tasksID:</strong> {selected tasks.id}</div>
                <div><strong>projectsID:</strong> {selected tasks.project_id}</div>
                <div><strong>Title:</strong> {selected tasks.title}</div>
                <div><strong>Description:</strong> {selected tasks.description}</div>
              </Col>
              <Col span={12}>
                <div><strong>Status:</strong> 
                  <Tag color={getStatusColor(selected tasks.status)} style={{ marginLeft: 8 }}>
                    {getStatusText(selected tasks.status)}
                  </Tag>
                </div>
                <div><strong>分区:</strong> 
                  {(() => {
                    const partition = BILIBILI_PARTITIONS.find(p => p.id === selected tasks.partition_id)
                    return partition ? partition.name : `分区${selected tasks.partition_id}`
                  })()}
                </div>
                <div><strong>CreateTime:</strong> {dayjs(selected tasks.created_at).format('YYYY-MM-DD HH:mm:ss')}</div>
                <div><strong>UpdateTime:</strong> {dayjs(selected tasks.updated_at).format('YYYY-MM-DD HH:mm:ss')}</div>
              </Col>
            </Row>
            
            <Divider />
            
            <div>
              <strong>ClipInfo:</strong>
              <div style={{ marginTop: 8 }}>
                {selected tasks.clip_id.split(',').filter(id => id.trim()).map((clipId, index) => (
                  <Tag key={index} style={{ marginBottom: 4 }}>{clipId.trim()}</Tag>
                ))}
              </div>
            </div>
            
            {selected tasks.tags && (
              <>
                <Divider />
                <div>
                  <strong>Tags:</strong>
                  <div style={{ marginTop: 8 }}>
                    {JSON.parse(selected tasks.tags).map((tag: string, index: number) => (
                      <Tag key={index} color="blue">{tag}</Tag>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            {selected tasks.bvid && (
              <>
                <Divider />
                <div>
                  <strong>BV Number:</strong> {selected tasks.bvid}
                </div>
              </>
            )}
            
            {selected tasks.error_message && (
              <>
                <Divider />
                <div>
                  <strong>ErrorInfo:</strong>
                  <div style={{ marginTop: 8, color: '#ff4d4f', backgroundColor: '#fff2f0', padding: 8, borderRadius: 4 }}>
                    {selected tasks.error_message}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Upload tasksManager



