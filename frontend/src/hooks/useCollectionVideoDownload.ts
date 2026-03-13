import { useState } from 'react'
import { message } from 'antd'
import { projectApi } from '../services/api'

export const useCollectionVideoDownload = () => {
  const [isGenerating, setIsGenerating] = useState(false)

  const generateAndDownloadCollectionVideo = async (
    projectId: string, 
    collectionId: string,
    collectionTitle: string
  ) => {
    if (isGenerating) return

    setIsGenerating(true)
    
    try {
      // 直接按用户当前调整的顺序生成Collection视频
      message.info('正在按您的顺序生成Collection视频...')
      
      // 生成Collection视频（按用户调整的顺序）
      await projectApi.generateCollectionVideo(projectId, collectionId)
      
      // 等待1秒让后端完成文件生成，然后Download
      message.success('Collection视频生成成功，正在Download...')
      
      setTimeout(async () => {
        try {
          await projectApi.downloadVideo(projectId, undefined, collectionId)
          message.success('Collection视频Download完成')
        } catch (downloadError) {
          console.error('Download失败:', downloadError)
          message.error('Download失败，请稍后Retry')
        }
      }, 1000)
      
    } catch (error) {
      console.error('生成Collection视频失败:', error)
      message.error('生成Collection视频失败')
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    isGenerating,
    generateAndDownloadCollectionVideo
  }
} 