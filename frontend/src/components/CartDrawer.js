"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer({ isOpen, onClose }) {
  const router = useRouter();
  const {
    cartItems,
    coupon,
    shippingCharges,
    subtotal,
    discountAmount,
    total,
    updateQuantity,
    removeFromCart,
    applyCouponCode,
    removeCoupon
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const freeShippingThreshold = 1000;
  const progressToFreeShipping = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const remainingForFreeShipping = Math.max(freeShippingThreshold - subtotal, 0);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    
    if (!couponCode.trim()) return;

    const result = await applyCouponCode(couponCode.trim());
    if (result.success) {
      setCouponSuccess('Coupon applied successfully!');
      setCouponCode('');
    } else {
      setCouponError(result.message || 'Invalid coupon code');
    }
  };

  const handleCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay background */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-brand-black/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
        {/* Drawer container */}
        <div className="w-screen max-w-md bg-white dark:bg-brand-black border-l border-brand-silver dark:border-brand-grey flex flex-col justify-between shadow-2xl">
          
          {/* Header */}
          <div className="px-6 py-6 border-b border-brand-silver dark:border-brand-grey flex items-center justify-between">
            <h2 className="font-display text-lg font-bold tracking-widest uppercase flex items-center">
              <ShoppingBag size={20} className="mr-2" />
              Your Bag ({cartItems.length})
            </h2>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cart items / Free shipping progress */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {cartItems.length > 0 ? (
              <>
                {/* Free shipping banner */}
                <div className="mb-6 bg-brand-platinum dark:bg-brand-darkgrey p-4 rounded border border-brand-silver dark:border-brand-grey">
                  {remainingForFreeShipping > 0 ? (
                    <p className="text-xs font-display tracking-wide mb-2 text-neutral-600 dark:text-neutral-300">
                      Spend <span className="font-bold">₹{remainingForFreeShipping}</span> more for <span className="font-bold">FREE SHIPPING</span>
                    </p>
                  ) : (
                    <p className="text-xs font-display tracking-wide mb-2 text-green-600 dark:text-green-400 font-bold">
                      🎉 Your order qualifies for FREE SHIPPING!
                    </p>
                  )}
                  <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-brand-black dark:bg-white h-full transition-all duration-500" 
                      style={{ width: `${progressToFreeShipping}%` }}
                    />
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-4">
                  {cartItems.map((item, idx) => {
                    const price = item.product.salePrice || item.product.price;
                    return (
                      <div 
                        key={idx} 
                        className="flex py-4 border-b border-brand-silver dark:border-brand-grey last:border-0"
                      >
                        {/* Image */}
                        <div className="w-20 h-24 flex-shrink-0 bg-neutral-100 dark:bg-neutral-950 rounded overflow-hidden">
                          <img 
                            src={item.product.images ? item.product.images[0] : '/placeholder.jpg'} 
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Metadata */}
                        <div className="ml-4 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between">
                              <h3 className="font-display font-semibold text-sm truncate max-w-[180px]">
                                {item.product.name}
                              </h3>
                              <p className="font-display font-bold text-sm">
                                ₹{price * item.quantity}
                              </p>
                            </div>
                            <p className="text-xs text-neutral-500 mt-0.5">
                              Size: <span className="font-semibold text-neutral-800 dark:text-neutral-300">{item.size}</span> | Color: <span className="font-semibold text-neutral-800 dark:text-neutral-300">{item.color.name}</span>
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            {/* Quantity Selector */}
                            <div className="flex items-center border border-brand-silver dark:border-brand-grey rounded overflow-hidden">
                              <button 
                                onClick={() => updateQuantity(item.product._id, item.size, item.color, item.quantity - 1)}
                                className="px-2 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                              >
                                <Minus size={12} />
                              </button>
                              <span className="px-3 text-xs font-bold">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.product._id, item.size, item.color, item.quantity + 1)}
                                className="px-2 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                              >
                                <Plus size={12} />
                              </button>
                            </div>

                            {/* Delete button */}
                            <button 
                              onClick={() => removeFromCart(item.product._id, item.size, item.color)}
                              className="text-neutral-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <ShoppingBag size={48} className="text-neutral-300 mb-4" />
                <h3 className="font-display font-bold text-lg mb-1">Your bag is empty</h3>
                <p className="text-sm text-neutral-500 max-w-[250px]">
                  Fill it with our premium heavyweight t-shirts and luxury collection.
                </p>
              </div>
            )}
          </div>

          {/* Footer Summaries */}
          {cartItems.length > 0 && (
            <div className="px-6 py-6 border-t border-brand-silver dark:border-brand-grey bg-brand-platinum dark:bg-brand-charcoal">
              
              {/* Coupon apply box */}
              {coupon ? (
                <div className="mb-4 flex items-center justify-between bg-green-50 dark:bg-green-950/20 px-3 py-2 rounded border border-green-200 dark:border-green-900 text-xs">
                  <div className="text-green-700 dark:text-green-400">
                    Coupon <span className="font-bold">{coupon.code}</span> Applied (
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}% Off` : `₹${coupon.discountValue} Off`}
                    )
                  </div>
                  <button onClick={removeCoupon} className="text-red-500 hover:text-red-700 font-bold ml-2">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="mb-4 flex space-x-2">
                  <input 
                    type="text" 
                    placeholder="COUPON CODE" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-grow px-3 py-1.5 border border-brand-silver dark:border-brand-grey rounded text-xs bg-white dark:bg-brand-black tracking-widest outline-none focus:border-brand-black dark:focus:border-white uppercase"
                  />
                  <button 
                    type="submit"
                    className="px-4 py-1.5 bg-brand-black dark:bg-white text-white dark:text-brand-black font-display font-semibold text-xs tracking-wider rounded uppercase hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="text-red-500 text-xs mb-2 font-display">{couponError}</p>}
              {couponSuccess && <p className="text-green-600 text-xs mb-2 font-display">{couponSuccess}</p>}

              {/* Price Calculation breakdown */}
              <div className="space-y-2 text-xs font-display tracking-wider uppercase text-neutral-600 dark:text-neutral-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-brand-black dark:text-white">₹{subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span className="font-bold">-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-bold text-brand-black dark:text-white">
                    {shippingCharges === 0 ? 'FREE' : `₹${shippingCharges}`}
                  </span>
                </div>
                <div className="flex justify-between border-t border-brand-silver dark:border-brand-grey pt-3 text-sm font-bold text-brand-black dark:text-white">
                  <span>Estimated Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button 
                onClick={handleCheckout}
                className="w-full mt-6 py-3 bg-brand-black dark:bg-white text-white dark:text-brand-black font-display font-bold text-center uppercase tracking-widest text-sm rounded border border-brand-black dark:border-white hover:bg-transparent dark:hover:bg-transparent hover:text-brand-black dark:hover:text-white transition-all"
              >
                PROCEED TO CHECKOUT
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
