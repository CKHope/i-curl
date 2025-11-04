'use client'

import { Trash2, BookOpen, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { SavedRequest } from '../types'

interface SavedRequestsProps {
  savedRequests: SavedRequest[]
  onSelect: (request: SavedRequest) => void
  onDelete: (id: string) => void
}

export function SavedRequests({ savedRequests, onSelect, onDelete }: SavedRequestsProps) {
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

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this saved request?')) {
      onDelete(id)
      toast.success('Request deleted!')
    }
  }

  if (savedRequests.length === 0) {
    return (
      <div className="p-4 text-center">
        <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">No saved requests yet</p>
        <p className="text-gray-500 text-xs mt-1">Save frequently used requests for quick access</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-curl-gray">
        <h3 className="font-medium text-gray-300">Saved Requests</h3>
        <p className="text-xs text-gray-500 mt-1">{savedRequests.length} saved</p>
      </div>
      
      <div className="flex-1 overflow-auto">
        {savedRequests.map((request) => (
          <div
            key={request.id}
            className="border-b border-curl-gray/30 hover:bg-curl-gray/30 transition-colors group"
          >
            <button
              onClick={() => onSelect(request)}
              className="w-full p-3 text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-200 truncate pr-2">
                  {request.name}
                </h4>
                <div className="flex items-center space-x-1">
                  <ExternalLink className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <button
                    onClick={(e) => handleDelete(e, request.id)}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete request"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mb-2">
                <span className={`text-xs font-mono font-bold ${getMethodColor(request.request.method)}`}>
                  {request.request.method}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(request.createdAt)}
                </span>
              </div>
              
              <div className="text-xs text-gray-400 truncate">
                {request.request.url}
              </div>
              
              {request.request.headers.filter(h => h.key && h.enabled).length > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  {request.request.headers.filter(h => h.key && h.enabled).length} headers
                  {request.request.auth.type !== 'none' && ' • Auth configured'}
                </div>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}