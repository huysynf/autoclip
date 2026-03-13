/**
 * Simplified progress status management - based on fixed stages and polling
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
  // Status data
  byId: Record<string, SimpleProgress>
  
  // Polling control
  pollingInterval: number | null
  isPolling: boolean
  
  // Methods
  upsert: (progress: SimpleProgress) => void
  startPolling: (projectIds: string[], intervalMs?: number) => void
  stopPolling: () => void
  clearProgress: (projectId: string) => void
  clearAllProgress: () => void
  
  // Getters
  getProgress: (projectId: string) => SimpleProgress | null
  getAllProgress: () => Record<string, SimpleProgress>
}

export const useSimpleProgressStore = create<SimpleProgressState>((set, get) => {
  let timer: ReturnType<typeof setInterval> | null = null

  return {
    // Initial status
    byId: {},
    pollingInterval: null,
    isPolling: false,

    // Upsert progress data
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
      
      // If already polling, stop first
      if (isPolling) {
        stopPolling()
      }

      if (projectIds.length === 0) {
        console.warn('No project IDs provided, skipping poll')
        return
      }

      console.log(`Start PollingProgress: ${projectIds.join(', ')}`)

      // Fetch immediately
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
          
          console.log(`Poll update: ${snapshots.length} projects`)
          
        } catch (error) {
          console.error('Poll progress failed:', error)
        }
      }

      // Execute immediately
      fetchSnapshots()

      // Set timer
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

    // Clear single project progress
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

    // Get single project progress
    getProgress: (projectId: string) => {
      return get().byId[projectId] || null
    },

    // Get all progress
    getAllProgress: () => {
      return get().byId
    }
  }
})

// Stage display name mapping
export const STAGE_DISPLAY_NAMES: Record<string, string> = {
  'INGEST': 'Preparing Media',
  'SUBTITLE': 'Processing Subtitles',
  'ANALYZE': 'Analyzing Content',
  'HIGHLIGHT': 'Locating Clips',
  'EXPORT': 'Exporting Video',
  'DONE': 'Done'
}

// Stage color mapping
export const STAGE_COLORS: Record<string, string> = {
  'INGEST': '#1890ff',      // blue
  'SUBTITLE': '#52c41a',    // green
  'ANALYZE': '#fa8c16',     // orange
  'HIGHLIGHT': '#722ed1',   // purple
  'EXPORT': '#eb2f96',      // pink
  'DONE': '#13c2c2'         // cyan
}

// Get stage display name
export const getStageDisplayName = (stage: string): string => {
  return STAGE_DISPLAY_NAMES[stage] || stage
}

// Get stage color
export const getStageColor = (stage: string): string => {
  return STAGE_COLORS[stage] || '#666666'
}

// Check if stage is completed
export const isCompleted = (stage: string): boolean => {
  return stage === 'DONE'
}

// Check if message indicates failure
export const isFailed = (message: string): boolean => {
  return message.toLowerCase().includes('fail') || message.toLowerCase().includes('error')
}
