export type JobStatus = 'pending' | 'processing' | 'transcribing' | 'analyzing' | 'done' | 'error'

export interface Clip {
  id: string
  startTime: number   // seconds
  endTime: number     // seconds
  title: string
  description: string
  hashtags: string[]
  downloadUrl: string
  thumbnailUrl: string
  duration: number    // seconds
}

export interface Job {
  id: string
  url: string
  platform: 'youtube' | 'twitch' | 'unknown'
  status: JobStatus
  progress: number       // 0–100
  statusMessage: string
  clips: Clip[]
  error?: string
  createdAt: number      // unix ms
  updatedAt: number      // unix ms
}

export interface ProcessRequest {
  url: string
}

export interface ProcessResponse {
  jobId: string
  status: JobStatus
}

export interface StatusResponse {
  job: Job
}
