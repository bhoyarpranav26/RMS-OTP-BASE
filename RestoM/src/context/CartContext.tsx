import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

export interface MenuItem {
  id: number
  name: string
  price: number
  category: string
  image: string
  description: string
  type: 'veg' | 'nonveg'
  spiceLevel: 'mild' | 'medium' | 'hot'
}

export interface CartItem extends MenuItem {
  quantity: number
  spiceLevel: 'mild' | 'medium' | 'hot'
}

interface CartContextType {
  cart: CartItem[]
  cartAnimation: boolean
  addToCart: (item: MenuItem, spiceLevel?: 'mild' | 'medium' | 'hot') => void
  removeFromCart: (id: number) => void
  updateQuantity: (id: number, quantity: number) => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

interface CartProviderProps {
  children: ReactNode
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartAnimation, setCartAnimation] = useState(false)

  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (item: MenuItem, spiceLevel: 'mild' | 'medium' | 'hot' = 'medium') => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id && cartItem.spiceLevel === spiceLevel)
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id && cartItem.spiceLevel === spiceLevel
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      } else {
        return [...prevCart, { ...item, quantity: 1, spiceLevel }]
      }
    })
    // Trigger bounce animation
    setCartAnimation(true)
    setTimeout(() => setCartAnimation(false), 600)
  }

  const removeFromCart = (id: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id))
  }

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      )
    }
  }

  const clearCart = () => {
    setCart([])
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const value: CartContextType = {
    cart,
    cartAnimation,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}