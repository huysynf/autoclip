import React, { useState, useEffect, useRef } from 'react'
import { Card, Button, Tooltip, Modal, message } from 'antd'
import { PlayCircleOutlined, DownloadOutlined, ClockCircleOutlined, StarFilled, EditOutlined, UploadOutlined } from '@ant-design/icons'
import ReactPlayer from 'react-player'
import { Clip } from '../store/useProjectStore'
import SubtitleEditor from './SubtitleEditor'
import { subtitleEditorApi } from '../services/subtitleEditorApi'
import { SubtitleSegment, VideoEditOperation } from '../types/subtitle'
import BilibiliManager from './BilibiliManager'
import EditableTitle from './EditableTitle'
import './ClipCard.css'

interface ClipCardProps {
  clip: Clip
  videoUrl?: string
  onDownload: (clipId: string) => void
  projectId?: string
  onClipUpdate?: (clipId: string, updates: Partial<Clip>) => void
}

const ClipCard: React.FC<ClipCardProps> = ({ 
  clip, 
  videoUrl, 
  onDownload,
  projectId,
  onClipUpdate
}) => {
  const [showPlayer, setShowPlayer] = useState(false)
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null)
  const [showSubtitleEditor, setShowSubtitleEditor] = useState(false)
  const [subtitleData, setSubtitleData] = useState<SubtitleSegment[]>([])
  const [showBilibiliManager, setShowBilibiliManager] = useState(false)
  const playerRef = useRef<ReactPlayer>(null)

  // Error occurred while generating thumbnails:
  useEffect(() => {
    if (videoUrl) {
      generateThumbnail()
    }
  }, [videoUrl])

  const generateThumbnail = () => {
    if (!videoUrl) return
    
    const video = document.createElement('video')
    video.crossOrigin = 'anonymous'
    video.currentTime = 1 // Get the 1seconds frame as a thumbnail
    
    video.onloadeddata = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0)
      
      const thumbnail = canvas.toDataURL('image/jpeg', 0.8)
      setVideoThumbnail(thumbnail)
    }
    
    video.src = videoUrl
  }

  const handleDownloadWithTitle = async () => {
    try {
      // Call the APIDownload method directly, it will ProcessingFilename
      await onDownload(clip.id)
    } catch (error) {
      console.error('Download failed:', error)
      message.error('Download failed')
    }
  }

  const handleClosePlayer = () => {
    setShowPlayer(false)
  }

  const handleOpenSubtitleEditor = async () => {
    // ShowOnMediumPrompt
    message.info('Coming soon')
  }

  const handleSubtitleEditorClose = () => {
    setShowSubtitleEditor(false)
    setSubtitleData([])
  }

  const handleSubtitleEditorSave = async (operations: VideoEditOperation[]) => {
    if (!projectId) return
    
    try {
      // Extract the Subtitle segment ID to be deleted
      const deletedSegments = operations
        .filter(op => op.type === 'delete')
        .flatMap(op => op.segmentIds)

      if (deletedSegments.length === 0) {
        console.log('No deletion operations')
        return
      }

      // Execute VideoEdit
      const result = await subtitleEditorApi.editClipBySubtitles(
        projectId,
        clip.id,
        deletedSegments
      )

      if (result.success) {
        console.log('Video edit successful:', result)
      }
    } catch (error) {
      console.error('Video edit failed:', error)
    }
  }

  const handleTitleUpdate = (newTitle: string) => {
    // UpdateLocalStatus
    onClipUpdate?.(clip.id, { title: newTitle })
  }


  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return '00:00'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const calculateDuration = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0
    
    try {
      // Parse TimeFormat "HH:MM:SS,mmm"Or"HH:MM:SS.mmm"
      const parseTime = (timeStr: string): number => {
        const normalized = timeStr.replace(',', '.')
        const parts = normalized.split(':')
        if (parts.length !== 3) return 0
        
        const hours = parseInt(parts[0]) || 0
        const minutes = parseInt(parts[1]) || 0
        const seconds = parseFloat(parts[2]) || 0
        
        return hours * 3600 + minutes * 60 + seconds
      }
      
      const start = parseTime(startTime)
      const end = parseTime(endTime)
      
      return Math.max(0, end - start)
    } catch (error) {
      console.error('Error calculating duration:', error)
      return 0
    }
  }

  const getDuration = () => {
    if (!clip.start_time || !clip.end_time) return '00:00'
    const start = clip.start_time.replace(',', '.')
    const end = clip.end_time.replace(',', '.')
    return `${start.substring(0, 8)} - ${end.substring(0, 8)}`
  }

  const getScoreColor = (score: number) => {
    // Different Colors according to the score interval Settings
    if (score >= 0.9) return '#52c41a' // If projectsCompleted, load clips and collections
    if (score >= 0.8) return '#1890ff' // Blue - good
    if (score >= 0.7) return '#faad14' // Orange - Average
    if (score >= 0.6) return '#ff7a45' // Red-orange - poor
    return '#ff4d4f' // Red - Poor
  }


  // Get the introduction Content to be displayed
  const getDisplayContent = () => {
    // Prioritize display of recommendation reasons (this is the content point generated by YesAI)
    if (clip.recommend_reason && clip.recommend_reason.trim()) {
      return clip.recommend_reason
    }
    
    // If there is no reason to recommend, try getting the Content gist of the non-translated text from contentMedium
    if (clip.content && clip.content.length > 0) {
      // Filter out the Content that may be Yes transcribed text (usually the transcribed text is very long and contains punctuation marks)
      const contentPoints = clip.content.filter(item => {
        const text = item.trim()
        // If the text is longer than 100chars or Contains a lot of punctuation, it may Yes to transcribe the text
        if (text.length > 100) return false
        if (text.split(/[，。！？；：""''（）【】]/).length > 3) return false
        return true
      })
      
      if (contentPoints.length > 0) {
        return contentPoints.join(' ')
      }
    }
    
    // Finally return to outline (outline)
    if (clip.outline && clip.outline.trim()) {
      return clip.outline
    }
    
    return 'No highlights available'
  }

  const textRef = useRef<HTMLDivElement>(null)

  return (
    <>
      <Card
          className="clip-card"
          hoverable
          style={{ 
            height: '380px',
            borderRadius: '16px',
            border: '1px solid #303030',
            background: 'linear-gradient(135deg, #1f1f1f 0%, #2a2a2a 100%)',
            overflow: 'hidden',
            cursor: 'pointer'
          }}
          styles={{
            body: {
              padding: 0,
            },
          }}
          cover={
            <div 
              style={{ 
                height: '200px', 
                background: videoThumbnail 
                  ? `url(${videoThumbnail}) center/cover` 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                cursor: 'pointer',
                overflow: 'hidden'
              }}
              onClick={() => setShowPlayer(true)}
            >
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.3s ease'
                }}
                className="video-overlay"
              >
                <PlayCircleOutlined style={{ fontSize: '40px', color: 'white' }} />
              </div>{/* Recommended score in the upper right corner */}<div 
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: getScoreColor(clip.final_score),
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <StarFilled style={{ fontSize: '12px' }} />{(clip.final_score * 100).toFixed(0)} points</div>{/* Time interval in the lower left corner */}<div 
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <ClockCircleOutlined style={{ fontSize: '12px' }} />
                {getDuration()}
              </div>Extreme<div 
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {formatDuration(calculateDuration(clip.start_time, clip.end_time))}
              </div>
            </div>
          }
        >
          <div style={{ 
            padding: '16px', 
            height: '180px', 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>{/* Content area - fixed High */}<div style={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0 // Allow flex items to shrink
            }}>{/* Title area - fixed High */}<div style={{ 
                height: '44px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'flex-start'
              }}>
                <EditableTitle
                  title={clip.title || clip.generated_title || 'Untitled Clip'}
                  clipId={clip.id}
                  onTitleUpdate={handleTitleUpdate}
                  style={{ 
                    fontSize: '16px',
                    fontWeight: 600,
                    lineHeight: '1.4',
                    color: '#ffffff',
                    width: '100%'
                  }}
                />
              </div>{/* Content Points - Fixed High */}<div style={{ 
                height: '58px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'flex-start'
              }}>
                <Tooltip 
                  title={getDisplayContent()} 
                  placement="top" 
                  overlayStyle={{ maxWidth: '300px' }}
                  mouseEnterDelay={0.5}
                >
                  <div 
                    ref={textRef}
                    style={{ 
                      fontSize: '13px',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: '1.5',
                      color: '#b0b0b0',
                      cursor: 'pointer',
                      wordBreak: 'break-word',
                      textOverflow: 'ellipsis',
                      width: '100%'
                    }}
                  >
                    {getDisplayContent()}
                  </div>
                </Tooltip>
              </div>
            </div>{/* Operation buttons - fixed at the bottom */}<div style={{ 
              display: 'flex', 
              gap: '8px',
              height: '28px',
              alignItems: 'center',
              marginTop: 'auto'
            }}>
              <Button 
                type="text" 
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => setShowPlayer(true)}
                style={{
                  color: '#4facfe',
                  border: '1px solid rgba(79, 172, 254, 0.3)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  height: '28px',
                  padding: '0 12px',
                  background: 'rgba(79, 172, 254, 0.1)'
                }}
              >
                Play
              </Button>
              <Button 
                type="text" 
                size="small"
                icon={<DownloadOutlined />}
                onClick={handleDownloadWithTitle}
                style={{
                  color: '#52c41a',
                  border: '1px solid rgba(82, 196, 26, 0.3)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  height: '28px',
                  padding: '0 12px',
                  background: 'rgba(82, 196, 26, 0.1)'
                }}
              >
                Download
              </Button>
              <Button 
                type="text" 
                size="small"
                icon={<UploadOutlined />}
                onClick={() => message.info('Coming soon', 3)}
                style={{
                  color: '#ff7875',
                  border: '1px solid rgba(255, 120, 117, 0.3)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  height: '28px',
                  padding: '0 12px',
                  background: 'rgba(255, 120, 117, 0.1)'
                }}
              >
                Upload
              </Button>
            </div>
          </div>
        </Card>{/* Video playback modal box */}<Modal
        open={showPlayer}
        onCancel={handleClosePlayer}
        footer={[
          <Button key="download" type="primary" icon={<DownloadOutlined />} onClick={handleDownloadWithTitle}>
            Download Video
          </Button>,
          <Button 
            key="subtitle" 
            icon={<EditOutlined />} 
            onClick={handleOpenSubtitleEditor}
          >
            Edit Subtitles
          </Button>,
          <Button 
            key="upload" 
            type="default" 
            icon={<UploadOutlined />} 
            onClick={() => message.info('Coming soon', 3)}
          >
            Upload to Bilibili
          </Button>
        ]}
        width={800}
        centered
        destroyOnClose
        styles={{
          header: {
            borderBottom: '1px solid #303030',
            background: '#1f1f1f'
          }
        }}
        closeIcon={
          <span style={{ color: '#ffffff', fontSize: '16px' }}>×</span>
        }
        title={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            width: '100%',
            paddingRight: '30px' // Leave Empty room for CloseButton
          }}>
            <EditableTitle
              title={clip.title || clip.generated_title || 'Video Preview'}
              clipId={clip.id}
              onTitleUpdate={(newTitle) => {
                // Title of Updateclip
                console.log('Update clip title:', newTitle)
                // Here you can trigger the Update callback of the parent Component
                if (onClipUpdate) {
                  onClipUpdate(clip.id, { title: newTitle })
                }
              }}
              style={{ 
                color: '#ffffff', 
                fontSize: '16px', 
                fontWeight: '500',
                flex: 1,
                maxWidth: 'calc(100% - 40px)' // Make sure not to overlap with CloseButton
              }}
            />
          </div>
        }
      >
        {videoUrl && (
          <ReactPlayer
            ref={playerRef}
            url={videoUrl}
            width="100%"
            height="400px"
            controls
            playing={showPlayer}
            config={{
              file: {
                attributes: {
                  controlsList: 'nodownload',
                  preload: 'metadata'
                },
                forceHLS: false,
                forceDASH: false
              }
            }}
            onReady={() => {
              console.log('Video ready for seeking')
            }}
            onError={(error) => {
              console.error('ReactPlayer error:', error)
            }}
          />
        )}
      </Modal>

      {/* SubtitleEditer */}
      {showSubtitleEditor && (
        <>
          {console.log('Rendering SubtitleEditor with:', { showSubtitleEditor, subtitleDataLength: subtitleData.length })}
          <SubtitleEditor
            videoUrl={videoUrl || ''}
            subtitles={subtitleData}
            onSave={handleSubtitleEditorSave}
            onClose={handleSubtitleEditorClose}
          />
        </>
      )}

      {/* Bilibili Management pop-up window */}
      <BilibiliManager
        visible={showBilibiliManager}
        onClose={() => setShowBilibiliManager(false)}
        projectId={projectId || ''}
        clipIds={[clip.id]}
        clipTitles={[clip.title || clip.generated_title || 'Video Clips']}
        onUploadSuccess={() => {
          // After UploadSuccess, you can RefreshData or display Prompt
          console.log('UploadSuccess')
        }}
      />
    </>
  )
}

export default ClipCard