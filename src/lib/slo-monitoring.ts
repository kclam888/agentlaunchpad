import { prisma } from './prisma'
import { captureError } from './monitoring'

interface SLO {
  name: string
  target: number // percentage
  window: number // hours
  metric: string
  query: string
}

interface SLOResult {
  name: string
  current: number
  target: number
  status: 'healthy' | 'warning' | 'breached'
  burnRate: number
  errorBudget: number
}

interface MetricResult {
  value: number
  timestamp: number
}

const SLOs: SLO[] = [
  {
    name: 'API Availability',
    target: 99.9,
    window: 24,
    metric: 'http_requests_total',
    query: 'sum(rate(http_requests_total{status!~"5.."}[1h])) / sum(rate(http_requests_total[1h])) * 100'
  },
  {
    name: 'Latency P95',
    target: 99,
    window: 24,
    metric: 'http_request_duration_seconds',
    query: 'histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[1h])) by (le)) <= 0.5'
  },
  {
    name: 'Successful Workflows',
    target: 99.5,
    window: 24,
    metric: 'workflow_executions_total',
    query: 'sum(rate(workflow_executions_total{status="success"}[1h])) / sum(rate(workflow_executions_total[1h])) * 100'
  }
]

export async function checkSLOs(): Promise<SLOResult[]> {
  try {
    const results = await Promise.all(SLOs.map(evaluateSLO))
    await storeSLOResults(results)
    return results
  } catch (error) {
    captureError(error as Error, { context: 'slo-monitoring' })
    throw error
  }
}

async function evaluateSLO(slo: SLO): Promise<SLOResult> {
  // Implementation for evaluating each SLO
  // This would typically query Prometheus/CloudWatch for the metrics
  const current = await queryMetric(slo.query)
  const burnRate = calculateBurnRate(current, slo.target)
  const errorBudget = calculateErrorBudget(current, slo.target)

  return {
    name: slo.name,
    current: current.value,
    target: slo.target,
    status: getStatus(current.value, slo.target),
    burnRate,
    errorBudget
  }
}

function getStatus(current: number, target: number): SLOResult['status'] {
  if (current >= target) return 'healthy'
  if (current >= target - 1) return 'warning'
  return 'breached'
}

async function queryMetric(query: string): Promise<MetricResult> {
  // Implementation would connect to your metrics system
  // This is a placeholder that returns mock data
  return {
    value: Math.random() * 100,
    timestamp: Date.now()
  }
}

function calculateBurnRate(current: MetricResult, target: number): number {
  return (target - current.value) / target
}

function calculateErrorBudget(current: MetricResult, target: number): number {
  return target - current.value
}

async function storeSLOResults(results: SLOResult[]) {
  await prisma.sloMetrics.createMany({
    data: results.map(result => ({
      name: result.name,
      current: result.current,
      target: result.target,
      status: result.status,
      burnRate: result.burnRate,
      errorBudget: result.errorBudget,
      timestamp: new Date()
    }))
  })
} 