"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, Heart, ShoppingBag, User, Sun, Moon, 
  Menu, X, ShieldAlert, LogOut, Headset 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import SearchOverlay from './SearchOverlay';
import CartDrawer from './CartDrawer';

export default function Navbar() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const { cartItems } = useCart();
  const { wishlist } = useWishlist();
  const { darkMode, toggleTheme } = useTheme();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    router.push('/');
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 glass-nav transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="p-2 -ml-2 lg:hidden text-neutral-600 dark:text-neutral-300 hover:text-brand-black dark:hover:text-white"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link href="/" className="font-display font-extrabold text-xl sm:text-2xl tracking-[0.25em] uppercase hover:opacity-85 text-brand-black dark:text-white">
              Black Theory
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex space-x-8">
            <Link href="/shop" className="font-display text-xs font-semibold uppercase tracking-widest hover:text-neutral-500 transition-colors">
              All Tees
            </Link>
            <Link href="/shop?subcategory=Oversized" className="font-display text-xs font-semibold uppercase tracking-widest hover:text-neutral-500 transition-colors">
              Oversized
            </Link>
            <Link href="/shop?subcategory=Acid+Wash" className="font-display text-xs font-semibold uppercase tracking-widest hover:text-neutral-500 transition-colors">
              Acid Wash
            </Link>
            <Link href="/shop?subcategory=Graphic" className="font-display text-xs font-semibold uppercase tracking-widest hover:text-neutral-500 transition-colors">
              Graphic Tees
            </Link>
            <Link href="/shop?subcategory=Minimalist" className="font-display text-xs font-semibold uppercase tracking-widest hover:text-neutral-500 transition-colors">
              Minimalist
            </Link>
            <button
              onClick={() => {
                const widgetBtn = document.querySelector('button[title="Live Customer Support"]');
                if (widgetBtn) widgetBtn.click();
              }}
              className="font-display text-xs font-bold uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors flex items-center space-x-1"
            >
              <Headset size={14} />
              <span>Customer Care</span>
            </button>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            
            {/* Search */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-brand-black dark:hover:text-white transition-colors"
              title="Search"
            >
              <Search size={20} />
            </button>

            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-brand-black dark:hover:text-white transition-colors"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Wishlist */}
            <Link 
              href="/wishlist" 
              className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-brand-black dark:hover:text-white transition-colors relative"
              title="Wishlist"
            >
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-brand-black dark:bg-white text-white dark:text-brand-black text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center border border-white dark:border-brand-black">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart Drawer Toggle */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-brand-black dark:hover:text-white transition-colors relative"
              title="Cart"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-brand-black dark:bg-white text-white dark:text-brand-black text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center border border-white dark:border-brand-black">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Dropdown */}
            <div className="relative">
              {isAuthenticated ? (
                <>
                  <button 
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-brand-black dark:hover:text-white transition-colors flex items-center space-x-1"
                  >
                    <User size={20} />
                  </button>
                  
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-brand-charcoal border border-brand-silver dark:border-brand-grey rounded shadow-lg py-1 z-50">
                      <div className="px-4 py-2 border-b border-brand-silver dark:border-brand-grey">
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Signed in as</p>
                        <p className="text-sm font-semibold truncate">{user?.name}</p>
                      </div>
                      <Link 
                        href="/profile" 
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        My Profile
                      </Link>
                      <Link 
                        href="/orders" 
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        Order History
                      </Link>
                      {user?.role === 'admin' && (
                        <Link 
                          href="/admin" 
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center border-t border-brand-silver dark:border-brand-grey"
                        >
                          <ShieldAlert size={14} className="mr-1.5" />
                          Admin Panel
                        </Link>
                      )}
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center border-t border-brand-silver dark:border-brand-grey"
                      >
                        <LogOut size={14} className="mr-1.5" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link 
                  href="/auth/login" 
                  className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-brand-black dark:hover:text-white transition-colors"
                  title="Login"
                >
                  <User size={20} />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Responsive Mobile Drawer Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-brand-silver dark:border-brand-grey bg-white dark:bg-brand-black py-4 px-6 space-y-4">
            <Link 
              href="/shop" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block font-display text-sm font-semibold uppercase tracking-wider hover:text-neutral-500"
            >
              All Tees
            </Link>
            <Link 
              href="/shop?subcategory=Oversized" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block font-display text-sm font-semibold uppercase tracking-wider hover:text-neutral-500"
            >
              Oversized Heavyweight
            </Link>
            <Link 
              href="/shop?subcategory=Acid+Wash" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block font-display text-sm font-semibold uppercase tracking-wider hover:text-neutral-500"
            >
              Acid Wash Relic
            </Link>
            <Link 
              href="/shop?subcategory=Graphic" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block font-display text-sm font-semibold uppercase tracking-wider hover:text-neutral-500"
            >
              Graphic Typography
            </Link>
            <Link 
              href="/shop?subcategory=Minimalist" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block font-display text-sm font-semibold uppercase tracking-wider hover:text-neutral-500"
            >
              Minimalist Core
            </Link>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                const widgetBtn = document.querySelector('button[title="Live Customer Support"]');
                if (widgetBtn) widgetBtn.click();
              }}
              className="block w-full text-left font-display text-sm font-bold uppercase tracking-wider text-emerald-500 hover:text-emerald-400"
            >
              🎧 Live Customer Care
            </button>
            {user?.role === 'admin' && (
              <Link 
                href="/admin" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block font-display text-sm font-semibold uppercase tracking-wider text-red-500"
              >
                Admin Panel
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Slide-over overlays */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
