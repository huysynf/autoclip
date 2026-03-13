// Subtitle word type
export interface SubtitleWord {
  id: string
  text: string
  startTime: number  // seconds
  endTime: number    // seconds
  confidence?: number // speech recognition confidence
}

// Subtitle segment type
export interface SubtitleSegment {
  id: string
  startTime: number  // seconds
  endTime: number    // seconds
  words: SubtitleWord[]
  text: string       // full text
  index: number      // original SRT index
}

// Video edit operation type
export interface VideoEditOperation {
  type: 'delete' | 'insert' | 'modify'
  segmentIds: string[]
  timestamp: number
  metadata?: {
    originalText?: string
    newText?: string
    timeRange?: {
      start: number
      end: number
    }
  }
}

// Subtitle editor state
export interface SubtitleEditorState {
  currentTime: number
  playing: boolean
  selectedWords: Set<string>
  deletedSegments: Set<string>
  editHistory: VideoEditOperation[]
  historyIndex: number
  showDeleted: boolean
}

// Subtitle data API response
export interface SubtitleDataResponse {
  segments: SubtitleSegment[]
  total_duration: number
  word_count: number
  segment_count: number
}

// Video edit result
export interface VideoEditResult {
  originalVideoPath: string
  editedVideoPath: string
  operations: VideoEditOperation[]
  totalDeletedDuration: number
  finalDuration: number
}
