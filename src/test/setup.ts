// 关键：axios 在 jsdom 下默认走 XHR adapter，而 msw/node 的 setupServer 只拦截 fetch/http。
// 必须将请求实例切到 fetch adapter，MSW 才能拦截 useProductList 等经 axios 发出的请求（修复 plan-review F1）。
import request from '@/lib/request'
// 测试环境用绝对 baseURL：jsdom 下 Node fetch（undici）不解析相对 URL，
// 必须给出 origin，否则 fetch('/api/products') 报 "Failed to parse URL"。
// 同时切到 fetch adapter，msw/node 才能拦截（修复 plan-review F1）。
request.defaults.baseURL = 'http://localhost'
request.defaults.adapter = 'fetch'

import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
