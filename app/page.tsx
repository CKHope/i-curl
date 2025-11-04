'use client'

import { useState, useEffect } from 'react'
import { Send, Copy, Trash2, Save, Settings, Clock, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import { RequestForm } from './components/RequestForm'
import { ResponseViewer } from './components/ResponseViewer'
import { RequestHistory } from './components/RequestHistory'
import { SavedRequests } from './components/SavedRequests'
import { CurlGenerator } from './components/CurlGenerator'
import { RequestData, ResponseData, HistoryItem, SavedRequest } from './types'

const initialRequestData: RequestData = {
  url: '',
  method: 'GET',
  headers: [{ key: '', value: '', enabled: true }],
  body: '',
  auth: {
    type: 'none',
    username: '',
    password: '',
    token: ''
  }
}

export default function Home() {
  const [requestData, setRequestData] = useState<RequestData>(initialRequestData)
  const [responseData, setResponseData] = useState<ResponseData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [savedRequests, setSavedRequests] = useState<SavedRequest[]>([])
  const [activeTab, setActiveTab] = useState<'request' | 'history' | 'saved'>('request')
  const [showCurlGenerator, setShowCurlGenerator] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('i-curl-history')
    const savedRequestsData = localStorage.getItem('i-curl-saved')
    
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
    if (savedRequestsData) {
      setSavedRequests(JSON.parse(savedRequestsData))
    }
  }, [])

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('i-curl-history', JSON.stringify(history))
  }, [history])

  useEffect(() => {
    localStorage.setItem('i-curl-saved', JSON.stringify(savedRequests))
  }, [savedRequests])

  const executeRequest = async () => {
    if (!requestData.url) {
      toast.error('Please enter a URL')
      return
    }

    setIsLoading(true)
    const startTime = Date.now()

    try {
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      const result = await response.json()
      const endTime = Date.now()
      const duration = endTime - startTime

      const responseData: ResponseData = {
        status: result.status,
        statusText: result.statusText,
        headers: result.headers,
        data: result.data,
        duration,
        size: JSON.stringify(result.data).length
      }

      setResponseData(responseData)

      // Add to history
      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        request: { ...requestData },
        response: responseData,
        timestamp: new Date().toISOString()
      }
      setHistory(prev => [historyItem, ...prev.slice(0, 49)]) // Keep last 50 items

      toast.success(`Request completed in ${duration}ms`)
    } catch (error) {
      console.error('Request failed:', error)
      toast.error('Request failed: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const saveRequest = () => {
    if (!requestData.url) {
      toast.error('Please enter a URL before saving')
      return
    }

    const name = prompt('Enter a name for this request:')
    if (!name) return

    const savedRequest: SavedRequest = {
      id: Date.now().toString(),
      name,
      request: { ...requestData },
      createdAt: new Date().toISOString()
    }

    setSavedRequests(prev => [savedRequest, ...prev])
    toast.success('Request saved!')
  }

  const loadSavedRequest = (savedRequest: SavedRequest) => {
    setRequestData({ ...savedRequest.request })
    setActiveTab('request')
    toast.success('Request loaded!')
  }

  const loadHistoryItem = (historyItem: HistoryItem) => {
    setRequestData({ ...historyItem.request })
    setResponseData({ ...historyItem.response })
    setActiveTab('request')
    toast.success('Request loaded from history!')
  }

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all history?')) {
      setHistory([])
      toast.success('History cleared!')
    }
  }

  const clearResponse = () => {
    setResponseData(null)
  }

  return (
    <div className="min-h-screen bg-curl-dark text-white">
      {/* Header */}
      <header className="border-b border-curl-gray bg-curl-dark/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-curl-blue rounded-lg flex items-center justify-center">
                <Send className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold">i-curl</h1>
              <span className="text-sm text-gray-400">Modern API Testing Tool</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowCurlGenerator(!showCurlGenerator)}
                className="px-3 py-2 text-sm bg-curl-gray hover:bg-gray-600 rounded-lg transition-colors"
              >
                Generate curl
              </button>
              <button
                onClick={saveRequest}
                disabled={!requestData.url}
                className="px-3 py-2 text-sm bg-curl-blue hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center space-x-1"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <div className="w-80 border-r border-curl-gray bg-curl-dark/30">
          <div className="flex border-b border-curl-gray">
            <button
              onClick={() => setActiveTab('request')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'request' ? 'border-b-2 border-curl-blue text-curl-blue' : 'text-gray-400 hover:text-white'}`}
            >
              Request
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center space-x-1 ${activeTab === 'history' ? 'border-b-2 border-curl-blue text-curl-blue' : 'text-gray-400 hover:text-white'}`}
            >
              <Clock className="w-4 h-4" />
              <span>History</span>
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center space-x-1 ${activeTab === 'saved' ? 'border-b-2 border-curl-blue text-curl-blue' : 'text-gray-400 hover:text-white'}`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Saved</span>
            </button>
          </div>

          <div className="h-full overflow-auto">
            {activeTab === 'request' && (
              <RequestForm 
                requestData={requestData}
                onChange={setRequestData}
                onExecute={executeRequest}
                isLoading={isLoading}
              />
            )}
            {activeTab === 'history' && (
              <RequestHistory 
                history={history}
                onSelect={loadHistoryItem}
                onClear={clearHistory}
              />
            )}
            {activeTab === 'saved' && (
              <SavedRequests 
                savedRequests={savedRequests}
                onSelect={loadSavedRequest}
                onDelete={(id) => setSavedRequests(prev => prev.filter(r => r.id !== id))}
              />
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Response Area */}
          <div className="flex-1 p-6">
            {showCurlGenerator && (
              <div className="mb-6">
                <CurlGenerator 
                  requestData={requestData} 
                  onClose={() => setShowCurlGenerator(false)}
                />
              </div>
            )}
            
            <ResponseViewer 
              responseData={responseData}
              isLoading={isLoading}
              onClear={clearResponse}
            />
          </div>
        </div>
      </div>
    </div>
  )
}