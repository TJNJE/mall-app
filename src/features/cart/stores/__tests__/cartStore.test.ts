import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from '../cartStore'

const sampleA = { productId: 1, productName: 'A', productImage: 'x', price: 10 }
const sampleB = { productId: 2, productName: 'B', productImage: 'y', price: 5 }

describe('cartStore', () => {
  beforeEach(() => {
    // zustand store 是模块级单例，每个用例前重置，避免相互污染
    useCartStore.getState().clear()
  })

  it('addItem 新增商品，重复添加累加数量', () => {
    const store = useCartStore.getState()
    store.addItem(sampleA)
    store.addItem(sampleA)

    const state = useCartStore.getState()
    expect(state.items).toHaveLength(1)
    expect(state.items[0].quantity).toBe(2)
    expect(state.getCount()).toBe(2)
    expect(state.getAmount()).toBe(20)
  })

  it('removeItem 按 productId 移除', () => {
    const store = useCartStore.getState()
    store.addItem(sampleA)
    store.addItem(sampleB)
    store.removeItem(1)

    const items = useCartStore.getState().items
    expect(items).toHaveLength(1)
    expect(items[0].productId).toBe(2)
  })

  it('updateQuantity 修改数量，<=0 时移除该项', () => {
    const store = useCartStore.getState()
    store.addItem(sampleA)
    store.updateQuantity(1, 3)
    expect(useCartStore.getState().items[0].quantity).toBe(3)

    store.updateQuantity(1, 0)
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('getAmount 计算购物车总额', () => {
    const store = useCartStore.getState()
    store.addItem(sampleA)
    store.addItem(sampleB)
    expect(useCartStore.getState().getAmount()).toBe(15)
  })
})
