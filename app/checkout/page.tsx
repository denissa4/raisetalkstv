'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function CheckoutPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const initiateCheckout = async () => {
      try {
        // Check if user is logged in
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          router.push('/login?redirect=/checkout');
          return;
        }

        // Check if user already has an active subscription
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_status')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          throw new Error('Failed to fetch subscription status');
        }

        if (profile?.subscription_status === 'active') {
          router.push('/library');
          return;
        }

        // Call the checkout API with authentication
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create checkout session');
        }

        const { url } = await response.json();

        if (!url) {
          throw new Error('No checkout URL returned');
        }

        // Redirect to Stripe checkout
        window.location.href = url;
      } catch (err) {
        console.error('Checkout error:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        setLoading(false);
      }
    };

    initiateCheckout();
  }, [router, supabase]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Checkout Error
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/library')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Return to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Preparing Checkout
        </h2>
        <p className="text-gray-600">
          Please wait while we redirect you to the payment page...
        </p>
      </div>
    </div>
  );
}