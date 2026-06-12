import axios from 'axios'
import type { ApiResponse, ApiError } from '@/types'
import { useAuthStore } from '@/features/auth/stores/authStore'

const request = axios.create({
  baseURL: '/',
  timeout: 10000,
})

request.interceptors.request.use((config) => {
  const token = useAuthStore.getState().user?.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

request.interceptors.response.use(
  (response) => {
    const { code, message, data } = response.data as ApiResponse
    if (code === 0) return data
    return Promise.reject(new Error(message || '请求失败'))
  },
  (error) => {
    const apiError = error.response?.data as ApiError | undefined
    const msg = apiError?.message || error.message || '网络异常'
    console.error('[API Error]', msg)
    return Promise.reject(new Error(msg))
  },
)

export default request
