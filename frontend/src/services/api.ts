import axios from 'axios'
import { Project, Clip, Collection } from '../store/useProjectStore'

// 格式化Time函数（暂时未使用，保留备用）

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1', // FastAPI backend server address
  timeout: 300000, // increased to 5-minute timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('API Error:', error)
    
    // 特殊处理429错误（系统繁忙）
    if (error.response?.status === 429) {
      const message = error.response?.data?.detail || 'System is busy, please try again later'
      error.userMessage = message
    }
    // 处理超时错误
    else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      error.userMessage = 'Request timed out; project may still be processing in background. Check status later.'
    }
    // 处理网络错误
    else if (error.code === 'NETWORK_ERROR' || !error.response) {
      error.userMessage = 'Network connection failed. Please check your network.'
    }
    // 处理Server error
    else if (error.response?.status >= 500) {
      error.userMessage = 'Internal server error. Please try again later.'
    }
    
    return Promise.reject(error)
  }
)

export interface UploadFilesRequest {
  video_file: File
  srt_file?: File
  project_name: string
  video_category?: string
}

export interface VideoCategory {
  value: string
  name: string
  description: string
  icon: string
  color: string
}

export interface VideoCategoriesResponse {
  categories: VideoCategory[]
  default_category: string
}

export interface ProcessingStatus {
  status: 'processing' | 'completed' | 'error'
  current_step: number
  total_steps: number
  step_name: string
  progress: number
  error_message?: string
}

// B站相关接口Type
export interface BilibiliVideoInfo {
  title: string
  description: string
  duration: number
  uploader: string
  upload_date: string
  view_count: number
  like_count: number
  thumbnail: string
  url: string
}

export interface BilibiliDownloadRequest {
  url: string
  project_name: string
  video_category?: string
  browser?: string
}

export interface BilibiliDownloadTask {
  id: string
  url: string
  project_name: string
  video_category?: string
  browser?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  error_message?: string
  video_info?: BilibiliVideoInfo
  project_id?: string
  created_at: string
  updated_at: string
}

// Settings相关API
export const settingsApi = {
  // 获取系统配置
  getSettings: (): Promise<any> => {
    return api.get('/settings')
  },

  // Update系统配置
  updateSettings: (settings: any): Promise<any> => {
    return api.post('/settings', settings)
  },

  // TestAPI密钥
  testApiKey: (provider: string, apiKey: string, modelName: string): Promise<{ success: boolean; error?: string }> => {
    return api.post('/settings/test-api-key', { 
      provider, 
      api_key: apiKey, 
      model_name: modelName 
    })
  },

  // 获取所有可用模型
  getAvailableModels: (): Promise<any> => {
    return api.get('/settings/available-models')
  },

  // 获取当前提供商信息
  getCurrentProvider: (): Promise<any> => {
    return api.get('/settings/current-provider')
  }
}

