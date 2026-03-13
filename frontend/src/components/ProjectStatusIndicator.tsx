import React from 'react'
import { Badge, Tooltip } from 'antd'
import { Project } from '../store/useProjectStore'
// import { 
//   getProjectStatusConfig, 
//   normalizeProjectStatus 
// } from '../utils/statusUtils'

interface ProjectStatusIndicatorProps {
  project: Project
  showProgress?: boolean
  size?: 'small' | 'default' | 'large'
}

const ProjectStatusIndicator: React.FC<ProjectStatusIndicatorProps> = ({
  project,
  size = 'default'
}) => {
  // Temporarily Use simple StatusProcessing
  const normalizedStatus = project.status === 'error' ? 'failed' : project.status

  const getStepName = () => {
    if (normalizedStatus === 'processing' && project.current_step) {
      const stepNames = {
        1: 'ContentOutlineAnalysis',
        2: 'Time axis generation',
        3: 'clipsScore',
        4: 'Title generation',
        5: 'Theme clustering',
        6: 'Video generation'
      }
      return stepNames[project.current_step as keyof typeof stepNames] || 'Processing'
    }
    return String(normalizedStatus)
  }

  if (size === 'small') {
    return (
      <Tooltip title={getStepName()}>
        <Badge status={(normalizedStatus === 'failed' ? 'error' : 'processing') as any} text={normalizedStatus} />
      </Tooltip>
    )
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      padding: '4px 8px',
      borderRadius: '4px',
      backgroundColor: `${'#1677ff'}15`,
      border: `1px solid ${'#1677ff'}30`,
      color: '#1677ff',
      fontSize: '12px',
      fontWeight: 500,
      minHeight: '24px'
    }}>
      <span style={{ marginRight: '4px', display: 'flex', alignItems: 'center' }}>
        {normalizedStatus}
      </span>
      <span>{normalizedStatus}</span>
    </div>
  )
}

export default ProjectStatusIndicator