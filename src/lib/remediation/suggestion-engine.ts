import { TrendAnalysis } from '../analysis/trend-analyzer'
import { FailurePattern } from '../analysis/failure-analyzer'
import { getSystemMetrics } from '../monitoring'

interface RemediationSuggestion {
  priority: 'high' | 'medium' | 'low'
  category: 'infrastructure' | 'application' | 'process'
  action: string
  impact: string
  effort: 'small' | 'medium' | 'large'
  automatable: boolean
  automationScript?: string
}

export async function generateRemediationSuggestions(
  trends: TrendAnalysis[],
  failures: FailurePattern[]
): Promise<RemediationSuggestion[]> {
  const systemMetrics = await getSystemMetrics()
  const suggestions: RemediationSuggestion[] = []

  // Analyze trends for systemic issues
  for (const trend of trends) {
    if (trend.trend === 'degrading') {
      suggestions.push(...generateTrendBasedSuggestions(trend, systemMetrics))
    }
  }

  // Analyze specific failure patterns
  for (const failure of failures) {
    suggestions.push(...generateFailureBasedSuggestions(failure))
  }

  // Prioritize suggestions
  return prioritizeSuggestions(suggestions)
}

function generateTrendBasedSuggestions(
  trend: TrendAnalysis,
  metrics: any
): RemediationSuggestion[] {
  const suggestions: RemediationSuggestion[] = []

  if (trend.metrics.recoveryTimeChange > 10) {
    suggestions.push({
      priority: 'high',
      category: 'infrastructure',
      action: 'Increase resource allocation',
      impact: 'Improve recovery time by allocating more resources',
      effort: 'small',
      automatable: true,
      automationScript: generateResourceScalingScript(trend.scenario)
    })
  }

  if (trend.seasonalPatterns.timeOfDay?.length > 0) {
    suggestions.push({
      priority: 'medium',
      category: 'infrastructure',
      action: 'Implement predictive scaling',
      impact: 'Prevent failures during high-load periods',
      effort: 'medium',
      automatable: true,
      automationScript: generatePredictiveScalingScript(trend.seasonalPatterns)
    })
  }

  return suggestions
}

function generateFailureBasedSuggestions(
  failure: FailurePattern
): RemediationSuggestion[] {
  const suggestions: RemediationSuggestion[] = []

  if (failure.failureRate > 20) {
    suggestions.push({
      priority: 'high',
      category: 'application',
      action: 'Implement circuit breaker pattern',
      impact: 'Prevent cascading failures',
      effort: 'medium',
      automatable: true,
      automationScript: generateCircuitBreakerScript(failure.scenario)
    })
  }

  return suggestions
}

function prioritizeSuggestions(
  suggestions: RemediationSuggestion[]
): RemediationSuggestion[] {
  return suggestions.sort((a, b) => {
    const priorityScore = { high: 3, medium: 2, low: 1 }
    const effortScore = { small: 3, medium: 2, large: 1 }
    
    const scoreA = priorityScore[a.priority] * effortScore[a.effort]
    const scoreB = priorityScore[b.priority] * effortScore[b.effort]
    
    return scoreB - scoreA
  })
} 