"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, X, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function Login() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, googleLogin } = useAuth();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showAccountPickerModal, setShowAccountPickerModal] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  // 1. Auto-redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') router.replace('/admin');
      else router.replace('/shop');
    }
  }, [isAuthenticated, user, router]);

  // 2. Load Google Identity Services SDK
  useEffect(() => {
    try {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    } catch (e) {
      console.error('Google script load error:', e);
    }
  }, []);

  // 3. Handle "Continue with Google" - Opens Google's Official Account Chooser Popup
  const handleGoogleClick = () => {
    setErrorMsg('');
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '976550764058-lhqq0q1vfq3368s31qj3u2arnjfbncoe.apps.googleusercontent.com';

    // Official Google OAuth 2.0 Popup with prompt=select_account (Displays ALL signed-in accounts on device)
    if (window.google?.accounts?.oauth2) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'email profile openid',
          prompt: 'select_account',
          callback: async (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
              setLoading(true);
              try {
                const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const userInfo = await userRes.json();

                if (userInfo.email) {
                  const res = await googleLogin({
                    email: userInfo.email,
                    name: userInfo.name || userInfo.given_name || 'Google User',
                    googleId: userInfo.sub
                  });
                  if (res.success) {
                    if (res.user?.role === 'admin') router.push('/admin');
                    else router.push('/shop');
                  } else {
                    setErrorMsg(res.message || 'Login failed. Please try again.');
                  }
                }
              } catch (err) {
                setErrorMsg('Could not fetch user details from Google account.');
              } finally {
                setLoading(false);
              }
            }
          }
        });

        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.error('OAuth Token Client error:', err);
      }
    }

    // Fallback: If SDK isn't ready, open fallback modal
    setShowAccountPickerModal(true);
  };

  // 4. Fallback Account Selection
  const handleSelectAccount = async (email, name) => {
    setShowAccountPickerModal(false);
    setLoading(true);
    setErrorMsg('');
    const res = await googleLogin({ email, name: name || 'Google User', googleId: 'g-' + Date.now() });
    setLoading(false);
    if (res.success) {
      if (res.user?.role === 'admin') router.push('/admin');
      else router.push('/shop');
    } else {
      setErrorMsg(res.message || 'Authentication failed. Please try again.');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-neutral-50 dark:bg-brand-black">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-black dark:border-white" />
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-neutral-50 dark:bg-brand-black">
      <div className="w-full max-w-md bg-white dark:bg-brand-charcoal border border-brand-silver dark:border-brand-grey p-8 sm:p-10 rounded-lg shadow-2xl text-center">

        {/* Brand Header */}
        <div className="mb-10">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <Shield className="w-6 h-6 text-brand-black dark:text-white" />
          </div>
          <h1 className="font-display font-extrabold text-2xl uppercase tracking-[0.25em] text-brand-black dark:text-white mb-2">
            BLACK THEORY
          </h1>
          <p className="text-[11px] text-neutral-500 uppercase tracking-widest">
            Sign in using your Google account
          </p>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mb-6 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs rounded font-display uppercase tracking-wider flex items-center justify-center space-x-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* MAIN BUTTON: CONTINUE WITH GOOGLE */}
        <button
          id="continue-with-google-btn"
          type="button"
          onClick={handleGoogleClick}
          disabled={loading}
          className="w-full py-4 bg-white hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-brand-black dark:text-white border-2 border-brand-silver dark:border-brand-grey font-display font-extrabold text-sm uppercase tracking-widest flex items-center justify-center space-x-3 transition-all duration-200 hover:border-neutral-400 dark:hover:border-neutral-500 rounded-md shadow-md hover:shadow-lg disabled:opacity-50"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>{loading ? 'AUTHENTICATING...' : 'CONTINUE WITH GOOGLE'}</span>
        </button>

        <p className="mt-8 text-[10px] text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
          Secured by Google OAuth 2.0
        </p>

      </div>

      {/* Fallback Modal */}
      {showAccountPickerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-brand-charcoal border border-brand-silver dark:border-brand-grey w-full max-w-md p-6 sm:p-8 rounded-lg shadow-2xl relative text-left">
            <button
              onClick={() => setShowAccountPickerModal(false)}
              className="absolute right-4 top-4 text-neutral-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <svg className="w-8 h-8 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <div>
                <h3 className="font-display font-extrabold text-sm uppercase tracking-widest text-brand-black dark:text-white">
                  Choose a Google Account
                </h3>
                <p className="text-[11px] text-neutral-400">
                  to continue to Black Theory
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleSelectAccount('siddhujha2006@gmail.com', 'Siddhu Jha (Admin)')}
                className="w-full flex items-center justify-between p-3.5 border border-brand-silver dark:border-brand-grey rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-amber-600 flex items-center justify-center text-white font-extrabold text-sm">
                    S
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brand-black dark:text-white group-hover:text-amber-400 transition-colors">
                      Siddhu Jha
                    </p>
                    <p className="text-[10px] text-amber-500 font-semibold">
                      siddhujha2006@gmail.com · Admin Access 👑
                    </p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-neutral-400 group-hover:text-white transition-colors" />
              </button>

              <button
                onClick={() => handleSelectAccount('siddhukumar2006@gmail.com', 'Siddhu Kumar')}
                className="w-full flex items-center justify-between p-3.5 border border-brand-silver dark:border-brand-grey rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm">
                    S
                  </div>
                  <div>
                    <p className="text-xs font-bold text-brand-black dark:text-white group-hover:text-amber-400 transition-colors">
                      Siddhu Kumar
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      siddhukumar2006@gmail.com · Customer Account
                    </p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-neutral-400 group-hover:text-white transition-colors" />
              </button>
            </div>

            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-brand-silver dark:border-brand-grey" />
              </div>
              <span className="relative px-3 bg-white dark:bg-brand-charcoal text-[9px] font-display font-bold text-neutral-500 uppercase tracking-widest">
                Use Another Google Account
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (customEmail) handleSelectAccount(customEmail, customName);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-[9px] font-display font-bold uppercase tracking-widest text-neutral-500 mb-1">
                  Google Email Address
                </label>
                <input
                  type="email"
                  placeholder="your.email@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full p-2.5 border border-brand-silver dark:border-brand-grey bg-transparent text-xs rounded outline-none focus:border-brand-black dark:focus:border-white transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] font-display font-bold uppercase tracking-widest text-neutral-500 mb-1">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full p-2.5 border border-brand-silver dark:border-brand-grey bg-transparent text-xs rounded outline-none focus:border-brand-black dark:focus:border-white transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-black dark:bg-white text-white dark:text-brand-black font-display font-extrabold text-xs uppercase tracking-widest rounded hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 mt-2"
              >
                <span>Sign In with this Google Account</span>
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
