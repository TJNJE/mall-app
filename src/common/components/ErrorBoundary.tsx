import React from 'react'
import { logger } from '@/lib/logger'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // 渲染错误上报（S4 可观测）：未配置 Sentry 时退化为 console。
    // ErrorBoundary 吞掉的错误不会自动进入 Sentry，必须显式上报（S4 review F1）
    logger.error(`[ErrorBoundary] ${error.message}`, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-24 px-5 max-w-md mx-auto">
          <h1 className="text-xl font-semibold text-gray-800 mb-3">😵 页面出了点问题</h1>
          <p className="text-sm text-gray-400 mb-6">{this.state.error?.message || '未知错误'}</p>
          <button
            className="px-8 py-3 text-base font-medium bg-primary text-white border-0 rounded-lg cursor-pointer"
            onClick={() => window.location.reload()}
          >
            刷新页面
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
