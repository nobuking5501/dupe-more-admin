// 共通の型定義

export interface BlogPost {
  id: string
  title: string
  content: string
  excerpt: string
  status: 'draft' | 'published'
  authorId: string
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
  tags: string[]
  imageUrl?: string
}

export interface DailyReport {
  id: string
  staffId: string
  date: Date
  content: string
  createdAt: Date
}

export interface Staff {
  id: string
  name: string
  email: string
  role: 'admin' | 'staff'
  createdAt: Date
}

export interface Event {
  id: string
  title: string
  description: string
  date: Date
  status: 'draft' | 'published'
  createdAt: Date
  updatedAt: Date
}

export interface News {
  id: string
  title: string
  content: string
  status: 'draft' | 'published'
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}

// API レスポンス型
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Claude API関連
export interface ClaudeGenerationRequest {
  dailyReport: string
  targetLength?: number
  tone?: 'professional' | 'friendly' | 'casual'
}

export interface ClaudeGenerationResponse {
  title: string
  content: string
  excerpt: string
  suggestedTags: string[]
}