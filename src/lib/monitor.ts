import * as Sentry from '@sentry/react'
import { SENTRY_DSN } from './env'
import { reportWebVitals } from './perf'
import { track } from './track'

export const isMonitorEnabled = (): boolean => Boolean(SENTRY_DSN)

/**
 * 白屏检测：load 后 1s 检查 #root 是否为空，为空则上报 blank_screen。
 * 白屏是最严重的用户可见故障，需独立信号（S4 review F2）。
 */
function detectBlankScreen(): void {
  const check = (): void => {
    const root = document.getElementById('root')
    if (!root || root.childElementCount === 0) {
      track('blank_screen', { path: window.location.pathname })
    }
  }
  window.addEventListener('load', () => setTimeout(check, 1000), { once: true })
}

/**
 * 应用启动时初始化监控。
 * - 配置了 VITE_SENTRY_DSN：启用 Sentry 错误上报与 tracing
 * - 未配置：仅 warn，错误与埋点退化为 console（保证本地开发不被阻塞）
 * Web Vitals 与白屏检测在两种情况下都注册。
 */
export function initMonitor(): void {
  if (!SENTRY_DSN) {
    console.warn('[monitor] VITE_SENTRY_DSN 未配置，Sentry 未启用（错误与埋点退化为 console）')
  } else {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: import.meta.env.MODE,
      tracesSampleRate: 0.1,
    })
  }

  // 尽早注册，避免错过 LCP / CLS 等首屏指标
  reportWebVitals()
  detectBlankScreen()
}

export { Sentry }
