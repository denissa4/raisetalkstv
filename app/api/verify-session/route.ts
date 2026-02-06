import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover',
});

// Use service role key to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  console.log('=== VERIFY SESSION API CALLED ===');
  try {
    const { sessionId } = await request.json();
    console.log('Session ID:', sessionId);

    if (!sessionId) {
      console.log('ERROR: No session ID provided');
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Retrieve the Stripe checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session || session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const userId = session.metadata?.user_id;
    if (!userId) {
      return NextResponse.json({ error: 'No user ID in session' }, { status: 400 });
    }

    // Check if subscription already exists
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id, status')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing?.status === 'active') {
      return NextResponse.json({ success: true, message: 'Subscription already active' });
    }

    // Get subscription details from Stripe - default to 30 days from now
    let periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    if (session.subscription) {
      try {
        const sub = await stripe.subscriptions.retrieve(session.subscription as string);
        console.log('Subscription data:', JSON.stringify(sub, null, 2));
        
        // Try to get current_period_end from various possible locations
        const subAny = sub as unknown as Record<string, unknown>;
        const endTimestamp = subAny.current_period_end as number | undefined;
        
        if (endTimestamp && typeof endTimestamp === 'number') {
          periodEnd = new Date(endTimestamp * 1000).toISOString();
        }
      } catch (subError) {
        console.error('Error retrieving subscription details:', subError);
        // Keep default periodEnd
      }
    }

    // Create or update subscription
    console.log('Attempting to save subscription for user:', userId);
    console.log('Existing subscription:', existing);
    
    if (existing) {
      const { error, data } = await supabase
        .from('subscriptions')
        .update({
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          status: 'active',
          current_period_end: periodEnd,
        })
        .eq('user_id', userId)
        .select();

      console.log('Update result:', { error, data });

      if (error) {
        console.error('Error updating subscription:', JSON.stringify(error));
        return NextResponse.json({ 
          error: `Failed to update subscription: ${error.message}`,
          details: error 
        }, { status: 500 });
      }
    } else {
      const { error, data } = await supabase.from('subscriptions').insert({
        user_id: userId,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
        status: 'active',
        current_period_end: periodEnd,
      }).select();

      console.log('Insert result:', { error, data });

      if (error) {
        console.error('Error creating subscription:', JSON.stringify(error));
        return NextResponse.json({ 
          error: `Failed to create subscription: ${error.message}`,
          details: error 
        }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verify session error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to verify session: ${errorMessage}` }, { status: 500 });
  }
}
