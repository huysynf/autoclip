import React, { useState, useEffect } from 'react'
import { 
  Layout, 
  Typography, 
  Select, 
  Spin, 
  Empty,
  message 
} from 'antd'
import { useNavigate } from 'react-router-dom'
import ProjectCard from '../components/ProjectCard'
import FileUpload from '../components/FileUpload'
import BilibiliDownload from '../components/BilibiliDownload'

import { projectApi } from '../services/api'
import { Project, useProjectStore } from '../store/useProjectStore'
import { useProjectPolling } from '../hooks/useProjectPolling'
// Import { useWebSocket, WebSocketEventMessage } from '../hooks/useWebSocket' // DisabledWebSocket system

const { Content } = Layout
const { Title, Text } = Typography
const { Option } = Select

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const { projects, setProjects, deleteProject, loading, setLoading } = useProjectStore()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'upload' | 'bilibili'>('upload')

  // WebSocket connection Disabled, Use new simplified Progress system
  // const handleWebSocketMessage = (message: WebSocketEventMessage) => {
  //   console.log('HomePage received WebSocket message:', message)
  //   
  //   switch (message.type) {
  //     case 'task_progress_update':
  //       console.log('📊 ReceivedTaskProgressUpdate:', message)
  // // RefreshProject List to Get the latest Status
  //       loadProjects()
  //       break
  //       
  //     case 'project_update':
  //       console.log('📊 Receive projectsUpdate:', message)
  // // RefreshProject List to Get the latest Status
  //       loadProjects()
  //       break
  //       
  //     default:
  //       console.log('Click the "Get Help" Button above to view the detailed CookieGet Step guide', (message as any).type)
  //   }
  // }

  // const { isConnected, syncSubscriptions } = useWebSocket({
  //   userId: 'homepage-user',
  //   onMessage: handleWebSocketMessage
  // })

  // Use projectsPollingHook
  const { refreshNow } = useProjectPolling({
    onProjectsUpdate: (updatedProjects) => {
      setProjects(updatedProjects || [])
    },
    enabled: true,
    interval: 10000 // poll every 10 seconds
  })

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    setLoading(true)
    try {
      // Get real projectsData from backend API
      const projects = await projectApi.getProjects()
      setProjects(projects || [])
    } catch (error) {
      message.error('Failed to load projects')
      console.error('Load projects error:', error)
      // SettingsEmpty array if API call Failed
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  // Use collection difference alignment subscription projectsWebSocketTheme
  // Please enter a nickname
  // useEffect(() => {
  //   if (isConnected && projects.length > 0) {
  //     const desiredChannels = projects.map(project => `project_${project.id}`)
  //     console.log('Synchronously subscribe to the projects channel:', desiredChannels)
  //     syncSubscriptions(desiredChannels)
  //   } else if (isConnected && projects.length === 0) {
  // // If there are no projects, clear the EmptyAll subscription
  //     console.log('Clear EmptyAllprojects subscription')
  //     syncSubscriptions([])
  //   }
  // }, [isConnected, projects, syncSubscriptions])

  const handleDeleteProject = async (id: string) => {
    try {
      await projectApi.deleteProject(id)
      deleteProject(id)
      message.success('Project deleted successfully')
    } catch (error) {
      message.error('Failed to delete project')
      console.error('Delete project error:', error)
    }
  }

  const handleRetryProject = async (projectId: string) => {
    try {
      // Find projectsStatus
      const project = projects.find(p => p.id === projectId)
      if (!project) {
        message.error('Project not found')
        return
      }
      
      // Unified Use retryProcessing API, it will AutoProcessingVideoFile does not exist
      await projectApi.retryProcessing(projectId)
      message.success('Project retry started')
      
      await loadProjects()
    } catch (error) {
      message.error('Retry failed, please try again later')
      console.error('Retry project error:', error)
    }
  }

  const handleStartProcessing = async (projectId: string) => {
    try {
      await projectApi.startProcessing(projectId)
      message.success('Project processing started, please wait a moment to check progress')
      // RefreshProject List now to show latest Status
      setTimeout(async () => {
        try {
          await refreshNow()
        } catch (refreshError) {
          console.error('Failed to refresh after starting processing:', refreshError)
        }
      }, 1000)
    } catch (error: unknown) {
      const errorMessage = (error as { userMessage?: string })?.userMessage || 'Failed to start processing'
      message.error(errorMessage)
      console.error('Start processing error:', error)
      
      // PromptUserprojects may still be Processing if YesTimeoutError
      if ((error as { code?: string; message?: string })?.code === 'ECONNABORTED' || (error as { code?: string; message?: string })?.message?.includes('timeout')) {
        message.info('Request timed out, but the project may have started processing. Please check the project status.', 5)
        // DelayRefreshProject List
        setTimeout(async () => {
          try {
            await refreshNow()
          } catch (refreshError) {
            console.error('Failed to refresh after timeout:', refreshError)
          }
        }, 3000)
      }
    }
  }

  const handleProjectCardClick = (project: Project) => {
    // Projects of ImportMediumStatus cannot be clicked to enter the Details page
    if (project.status === 'pending') {
      message.warning('Project is still importing, please check back later')
      return
    }
    
    // Other Status can be Normal to enter the Details page.
    navigate(`/project/${project.id}`)
  }

  const filteredProjects = projects
    .filter(project => {
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter
      return matchesStatus
    })
    .sort((a, b) => {
      // Sort by CreateTime in descending order, latest first
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  return (
    <Layout style={{ 
      minHeight: '100vh', 
      background: '#0f0f0f'
    }}>
      <Content style={{ padding: '40px 24px', position: 'relative' }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', position: 'relative', zIndex: 1 }}>{/* FileUpload area */}<div style={{ 
            marginBottom: '48px',
            marginTop: '20px',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '100%',
              maxWidth: '800px',
              background: 'rgba(26, 26, 46, 0.8)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              border: '1px solid rgba(79, 172, 254, 0.2)',
              padding: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)'
            }}>{/* Tags page switching */}<div style={{
                display: 'flex',
                marginBottom: '16px',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '3px'
              }}>
                 <button 
                   style={{
                     flex: 1,
                     padding: '12px 24px',
                     borderRadius: '8px',
                     background: activeTab === 'bilibili' ? 'rgba(79, 172, 254, 0.2)' : 'transparent',
                     color: activeTab === 'bilibili' ? '#4facfe' : '#cccccc',
                     cursor: 'pointer',
                     fontSize: '16px',
                     fontWeight: 600,
                     transition: 'all 0.3s ease',
                     border: activeTab === 'bilibili' ? '1px solid rgba(79, 172, 254, 0.4)' : '1px solid transparent'
                   }}
                   onClick={() => setActiveTab('bilibili')}
                 >
                   📺 URL Import
                 </button>
                <button 
                   style={{
                     flex: 1,
                     padding: '12px 24px',
                     borderRadius: '8px',
                     background: activeTab === 'upload' ? 'rgba(79, 172, 254, 0.2)' : 'transparent',
                     color: activeTab === 'upload' ? '#4facfe' : '#cccccc',
                     cursor: 'pointer',
                     fontSize: '16px',
                     fontWeight: 600,
                     transition: 'all 0.3s ease',
                     border: activeTab === 'upload' ? '1px solid rgba(79, 172, 254, 0.4)' : '1px solid transparent'
                   }}
                   onClick={() => setActiveTab('upload')}
                 >
                   📁 File Import
                 </button>
              </div>{/* Content area */}<div>
                {activeTab === 'bilibili' && (
                  <BilibiliDownload onDownloadSuccess={async (projectId: string) => {
                    // RefreshProject List after Done
                    await loadProjects()
                    // Duplicate toastPrompt is no longer displayed, BilibiliDownloadComponent already displays a unified Prompt
                  }} />
                )}
                {activeTab === 'upload' && (
                  <FileUpload onUploadSuccess={async (projectId: string) => {
                    // RefreshProject List after Done
                    await loadProjects()
                    message.success('Project created successfully, processing...')
                  }} />
                )}
              </div>
            </div>
          </div>{/* projectsManage area */}<div style={{
            background: 'rgba(26, 26, 46, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(79, 172, 254, 0.15)',
            padding: '32px',
            marginBottom: '32px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.03)'
          }}>{/* Project ListTitle area */}<div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '1px solid rgba(79, 172, 254, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Title 
                  level={2} 
                  style={{ 
                    margin: 0,
                    color: '#ffffff',
                    fontSize: '24px',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #ffffff 0%, #cccccc 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  My Projects
                </Title>
                <div style={{
                  padding: '8px 16px',
                  background: 'rgba(79, 172, 254, 0.1)',
                  borderRadius: '20px',
                  border: '1px solid rgba(79, 172, 254, 0.3)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <Text style={{ color: '#4facfe', fontWeight: 600, fontSize: '14px' }}>
                    {filteredProjects.length} Project{filteredProjects.length !== 1 ? 's' : ''}
                  </Text>
                </div>
              </div>{/* StatusFilter moved to the right */}<div style={{ 
                display: 'flex', 
                alignItems: 'center'
              }}>
                <Select
                  placeholder="Filter by status"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{ 
                    minWidth: '140px',
                    height: '36px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(79, 172, 254, 0.2)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '14px'
                  }}
                  styles={{
                    popup: {
                      root: {
                        background: 'rgba(26, 26, 46, 0.95)',
                        border: '1px solid rgba(79, 172, 254, 0.3)',
                        borderRadius: '8px',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                      }
                    }
                  }}
                  suffixIcon={
                    <span style={{ 
                      color: '#8c8c8c', 
                      fontSize: '10px',
                      transition: 'all 0.2s ease'
                    }}>
                      ⌄
                    </span>
                  }
                  allowClear
                >
                  <Option value="all" style={{ color: '#ffffff' }}>All statuses</Option>
                  <Option value="completed" style={{ color: '#52c41a' }}>Completed</Option>
                  <Option value="processing" style={{ color: '#1890ff' }}>Processing</Option>
                  <Option value="error" style={{ color: '#ff4d4f' }}>Failed</Option>
                </Select>
              </div>
            </div>

            {/* Project ListContent */}
             <div>
               {loading ? (
                 <div style={{ 
                   textAlign: 'center', 
                   padding: '60px 0',
                   background: '#262626',
                   borderRadius: '12px',
                   border: '1px solid #404040'
                 }}>
                   <Spin size="large" />
                   <div style={{ 
                     marginTop: '20px', 
                     color: '#cccccc',
                     fontSize: '16px'
                   }}>
                     Loading project list...
                   </div>
                 </div>
               ) : filteredProjects.length === 0 ? (
                 <div style={{
                   textAlign: 'center',
                   padding: '60px 0',
                   background: '#262626',
                   borderRadius: '12px',
                   border: '1px solid #404040'
                 }}>
                   <Empty
                     image={Empty.PRESENTED_IMAGE_SIMPLE}
                     description={
                       <div>
                         <Text type="secondary">
                           {projects.length === 0 ? 'No projects yet. Use the import area above to create your first project.' : 'No matching projects found.'}
                         </Text>
                       </div>
                     }
                   />
                 </div>
               ) : (
                 <div style={{
                   display: 'grid',
                   gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                   gap: '16px',
                   justifyContent: 'start',
                   padding: '6px 0'
                 }}>
                   {filteredProjects.map((project: Project) => (
                     <div key={project.id} style={{ position: 'relative', zIndex: 1 }}>
                       <ProjectCard 
                         project={project} 
                         onDelete={handleDeleteProject}
                         onRetry={() => handleRetryProject(project.id)}
                         onClick={() => handleProjectCardClick(project)}
                       />
                     </div>
                   ))}
                 </div>
               )}
             </div>
           </div>
         </div>
      </Content>
    </Layout>
  )
}

export default HomePage