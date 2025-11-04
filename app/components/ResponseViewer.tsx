'use client'

import { useState } from 'react'
import { Copy, Trash2, Download, Eye, Code } from 'lucide-react'
import toast from 'react-hot-toast'
import { ResponseData } from '../types'

interface ResponseViewerProps {
  responseData: ResponseData | null
  isLoading: boolean
  onClear: () => void
}

export function ResponseViewer({ responseData, isLoading, onClear }: ResponseViewerProps) {
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body')
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted')

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-400'
    if (status >= 300 && status < 400) return 'text-yellow-400'
    if (status >= 400 && status < 500) return 'text-orange-400'
    if (status >= 500) return 'text-red-400'
    return 'text-gray-400'
  }

  const formatJson = (data: any) => {
    try {
      return JSON.stringify(data, null, 2)
    } catch {
      return String(data)
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-curl-blue mx-auto"></div>
          <p className="text-gray-400">Sending request...</p>
        </div>
      </div>
    )
  }

  if (!responseData) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-curl-gray rounded-full flex items-center justify-center mx-auto">
            <Code className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">Ready to test your API</h3>
            <p className="text-gray-400 text-sm">
              Enter a URL and click "Send Request" to see the response here.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Response Header */}
      <div className="flex items-center justify-between p-4 border-b border-curl-gray">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className={`text-lg font-mono font-bold ${getStatusColor(responseData.status)}`}>
              {responseData.status}
            </span>
            <span className="text-gray-400">{responseData.statusText}</span>
          </div>
          <div className="text-sm text-gray-400">
            {responseData.duration}ms • {formatBytes(responseData.size)}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === 'formatted' ? 'raw' : 'formatted')}
            className="px-3 py-1 text-sm bg-curl-gray hover:bg-gray-600 rounded transition-colors"
          >
            {viewMode === 'formatted' ? 'Raw' : 'Pretty'}
          </button>
          <button
            onClick={() => copyToClipboard(formatJson(responseData.data), 'Response')}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Copy response"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={onClear}
            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
            title="Clear response"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-curl-gray">
        <button
          onClick={() => setActiveTab('body')}
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'body' ? 'border-b-2 border-curl-blue text-curl-blue' : 'text-gray-400 hover:text-white'}`}
        >
          Response Body
        </button>
        <button
          onClick={() => setActiveTab('headers')}
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'headers' ? 'border-b-2 border-curl-blue text-curl-blue' : 'text-gray-400 hover:text-white'}`}
        >
          Headers ({Object.keys(responseData.headers).length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'body' && (
          <div className="p-4">
            <pre className="bg-curl-gray rounded-lg p-4 text-sm font-mono overflow-auto whitespace-pre-wrap">
              {viewMode === 'formatted' ? formatJson(responseData.data) : JSON.stringify(responseData.data)}
            </pre>
          </div>
        )}
        
        {activeTab === 'headers' && (
          <div className="p-4 space-y-2">
            {Object.entries(responseData.headers).map(([key, value]) => (
              <div key={key} className="flex items-start space-x-3 py-2 border-b border-gray-700 last:border-b-0">
                <span className="font-mono text-sm text-curl-blue min-w-0">{key}:</span>
                <span className="font-mono text-sm text-gray-300 break-all">{value}</span>
                <button
                  onClick={() => copyToClipboard(value, `Header ${key}`)}
                  className="p-1 text-gray-400 hover:text-white transition-colors flex-shrink-0"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}