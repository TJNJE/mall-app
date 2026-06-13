import { z } from 'zod'

export const checkoutSchema = z.object({
  name: z.string().min(1, '请输入姓名'),
  phone: z.string().regex(/^1\d{10}$/, '手机号格式不正确'),
  province: z.string().min(1, '请输入省份'),
  city: z.string().min(1, '请输入城市'),
  district: z.string().min(1, '请输入区县'),
  detail: z.string().min(1, '请输入详细地址'),
}).extend({
  quantity: z.number().min(1),
})

export type CheckoutForm = z.infer<typeof checkoutSchema>

export function validateCheckoutForm(values: Record<string, string>) {
  const result = checkoutSchema.safeParse(values)
  if (result.success) return {}
  const errors: Partial<Record<keyof CheckoutForm, string>> = {}
  for (const issue of result.error.issues) {
    const path = issue.path[0] as string
    if (path) errors[path as keyof CheckoutForm] = issue.message
  }
  return errors
}
