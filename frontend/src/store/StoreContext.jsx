import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

const StoreContext = createContext(null)
const CART_KEY = 'carrito'

const readCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function StoreProvider({ children }) {
  const [shop, setShop] = useState({
    shop_name: 'MaiTentaciones',
    whatsapp_number: '',
    instagram_user: '',
    contact_email: '',
    currency: 'ARS',
  })
  const [items, setItems] = useState(readCart)
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    api
      .shop()
      .then((data) => {
        setShop(data)
        // El nombre del negocio manda también en la pestaña del navegador.
        document.title = `${data.shop_name} — pastelería artesanal`
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  const addItem = useCallback((item) => {
    setItems((prev) => {
      // Dos líneas idénticas (mismo producto y misma personalización) se agrupan.
      const key = `${item.title}::${item.detail ?? ''}::${item.unit_price}`
      const existing = prev.find(
        (i) => `${i.title}::${i.detail ?? ''}::${i.unit_price}` === key,
      )
      if (existing) {
        return prev.map((i) =>
          i.uid === existing.uid ? { ...i, quantity: i.quantity + (item.quantity ?? 1) } : i,
        )
      }
      return [
        ...prev,
        {
          uid: crypto.randomUUID(),
          quantity: 1,
          detail: '',
          accent: 'rosa',
          ...item,
        },
      ]
    })
    setCartOpen(true)
  }, [])

  const removeItem = useCallback((uid) => {
    setItems((prev) => prev.filter((i) => i.uid !== uid))
  }, [])

  const setQuantity = useCallback((uid, quantity) => {
    setItems((prev) =>
      prev.flatMap((i) => {
        if (i.uid !== uid) return [i]
        const next = Math.min(99, Math.max(0, quantity))
        return next === 0 ? [] : [{ ...i, quantity: next }]
      }),
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0),
    [items],
  )
  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items])

  const value = useMemo(
    () => ({
      shop,
      items,
      total,
      count,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
      cartOpen,
      setCartOpen,
    }),
    [shop, items, total, count, addItem, removeItem, setQuantity, clearCart, cartOpen],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore debe usarse dentro de <StoreProvider>')
  return ctx
}
