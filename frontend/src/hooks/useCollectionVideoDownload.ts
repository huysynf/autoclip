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
      // Generate CollectionVideo directly in the order adjusted by UserCurrent
      message.info('Generating CollectionVideo in your order...')
      
      // Generate CollectionVideo (in order adjusted by User)
      await projectApi.generateCollectionVideo(projectId, collectionId)
      
      // Wait 1 second for the backend CompletedFile to be generated, and then Download
      message.success('CollectionVideo generates Success, Downloading...')
      
      setTimeout(async () => {
        try {
          await projectApi.downloadVideo(projectId, undefined, collectionId)
          message.success('CollectionVideoDownloadCompleted')
        } catch (downloadError) {
          console.error('DownloadFailed:', downloadError)
          message.error('DownloadFailed, please Retry later')
        }
      }, 1000)
      
    } catch (error) {
      console.error('Generate CollectionVideoFailed:', error)
      message.error('GenerateCollectionVideoFailed')
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    isGenerating,
    generateAndDownloadCollectionVideo
  }
} 