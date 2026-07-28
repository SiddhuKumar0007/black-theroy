import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-xs font-sans tracking-wide leading-relaxed text-neutral-600 dark:text-neutral-300">
      <div className="border-b border-brand-silver dark:border-brand-grey pb-6 mb-10 text-center text-brand-black dark:text-white">
        <h1 className="font-display font-extrabold text-3xl uppercase tracking-widest">
          PRIVACY POLICY
        </h1>
        <p className="text-xs text-neutral-500 uppercase tracking-widest mt-1">
          How we protect member details
        </p>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="font-display font-bold text-xs uppercase tracking-widest text-brand-black dark:text-white mb-2">1. Data Collection</h2>
          <p>We collect essential credentials (name, email, phone number, shipping coordinates) to process transactions, manage account profiles, and reward loyalty points.</p>
        </section>
        <section>
          <h2 className="font-display font-bold text-xs uppercase tracking-widest text-brand-black dark:text-white mb-2">2. Secure Transactions</h2>
          <p>Payment credentials entered during checkouts are processed directly by our integrated PCI-DSS certified gateways (Stripe and Razorpay). Black Theory servers do not store card or banking PIN numbers.</p>
        </section>
        <section>
          <h2 className="font-display font-bold text-xs uppercase tracking-widest text-brand-black dark:text-white mb-2">3. Member Rights</h2>
          <p>You can request full deletion of your member profile, address records, and purchase history at any time by contacting privacy@blacktheory.com.</p>
        </section>
      </div>
    </div>
  );
}
