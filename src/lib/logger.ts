import * as Sentry from '@sentry/react'
import { SENTRY_DSN } from './env'

/**
 * 统一日志出口：开发与生产使用同一入口，
 * error 级别在启用 Sentry 时额外上报异常，便于线上排查。
 */
export const logger = {
  debug(message: string, ...args: unknown[]): void {
    console.debug(`[debug] ${message}`, ...args)
  },
  info(message: string, ...args: unknown[]): void {
    console.info(`[info] ${message}`, ...args)
  },
  warn(message: string, ...args: unknown[]): void {
    console.warn(`[warn] ${message}`, ...args)
  },
  error(message: string, ...args: unknown[]): void {
    console.error(`[error] ${message}`, ...args)
    if (SENTRY_DSN) Sentry.captureException(new Error(message))
  },
}
