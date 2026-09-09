import * as Sentry from '@sentry/react'
import { SENTRY_DSN } from './env'

/**
 * 业务埋点出口。
 * 配置 Sentry DSN 时上报到 Sentry，否则退化为 console.debug。
 * 调用方无需判空，也无需感知具体上报通道。
 */
export function track(event: string, payload?: Record<string, unknown>): void {
  if (SENTRY_DSN) {
    Sentry.captureEvent({ message: event, level: 'info', extra: payload })
    return
  }
  console.debug('[track]', event, payload ?? {})
}
