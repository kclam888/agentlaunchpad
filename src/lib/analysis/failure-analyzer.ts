import { prisma } from '../prisma'
import { captureError } from '../monitoring'

interface FailurePattern {
  scenario: string
  failureRate: number
  avgRecoveryTime: number
  commonErrors: Array<{
    error: string
    count: number
  }>
  recommendations: string[]
}

export async function analyzeFailures(timeframe: 'day' | 'week' | 'month'): Promise<FailurePattern[]> {
  try {
    const startDate = getStartDate(timeframe)
    
    const simulations = await prisma.recoverySimulation.findMany({
      where: {
        executedAt: {
          gte: startDate
        }
      },
      include: {
        details: true
      }
    })

    const patterns = groupByScenario(simulations)
    return patterns.map(analyzePattern)
  } catch (error) {
    captureError(error as Error, { context: 'failure-analysis' })
    throw error
  }
}

function getStartDate(timeframe: string): Date {
  const now = new Date()
  switch (timeframe) {
    case 'day':
      return new Date(now.setDate(now.getDate() - 1))
    case 'week':
      return new Date(now.setDate(now.getDate() - 7))
    case 'month':
      return new Date(now.setMonth(now.getMonth() - 1))
    default:
      throw new Error('Invalid timeframe')
  }
}

function analyzePattern(group: any): FailurePattern {
  const totalRuns = group.simulations.length
  const failures = group.simulations.filter(s => !s.success)
  
  const errors = failures.reduce((acc, f) => {
    f.details.errors.forEach(e => {
      acc[e] = (acc[e] || 0) + 1
    })
    return acc
  }, {})

  const recommendations = generateRecommendations(group.scenario, errors)

  return {
    scenario: group.scenario,
    failureRate: (failures.length / totalRuns) * 100,
    avgRecoveryTime: calculateAverageRecoveryTime(group.simulations),
    commonErrors: Object.entries(errors)
      .map(([error, count]) => ({ error, count: count as number }))
      .sort((a, b) => b.count - a.count),
    recommendations
  }
}

function generateRecommendations(scenario: string, errors: Record<string, number>): string[] {
  const recommendations: string[] = []
  
  // Scenario-specific recommendations
  switch (scenario) {
    case 'database-failure':
      if (errors['connection_timeout']) {
        recommendations.push('Consider increasing database connection timeout')
      }
      if (errors['max_connections']) {
        recommendations.push('Review and possibly increase connection pool size')
      }
      break
      
    case 'memory-pressure':
      if (errors['oom_kill']) {
        recommendations.push('Consider increasing container memory limits')
        recommendations.push('Implement memory leak detection')
      }
      break
  }

  // General recommendations
  if (Object.keys(errors).length > 3) {
    recommendations.push('Implement more granular error monitoring')
  }

  return recommendations
}

function calculateAverageRecoveryTime(simulations: any[]): number {
  const successfulRecoveries = simulations.filter(s => s.success)
  if (successfulRecoveries.length === 0) return 0
  
  const totalTime = successfulRecoveries.reduce((sum, s) => sum + s.details.duration, 0)
  return totalTime / successfulRecoveries.length
} 