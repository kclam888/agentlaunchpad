import { WebSocket, WebSocketServer } from 'ws'
import { Server } from 'http'

interface WebSocketMessage {
  type: string
  payload: any
}

class WebSocketHandler {
  private wss: WebSocketServer | null = null
  private clients: Map<string, WebSocket> = new Map()

  initialize(server: Server) {
    this.wss = new WebSocketServer({ server })

    this.wss.on('connection', (ws: WebSocket) => {
      const clientId = Math.random().toString(36).substring(7)
      this.clients.set(clientId, ws)

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message) as WebSocketMessage
          this.handleMessage(clientId, data)
        } catch (error) {
          console.error('WebSocket message error:', error)
        }
      })

      ws.on('close', () => {
        this.clients.delete(clientId)
      })
    })
  }

  private handleMessage(clientId: string, message: WebSocketMessage) {
    switch (message.type) {
      case 'subscribe':
        // Handle subscription to specific events/channels
        break
      default:
        console.warn('Unknown message type:', message.type)
    }
  }

  broadcast(message: WebSocketMessage) {
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message))
      }
    })
  }

  sendToUser(userId: string, message: WebSocketMessage) {
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message))
      }
    })
  }
}

export const wsHandler = new WebSocketHandler() 