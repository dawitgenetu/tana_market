import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      subtotal: 0,
      discount: 0,

      addItem: (product, quantity = 1) => {
        const items = [...get().items]
        const existingItem = items.find(item => item._id === product._id)

        if (existingItem) {
          existingItem.quantity += quantity
        } else {
          items.push({ ...product, quantity })
        }

        get().calculateTotals(items)
        set({ items })
      },

      removeItem: (productId) => {
        const items = get().items.filter(item => item._id !== productId)
        get().calculateTotals(items)
        set({ items })
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        const items = get().items.map(item =>
          item._id === productId ? { ...item, quantity } : item
        )

        get().calculateTotals(items)
        set({ items })
      },

      clearCart: () => {
        set({ items: [], total: 0, subtotal: 0, discount: 0 })
      },

      calculateTotals: (items = get().items) => {
        const subtotal = items.reduce((sum, item) => {
          const price = item.discount > 0 
            ? item.price * (1 - item.discount / 100)
            : item.price
          return sum + price * item.quantity
        }, 0)

        const discount = items.reduce((sum, item) => {
          if (item.discount > 0) {
            return sum + (item.price * item.discount / 100) * item.quantity
          }
          return sum
        }, 0)

        const total = subtotal

        set({ subtotal, discount, total, items })
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export default useCartStore
