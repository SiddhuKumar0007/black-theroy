"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, Phone } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-brand-black dark:bg-black text-white pt-16 pb-8 border-t border-brand-grey mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Info */}
          <div className="md:col-span-1">
            <h3 className="font-display font-extrabold text-xl tracking-[0.25em] uppercase mb-4">
              Black Theory
            </h3>
            <p className="text-xs text-neutral-400 font-sans tracking-wide leading-relaxed mb-6">
              Architectural shapes. Premium cotton structures. Designed for the minimal luxury streetwear enthusiast.
            </p>
            <div className="flex space-x-4">
              {/* WhatsApp chat trigger */}
              <a 
                href="https://wa.me/911234567890?text=Hi%20Black%20Theory%2C%20I%20have%20a%20question%20about%20my%20order" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 border border-brand-grey hover:border-white transition-colors text-neutral-400 hover:text-white rounded"
                title="Chat on WhatsApp"
              >
                <Phone size={16} />
              </a>
              {/* Instagram link */}
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 border border-brand-grey hover:border-white transition-colors text-neutral-400 hover:text-white rounded flex items-center justify-center"
                title="Follow on Instagram"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-xs font-bold uppercase tracking-widest text-neutral-300 mb-4">
              Collections
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400 font-sans uppercase tracking-widest">
              <li><Link href="/shop" className="hover:text-white transition-colors">All T-Shirts</Link></li>
              <li><Link href="/shop?subcategory=Oversized" className="hover:text-white transition-colors">Oversized Heavyweight</Link></li>
              <li><Link href="/shop?subcategory=Acid+Wash" className="hover:text-white transition-colors">Acid Wash Relic</Link></li>
              <li><Link href="/shop?subcategory=Graphic" className="hover:text-white transition-colors">Graphic Typography</Link></li>
              <li><Link href="/shop?subcategory=Minimalist" className="hover:text-white transition-colors">Minimalist Core</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display text-xs font-bold uppercase tracking-widest text-neutral-300 mb-4">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400 font-sans uppercase tracking-widest">
              <li>
                <button
                  onClick={() => {
                    const widgetBtn = document.querySelector('button[title="Live Customer Support"]');
                    if (widgetBtn) widgetBtn.click();
                  }}
                  className="hover:text-white transition-colors text-emerald-400 font-bold uppercase text-left"
                >
                  💬 Live Chat Support
                </button>
              </li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQs</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping Policy</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">Returns & Refunds</Link></li>
              <li><Link href="/size-guide" className="hover:text-white transition-colors">Sizing Guide</Link></li>
            </ul>
          </div>

          {/* Newsletter subscription */}
          <div>
            <h4 className="font-display text-xs font-bold uppercase tracking-widest text-neutral-300 mb-4">
              JOIN THE THEORY
            </h4>
            <p className="text-xs text-neutral-400 mb-4 font-sans tracking-wide leading-relaxed">
              Subscribe to receive private collection drops, early sale access, and luxury streetwear updates.
            </p>
            {subscribed ? (
              <p className="text-xs font-display text-green-400 font-semibold tracking-wider">
                🎉 Welcome to the club. Check your inbox soon.
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="relative border-b border-brand-grey pb-2">
                <input 
                  type="email" 
                  placeholder="ENTER YOUR EMAIL" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent text-xs outline-none pr-10 w-full uppercase tracking-widest"
                  required
                />
                <button 
                  type="submit" 
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                >
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Policies & Copyright */}
        <div className="border-t border-brand-grey pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-neutral-500 uppercase tracking-widest font-sans">
          <p>© {new Date().getFullYear()} BLACK THEORY. ALL RIGHTS RESERVED.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
