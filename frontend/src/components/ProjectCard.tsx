import React, { useState, useEffect } from 'react'
import { Card, Tag, Button, Space, Typography, Progress, Popconfirm, message, Tooltip } from 'antd'
import { PlayCircleOutlined, DeleteOutlined, EyeOutlined, DownloadOutlined, ReloadOutlined, LoadingOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { Project } from '../store/useProjectStore'
import { projectApi } from '../services/api'
import { UnifiedStatusBar } from './UnifiedStatusBar'
// import { 
//   getProjectStatusConfig, 
//   calculateProjectProgress, 
//   normalizeProjectStatus,
//   getProgressStatus 
// } from '../utils/statusUtils'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.extend(timezone)
dayjs.extend(utc)
dayjs.locale('zh-cn')

// AddCSS animation styles
const pulseAnimation = `
  @keyframes pulse {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.1);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
`

// Inject styles into Page
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = pulseAnimation
  document.head.appendChild(style)
}

const { Text, Title } = Typography
const { Meta } = Card

interface ProjectCardProps {
  project: Project
  onDelete: (id: string) => void
  onRetry?: (id: string) => void
  onClick?: () => void
}

interface LogEntry {
  timestamp: string
  module: string
  level: string
  message: string
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete, onRetry, onClick }) => {
  const navigate = useNavigate()
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null)
  const [thumbnailLoading, setThumbnailLoading] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [currentLogIndex, setCurrentLogIndex] = useState(0)

  // Get CategoryInfo
  const getCategoryInfo = (category?: string) => {
    const categoryMap: Record<string, { name: string; icon: string; color: string }> = {
      'default': { name: 'Default', icon: '🎬', color: '#4facfe' },
      'knowledge': { name: 'Knowledge popularization', icon: '📚', color: '#52c41a' },
      'business': { name: 'Business and Finance', icon: '💼', color: '#faad14' },
      'opinion': { name: 'Opinion comments', icon: '💭', color: '#722ed1' },
      'experience': { name: 'Experience sharing', icon: '🌟', color: '#13c2c2' },
      'speech': { name: 'Speech talk show', icon: '🎤', color: '#eb2f96' },
      'content_review': { name: 'ContentExplanation', icon: '🎭', color: '#f5222d' },
      'entertainment': { name: 'Entertainment Content', icon: '🎪', color: '#fa8c16' }
    }
    return categoryMap[category || 'default'] || categoryMap['default']
  }

  // ThumbnailCacheManage
  const thumbnailCacheKey = `thumbnail_${project.id}`
  
  // Generate projectsVideo thumbnails (with Cache)
  useEffect(() => {
    const generateThumbnail = async () => {
      // Prioritize thumbnails provided by Use backend
      if (project.thumbnail) {
        setVideoThumbnail(project.thumbnail)
        console.log(`Use the thumbnail provided by the backend: ${project.id}`)
        return
      }
      
      if (!project.video_path) {
        console.log('Projects has no Video Path:', project.id)
        return
      }
      
      // Check Cache
      const cachedThumbnail = localStorage.getItem(thumbnailCacheKey)
      if (cachedThumbnail) {
        setVideoThumbnail(cachedThumbnail)
        return
      }
      
      setThumbnailLoading(true)
      
      try {
        const video = document.createElement('video')
        video.crossOrigin = 'anonymous'
        video.muted = true
        video.preload = 'metadata'
        
        // Try multiple possible VideoFile paths
        const possiblePaths = [
          'input/input.mp4',
          'input.mp4',
          project.video_path,
          `${project.video_path}/input.mp4`
        ].filter(Boolean)
        
        let videoLoaded = false
        
        for (const path of possiblePaths) {
          if (videoLoaded) break
          
          try {
            const videoUrl = projectApi.getProjectFileUrl(project.id, path)
            console.log('Try Loading Video:', videoUrl)
            
            await new Promise((resolve, reject) => {
              const timeoutId = setTimeout(() => {
                reject(new Error('Video loading timeout'))
              }, 10000) // 10secondsTimeout
              
              video.onloadedmetadata = () => {
                clearTimeout(timeoutId)
                console.log('Video metadata loading Success:', videoUrl)
                video.currentTime = Math.min(5, video.duration / 4) // Get the frame at Video1/4 or 5 seconds
              }
              
              video.onseeked = () => {
                clearTimeout(timeoutId)
                try {
                  const canvas = document.createElement('canvas')
                  const ctx = canvas.getContext('2d')
                  if (!ctx) {
                    reject(new Error('None method Get canvas context'))
                    return
                  }
                  
                  // SettingsAppropriate thumbnail size
                  const maxWidth = 320
                  const maxHeight = 180
                  const aspectRatio = video.videoWidth / video.videoHeight
                  
                  let width = maxWidth
                  let height = maxHeight
                  
                  if (aspectRatio > maxWidth / maxHeight) {
                    height = maxWidth / aspectRatio
                  } else {
                    width = maxHeight * aspectRatio
                  }
                  
                  canvas.width = width
                  canvas.height = height
                  ctx.drawImage(video, 0, 0, width, height)
                  
                  const thumbnail = canvas.toDataURL('image/jpeg', 0.7)
                  setVideoThumbnail(thumbnail)
                  
                  // Cache thumbnail
                  try {
                    localStorage.setItem(thumbnailCacheKey, thumbnail)
                  } catch (e) {
                    // If there is insufficient localStorageEmpty space, clear the old Cache
                    const keys = Object.keys(localStorage).filter(key => key.startsWith('thumbnail_'))
                    if (keys.length > 50) { // Operation buttons - fixed at the bottom
                      keys.slice(0, 10).forEach(key => localStorage.removeItem(key))
                      localStorage.setItem(thumbnailCacheKey, thumbnail)
                    }
                  }
                  
                  videoLoaded = true
                  resolve(thumbnail)
                } catch (error) {
                  reject(error)
                }
              }
              
              video.onerror = (error) => {
                clearTimeout(timeoutId)
                console.error('VideoLoad Failed:', videoUrl, error)
                reject(error)
              }
              
              video.src = videoUrl
            })
            
            break // Orange - Average
          } catch (error) {
            console.warn(`Path ${path} Load Failed:`, error)
            continue // Try next Path
          }
        }
        
        if (!videoLoaded) {
          console.error('Main Account')
        }
      } catch (error) {
        console.error('Error occurred while generating thumbnails:', error)
      } finally {
        setThumbnailLoading(false)
      }
    }
    
    generateThumbnail()
  }, [project.id, project.video_path, thumbnailCacheKey])

  // Get projectsLog (only when Processing)
  useEffect(() => {
    if (project.status !== 'processing') {
      setLogs([])
      return
    }

    const fetchLogs = async () => {
      try {
        const response = await projectApi.getProjectLogs(project.id, 20)
        setLogs(response.logs.filter(log => 
          log.message.includes('Step') || 
          log.message.includes('Start') || 
          log.message.includes('Completed') ||
          log.message.includes('Processing') ||
          log.level === 'ERROR'
        ))
      } catch (error) {
        console.error('Get LogFailed:', error)
      }
    }

    // Fetch immediately
    fetchLogs()
    
    // Log every 3 secondsUpdate
    const logInterval = setInterval(fetchLogs, 3000)
    
    return () => clearInterval(logInterval)
  }, [project.id, project.status])

  // Log carousel
  useEffect(() => {
    if (logs.length <= 1) return
    
    const interval = setInterval(() => {
      setCurrentLogIndex(prev => (prev + 1) % logs.length)
    }, 2000) // Switch a Log every 2 seconds
    
    return () => clearInterval(interval)
  }, [logs.length])

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'completed': return 'success'
      case 'processing': return 'processing'
      case 'error': return 'error'
      /* case 'uploading': */ return 'default'
      default: return 'default'
    }
  }

  // Check YesNoYesPendingStatus - pendingStatus shows as ImportMedium
  const isImporting = project.status === 'pending'
  
  // Status Normalized Processing - pendingStatus is displayed as ImportMedium
  const normalizedStatus = project.status === 'error' ? 'failed' : 
                          isImporting ? 'importing' : project.status
  
  // DebugInfo
  console.log('ProjectCard Debug:', {
    projectId: project.id,
    projectStatus: project.status,
    isImporting,
    normalizedStatus,
    processingConfig: project.processing_config
  })
  
  // Calculate Progress percentage
  const progressPercent = project.status === 'completed' ? 100 : 
                         project.status === 'failed' ? 0 :
                         isImporting ? 20 : // ImportMedium shows 20%Progress
                         project.current_step && project.total_steps ? 
                         Math.round((project.current_step / project.total_steps) * 100) : 
                         project.status === 'processing' ? 10 : 0

  const handleRetry = async () => {
    if (isRetrying) return
    
    setIsRetrying(true)
    try {
      // For projects with PENDINGStatus, Use startProcessing; for other Statuses, Use retryProcessing
      if (project.status === 'pending') {
        await projectApi.startProcessing(project.id)
      } else {
        await projectApi.retryProcessing(project.id)
      }
      // Remove duplicate toast displays and let the parent Component unify Processing
      if (onRetry) {
        onRetry(project.id)
      }
    } catch (error) {
      console.error('Retry failed:', error)
      message.error('RetryFailed, please try again later')
    } finally {
      setIsRetrying(false)
    }
  }

  return (
    <Card
      hoverable
      className="project-card"
      style={{ 
        width: 200, 
        height: 240,
        borderRadius: '4px',
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #1e1e1e 0%, #2a2a2a 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        marginBottom: '0px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.4)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}
      bodyStyle={{
        padding: '12px',
        background: 'transparent',
        height: 'calc(100% - 120px)',
        display: 'flex',
        flexDirection: 'column'
      }}
      cover={
        <div 
          style={{ 
            height: 120, 
            position: 'relative',
            background: videoThumbnail 
              ? `url(${videoThumbnail}) center/cover` 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
          onClick={() => {
            // Projects of ImportMediumStatus cannot be clicked to enter the Details page
            if (project.status === 'pending') {
              message.warning('Projects are ImportMedium, please try again laterViewDetails')
              return
            }
            
            if (onClick) {
              onClick()
            } else {
              navigate(`/project/${project.id}`)
            }
          }}
        >
          {/* Thumbnail loading Status */}
          {thumbnailLoading && (
            <div style={{ 
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.8)'
            }}>
              <LoadingOutlined 
                style={{ 
                  fontSize: '24px', 
                  marginBottom: '4px'
                }} 
              />
              <div style={{ 
                fontSize: '12px',
                fontWeight: 500
              }}>Generate ThumbnailMedium...</div>
            </div>
          )}
          
          {/* Score: {(currentClip.final_score * 100).toFixed(0)} */}
          {!videoThumbnail && !thumbnailLoading && (
            <div style={{ textAlign: 'center' }}>
              <PlayCircleOutlined 
                style={{ 
                  fontSize: '40px', 
                  color: 'rgba(255, 255, 255, 0.9)',
                  marginBottom: '4px',
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))'
                }} 
              />
              <div style={{ 
                color: 'rgba(255, 255, 255, 0.8)', 
                fontSize: '12px',
                fontWeight: 500
              }}>Click Preview</div>
            </div>
          )}
          
          {/* CategoryTags - upper left corner */}
          {project.video_category && project.video_category !== 'default' && (
            <div style={{
              position: 'absolute',
              top: '8px',
              left: '8px'
            }}>
              <Tag
                style={{
                  background: `${getCategoryInfo(project.video_category).color}15`,
                  border: `1px solid ${getCategoryInfo(project.video_category).color}40`,
                  borderRadius: '3px',
                  color: getCategoryInfo(project.video_category).color,
                  fontSize: '10px',
                  fontWeight: 500,
                  padding: '2px 6px',
                  lineHeight: '14px',
                  height: '18px',
                  margin: 0
                }}
              >
                <span style={{ marginRight: '2px' }}>{getCategoryInfo(project.video_category).icon}</span>
                {getCategoryInfo(project.video_category).name}
              </Tag>
            </div>
          )}
          
          {/* Remove Status indicator in upper right corner - poor readability and redundant */}
          
          {/* UpdateTime and Operation buttons - moved to bottom of Thumbnail */}
          <div style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(10px)',
            borderRadius: '0',
            padding: '6px 8px',
            height: '28px'
          }}>
            <Text style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
              {dayjs(project.created_at).tz('Asia/Shanghai').fromNow()}
            </Text>
            
            {/* Operation buttons */}
            <div 
              className="card-action-buttons"
              style={{
                display: 'flex',
                gap: '4px',
                opacity: 0,
                transition: 'opacity 0.3s ease'
              }}
            >
              {/* FailedStatus: Only Retry and DeleteButton are displayed */}
              {normalizedStatus === 'failed' ? (
                <>
                  <Button
                    type="text"
                    icon={<ReloadOutlined />}
                    loading={isRetrying}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRetry()
                    }}
                    style={{
                      height: '20px',
                      width: '20px',
                      borderRadius: '3px',
                      color: '#52c41a',
                      border: '1px solid rgba(82, 196, 26, 0.5)',
                      background: 'rgba(82, 196, 26, 0.1)',
                      padding: 0,
                      minWidth: '20px',
                      fontSize: '10px'
                    }}
                  />
                  
                  <Popconfirm
                    title="OK Delete these projects?"
                    description="None method recovery after Delete"
                    onConfirm={(e) => {
                      e?.stopPropagation()
                      onDelete(project.id)
                    }}
                    onCancel={(e) => {
                      e?.stopPropagation()
                    }}
                    okText="OK"
                    cancelText="Cancel"
                  >
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                      style={{
                        height: '20px',
                        width: '20px',
                        borderRadius: '3px',
                        color: '#ff6b6b',
                        border: '1px solid rgba(255, 107, 107, 0.5)',
                        background: 'rgba(255, 107, 107, 0.1)',
                        padding: 0,
                        minWidth: '20px',
                        fontSize: '10px'
                      }}
                    />
                  </Popconfirm>
                </>
              ) : (
                /* Other Status: Show Download, Retry and DeleteButton */
                <>
                  <Space size={4}>
                    {/* RetryButton - displayed in Processing and WaitingStatus, allowing the user to re-submitTask */}
                    {(normalizedStatus === 'processing' || normalizedStatus === 'importing' || project.status === 'pending') && (
                      <Tooltip title={project.status === 'pending' ? "Start Processing" : "SubmitTask again"}>
                        <Button
                          type="text"
                          icon={<ReloadOutlined />}
                          loading={isRetrying}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRetry()
                          }}
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '3px',
                            color: '#1890ff',
                            border: '1px solid rgba(24, 144, 255, 0.5)',
                            background: 'rgba(24, 144, 255, 0.1)',
                            padding: 0,
                            minWidth: '20px',
                            fontSize: '10px'
                          }}
                        />
                      </Tooltip>
                    )}
                    
                    {/* DownloadButton - only shown in CompletedStatus */}
                    {normalizedStatus === 'completed' && (
                      <Button
                        type="text"
                        icon={<DownloadOutlined />}
                        onClick={(e) => {
                          e.stopPropagation()
                          // Implement Download function
                          message.info('Download functionOn postMedium...')
                        }}
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '3px',
                          color: 'rgba(255, 255, 255, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          background: 'rgba(255, 255, 255, 0.1)',
                          padding: 0,
                          minWidth: '20px',
                          fontSize: '10px'
                        }}
                      />
                    )}
                    
                    {/* DeleteButton */}
                    <Popconfirm
                      title="OK Delete these projects?"
                      description="None method recovery after Delete"
                      onConfirm={(e) => {
                        e?.stopPropagation()
                        onDelete(project.id)
                      }}
                      onCancel={(e) => {
                        e?.stopPropagation()
                      }}
                      okText="OK"
                      cancelText="Cancel"
                    >
                      <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                          e.stopPropagation()
                        }}
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '3px',
                          color: 'rgba(255, 255, 255, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          background: 'rgba(255, 255, 255, 0.1)',
                          padding: 0,
                          minWidth: '20px',
                          fontSize: '10px'
                        }}
                      />
                    </Popconfirm>
                  </Space>
                 </>
               )}
            </div>
          </div>
        </div>
      }
    >
      <div style={{ padding: '0', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>{/* projectsName - always on top */}<div style={{ marginBottom: '12px', position: 'relative' }}>
            <Tooltip title={project.name} placement="top">
              <Text 
                strong 
                style={{ 
                  fontSize: '13px', 
                  color: '#ffffff',
                  fontWeight: 600,
                  lineHeight: '16px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  cursor: 'help',
                  height: '32px'
                }}
              >
                {project.name}
              </Text>
            </Tooltip>
          </div>
          
          {/* Status and StatisticsInfo */}
          {(normalizedStatus === 'importing' || normalizedStatus === 'processing' || normalizedStatus === 'failed') ? (
            // ImportMedium, Processing, Failed: Only the Status block is displayed, and it is displayed in Medium
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              <div style={{ width: '100%', maxWidth: '200px' }}>
                <UnifiedStatusBar
                  projectId={project.id}
                  status={normalizedStatus}
                  downloadProgress={progressPercent}
                  onStatusChange={(newStatus) => {
                    console.log(`Projects ${project.id} Status changes: ${normalizedStatus} -> ${newStatus}`)
                  }}
                  onDownloadProgressUpdate={(progress) => {
                    console.log(`projects ${project.id} DownloadProgressUpdate: ${progress}%`)
                  }}
                />
              </div>
            </div>
          ) : (
            // Other Status: Display Status block + Clip number + Collection number
            <div style={{ 
              display: 'flex', 
              gap: '6px',
              marginBottom: '12px'
            }}>{/* Status display - occupies MoreEmpty space */}<div style={{ flex: 2 }}>
                <UnifiedStatusBar
                  projectId={project.id}
                  status={normalizedStatus}
                  downloadProgress={progressPercent}
                  onStatusChange={(newStatus) => {
                    console.log(`Projects ${project.id} Status changes: ${normalizedStatus} -> ${newStatus}`)
                  }}
                  onDownloadProgressUpdate={(progress) => {
                    console.log(`projects ${project.id} DownloadProgressUpdate: ${progress}%`)
                  }}
                />
              </div>{/* ClipCount - reduce width */}<div style={{
                background: 'rgba(102, 126, 234, 0.15)',
                border: '1px solid rgba(102, 126, 234, 0.3)',
                borderRadius: '3px',
                padding: '3px 4px',
                textAlign: 'center',
                minWidth: '50px',
                flex: 0.8
              }}>
                <div style={{ color: '#667eea', fontSize: '11px', fontWeight: 600, lineHeight: '12px' }}>
                  {project.total_clips || 0}
                </div>
                <div style={{ color: '#999999', fontSize: '8px', lineHeight: '9px' }}>
                  Clip
                </div>
              </div>{/* CollectionCount - reduce width */}<div style={{
                background: 'rgba(118, 75, 162, 0.15)',
                border: '1px solid rgba(118, 75, 162, 0.3)',
                borderRadius: '3px',
                padding: '3px 4px',
                textAlign: 'center',
                minWidth: '50px',
                flex: 0.8
              }}>
                <div style={{ color: '#764ba2', fontSize: '11px', fontWeight: 600, lineHeight: '12px' }}>
                  {project.total_collections || 0}
                </div>
                <div style={{ color: '#999999', fontSize: '8px', lineHeight: '9px' }}>
                  Collection
                </div>
              </div>
            </div>
          )}

          {/* 2. Click the "Login" Button in the upper right corner */}

        </div>
      </div>
    </Card>
  )
}

export default ProjectCard