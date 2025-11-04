import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json()
    const { url, method, headers, body, auth } = requestData

    // Build headers
    const fetchHeaders: Record<string, string> = {}
    
    // Add enabled headers
    headers
      .filter((h: any) => h.key && h.enabled)
      .forEach((h: any) => {
        fetchHeaders[h.key] = h.value
      })

    // Add authentication headers
    if (auth.type === 'basic' && auth.username && auth.password) {
      const credentials = btoa(`${auth.username}:${auth.password}`)
      fetchHeaders['Authorization'] = `Basic ${credentials}`
    } else if (auth.type === 'bearer' && auth.token) {
      fetchHeaders['Authorization'] = `Bearer ${auth.token}`
    } else if (auth.type === 'apikey' && auth.token) {
      fetchHeaders['X-API-Key'] = auth.token
    }

    // Set default content-type for requests with body
    if (['POST', 'PUT', 'PATCH'].includes(method) && body && !fetchHeaders['Content-Type']) {
      fetchHeaders['Content-Type'] = 'application/json'
    }

    // Make the request
    const startTime = Date.now()
    const response = await fetch(url, {
      method,
      headers: fetchHeaders,
      body: ['POST', 'PUT', 'PATCH'].includes(method) ? body : undefined,
    })
    const endTime = Date.now()

    // Get response data
    const responseHeaders: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })

    let responseData
    const contentType = response.headers.get('content-type') || ''
    
    try {
      if (contentType.includes('application/json')) {
        responseData = await response.json()
      } else {
        responseData = await response.text()
      }
    } catch {
      responseData = await response.text()
    }

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      data: responseData,
      duration: endTime - startTime,
    })
  } catch (error: any) {
    console.error('Proxy request failed:', error)
    
    return NextResponse.json(
      {
        status: 0,
        statusText: 'Network Error',
        headers: {},
        data: { error: error.message || 'Request failed' },
        duration: 0,
      },
      { status: 500 }
    )
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    },
  })
}