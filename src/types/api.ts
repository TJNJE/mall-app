/** 统一的 API 响应格式 */

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

/** 分页参数 */
export interface PaginationParams {
  page?: number
  pageSize?: number
}

/** 通用错误信息 */
export interface ApiError {
  code: number
  message: string
}
