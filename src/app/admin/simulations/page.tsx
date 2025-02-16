import { useState } from 'react'
import { Button, Card, Table, Tag, Timeline } from '@/components/ui'
import { runRecoverySimulation } from '@/lib/recovery-simulator'
import { useToast } from '@/hooks/useToast'

export default function SimulationsPage() {
  const [running, setRunning] = useState(false)
  const [selectedScenario, setSelectedScenario] = useState('')
  const { showToast } = useToast()

  const handleRunSimulation = async () => {
    try {
      setRunning(true)
      const success = await runRecoverySimulation(selectedScenario)
      showToast({
        title: success ? 'Simulation Successful' : 'Simulation Failed',
        type: success ? 'success' : 'error'
      })
    } catch (error) {
      showToast({
        title: 'Simulation Error',
        message: error.message,
        type: 'error'
      })
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Recovery Simulations</h1>
      
      <Card className="mb-6">
        <h2 className="text-xl mb-4">Run Simulation</h2>
        <div className="flex gap-4 mb-4">
          <select 
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value)}
            className="form-select"
          >
            <option value="">Select Scenario</option>
            <option value="database-failure">Database Failure</option>
            <option value="memory-pressure">Memory Pressure</option>
          </select>
          <Button 
            onClick={handleRunSimulation}
            loading={running}
            disabled={!selectedScenario || running}
          >
            Run Simulation
          </Button>
        </div>
      </Card>

      <SimulationHistory />
    </div>
  )
}

function SimulationHistory() {
  const { data: simulations } = useSWR('/api/admin/simulations', fetcher)

  return (
    <Card>
      <h2 className="text-xl mb-4">Simulation History</h2>
      <Table>
        <thead>
          <tr>
            <th>Scenario</th>
            <th>Status</th>
            <th>Duration</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {simulations?.map((sim) => (
            <tr key={sim.id}>
              <td>{sim.scenario}</td>
              <td>
                <Tag
                  color={sim.success ? 'green' : 'red'}
                >
                  {sim.success ? 'Success' : 'Failed'}
                </Tag>
              </td>
              <td>{formatDuration(sim.details.duration)}</td>
              <td>{formatDate(sim.executedAt)}</td>
              <td>
                <Button
                  size="small"
                  onClick={() => viewDetails(sim)}
                >
                  View Details
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  )
}

function SimulationDetails({ simulation }) {
  return (
    <div className="space-y-6">
      <Timeline>
        {simulation.details.steps.map((step, index) => (
          <Timeline.Item
            key={index}
            title={step.name}
            status={step.success ? 'success' : 'error'}
            description={step.details}
          />
        ))}
      </Timeline>

      <Card>
        <h3 className="text-lg mb-4">Metrics</h3>
        <div className="grid grid-cols-3 gap-4">
          <MetricCard
            title="Recovery Time"
            value={formatDuration(simulation.details.duration)}
          />
          <MetricCard
            title="Steps Completed"
            value={`${simulation.details.completedSteps}/${simulation.details.totalSteps}`}
          />
          <MetricCard
            title="Success Rate"
            value={`${simulation.details.successRate}%`}
          />
        </div>
      </Card>
    </div>
  )
}

function MetricCard({ title, value }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
} 