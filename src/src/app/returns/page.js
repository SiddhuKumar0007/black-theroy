import React from 'react';

export default function ReturnsPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-xs font-sans tracking-wide leading-relaxed text-neutral-600 dark:text-neutral-300">
      <div className="border-b border-brand-silver dark:border-brand-grey pb-6 mb-10 text-center text-brand-black dark:text-white">
        <h1 className="font-display font-extrabold text-3xl uppercase tracking-widest">
          RETURNS & EXCHANGES
        </h1>
        <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">
          Hassle-free replacement coordinates
        </p>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="font-display font-bold text-xs uppercase tracking-widest text-brand-black dark:text-white mb-2">7-Day Return Window</h2>
          <p>We provide a 7-day return and exchange window from the date of package delivery. If you are not satisfied with the sizing or style, you can request an exchange from your dashboard.</p>
        </section>
        <section>
          <h2 className="font-display font-bold text-xs uppercase tracking-widest text-brand-black dark:text-white mb-2">Condition Guidelines</h2>
          <p>Garments must be unworn, unwashed, and in their original premium canvas boxes with brand tags intact. Returned items failing inspection will be returned back to the customer.</p>
        </section>
        <section>
          <h2 className="font-display font-bold text-xs uppercase tracking-widest text-brand-black dark:text-white mb-2">Refund Processing</h2>
          <p>Refunds are initiated immediately after returned stock passes inspection. Funds will reflect in the source payment method (cards/UPI) within 5-7 business days.</p>
        </section>
      </div>
    </div>
  );
}
