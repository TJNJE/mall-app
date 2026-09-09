import React from 'react'
import { logger } from '@/lib/logger'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
}

/**
 * 路由级错误边界：单个页面抛错时只替换当前页内容，
 * 不会把整棵路由树打成白屏（区别于 App 层的全局 ErrorBoundary）。
 */
export class RouteErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    logger.error(`[RouteErrorBoundary] ${error.message}`, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-16 px-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">这个页面加载失败了</h2>
          <p className="text-sm text-gray-400 mb-5">请重试，或返回首页继续浏览</p>
          <button
            className="px-6 py-2.5 text-sm bg-primary text-white border-0 rounded-lg cursor-pointer"
            onClick={() => window.location.reload()}
          >
            重试
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
