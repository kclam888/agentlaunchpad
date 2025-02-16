import { Bot, Activity, Workflow } from 'lucide-react'
import { StatCard } from '@/components/dashboard/StatCard'
import { ActivityChart } from '@/components/dashboard/ActivityChart'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Active Agents"
          value={12}
          icon={<Bot className="w-5 h-5" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Total Tasks"
          value={156}
          icon={<Activity className="w-5 h-5" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Active Workflows"
          value={5}
          icon={<Workflow className="w-5 h-5" />}
          trend={{ value: 2, isPositive: false }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ActivityChart period="7d" />
        </div>
        <div>
          <ActivityFeed />
        </div>
      </div>
    </div>
  )
} 