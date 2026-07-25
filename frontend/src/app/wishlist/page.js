"use client";

import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import ProductCard from '../../components/ProductCard';
export default function Wishlist() {
  const { wishlist } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh]">
      <div className="border-b border-brand-silver dark:border-brand-grey pb-6 mb-10">
        <h1 className="font-display font-extrabold text-3xl uppercase tracking-widest flex items-center">
          <Heart size={24} className="mr-2 fill-current" />
          YOUR WISHLIST
        </h1>
        <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">
          Saved designs and limited releases
        </p>
      </div>

      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-brand-silver dark:border-brand-grey bg-brand-platinum dark:bg-brand-charcoal/50 rounded">
          <Heart size={48} className="text-neutral-300 dark:text-neutral-700 mb-4" />
          <h2 className="font-display font-bold text-lg mb-1">Your wishlist is empty</h2>
          <p className="text-xs text-neutral-500 max-w-[280px] leading-relaxed uppercase tracking-wider mb-6">
            Bookmark items from our shop page to save them for later checkouts.
          </p>
          <Link 
            href="/shop" 
            className="px-6 py-2.5 bg-brand-black dark:bg-white text-white dark:text-brand-black text-xs font-display font-bold tracking-widest uppercase hover:opacity-85 flex items-center space-x-2"
          >
            <span>Explore Shop</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      )}
    </div>
  );
}
