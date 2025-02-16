import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { createObjectCsvWriter } from 'csv-writer'
import { format } from 'date-fns'
import fs from 'fs/promises'

export async function GET(req: Request) {
  const auth = await requireAuth(req)
  if (!auth || auth.role !== 'ADMIN') {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const simulations = await prisma.recoverySimulation.findMany({
      orderBy: { executedAt: 'desc' }
    })

    const csvWriter = createObjectCsvWriter({
      path: '/tmp/simulations.csv',
      header: [
        { id: 'scenario', title: 'Scenario' },
        { id: 'success', title: 'Success' },
        { id: 'duration', title: 'Duration (ms)' },
        { id: 'executedAt', title: 'Executed At' },
        { id: 'completedSteps', title: 'Completed Steps' },
        { id: 'totalSteps', title: 'Total Steps' },
        { id: 'successRate', title: 'Success Rate (%)' }
      ]
    })

    await csvWriter.writeRecords(simulations.map(sim => ({
      ...sim,
      executedAt: format(new Date(sim.executedAt), 'yyyy-MM-dd HH:mm:ss'),
      ...sim.details
    })))

    const file = await fs.readFile('/tmp/simulations.csv')
    
    return new NextResponse(file, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=simulations-${format(new Date(), 'yyyy-MM-dd')}.csv`
      }
    })
  } catch (error) {
    console.error('Failed to export simulations:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 