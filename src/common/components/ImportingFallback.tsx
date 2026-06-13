export default function ImportingFallback({ name }: { name: string }) {
  return (
    <div style={styles.container}>
      <div style={styles.spinner} />
      <p style={styles.text}>加载中：{name}...</p>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '120px 20px',
    color: '#999',
  },
  spinner: {
    width: 36,
    height: 36,
    border: '3px solid #f3f3f3',
    borderTopColor: '#1677ff',
    borderRadius: '50%',
    margin: '0 auto 16px',
    animation: 'spin 0.8s linear infinite',
  },
  text: {
    fontSize: 14,
    color: '#999',
  },
}
