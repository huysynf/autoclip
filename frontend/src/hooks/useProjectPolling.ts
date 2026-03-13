import { useEffect, useRef, useState } from 'react'
import { projectApi } from '../services/api'
import { Project, useProjectStore } from '../store/useProjectStore'

interface UseProjectPollingOptions {
  interval?: number // Polling Interval,Default10seconds
  onProjectsUpdate?: (projects: Project[]) => void
  enabled?: boolean // YesNoEnablePolling
}

export const useProjectPolling = ({
  interval = 10000,
  onProjectsUpdate,
  enabled = true
}: UseProjectPollingOptions = {}) => {
  const [isPolling, setIsPolling] = useState(false)
  const intervalRef = useRef<number | null>(null)
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now())
  const isDragging = useProjectStore(state => state.isDragging)

    const startPolling = () => {
    if (!enabled || intervalRef.current) return

    setIsPolling(true)
    
    const poll = async () => {
      try {
        // Real-timeGet isDraggingStatus
        const currentIsDragging = useProjectStore.getState().isDragging
        
        // If dragging is in progress, Skip polls this time
        if (currentIsDragging) {
          console.log('Skipping poll: dragging in progress')
          return
        }
        
        console.log('Polling projects...')
        const projects = await projectApi.getProjects()
        console.log('Polled projects:', projects)
        
        const hasProcessingProjects = projects.some(p => p.status === 'processing')
        
        if (onProjectsUpdate) {
          console.log('Calling onProjectsUpdate with:', projects)
          onProjectsUpdate(projects)
        }
        
        setLastUpdateTime(Date.now())
        
        // If there are no Processing projects, the polling frequency can be appropriately reduced.
        if (!hasProcessingProjects) {
          // {/* Simplified projects header */}
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }

    // Execute immediately
    poll()
    
    // Set timer
    intervalRef.current = setInterval(poll, interval)
  }

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsPolling(false)
  }

  const refreshNow = async () => {
    try {
      const projects = await projectApi.getProjects()
      if (onProjectsUpdate) {
        onProjectsUpdate(projects)
      }
      setLastUpdateTime(Date.now())
      return projects
    } catch (error) {
      console.error('Manual refresh error:', error)
      throw error
    }
  }

  useEffect(() => {
    if (enabled) {
      startPolling()
    } else {
      stopPolling()
    }

    return () => {
      stopPolling()
    }
  }, [enabled, interval])

  return {
    isPolling,
    lastUpdateTime,
    startPolling,
    stopPolling,
    refreshNow
  }
}

export default useProjectPolling