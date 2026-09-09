import { track } from './track'

/**
 * 采集核心 Web Vitals：FCP / LCP / CLS。
 * 使用 buffered: true 以便捕获注册前已经产生的指标。
 */
export function reportWebVitals(): void {
  if (typeof PerformanceObserver === 'undefined') return

  // FCP
  try {
    const fcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          track('web_vitals', { metric: 'FCP', value: Math.round(entry.startTime) })
        }
      }
    })
    fcpObserver.observe({ type: 'paint', buffered: true })
  } catch {
    console.warn('[perf] paint observer unsupported')
  }

  // LCP
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const last = entries[entries.length - 1]
      if (last) track('web_vitals', { metric: 'LCP', value: Math.round(last.startTime) })
    })
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
  } catch {
    console.warn('[perf] largest-contentful-paint observer unsupported')
  }

  // CLS（累加非用户交互引起的布局偏移）
  try {
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number }
        if (!shift.hadRecentInput) clsValue += shift.value ?? 0
      }
    })
    clsObserver.observe({ type: 'layout-shift', buffered: true })

    // CLS 是会话累计值：仅在页面隐藏/卸载时上报一次最终值，
    // 避免偏移过程中产生多条中间态埋点（S4 review F3）
    const reportCLS = (): void => {
      track('web_vitals', { metric: 'CLS', value: Number(clsValue.toFixed(4)) })
    }
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') reportCLS()
    })
    window.addEventListener('pagehide', reportCLS, { once: true })
  } catch {
    console.warn('[perf] layout-shift observer unsupported')
  }
}