// projects相关API
export const projectApi = {
  // 获取Video Category配置
  getVideoCategories: async (): Promise<VideoCategoriesResponse> => {
    return api.get('/video-categories')
  },

  // 获取所有projects
  getProjects: async (): Promise<Project[]> => {
    const response = await api.get('/projects/')
    // 处理分页响应结构，Backitems数组
    return (response as any).items || response || []
  },

  // 获取单projects
  getProject: async (id: string): Promise<Project> => {
    return api.get(`/projects/${id}`)
  },

  // Upload文件并Createprojects
  uploadFiles: async (data: UploadFilesRequest): Promise<Project> => {
    const formData = new FormData()
    formData.append('video_file', data.video_file)
    if (data.srt_file) {
      formData.append('srt_file', data.srt_file)
    }
    formData.append('project_name', data.project_name)
    if (data.video_category) {
      formData.append('video_category', data.video_category)
    }
    
    return api.post('/projects/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // Deleteprojects
  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`)
  },

  // Start Processingprojects
  startProcessing: async (id: string): Promise<void> => {
    await api.post(`/projects/${id}/process`)
  },

  // Retry处理projects
  retryProcessing: async (id: string): Promise<void> => {
    await api.post(`/projects/${id}/retry`)
  },

  // 获取处理Status
  getProcessingStatus: async (id: string): Promise<ProcessingStatus> => {
    return api.get(`/projects/${id}/status`)
  },

  // 获取projects日志
  getProjectLogs: async (id: string, lines: number = 50): Promise<{logs: Array<{timestamp: string, module: string, level: string, message: string}>}> => {
    return api.get(`/projects/${id}/logs?lines=${lines}`)
  },

  // 获取projects切片
  getClips: async (projectId: string): Promise<any[]> => {
    try {
      // 只从数据库获取数据，不再回退到文件系统
      console.log('🔍 Calling clips API for project:', projectId)
      const response = await api.get(`/clips/?project_id=${projectId}`)
      console.log('📦 Raw API response:', response)
      const clips = (response as any).items || response || []
      console.log('📋 Extracted clips:', clips.length, 'clips found')
      
      // 转换后端数据格式为前端期望的格式
      const convertedClips = clips.map((clip: any) => {
        // 转换秒数为Timechars串格式
        const formatSecondsToTime = (seconds: number) => {
          const hours = Math.floor(seconds / 3600)
          const minutes = Math.floor((seconds % 3600) / 60)
          const secs = Math.floor(seconds % 60)
          return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        }
        
        // 获取metadata中的Content
        const metadata = clip.clip_metadata || {}
        
        return {
          id: clip.id,
          title: clip.title,
          generated_title: clip.title,
          start_time: formatSecondsToTime(clip.start_time),
          end_time: formatSecondsToTime(clip.end_time),
          duration: clip.duration || 0,
          final_score: clip.score || 0,
          recommend_reason: metadata.recommend_reason || '',
          outline: metadata.outline || '',
          // 只使用metadata中的content，避免使用description（可能是转写文本）
          content: metadata.content || [],
          chunk_index: metadata.chunk_index || 0
        }
      })
      
      console.log('✅ Converted clips:', convertedClips.length, 'clips')
      console.log('📄 First clip sample:', convertedClips[0])
      return convertedClips
    } catch (error) {
      console.error('❌ Failed to get clips:', error)
      return []
    }
  },

  // 获取projectsCollection
  getCollections: async (projectId: string): Promise<any[]> => {
    try {
      // 只从数据库获取数据，不再回退到文件系统
      const response = await api.get(`/collections/?project_id=${projectId}`)
      const collections = (response as any).items || response || []
      
      // 转换后端数据格式为前端期望的格式
      return collections.map((collection: any) => ({
        id: collection.id,
        collection_title: collection.name || collection.collection_title || '',
        collection_summary: collection.description || collection.collection_summary || '',
        clip_ids: collection.clip_ids || collection.metadata?.clip_ids || [],
        collection_type: collection.collection_type || 'ai_recommended',
        created_at: collection.created_at,
        project_id: collection.project_id,
        thumbnail_path: collection.thumbnail_path
      }))
    } catch (error) {
      console.error('Failed to get collections:', error)
      return []
    }
  },

  // 重启指定Step
  restartStep: async (id: string, step: number): Promise<void> => {
    await api.post(`/projects/${id}/restart-step`, { step })
  },

  // Update切片信息
  updateClip: (projectId: string, clipId: string, updates: Partial<Clip>): Promise<Clip> => {
    return api.patch(`/projects/${projectId}/clips/${clipId}`, updates)
  },

  // Update切片Title
  updateClipTitle: async (clipId: string, title: string): Promise<any> => {
    return api.patch(`/clips/${clipId}/title`, { title })
  },

  // 生成切片Title
  generateClipTitle: async (clipId: string): Promise<{clip_id: string, generated_title: string, success: boolean}> => {
    return api.post(`/clips/${clipId}/generate-title`)
  },

  // CreateCollection
  createCollection: (projectId: string, collectionData: { collection_title: string, collection_summary: string, clip_ids: string[] }): Promise<Collection> => {
    return api.post(`/collections/`, {
      project_id: projectId,
      name: collectionData.collection_title,
      description: collectionData.collection_summary,
      metadata: {
        clip_ids: collectionData.clip_ids,
        collection_type: 'manual'
      }
    })
  },

  // UpdateCollection信息
  updateCollection: (_projectId: string, collectionId: string, updates: Partial<Collection>): Promise<Collection> => {
    // 如果updates包含clip_ids，需要将其包装在metadata中
    const apiUpdates = { ...updates }
    if ('clip_ids' in updates && updates.clip_ids !== undefined) {
      apiUpdates.metadata = { clip_ids: updates.clip_ids }
      delete apiUpdates.clip_ids
    }
    return api.put(`/collections/${collectionId}`, apiUpdates)
  },

  // 重新SortCollection切片
  reorderCollectionClips: (projectId: string, collectionId: string, clipIds: string[]): Promise<Collection> => {
    return api.patch(`/projects/${projectId}/collections/${collectionId}/reorder`, clipIds)
  },

  // DeleteCollection
  deleteCollection: (_projectId: string, collectionId: string): Promise<{message: string, deleted_collection: string}> => {
    return api.delete(`/collections/${collectionId}`)
  },

  // 生成CollectionTitle
  generateCollectionTitle: (collectionId: string): Promise<{collection_id: string, generated_title: string, success: boolean}> => {
    return api.post(`/collections/${collectionId}/generate-title`)
  },

  // UpdateCollectionTitle
  updateCollectionTitle: (collectionId: string, title: string): Promise<{collection_id: string, title: string, success: boolean}> => {
    return api.put(`/collections/${collectionId}/title`, { title })
  },

  // Download切片视频
  downloadClip: (_projectId: string, clipId: string): Promise<Blob> => {
    return api.get(`/files/projects/${_projectId}/clips/${clipId}`, {
      responseType: 'blob'
    })
  },

  // DownloadCollection视频
  downloadCollection: (projectId: string, collectionId: string): Promise<Blob> => {
    return api.get(`/files/projects/${projectId}/collections/${collectionId}`, {
      responseType: 'blob'
    })
  },

  // 导出元数据
  exportMetadata: (projectId: string): Promise<Blob> => {
    return api.get(`/projects/${projectId}/export`, {
      responseType: 'blob'
    })
  },

  // 生成Collection视频
  generateCollectionVideo: (projectId: string, collectionId: string) => {
    return api.post(`/projects/${projectId}/collections/${collectionId}/generate`)
  },

  downloadVideo: async (projectId: string, clipId?: string, collectionId?: string) => {
    let url = `/projects/${projectId}/download`
    if (clipId) {
      url += `?clip_id=${clipId}`
    } else if (collectionId) {
      url += `?collection_id=${collectionId}`
    }
    
    try {
      // 对于blobType的响应，需要直接使用axios而不是经过拦截器
      const response = await axios.get(`http://localhost:8000/api/v1${url}`, { 
        responseType: 'blob',
        headers: {
          'Accept': 'application/octet-stream'
        }
      })
      
      // 从响应头获取文件名，如果没有则使用默认Name
      const contentDisposition = response.headers['content-disposition']
      let filename = clipId ? `clip_${clipId}.mp4` : 
                     collectionId ? `collection_${collectionId}.mp4` : 
                     `project_${projectId}.mp4`
      
      if (contentDisposition) {
        // 优先尝试解析 RFC 6266 格式的 filename* 参数
        const filenameStarMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/)
        if (filenameStarMatch) {
          filename = decodeURIComponent(filenameStarMatch[1])
        } else {
          // 回退到传统的 filename 参数
          const filenameMatch = contentDisposition.match(/filename="([^"]+)"/)
          if (filenameMatch) {
            filename = filenameMatch[1]
          }
        }
      }
      
      // CreateDownload链接
      const blob = new Blob([response.data], { type: 'video/mp4' })
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      
      // 触发Download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      
      return response.data
    } catch (error) {
      console.error('Download failed:', error)
      throw error
    }
  },

  // 获取projects文件URL
  getProjectFileUrl: (projectId: string, filename: string): string => {
    return `${api.defaults.baseURL}/projects/${projectId}/files/${filename}`
  },

  // 获取projects视频URL
  getProjectVideoUrl: (projectId: string): string => {
    return `${api.defaults.baseURL}/projects/${projectId}/video`
  },

  // 获取切片视频URL
  getClipVideoUrl: (projectId: string, clipId: string, _clipTitle?: string): string => {
    // 使用projects路由获取切片视频
    return `http://localhost:8000/api/v1/projects/${projectId}/clips/${clipId}`
  },

  // 获取Collection视频URL
  getCollectionVideoUrl: (projectId: string, collectionId: string): string => {
    // 使用files路由获取Collection视频
    return `http://localhost:8000/api/v1/files/projects/${projectId}/collections/${collectionId}`
  },

  // 生成projects缩略图
  generateThumbnail: async (projectId: string): Promise<{success: boolean, thumbnail: string, message: string}> => {
    return api.post(`/projects/${projectId}/generate-thumbnail`)
  }
}

