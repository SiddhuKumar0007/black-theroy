"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/auth/login');
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <p className="text-xs font-display uppercase tracking-widest text-neutral-400">
        Redirecting to Google Sign-In...
      </p>
    </div>
  );
}
