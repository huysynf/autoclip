import React, { useState } from 'react'
import { Button, Card, Space, Typography } from 'antd'
import { PlayCircleOutlined } from '@ant-design/icons'
import SubtitleEditor from './SubtitleEditor'
import { SubtitleSegment, VideoEditOperation } from '../types/subtitle'

const { Title, Text } = Typography

const SubtitleEditorDemo: React.FC = () => {
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  // Mock SubtitleData
  const mockSubtitles: SubtitleSegment[] = [
    {
      id: '1',
      startTime: 0,
      endTime: 11,
      words: [
        { id: '1-1', text: 'Welcome', startTime: 0, endTime: 2 },
        { id: '1-2', text: 'Everyone', startTime: 2, endTime: 4 },
        { id: '1-3', text: 'Use ', startTime: 4, endTime: 6 },
        { id: '1-4', text: 'Word shadow', startTime: 6, endTime: 8 },
        { id: '1-5', text: '。', startTime: 8, endTime: 11 }
      ],
      text: '',
      index: 0
    },
    {
      id: '2',
      startTime: 11,
      endTime: 13,
      words: [
        { id: '2-1', text: 'Word shadow', startTime: 11, endTime: 12 },
        { id: '2-2', text: 'Yes', startTime: 12, endTime: 12.5 },
        { id: '2-3', text: 'One', startTime: 12.5, endTime: 13 }
      ],
      text: '',
      index: 0
    },
    {
      id: '3',
      startTime: 13,
      endTime: 14,
      words: [
        { id: '3-1', text: 'Extreme', startTime: 13, endTime: 13.5 },
        { id: '3-2', text: 'Simple', startTime: 13.5, endTime: 14 }
      ],
      text: '',
      index: 0
    },
    {
      id: '4',
      startTime: 14,
      endTime: 17,
      words: [
        { id: '4-1', text: 'Video', startTime: 14, endTime: 15 },
        { id: '4-2', text: 'Edit', startTime: 15, endTime: 16 },
        { id: '4-3', text: 'Product', startTime: 16, endTime: 17 },
        { id: '4-4', text: '。', startTime: 17, endTime: 17 }
      ],
      text: '',
      index: 0
    },
    {
      id: '5',
      startTime: 17,
      endTime: 18,
      words: [
        { id: '5-1', text: 'Word shadow', startTime: 17, endTime: 17.5 },
        { id: '5-2', text: 'Most', startTime: 17.5, endTime: 17.8 },
        { id: '5-3', text: 'Main', startTime: 17.8, endTime: 18 }
      ],
      text: '',
      index: 0
    },
    {
      id: '6',
      startTime: 18,
      endTime: 23,
      words: [
        { id: '6-1', text: 'Of', startTime: 18, endTime: 18.2 },
        { id: '6-2', text: 'Innovation', startTime: 18.2, endTime: 19 },
        { id: '6-3', text: 'Yes', startTime: 19, endTime: 19.5 },
        { id: '6-4', text: 'Pass', startTime: 19.5, endTime: 20 },
        { id: '6-5', text: 'Word', startTime: 20, endTime: 21 },
        { id: '6-6', text: 'Come', startTime: 21, endTime: 21.5 },
        { id: '6-7', text: 'Edit', startTime: 21.5, endTime: 22.5 },
        { id: '6-8', text: 'Video', startTime: 22.5, endTime: 23 },
        { id: '6-9', text: '，', startTime: 23, endTime: 23 }
      ],
      text: '',
      index: 0
    }
  ]

  const handleSave = (operations: VideoEditOperation[]) => {
    console.log('SaveEditAction:', operations)
    setIsEditorOpen(false)
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ color: '#ffffff', marginBottom: '16px' }}>SubtitleEditer demo</Title>
        <Text style={{ color: '#cccccc', fontSize: '16px', display: 'block', marginBottom: '24px' }}>This Yes is a redesigned SubtitleEdit that refers to the layout and interaction design of modern VideoEdit software.</Text>
        
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Text style={{ color: '#ffffff', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Update the projects array at the same time to ensure that StoreMedium’s Data is synchronized</Text>
            <ul style={{ color: '#cccccc', fontSize: '14px', lineHeight: '1.6' }}>
              <li>Three-column Layout: Subtitle List on the left, Medium style Select, and Video player on the right</li>
              <li>Right-click menu: Supports actions such as Deleteclips, Off link material, Reset, Hide Subtitle, High, etc.</li>
              <li>Real-timePreview: Click on the Subtitle segment to jump to the corresponding Time point</li>
              <li>Style template: Provides multiple Subtitle styles Select</li>
              <li>EditHistory: supports undo/redo Action</li>
              <li>Modern UI: dark theme, smooth animation effect</li>
            </ul>
          </div>

          <div>
            <Text style={{ color: '#ffffff', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Action description:</Text>
            <ul style={{ color: '#cccccc', fontSize: '14px', lineHeight: '1.6' }}>
              <li>Click the Subtitle segment to jump to the corresponding Time point of the Video</li>
              <li>Click on the word Optional/CancelSelect (Ctrl/Cmd+click for multiple selections)</li>
              <li>Right-click on the Subtitle segment to open the On context menu</li>
              <li>Use the Edit tool to perform actions such as Delete, Undo, and Redo.</li>
              <li>Select style template can Preview different effects</li>
            </ul>
          </div>

          <Button 
            type="primary" 
            size="large" 
            icon={<PlayCircleOutlined />}
            onClick={() => setIsEditorOpen(true)}
            style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              border: 'none',
              height: '48px',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >Open OnSubtitleEditer</Button>
        </Space>
      </Card>

      {isEditorOpen && (
        <SubtitleEditor
          videoUrl="https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4"
          subtitles={mockSubtitles}
          onSave={handleSave}
          onClose={() => setIsEditorOpen(false)}
        />
      )}
    </div>
  )
}

export default SubtitleEditorDemo
