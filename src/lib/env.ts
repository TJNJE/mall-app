/**
 * 集中读取环境变量，避免在多个模块重复访问 import.meta.env。
 * 所有 VITE_ 变量在此收敛并显式标注类型。
 */
export const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined
