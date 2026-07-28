"use client";

import React from 'react';

export default function SizeGuide() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="border-b border-brand-silver dark:border-brand-grey pb-6 mb-10 text-center">
        <h1 className="font-display font-extrabold text-3xl uppercase tracking-widest">
          SIZING GUIDE
        </h1>
        <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">
          Measure details for the perfect architectural drop
        </p>
      </div>

      <div className="space-y-12">
        {/* T-shirts details */}
        <section className="bg-white dark:bg-brand-charcoal border border-brand-silver dark:border-brand-grey p-6 rounded">
          <h2 className="font-display font-extrabold text-lg uppercase tracking-wider mb-4">Oversized T-Shirts (Mock Rib Neck)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-display tracking-widest text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-silver dark:border-brand-grey text-neutral-400">
                  <th className="py-2">Size</th>
                  <th className="py-2">Chest (Inches)</th>
                  <th className="py-2">Length (Inches)</th>
                  <th className="py-2">Sleeve (Inches)</th>
                </tr>
              </thead>
              <tbody className="text-neutral-600 dark:text-neutral-300 font-sans">
                <tr className="border-b border-brand-silver/50 dark:border-brand-grey/50"><td className="py-3 font-bold">S</td><td className="py-3">42</td><td className="py-3">27</td><td className="py-3">8.5</td></tr>
                <tr className="border-b border-brand-silver/50 dark:border-brand-grey/50"><td className="py-3 font-bold">M</td><td className="py-3">44</td><td className="py-3">28</td><td className="py-3">9.0</td></tr>
                <tr className="border-b border-brand-silver/50 dark:border-brand-grey/50"><td className="py-3 font-bold">L</td><td className="py-3">46</td><td className="py-3">29</td><td className="py-3">9.5</td></tr>
                <tr className="border-b border-brand-silver/50 dark:border-brand-grey/50"><td className="py-3 font-bold">XL</td><td className="py-3">48</td><td className="py-3">30</td><td className="py-3">10.0</td></tr>
                <tr><td className="py-3 font-bold">XXL</td><td className="py-3">50</td><td className="py-3">31</td><td className="py-3">10.5</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Hoodies details */}
        <section className="bg-white dark:bg-brand-charcoal border border-brand-silver dark:border-brand-grey p-6 rounded">
          <h2 className="font-display font-extrabold text-lg uppercase tracking-wider mb-4">Relaxed Hoodies & Sweatshirts</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-display tracking-widest text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-silver dark:border-brand-grey text-neutral-400">
                  <th className="py-2">Size</th>
                  <th className="py-2">Chest (Inches)</th>
                  <th className="py-2">Length (Inches)</th>
                  <th className="py-2">Shoulder (Inches)</th>
                </tr>
              </thead>
              <tbody className="text-neutral-600 dark:text-neutral-300 font-sans">
                <tr className="border-b border-brand-silver/50 dark:border-brand-grey/50"><td className="py-3 font-bold">S</td><td className="py-3">44</td><td className="py-3">26.5</td><td className="py-3">20.5</td></tr>
                <tr className="border-b border-brand-silver/50 dark:border-brand-grey/50"><td className="py-3 font-bold">M</td><td className="py-3">46</td><td className="py-3">27.5</td><td className="py-3">21.5</td></tr>
                <tr className="border-b border-brand-silver/50 dark:border-brand-grey/50"><td className="py-3 font-bold">L</td><td className="py-3">48</td><td className="py-3">28.5</td><td className="py-3">22.5</td></tr>
                <tr><td className="py-3 font-bold">XL</td><td className="py-3">50</td><td className="py-3">29.5</td><td className="py-3">23.5</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
