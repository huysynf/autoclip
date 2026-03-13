import React from 'react'
import { Card, Tag, Space, Typography } from 'antd'
import { BILIBILI_PARTITIONS } from '../services/uploadApi'

const { Title, Text } = Typography

interface UploadToBilibiliProps {
  partitionId?: number
}

const UploadToBilibili: React.FC<UploadToBilibiliProps> = ({ partitionId }) => {
  // GetPartitionName
  const getPartitionName = (id: number) => {
    const partition = BILIBILI_PARTITIONS.find(p => p.id === id)
    return partition ? partition.name : 'Unknown partition'
  }

  return (
    <Card
      title={
        <Space>
          <span>Bilibili partition info</span>
          {partitionId && (
            <Tag color="blue">Current partition: {getPartitionName(partitionId)}</Tag>
          )}
        </Space>
      }
      size="small"
      style={{ marginBottom: '16px' }}
    >
      <div>
        <Text type="secondary">Supported partition types: animation, games, music, knowledge, entertainment, film and television, technology and digital, etc.</Text>
        <div style={{ marginTop: '12px' }}>
          <Text strong>Partition ID:</Text>
          <Text code>{partitionId || 'Not Settings'}</Text>
        </div>
      </div>
    </Card>
  )
}

export default UploadToBilibili

