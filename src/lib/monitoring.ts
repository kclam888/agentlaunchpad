import * as Sentry from '@sentry/nextjs'

export function trackPerformance(name: string, data?: Record<string, any>) {
  const transaction = Sentry.startTransaction({
    name,
    op: "performance",
    data
  })

  return {
    finish: () => transaction.finish(),
    setTag: (key: string, value: string) => transaction.setTag(key, value),
    setData: (key: string, value: any) => transaction.setData(key, value)
  }
}

export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context
  })
}

export function setUserContext(user: { id: string; email: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email
  })
} 