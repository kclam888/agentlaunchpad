import { render, screen, waitFor } from '@/lib/test-utils'
import userEvent from '@testing-library/user-event'
import { WorkflowList } from '../WorkflowList'

const mockWorkflows = [
  {
    id: '1',
    name: 'Test Workflow',
    status: 'ACTIVE',
    config: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

describe('WorkflowList', () => {
  it('renders workflows', () => {
    render(<WorkflowList initialWorkflows={mockWorkflows} />)
    expect(screen.getByText('Test Workflow')).toBeInTheDocument()
  })

  it('updates workflow on websocket message', async () => {
    render(<WorkflowList initialWorkflows={mockWorkflows} />)

    // Simulate websocket message
    const message = {
      type: 'workflow_update',
      payload: {
        ...mockWorkflows[0],
        name: 'Updated Workflow',
      },
    }

    window.dispatchEvent(
      new MessageEvent('message', {
        data: JSON.stringify(message),
      })
    )

    await waitFor(() => {
      expect(screen.getByText('Updated Workflow')).toBeInTheDocument()
    })
  })
}) 