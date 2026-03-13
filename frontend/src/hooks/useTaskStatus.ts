import { useState, useEffect, useCallback } from 'react';
import {  tasksUpdateMessage, ProjectUpdateMessage } from './useWebSocket';

export interface  tasksStatus {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  message?: string;
  error?: string;
  updatedAt: string;
  project_id?: string; // AddprojectsID字段
}

export interface ProjectStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message?: string;
  updatedAt: string;
}

export const use tasksStatus = () => {
  console.log('🔧 use tasksStatus Hook已Initializing');
  
  const [tasks, set taskss] = useState<Map<string,  tasksStatus>>(new Map());
  const [projects, setProjects] = useState<Map<string, ProjectStatus>>(new Map());
  const [loading, setLoading] = useState(false);

  const update tasks = useCallback((taskUpdate:  tasksUpdateMessage) => {
    set taskss(prev => {
      const new taskss = new Map(prev);
      const existing = new taskss.get(taskUpdate.task_id);
      
      new taskss.set(taskUpdate.task_id, {
        id: taskUpdate.task_id,
        status: taskUpdate.status as  tasksStatus['status'],
        progress: taskUpdate.progress || (existing?.progress || 0),
        message: taskUpdate.message,
        error: taskUpdate.error,
        updatedAt: taskUpdate.timestamp
      });
      
      return new taskss;
    });
  }, []);

  const updateProject = useCallback((projectUpdate: ProjectUpdateMessage) => {
    setProjects(prev => {
      const newProjects = new Map(prev);
      const existing = newProjects.get(projectUpdate.project_id);
      
      newProjects.set(projectUpdate.project_id, {
        id: projectUpdate.project_id,
        status: projectUpdate.status as ProjectStatus['status'],
        progress: projectUpdate.progress || (existing?.progress || 0),
        message: projectUpdate.message,
        updatedAt: projectUpdate.timestamp
      });
      
      return newProjects;
    });
  }, []);

  const get tasks = useCallback((taskId: string):  tasksStatus | undefined => {
    return tasks.get(taskId);
  }, [tasks]);

  const getProject = useCallback((projectId: string): ProjectStatus | undefined => {
    return projects.get(projectId);
  }, [projects]);

  const getAll taskss = useCallback(():  tasksStatus[] => {
    return Array.from(tasks.values());
  }, [tasks]);

  const getAllProjects = useCallback((): ProjectStatus[] => {
    return Array.from(projects.values());
  }, [projects]);

  const getActive taskss = useCallback(():  tasksStatus[] => {
    return Array.from(tasks.values()).filter(
      task => task.status === 'pending' || task.status === 'running'
    );
  }, [tasks]);

  const getActiveProjects = useCallback((): ProjectStatus[] => {
    return Array.from(projects.values()).filter(
      project => project.status === 'pending' || project.status === 'processing'
    );
  }, [projects]);

  const clear tasks = useCallback((taskId: string) => {
    set taskss(prev => {
      const new taskss = new Map(prev);
      new taskss.delete(taskId);
      return new taskss;
    });
  }, []);

  const clearProject = useCallback((projectId: string) => {
    setProjects(prev => {
      const newProjects = new Map(prev);
      newProjects.delete(projectId);
      return newProjects;
    });
  }, []);

  const clearAll = useCallback(() => {
    set taskss(new Map());
    setProjects(new Map());
  }, []);

  const loadProject taskss = useCallback(async (projectId: string) => {
    console.log('📤 Start加载projects tasks:', projectId);
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/tasks/project/${projectId}`);
      console.log('📡 API响应Status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        const project taskss = data.data.tasks || [];
        console.log('📋 Get 到 tasksCount:', project taskss.length);
        
        set taskss(prev => {
          const new taskss = new Map(prev);
          project taskss.forEach((task: any) => {
            console.log('📝 Add tasks:', task.task_id, task.status, task.progress);
            new taskss.set(task.task_id, {
              id: task.task_id,
              status: task.status as  tasksStatus['status'],
              progress: task.progress || 0,
              message: task.name,
              updatedAt: task.updated_at,
              project_id: task.project_id || projectId
            });
          });
          return new taskss;
        });
      } else {
        console.error('❌ API调用Failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ 加载projects tasksFailed:', error);
    } finally {
      setLoading(false);
      console.log('✅  tasks加载Completed');
    }
  }, []); // Empty依赖数组，避免None限循环

  return {
    tasks: getAll taskss(),
    projects: getAllProjects(),
    active taskss: getActive taskss(),
    activeProjects: getActiveProjects(),
    loading,
    get tasks,
    getProject,
    update tasks,
    updateProject,
    clear tasks,
    clearProject,
    clearAll,
    loadProject taskss
  };
}; 