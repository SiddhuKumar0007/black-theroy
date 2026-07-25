import React from 'react';

export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-xs font-sans tracking-wide leading-relaxed text-neutral-600 dark:text-neutral-300">
      <div className="border-b border-brand-silver dark:border-brand-grey pb-6 mb-10 text-center text-brand-black dark:text-white">
        <h1 className="font-display font-extrabold text-3xl uppercase tracking-widest">
          TERMS OF SERVICE
        </h1>
        <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">
          Rules for purchasing and membership
        </p>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="font-display font-bold text-xs uppercase tracking-widest text-brand-black dark:text-white mb-2">1. Agreement to Terms</h2>
          <p>By accessing the Black Theory website, you agree to comply with our purchasing guidelines, return timelines, and fair usage codes of coupons.</p>
        </section>
        <section>
          <h2 className="font-display font-bold text-xs uppercase tracking-widest text-brand-black dark:text-white mb-2">2. Sizing & Stock Availability</h2>
          <p>We make every effort to display garment descriptions, weights (GSM), and cuts (oversized/regular) accurately. We reserve the right to limit order quantities during high-demand collection drops.</p>
        </section>
        <section>
          <h2 className="font-display font-bold text-xs uppercase tracking-widest text-brand-black dark:text-white mb-2">3. User Conduct</h2>
          <p>Any account profiles found abusing coupons, creating multiple duplicate accounts for reward farming, or attempting malicious scripts on checkout gateways will be permanently suspended (banned).</p>
        </section>
      </div>
    </div>
  );
}
