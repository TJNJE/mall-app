import { create } from 'zustand'

export interface CartItem {
  productId: number
  productName: string
  productImage: string
  price: number
  quantity: number
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clear: () => void
  getCount: () => number
  getAmount: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (item) => {
    const { items } = get()
    const existing = items.find((i) => i.productId === item.productId)
    if (existing) {
      set({
        items: items.map((i) =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      })
    } else {
      set({ items: [...items, { ...item, quantity: 1 }] })
    }
  },

  removeItem: (productId) => {
    set({ items: get().items.filter((i) => i.productId !== productId) })
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId)
      return
    }
    set({
      items: get().items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
    })
  },

  clear: () => set({ items: [] }),

  getCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  getAmount: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}))
