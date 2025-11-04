'use client'

import { Trash2, Clock, ExternalLink } from 'lucide-react'
import { HistoryItem } from '../types'

interface RequestHistoryProps {
  history: HistoryItem[]
  onSelect: (item: HistoryItem) => void
  onClear: () => void
}

export function RequestHistory({ history, onSelect, onClear }: RequestHistoryProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const today = new Date()
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    }
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    }
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-400'
    if (status >= 300 && status < 400) return 'text-yellow-400'
    if (status >= 400 && status < 500) return 'text-orange-400'
    if (status >= 500) return 'text-red-400'
    return 'text-gray-400'
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'text-green-400'
      case 'POST': return 'text-blue-400'
      case 'PUT': return 'text-yellow-400'
      case 'DELETE': return 'text-red-400'
      case 'PATCH': return 'text-purple-400'
      default: return 'text-gray-400'
    }
  }

  if (history.length === 0) {
    return (
      <div className="p-4 text-center">
        <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">No request history yet</p>
        <p className="text-gray-500 text-xs mt-1">Your sent requests will appear here</p>
      </div>
    )
  }

  // Group by date
  const groupedHistory = history.reduce((groups, item) => {
    const date = formatDate(item.timestamp)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(item)
    return groups
  }, {} as Record<string, HistoryItem[]>)

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-curl-gray flex items-center justify-between">
        <h3 className="font-medium text-gray-300">Request History</h3>
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
            title="Clear all history"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <div className="flex-1 overflow-auto">
        {Object.entries(groupedHistory).map(([date, items]) => (
          <div key={date}>
            <div className="sticky top-0 bg-curl-dark/90 backdrop-blur px-4 py-2 border-b border-curl-gray/50">
              <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                {date}
              </h4>
            </div>
            
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className="w-full p-3 text-left hover:bg-curl-gray/30 border-b border-curl-gray/30 transition-colors group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-mono font-bold ${getMethodColor(item.request.method)}`}>
                      {item.request.method}
                    </span>
                    <span className={`text-xs font-mono ${getStatusColor(item.response.status)}`}>
                      {item.response.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>{formatTime(item.timestamp)}</span>
                    <span>{item.response.duration}ms</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                
                <div className="text-sm text-gray-300 truncate">
                  {item.request.url}
                </div>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}