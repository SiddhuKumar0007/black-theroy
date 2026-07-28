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
