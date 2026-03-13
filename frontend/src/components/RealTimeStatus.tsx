import React, { useEffect, useState, useCallback } from 'react';
import { Card, Row, Col, Statistic, Space, Tag, Button, Typography } from 'antd';
import { 
  WifiOutlined, 
  WifiOutlined as WifiDisconnectedOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { TaskProgress } from './TaskProgress';
import { NotificationList } from './NotificationList';
// import { useWebSocket, WebSocketEventMessage } from '../hooks/useWebSocket'  // 已禁用WebSocket系统;
import { useNotifications } from '../hooks/useNotifications';
import { useProjectStore } from '../store/useProjectStore';
import { projectApi } from '../api/projectApi';

const { Text } = Typography;

interface RealTimeStatusProps {
  userId: string;
}

export const RealTimeStatus: React.FC<RealTimeStatusProps> = ({ userId }) => {
  console.log('🎬 RealTimeStatus组件已加载');
  const { setProjects } = useProjectStore();
  
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // 直接使用简单的Status管理，不使用复杂的Hook
  const loadProjectTasks = useCallback(async (projectId: string) => {
    console.log('📤 Start加载projects任务:', projectId);
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/tasks/project/${projectId}`);
      console.log('📡 API响应Status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        const projectTasks = data.items || []; // 使用正确的字段名
        console.log('📋 获取到任务数量:', projectTasks.length);
        
        // 转换为TaskProgress组件期望的格式
        const formattedTasks = projectTasks.map((task: any) => ({
          id: task.id,
          status: task.status,
          progress: task.progress || 0,
          message: task.name || `任务 ${task.id}`, // 使用name字段或默认值
          updatedAt: task.created_at || task.updated_at || new Date().toISOString(),
          project_id: task.project_id // AddprojectsID字段
        }));
        
        setTasks(formattedTasks);
      } else {
        console.error('❌ API调用失败:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ 加载projects任务失败:', error);
    } finally {
      setLoading(false);
      console.log('✅ 任务加载完成');
    }
  }, []);

  const {
    notifications,
    unreadCount,
    markAsRead,
    removeNotification,
    markAllAsRead,
    clearAll: clearAllNotifications,
    handleSystemNotification,
    handleErrorNotification
  } = useNotifications();

  // WebSocket功能已禁用，使用新的简化Progress系统
  // const handleWebSocketMessage = async (message: WebSocketEventMessage) => {
  //   console.log('收到WebSocket消息:', message);
  //   
  //   switch (message.type) {
  //     case 'task_update':
  //       console.log('📈 收到任务Update:', message);
  //       // 处理任务Update，UpdateprojectsStatus
  //       if (message.task_id && message.status) {
  //         console.log('任务StatusUpdate:', message.task_id, message.status);
  //         // RefreshProject List以获取最新Status
  //         try {
  //           const projects = await projectApi.getProjects();
  //           setProjects(projects);
  //           console.log('Project List已Refresh');
  //         } catch (error) {
  //           console.error('RefreshProject List失败:', error);
  //         }
  //       }
  //       break;
  //       
  //     case 'project_update':
  //       console.log('📊 收到projectsUpdate:', message);
  //       // 处理projectsUpdate
  //       if (message.project_id && message.status) {
  //         console.log('projectsStatusUpdate:', message.project_id, message.status);
  //         // RefreshProject List以获取最新Status
  //         try {
  //           const projects = await projectApi.getProjects();
  //           setProjects(projects);
  //           console.log('Project List已Refresh');
  //         } catch (error) {
  //           console.error('RefreshProject List失败:', error);
  //         }
  //       }
  //       break;
  //       
  //     case 'system_notification':
  //       // 只处理重要的系统Notifications
  //       if (message.level === 'success' || message.level === 'error') {
  //         handleSystemNotification(message);
  //       }
  //       break;
  //       
  //     case 'error_notification':
  //       handleErrorNotification(message);
  //       break;
  //       
  //     case 'task_progress_update':
  //       console.log('📊 收到任务ProgressUpdate:', message);
  //       // 处理任务ProgressUpdate
  //       if (message.project_id && message.progress !== undefined) {
  //         console.log('任务ProgressUpdate:', message.project_id, message.progress + '%', message.step_name);
  //         // 这里可以UpdateprojectsStatus或触发其他UIUpdate
  //       }
  //       break;
  //       
  //     default:
  //       console.log('忽略未知Type的WebSocket消息:', (message as any).type);
  //   }
  // };

  // const {
  //   isConnected,
  //   connectionStatus,
  //   connect,
  //   disconnect,
  //   subscribeToTopic,
  //   unsubscribeFromTopic,
  //   sendMessage
  // } = useWebSocket({
  //   userId,
  //   onMessage: handleWebSocketMessage
  // });

  // 加载projects任务
  useEffect(() => {
    // 这里可以传入具体的projectsID，或者从props获取
    const projectId = '64d5768e-7b6b-40d0-9aed-f216768a6526'; // 示例projectsID
    console.log('🔄 Start加载projects任务:', projectId);
    loadProjectTasks(projectId);
  }, []); // RemoveloadProjectTasks依赖，避免无限循环

  // WebSocketStatus相关函数已禁用
  // const getConnectionStatusColor = () => {
  //   switch (connectionStatus) {
  //     case 'connected': return 'success';
  //     case 'connecting': return 'processing';
  //     case 'disconnected': return 'default';
  //     case 'error': return 'error';
  //     default: return 'default';
  //   }
  // };

  // const getConnectionStatusText = () => {
  //   switch (connectionStatus) {
  //     case 'connected': return 'Connected';
  //     case 'connecting': return '连接中';
  //     case 'disconnected': return '未连接';
  //     case 'error': return '连接错误';
  //     default: return '未知Status';
  //   }
  // };

  // const getConnectionIcon = () => {
  //   switch (connectionStatus) {
  //     case 'connected': return <WifiOutlined />;
  //     case 'connecting': return <SyncOutlined spin />;
  //     case 'disconnected': return <WifiDisconnectedOutlined />;
  //     case 'error': return <ExclamationCircleOutlined />;
  //     default: return <WifiDisconnectedOutlined />;
  //   }
  // };

  return (
    <div style={{ padding: 16 }}>
      <Row gutter={[16, 16]}>
        {/* WebSocket连接Status已禁用 */}
        {/* <Col span={24}>
          <Card size="small">
            <Space>
              {getConnectionIcon()}
              <Text>WebSocketStatus: </Text>
              <Tag color={getConnectionStatusColor()}>
                {getConnectionStatusText()}
              </Tag>
              <Button 
                size="small" 
                icon={<ReloadOutlined />}
                onClick={isConnected ? disconnect : connect}
              >
                {isConnected ? '断开' : '连接'}
              </Button>
            </Space>
          </Card>
        </Col> */}

        {/* 统计信息 */}
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="任务总数"
              value={tasks.length}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="加载Status"
              value={loading ? '加载中' : 'Completed'}
              valueStyle={{ color: loading ? '#52c41a' : '#999' }}
            />
          </Card>
        </Col>
        {/* WebSocket连接Status已禁用 */}
        {/* <Col span={6}>
          <Card size="small">
            <Statistic
              title="连接Status"
              value={isConnected ? 'Connected' : '未连接'}
              valueStyle={{ color: isConnected ? '#722ed1' : '#ff4d4f' }}
            />
          </Card>
        </Col> */}
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="未读Notifications"
              value={unreadCount}
              valueStyle={{ color: unreadCount > 0 ? '#ff4d4f' : '#999' }}
            />
          </Card>
        </Col>

        {/* 任务Progress */}
        <Col span={12}>
          <Card 
            title="任务Progress" 
            size="small"
            extra={
              <Button size="small" onClick={() => setTasks([])}>
                清空
              </Button>
            }
          >
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {tasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
                  No tasks
                </div>
              ) : (
                tasks.map((task) => (
                  <TaskProgress 
                    key={task.id} 
                    task={task} 
                    projectId={task.project_id || userId} // 使用任务的projectsID，如果没有则使用userId作为fallback
                  />
                ))
              )}
            </div>
          </Card>
        </Col>

        {/* Notifications列表 */}
        <Col span={12}>
          <NotificationList
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAsRead={markAsRead}
            onRemove={removeNotification}
            onMarkAllAsRead={markAllAsRead}
            onClearAll={clearAllNotifications}
            maxHeight={300}
          />
        </Col>
      </Row>
    </div>
  );
}; 