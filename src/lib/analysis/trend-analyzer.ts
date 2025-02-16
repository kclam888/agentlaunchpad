import { prisma } from '../prisma'
import { captureError } from '../monitoring'

interface TrendAnalysis {
  scenario: string
  trend: 'improving' | 'stable' | 'degrading'
  confidence: number
  metrics: {
    recoveryTimeChange: number // percentage
    successRateChange: number
    failurePatternChange: string[]
  }
  seasonalPatterns: {
    timeOfDay?: string[]
    dayOfWeek?: string[]
    monthlyPatterns?: string[]
  }
}

export async function analyzeTrends(timeframe: 'week' | 'month' | 'quarter'): Promise<TrendAnalysis[]> {
  try {
    const simulations = await fetchSimulationData(timeframe)
    const groupedData = groupByScenario(simulations)
    
    return Object.entries(groupedData).map(([scenario, data]) => ({
      scenario,
      ...analyzeScenarioTrend(data),
      seasonalPatterns: findSeasonalPatterns(data)
    }))
  } catch (error) {
    captureError(error as Error, { context: 'trend-analysis' })
    throw error
  }
}

function analyzeScenarioTrend(data: any[]): Omit<TrendAnalysis, 'scenario' | 'seasonalPatterns'> {
  const periods = splitIntoPeriods(data)
  const metrics = calculateMetricChanges(periods)
  
  return {
    trend: determineTrend(metrics),
    confidence: calculateConfidence(metrics),
    metrics
  }
}

function calculateMetricChanges(periods: any[]) {
  const [current, previous] = periods
  
  return {
    recoveryTimeChange: calculatePercentageChange(
      averageRecoveryTime(current),
      averageRecoveryTime(previous)
    ),
    successRateChange: calculatePercentageChange(
      successRate(current),
      successRate(previous)
    ),
    failurePatternChange: compareFailurePatterns(current, previous)
  }
}

function determineTrend(metrics: any): TrendAnalysis['trend'] {
  const score = calculateTrendScore(metrics)
  if (score > 0.1) return 'improving'
  if (score < -0.1) return 'degrading'
  return 'stable'
}

function calculateTrendScore(metrics: any): number {
  return (
    normalizeMetric(metrics.successRateChange) * 0.4 +
    normalizeMetric(-metrics.recoveryTimeChange) * 0.4 +
    normalizeMetric(-metrics.failurePatternChange.length) * 0.2
  )
}

function findSeasonalPatterns(data: any[]): TrendAnalysis['seasonalPatterns'] {
  return {
    timeOfDay: analyzeTimeOfDayPatterns(data),
    dayOfWeek: analyzeDayOfWeekPatterns(data),
    monthlyPatterns: analyzeMonthlyPatterns(data)
  }
}

function analyzeTimeOfDayPatterns(data: any[]): string[] {
  const hourlyStats = groupByHour(data)
  return findSignificantPatterns(hourlyStats)
}

function analyzeDayOfWeekPatterns(data: any[]): string[] {
  const dailyStats = groupByDayOfWeek(data)
  return findSignificantPatterns(dailyStats)
}

function analyzeMonthlyPatterns(data: any[]): string[] {
  const monthlyStats = groupByMonth(data)
  return findSignificantPatterns(monthlyStats)
}

function findSignificantPatterns(stats: Record<string, any>): string[] {
  const mean = calculateMean(Object.values(stats))
  const stdDev = calculateStdDev(Object.values(stats), mean)
  
  return Object.entries(stats)
    .filter(([_, value]) => Math.abs(value - mean) > stdDev * 2)
    .map(([key, value]) => {
      const direction = value > mean ? 'higher' : 'lower'
      return `${direction} failure rate during ${key}`
    })
}

// Helper functions
function calculateMean(values: number[]): number {
  return values.reduce((sum, val) => sum + val, 0) / values.length
}

function calculateStdDev(values: number[], mean: number): number {
  const squareDiffs = values.map(value => Math.pow(value - mean, 2))
  return Math.sqrt(calculateMean(squareDiffs))
}

function normalizeMetric(value: number): number {
  return Math.tanh(value / 100) // Normalize to [-1, 1]
}

function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
} 