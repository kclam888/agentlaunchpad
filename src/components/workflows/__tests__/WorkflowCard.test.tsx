import { render, screen } from '@/lib/test-utils'
import userEvent from '@testing-library/user-event'
import { WorkflowCard } from '../WorkflowCard'

const mockWorkflow = {
  id: '1',
  name: 'Test Workflow',
  status: 'ACTIVE' as const,
  config: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

describe('WorkflowCard', () => {
  it('renders workflow details', () => {
    render(
      <WorkflowCard
        workflow={mockWorkflow}
        onUpdate={() => {}}
        onDelete={() => {}}
      />
    )

    expect(screen.getByText(mockWorkflow.name)).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('calls onDelete when delete button is clicked', async () => {
    const onDelete = jest.fn()
    render(
      <WorkflowCard
        workflow={mockWorkflow}
        onUpdate={() => {}}
        onDelete={onDelete}
      />
    )

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    await userEvent.click(deleteButton)

    expect(onDelete).toHaveBeenCalledWith(mockWorkflow.id)
  })
}) 