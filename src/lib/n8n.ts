import { Agent } from '@prisma/client'

interface N8nWorkflow {
  id?: number
  name: string
  active: boolean
  nodes: any[]
  connections: any
}

interface WebhookPayload {
  workflowId: string
  event: string
  timestamp: string
  data: any
}

export class N8nClient {
  private baseUrl: string
  private apiKey: string

  constructor() {
    this.baseUrl = process.env.N8N_API_URL || ''
    this.apiKey = process.env.N8N_API_KEY || ''
  }

  private async fetch(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'X-N8N-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`N8N API error: ${response.statusText}`)
    }

    return response.json()
  }

  async createWorkflow(agent: Agent) {
    const workflow: N8nWorkflow = {
      name: `${agent.name} Workflow`,
      active: true,
      nodes: [
        // Configure nodes based on agent type and config
        {
          type: 'n8n-nodes-base.webhook',
          position: [100, 300],
          parameters: {
            path: `/webhook/${agent.id}`,
            options: {},
          },
        },
        // Add more nodes based on agent configuration
      ],
      connections: {
        // Configure node connections
      },
    }

    return this.fetch('/workflows', {
      method: 'POST',
      body: JSON.stringify(workflow),
    })
  }

  async getWorkflow(workflowId: number) {
    return this.fetch(`/workflows/${workflowId}`)
  }

  async updateWorkflow(workflowId: number, data: Partial<N8nWorkflow>) {
    return this.fetch(`/workflows/${workflowId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteWorkflow(workflowId: number) {
    return this.fetch(`/workflows/${workflowId}`, {
      method: 'DELETE',
    })
  }

  async activateWorkflow(workflowId: number) {
    return this.fetch(`/workflows/${workflowId}/activate`, {
      method: 'POST',
    })
  }

  async deactivateWorkflow(workflowId: number) {
    return this.fetch(`/workflows/${workflowId}/deactivate`, {
      method: 'POST',
    })
  }
}

export const n8nClient = new N8nClient()

export async function sendWebhook(url: string, payload: WebhookPayload) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.statusText}`)
    }

    return true
  } catch (error) {
    console.error('Webhook error:', error)
    return false
  }
}

export function validateWebhookUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.hostname === 'localhost'
  } catch {
    return false
  }
} 