'use client'

import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <div className="bg-[#1A1721] rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-400 text-sm">{title}</span>
        <div className="text-gray-400">{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-2xl font-semibold text-white">{value}</div>
        {trend && (
          <div className={`text-sm ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </div>
  )
} 