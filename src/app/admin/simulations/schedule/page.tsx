import { useState } from 'react'
import { Button, Card, Form, Input, Select, TimePicker } from '@/components/ui'
import { useToast } from '@/hooks/useToast'

export default function SimulationSchedulePage() {
  const [schedule, setSchedule] = useState({
    scenario: '',
    frequency: 'daily',
    time: '',
    notifyEmail: '',
    retryCount: 3
  })

  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/admin/simulations/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule)
      })

      if (!response.ok) throw new Error('Failed to schedule simulation')

      showToast({
        title: 'Schedule Created',
        type: 'success'
      })
    } catch (error) {
      showToast({
        title: 'Error',
        message: error.message,
        type: 'error'
      })
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Schedule Simulations</h1>

      <Card>
        <Form onSubmit={handleSubmit}>
          <Form.Item label="Scenario">
            <Select
              value={schedule.scenario}
              onChange={(value) => setSchedule({ ...schedule, scenario: value })}
              options={[
                { label: 'Database Failure', value: 'database-failure' },
                { label: 'Memory Pressure', value: 'memory-pressure' }
              ]}
            />
          </Form.Item>

          <Form.Item label="Frequency">
            <Select
              value={schedule.frequency}
              onChange={(value) => setSchedule({ ...schedule, frequency: value })}
              options={[
                { label: 'Daily', value: 'daily' },
                { label: 'Weekly', value: 'weekly' },
                { label: 'Monthly', value: 'monthly' }
              ]}
            />
          </Form.Item>

          <Form.Item label="Time">
            <TimePicker
              value={schedule.time}
              onChange={(value) => setSchedule({ ...schedule, time: value })}
              format="HH:mm"
            />
          </Form.Item>

          <Form.Item label="Notification Email">
            <Input
              type="email"
              value={schedule.notifyEmail}
              onChange={(e) => setSchedule({ ...schedule, notifyEmail: e.target.value })}
            />
          </Form.Item>

          <Form.Item label="Retry Count">
            <Input
              type="number"
              value={schedule.retryCount}
              onChange={(e) => setSchedule({ ...schedule, retryCount: parseInt(e.target.value) })}
              min={0}
              max={5}
            />
          </Form.Item>

          <Button type="submit">Create Schedule</Button>
        </Form>
      </Card>
    </div>
  )
} 