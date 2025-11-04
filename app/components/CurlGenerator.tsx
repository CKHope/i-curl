'use client'

import { useState } from 'react'
import { Copy, X, Code } from 'lucide-react'
import toast from 'react-hot-toast'
import { RequestData } from '../types'

interface CurlGeneratorProps {
  requestData: RequestData
  onClose: () => void
}

export function CurlGenerator({ requestData, onClose }: CurlGeneratorProps) {
  const [copyButtonText, setCopyButtonText] = useState('Copy')

  const generateCurlCommand = () => {
    const parts: string[] = ['curl']
    
    // Add method
    if (requestData.method !== 'GET') {
      parts.push(`-X ${requestData.method}`)
    }
    
    // Add headers
    const enabledHeaders = requestData.headers.filter(h => h.key && h.enabled)
    enabledHeaders.forEach(header => {
      parts.push(`-H "${header.key}: ${header.value}"`)
    })
    
    // Add authentication
    if (requestData.auth.type === 'basic' && requestData.auth.username && requestData.auth.password) {
      parts.push(`-u "${requestData.auth.username}:${requestData.auth.password}"`)
    } else if (requestData.auth.type === 'bearer' && requestData.auth.token) {
      parts.push(`-H "Authorization: Bearer ${requestData.auth.token}"`)
    } else if (requestData.auth.type === 'apikey' && requestData.auth.token) {
      parts.push(`-H "X-API-Key: ${requestData.auth.token}"`)
    }
    
    // Add body for applicable methods
    if (['POST', 'PUT', 'PATCH'].includes(requestData.method) && requestData.body) {
      // Try to format as JSON if possible
      try {
        const jsonBody = JSON.parse(requestData.body)
        parts.push(`-d '${JSON.stringify(jsonBody)}'`)
        // Add content-type header if not already present
        const hasContentType = enabledHeaders.some(h => 
          h.key.toLowerCase() === 'content-type'
        )
        if (!hasContentType) {
          parts.push(`-H "Content-Type: application/json"`)
        }
      } catch {
        // Not JSON, add as-is
        parts.push(`-d '${requestData.body.replace(/'/g, "'\"'\"'")}'`)
      }
    }
    
    // Add URL (always last)
    parts.push(`"${requestData.url}"`)
    
    return parts.join(' \\\n  ')
  }

  const curlCommand = generateCurlCommand()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(curlCommand)
    setCopyButtonText('Copied!')
    toast.success('curl command copied to clipboard!')
    
    setTimeout(() => {
      setCopyButtonText('Copy')
    }, 2000)
  }

  return (
    <div className="bg-curl-gray rounded-lg border border-gray-600">
      <div className="flex items-center justify-between p-4 border-b border-gray-600">
        <div className="flex items-center space-x-2">
          <Code className="w-4 h-4 text-curl-blue" />
          <h3 className="font-medium text-gray-200">Generated curl Command</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={copyToClipboard}
            className="px-3 py-1 text-sm bg-curl-blue hover:bg-blue-600 rounded transition-colors flex items-center space-x-1"
          >
            <Copy className="w-3 h-3" />
            <span>{copyButtonText}</span>
          </button>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <pre className="bg-curl-dark rounded p-3 text-sm font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap break-all">
          {curlCommand}
        </pre>
        
        <div className="mt-3 text-xs text-gray-500">
          <p>💡 This command can be run in any terminal that has curl installed.</p>
          <p className="mt-1">You can also import this into tools like Postman or Insomnia.</p>
        </div>
      </div>
    </div>
  )
}