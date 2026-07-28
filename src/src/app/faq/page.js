"use client";

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqItems = [
  {
    q: "WHAT MAKES BLACK THEORY T-SHIRTS PREMIUM?",
    a: "Our T-Shirts are cut from custom 240-280 GSM long-staple combed cotton fleece and loopback loops. This provides structural density that holds its architectural boxy drape indefinitely. We preshrink all fabrics to make sure they fit perfectly wash after wash."
  },
  {
    q: "HOW LONG WILL MY ORDER TAKE TO ARRIVE?",
    a: "We process orders within 24-48 hours. Shipping takes 3-5 business days depending on geographical location. Tracking numbers are generated and emailed instantly once shipped."
  },
  {
    q: "WHAT IS YOUR RETURN POLICY?",
    a: "We offer hassle-free 7-day return and exchange coordinates. Garments must be unworn, tags attached, and in original packaging. Refunds are processed to the source account within 5 days of picking up returned stock."
  },
  {
    q: "DO YOU OFFER CASH ON DELIVERY (COD)?",
    a: "Yes, we support Cash on Delivery across most pin codes without advance fees. You can pay via cash, card, or UPI directly to the courier agent upon arrival."
  }
];

export default function Faq() {
  const [openIdx, setOpenIdx] = useState(null);

  const toggle = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="border-b border-brand-silver dark:border-brand-grey pb-6 mb-10 text-center">
        <h1 className="font-display font-extrabold text-3xl uppercase tracking-widest">
          FREQUENTLY ASKED QUESTIONS
        </h1>
        <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">
          Everything you need to know about Black Theory operations
        </p>
      </div>

      <div className="space-y-4">
        {faqItems.map((item, idx) => (
          <div 
            key={idx}
            className="border border-brand-silver dark:border-brand-grey rounded overflow-hidden"
          >
            <button
              onClick={() => toggle(idx)}
              className="w-full p-5 bg-white dark:bg-brand-charcoal text-left font-display text-xs uppercase tracking-widest font-extrabold flex justify-between items-center text-brand-black dark:text-white"
            >
              <span>{item.q}</span>
              {openIdx === idx ? <Minus size={14} /> : <Plus size={14} />}
            </button>
            
            {openIdx === idx && (
              <div className="p-5 border-t border-brand-silver dark:border-brand-grey bg-brand-platinum/50 dark:bg-brand-black/20 text-xs font-sans tracking-wide leading-relaxed text-neutral-600 dark:text-neutral-300">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
