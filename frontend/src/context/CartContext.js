"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth, API_URL } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [shippingCharges, setShippingCharges] = useState(100);
  const [subtotal, setSubtotal] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [total, setTotal] = useState(0);

  // 1. Load initial cart
  useEffect(() => {
    const loadCart = async () => {
      if (isAuthenticated && token) {
        try {
          const res = await fetch(`${API_URL}/cart`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success && data.data && data.data.items) {
            // Convert database model items to client structure
            const dbItems = data.data.items.map(item => ({
              product: item.product,
              quantity: item.quantity,
              size: item.size,
              color: item.color
            }));
            setCartItems(dbItems);
            return;
          }
        } catch (err) {
          console.error('Error fetching cart from DB:', err);
        }
      }
      
      // Guest local storage cart fallback
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        setCartItems(JSON.parse(localCart));
      }
    };

    loadCart();
  }, [isAuthenticated, token]);

  // 2. Sync cart to localStorage and DB on change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));

    const syncWithDb = async () => {
      if (isAuthenticated && token) {
        try {
          const dbFormatItems = cartItems.map(item => ({
            product: item.product._id || item.product,
            quantity: item.quantity,
            size: item.size,
            color: item.color
          }));

          await fetch(`${API_URL}/cart/sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ items: dbFormatItems })
          });
        } catch (err) {
          console.error('Error syncing cart with DB:', err);
        }
      }
    };

    const timer = setTimeout(() => {
      syncWithDb();
    }, 500); // debounce sync writes

    return () => clearTimeout(timer);
  }, [cartItems, isAuthenticated, token]);

  // 3. Compute costs whenever items or coupon changes
  useEffect(() => {
    let sub = 0;
    cartItems.forEach(item => {
      const price = item.product.salePrice || item.product.price || 0;
      sub += price * item.quantity;
    });
    setSubtotal(sub);

    // Free shipping above 1000 INR/USD or if coupon is free_shipping
    let ship = sub > 0 && sub < 1000 ? 100 : 0;
    if (coupon && coupon.discountType === 'free_shipping') {
      ship = 0;
    }
    setShippingCharges(ship);

    // Calculate discount
    let disc = 0;
    if (coupon) {
      if (coupon.discountType === 'percentage') {
        disc = Math.round(sub * (coupon.discountValue / 100));
      } else if (coupon.discountType === 'flat') {
        disc = Math.min(coupon.discountValue, sub);
      }
    }
    setDiscountAmount(disc);

    setTotal(Math.max(0, sub + ship - disc));
  }, [cartItems, coupon]);

  const addToCart = (product, quantity, size, color) => {
    setCartItems(prev => {
      // Check if item already exists in cart with same size and color
      const existingIndex = prev.findIndex(
        item => (item.product._id || item.product) === (product._id || product) &&
                item.size === size &&
                item.color.name === color.name
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, { product, quantity, size, color }];
      }
    });
  };

  const removeFromCart = (productId, size, color) => {
    setCartItems(prev =>
      prev.filter(
        item => !((item.product._id || item.product) === productId &&
                  item.size === size &&
                  item.color.name === color.name)
      )
    );
  };

  const updateQuantity = (productId, size, color, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        ((item.product._id || item.product) === productId &&
         item.size === size &&
         item.color.name === color.name)
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
    localStorage.removeItem('cart');
  };

  const applyCouponCode = async (code) => {
    if (!isAuthenticated) {
      return { success: false, message: 'Please login to apply coupons' };
    }
    try {
      const res = await fetch(`${API_URL}/coupons/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code, cartTotal: subtotal })
      });
      const data = await res.json();
      if (data.success) {
        setCoupon(data.data);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      return { success: false, message: 'Coupon service unavailable' };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        coupon,
        shippingCharges,
        subtotal,
        discountAmount,
        total,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCouponCode,
        removeCoupon
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
