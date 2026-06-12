import React from 'react'

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

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <h1 style={styles.heading}>😵 页面出了点问题</h1>
          <p style={styles.desc}>{this.state.error?.message || '未知错误'}</p>
          <button style={styles.btn} onClick={() => window.location.reload()}>
            刷新页面
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    textAlign: 'center',
    padding: '100px 20px',
    maxWidth: 500,
    margin: '0 auto',
  },
  heading: { fontSize: 24, fontWeight: 600, color: '#333', marginBottom: 12 },
  desc: { fontSize: 14, color: '#999', marginBottom: 24 },
  btn: {
    padding: '12px 32px',
    fontSize: 15,
    fontWeight: 500,
    background: '#1677ff',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  },
}
