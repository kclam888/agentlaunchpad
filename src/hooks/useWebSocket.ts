import { useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth' // We'll create this later

interface WebSocketMessage {
  type: string
  data: any
}

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null)
  const { token } = useAuth()

  const connect = useCallback(() => {
    if (!token) return

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/api/ws?token=${token}`
    ws.current = new WebSocket(wsUrl)

    ws.current.onopen = () => {
      console.log('WebSocket connected')
    }

    ws.current.onclose = () => {
      console.log('WebSocket disconnected')
      // Attempt to reconnect after 5 seconds
      setTimeout(connect, 5000)
    }

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }, [token])

  useEffect(() => {
    connect()
    return () => {
      ws.current?.close()
    }
  }, [connect])

  const subscribe = useCallback((callback: (message: WebSocketMessage) => void) => {
    if (!ws.current) return

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data)
      callback(message)
    }
  }, [])

  return { subscribe }
} 