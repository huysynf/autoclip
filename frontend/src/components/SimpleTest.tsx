import React, { useEffect, useState } from 'react';
import { Card, Typography } from 'antd';

const { Text } = Typography;

export const SimpleTest: React.FC = () => {
  const [count, setCount] = useState(0);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    console.log('🎯 SimpleTestComponent loaded');
    setCount(prev => prev + 1);
  }, []);

  useEffect(() => {
    console.log('📤 StartAPI calls Test');
    fetch('http://localhost:8000/api/v1/tasks/project/64d5768e-7b6b-40d0-9aed-f216768a6526')
      .then(response => response.json())
      .then(data => {
        console.log('📋 API response:', data);
        setTasks(data.data.tasks || []);
      })
      .catch(error => {
        console.error('❌ API call Failed:', error);
      });
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <Card title="SimpleTestComponent">
        <Text>Component loading times: {count}</Text>
        <br />
        <Text> tasksCount: {tasks.length}</Text>
        <br />
        <Text> Task List:</Text>
        <ul>
          {tasks.map((task, index) => (
            <li key={index}>
              {task.task_id} - {task.status} - {task.progress}%
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}; 