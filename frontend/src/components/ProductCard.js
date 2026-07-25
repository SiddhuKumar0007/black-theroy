"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
export default function ProductCard({ product }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [hovered, setHovered] = useState(false);
  const isWishlisted = isInWishlist(product._id);

  const price = product.price;
  const salePrice = product.salePrice;
  const discountPercent = product.discountPercent || 0;

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Quick Add: default to first available size and color
    const defaultSize = product.sizes ? product.sizes[0] : 'M';
    const defaultColor = product.colors && product.colors.length > 0 
      ? product.colors[0] 
      : { name: 'Pitch Black', hex: '#000000' };
    
    addToCart(product, 1, defaultSize, defaultColor);
  };

  return (
    <div 
      className="group premium-card bg-white dark:bg-brand-charcoal overflow-hidden flex flex-col justify-between"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/product/${product._id}`} className="block relative aspect-[3/4] w-full bg-neutral-100 dark:bg-neutral-950 overflow-hidden">
        {/* Wishlist toggle */}
        <button 
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-brand-black/80 backdrop-blur-md rounded-full text-brand-black dark:text-white border border-brand-silver dark:border-brand-grey hover:scale-110 transition-transform z-10"
        >
          <Heart size={14} className={isWishlisted ? 'fill-black dark:fill-white text-black dark:text-white' : ''} />
        </button>

        {/* Discount Badge */}
        {salePrice && (
          <div className="absolute top-3 left-3 bg-brand-black dark:bg-white text-white dark:text-brand-black text-[9px] font-display font-extrabold uppercase tracking-widest px-2 py-0.5 z-10">
            {discountPercent}% Off
          </div>
        )}

        {/* Product Image */}
        <img 
          src={hovered && product.images && product.images[1] ? product.images[1] : product.images[0]} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Quick Add overlay */}
        <div className="absolute inset-x-4 bottom-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <button 
            onClick={handleQuickAdd}
            className="w-full py-2.5 bg-brand-black dark:bg-white text-white dark:text-brand-black font-display font-extrabold uppercase text-[10px] tracking-widest flex items-center justify-center space-x-2 border border-brand-black dark:border-white hover:bg-transparent dark:hover:bg-transparent hover:text-brand-black dark:hover:text-white transition-all shadow-md"
          >
            <ShoppingBag size={12} />
            <span>QUICK ADD</span>
          </button>
        </div>
      </Link>

      {/* Info details */}
      <div className="p-4 border-t border-brand-silver dark:border-brand-grey flex flex-col justify-between flex-grow">
        <div>
          <p className="text-[9px] text-neutral-500 font-display font-bold uppercase tracking-widest">
            {product.brand || 'Black Theory'}
          </p>
          <Link href={`/product/${product._id}`} className="block mt-1 font-display font-semibold text-sm hover:text-neutral-500 transition-colors truncate">
            {product.name}
          </Link>
          <div className="mt-2 flex items-baseline space-x-2">
            {salePrice ? (
              <>
                <span className="font-display font-extrabold text-sm">₹{salePrice}</span>
                <span className="font-display text-xs text-neutral-500 line-through">₹{price}</span>
              </>
            ) : (
              <span className="font-display font-extrabold text-sm">₹{price}</span>
            )}
          </div>
        </div>

        {/* Sizes display */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mt-3 pt-3 border-t border-brand-silver/50 dark:border-brand-grey/50 flex items-center justify-between text-[9px] text-neutral-500">
            <span>SIZES AVAILABLE</span>
            <span className="font-bold text-neutral-800 dark:text-neutral-300 uppercase">
              {product.sizes.join(', ')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
