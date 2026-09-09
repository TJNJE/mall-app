import axios from 'axios'
import type {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios'
import type { ApiResponse, ApiError } from '@/types'
import { useAuthStore } from '@/features/auth/stores/authStore'

// 后端统一返回 { code, message, data }，response 拦截器已将其解包为 data。
// 这里通过类型转换将 AxiosInstance 的方法返回类型声明为「已解包的 T」，
// 使 api 层无需在每个调用处写 `as unknown as Promise<T>`。
type UnwrappedAxios = Omit<
  AxiosInstance,
  'get' | 'post' | 'put' | 'delete' | 'head' | 'options' | 'patch' | 'request'
> & {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
  head<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
  options<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  request<T = unknown>(config: AxiosRequestConfig): Promise<T>
}

const instance = axios.create({
  baseURL: '/',
  timeout: 10000,
})

instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().user?.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

instance.interceptors.response.use(
  (response: AxiosResponse) => {
    const body = response.data as ApiResponse<unknown>
    if (body.code === 0) return body.data
    return Promise.reject(new Error(body.message || '请求失败'))
  },
  (error: AxiosError<ApiError>) => {
    const apiError = error.response?.data
    const msg = apiError?.message || error.message || '网络异常'
    console.error('[API Error]', msg)
    return Promise.reject(new Error(msg))
  },
)

const request = instance as unknown as UnwrappedAxios

export default request
