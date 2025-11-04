export interface RequestData {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'
  headers: HeaderItem[]
  body: string
  auth: {
    type: 'none' | 'basic' | 'bearer' | 'apikey'
    username: string
    password: string
    token: string
  }
}

export interface HeaderItem {
  key: string
  value: string
  enabled: boolean
}

export interface ResponseData {
  status: number
  statusText: string
  headers: Record<string, string>
  data: any
  duration: number
  size: number
}

export interface HistoryItem {
  id: string
  request: RequestData
  response: ResponseData
  timestamp: string
}

export interface SavedRequest {
  id: string
  name: string
  request: RequestData
  createdAt: string
}