'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface ChartData {
  date: string
  SUCCESS: number
  ERROR: number
  IN_PROGRESS: number
}

interface ActivityChartProps {
  period: '24h' | '7d' | '30d'
}

export function ActivityChart({ period }: ActivityChartProps) {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/analytics/charts?period=${period}`)
        const json = await response.json()
        setData(json.data)
      } catch (error) {
        console.error('Error fetching chart data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [period])

  if (loading) {
    return <div className="h-80 bg-[#1A1721] rounded-lg animate-pulse" />
  }

  return (
    <div className="bg-[#1A1721] rounded-lg p-6">
      <h3 className="text-white text-lg mb-6">Activity Overview</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis 
              dataKey="date" 
              stroke="#8A8F98"
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis stroke="#8A8F98" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1A1721',
                border: 'none',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="SUCCESS" fill="#2D7FF9" stackId="a" />
            <Bar dataKey="ERROR" fill="#EF4444" stackId="a" />
            <Bar dataKey="IN_PROGRESS" fill="#8A8F98" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
} 