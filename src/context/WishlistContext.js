"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth, API_URL } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  // Load wishlist
  useEffect(() => {
    const loadWishlist = async () => {
      if (isAuthenticated && token) {
        try {
          const res = await fetch(`${API_URL}/wishlist`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success && data.data) {
            setWishlist(data.data.products || []);
            return;
          }
        } catch (err) {
          console.error('Error fetching wishlist from DB:', err);
        }
      }
      
      // Guest local storage fallback
      const localWish = localStorage.getItem('wishlist');
      if (localWish) {
        setWishlist(JSON.parse(localWish));
      }
    };

    loadWishlist();
  }, [isAuthenticated, token]);

  // Sync wishlist to localStorage (for guests)
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, isAuthenticated]);

  const toggleWishlist = async (product) => {
    const productId = product._id || product;
    
    // Optimistic UI state update
    const isExist = wishlist.some(item => (item._id || item) === productId);
    if (isExist) {
      setWishlist(prev => prev.filter(item => (item._id || item) !== productId));
    } else {
      setWishlist(prev => [...prev, product]);
    }

    if (isAuthenticated && token) {
      try {
        const res = await fetch(`${API_URL}/wishlist/toggle`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productId })
        });
        const data = await res.json();
        // If the toggle fails, we might want to revert, but we'll assume success for smooth UX
        if (!data.success) {
          console.error('Wishlist sync failed:', data.message);
        }
      } catch (err) {
        console.error('Failed to toggle DB wishlist:', err);
      }
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => (item._id || item) === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
