import axios from 'axios'
import type { ApiResponse, ApiError } from '@/types'

// 创建 axios 实例
const request = axios.create({
  baseURL: '/',
  timeout: 10000,
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // TODO: 在这里添加 token
    // const token = localStorage.getItem('token')
    // if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error),
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const { code, message, data } = response.data as ApiResponse

    if (code === 0) {
      return data
    }

    // 业务错误
    return Promise.reject(new Error(message || '请求失败'))
  },
  (error) => {
    const apiError = error.response?.data as ApiError | undefined
    const message = apiError?.message || error.message || '网络异常'
    console.error('[API Error]', message)
    return Promise.reject(new Error(message))
  },
)

export default request
