import React from 'react';

export default function ShippingPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-xs font-sans tracking-wide leading-relaxed text-neutral-600 dark:text-neutral-300">
      <div className="border-b border-brand-silver dark:border-brand-grey pb-6 mb-10 text-center text-brand-black dark:text-white">
        <h1 className="font-display font-extrabold text-3xl uppercase tracking-widest">
          SHIPPING POLICY
        </h1>
        <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">
          Delivery timelines and shipping charges
        </p>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="font-display font-bold text-xs uppercase tracking-widest text-brand-black dark:text-white mb-2">Processing Timeline</h2>
          <p>All orders are processed and verified within 24-48 hours. Orders are not processed or shipped on Sundays or national holidays.</p>
        </section>
        <section>
          <h2 className="font-display font-bold text-xs uppercase tracking-widest text-brand-black dark:text-white mb-2">Shipping Charges</h2>
          <p>We charge a flat shipping fee of ₹100 for orders under ₹1000. All orders equal to or exceeding ₹1000 are eligible for FREE SHIPPING.</p>
        </section>
        <section>
          <h2 className="font-display font-bold text-xs uppercase tracking-widest text-brand-black dark:text-white mb-2">Tracking Notifications</h2>
          <p>Once shipped, tracking links from Bluedart or Delhivery are dispatched to your registered email address and contact numbers.</p>
        </section>
      </div>
    </div>
  );
}
