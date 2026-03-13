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
      // 直接按User当前调整的顺序生成CollectionVideo
      message.info('正在按您的顺序生成CollectionVideo...')
      
      // 生成CollectionVideo（按User调整的顺序）
      await projectApi.generateCollectionVideo(projectId, collectionId)
      
      // 等待1seconds让后端CompletedFile生成，然后Download
      message.success('CollectionVideo生成Success，正在Download...')
      
      setTimeout(async () => {
        try {
          await projectApi.downloadVideo(projectId, undefined, collectionId)
          message.success('CollectionVideoDownloadCompleted')
        } catch (downloadError) {
          console.error('DownloadFailed:', downloadError)
          message.error('DownloadFailed，请稍后Retry')
        }
      }, 1000)
      
    } catch (error) {
      console.error('生成CollectionVideoFailed:', error)
      message.error('生成CollectionVideoFailed')
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    isGenerating,
    generateAndDownloadCollectionVideo
  }
} 