/**
 * 简化的ProgressStatus管理 - 基于固定阶段和轮询
 */

import { create } from 'zustand'

export interface SimpleProgress {
  project_id: string
  stage: string
  percent: number
  message: string
  ts: number
}

interface SimpleProgressState {
  // Status数据
  byId: Record<string, SimpleProgress>
  
  // 轮询控制
  pollingInterval: number | null
  isPolling: boolean
  
  // 操作方法
  upsert: (progress: SimpleProgress) => void
  startPolling: (projectIds: string[], intervalMs?: number) => void
  stopPolling: () => void
  clearProgress: (projectId: string) => void
  clearAllProgress: () => void
  
  // 获取方法
  getProgress: (projectId: string) => SimpleProgress | null
  getAllProgress: () => Record<string, SimpleProgress>
}

export const useSimpleProgressStore = create<SimpleProgressState>((set, get) => {
  let timer: ReturnType<typeof setInterval> | null = null

  return {
    // 初始Status
    byId: {},
    pollingInterval: null,
    isPolling: false,

    // Update或插入Progress数据
    upsert: (progress: SimpleProgress) => {
      set((state) => ({
        byId: {
          ...state.byId,
          [progress.project_id]: progress
        }
      }))
    },

    // Start Polling
    startPolling: (projectIds: string[], intervalMs: number = 2000) => {
      const { stopPolling, isPolling } = get()
      
      // 如果已经在轮询，先Stop
      if (isPolling) {
        stopPolling()
      }

      if (projectIds.length === 0) {
        console.warn('没有projectsID，Skip轮询')
        return
      }

      console.log(`Start PollingProgress: ${projectIds.join(', ')}`)

      // 立即获取一次
      const fetchSnapshots = async () => {
        try {
          const queryString = projectIds.map(id => `project_ids=${id}`).join('&')
          const response = await fetch(`http://localhost:8000/api/v1/simple-progress/snapshot?${queryString}`)
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
          
          const snapshots: SimpleProgress[] = await response.json()
          
          // UpdateStatus
          snapshots.forEach(snapshot => {
            console.log(`UpdateProgress: ${snapshot.project_id} - ${snapshot.stage} (${snapshot.percent}%)`)
            get().upsert(snapshot)
          })
          
          console.log(`轮询Update: ${snapshots.length} projects`)
          
        } catch (error) {
          console.error('轮询Progress失败:', error)
        }
      }

      // 立即执行一次
      fetchSnapshots()

      // Settings定时器
      timer = setInterval(fetchSnapshots, intervalMs)

      set({
        isPolling: true,
        pollingInterval: intervalMs
      })
    },

    // Stop Polling
    stopPolling: () => {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
      
      set({
        isPolling: false,
        pollingInterval: null
      })
      
      console.log('Stop PollingProgress')
    },

    // 清除单projectsProgress
    clearProgress: (projectId: string) => {
      set((state) => {
        const newById = { ...state.byId }
        delete newById[projectId]
        return { byId: newById }
      })
    },

    // Clear AllProgress
    clearAllProgress: () => {
      set({ byId: {} })
    },

    // 获取单projectsProgress
    getProgress: (projectId: string) => {
      return get().byId[projectId] || null
    },

    // 获取所有Progress
    getAllProgress: () => {
      return get().byId
    }
  }
})

// 阶段显示Name映射
export const STAGE_DISPLAY_NAMES: Record<string, string> = {
  'INGEST': '素材准备',
  'SUBTITLE': '字幕处理',
  'ANALYZE': 'Content分析', 
  'HIGHLIGHT': 'clips定位',
  'EXPORT': '视频导出',
  'DONE': 'Done'
}

// 阶段颜色映射
export const STAGE_COLORS: Record<string, string> = {
  'INGEST': '#1890ff',      // 蓝色
  'SUBTITLE': '#52c41a',    // 绿色
  'ANALYZE': '#fa8c16',     // 橙色
  'HIGHLIGHT': '#722ed1',   // 紫色
  'EXPORT': '#eb2f96',      // 粉色
  'DONE': '#13c2c2'         // 青色
}

// 获取阶段显示Name
export const getStageDisplayName = (stage: string): string => {
  return STAGE_DISPLAY_NAMES[stage] || stage
}

// 获取阶段颜色
export const getStageColor = (stage: string): string => {
  return STAGE_COLORS[stage] || '#666666'
}

// 判断是否为完成Status
export const isCompleted = (stage: string): boolean => {
  return stage === 'DONE'
}

// 判断是否为失败Status
export const isFailed = (message: string): boolean => {
  return message.includes('失败') || message.includes('错误') || message.includes('失败')
}
