export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning'
  message: string
}