// 视频Download相关API
export const bilibiliApi = {
  // 解析B站Video Info
  parseVideoInfo: async (url: string, browser?: string): Promise<{success: boolean, video_info: BilibiliVideoInfo}> => {
    const formData = new FormData()
    formData.append('url', url)
    if (browser) {
      formData.append('browser', browser)
    }
    return api.post('/bilibili/parse', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // 解析YouTubeVideo Info
  parseYouTubeVideoInfo: async (url: string, browser?: string): Promise<{success: boolean, video_info: BilibiliVideoInfo}> => {
    const formData = new FormData()
    formData.append('url', url)
    if (browser) {
      formData.append('browser', browser)
    }
    return api.post('/youtube/parse', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // CreateB站Download任务
  createDownloadTask: async (data: BilibiliDownloadRequest): Promise<BilibiliDownloadTask> => {
    return api.post('/bilibili/download', data)
  },

  // CreateYouTubeDownload任务
  createYouTubeDownloadTask: async (data: BilibiliDownloadRequest): Promise<BilibiliDownloadTask> => {
    return api.post('/youtube/download', data)
  },

  // 获取Download任务Status
  getTaskStatus: async (taskId: string): Promise<BilibiliDownloadTask> => {
    return api.get(`/bilibili/tasks/${taskId}`)
  },

  // 获取YouTubeDownload任务Status
  getYouTubeTaskStatus: async (taskId: string): Promise<BilibiliDownloadTask> => {
    return api.get(`/youtube/tasks/${taskId}`)
  },

  // 获取所有Download任务
  getAllTasks: async (): Promise<BilibiliDownloadTask[]> => {
    return api.get('/bilibili/tasks')
  },

  // 获取所有YouTubeDownload任务
  getAllYouTubeTasks: async (): Promise<BilibiliDownloadTask[]> => {
    return api.get('/youtube/tasks')
  }
}

// 系统Status相关API
export const systemApi = {
  // 获取系统Status
  getSystemStatus: (): Promise<{
    current_processing_count: number
    max_concurrent_processing: number
    total_projects: number
    processing_projects: string[]
  }> => {
    return api.get('/system/status')
  }
}

export default api