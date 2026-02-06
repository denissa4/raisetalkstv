import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    console.log('Create subscription request for user:', userId);

    if (!userId) {
      console.error('Missing userId');
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Check if subscription already exists
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingSubscription) {
      console.log('Subscription already exists for user:', userId);
      return NextResponse.json({ success: true, message: 'Subscription already exists' });
    }

    // Create pending subscription (will be activated via Stripe)
    const { error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        stripe_customer_id: `pending_${userId.substring(0, 8)}`,
        stripe_subscription_id: `pending_${Date.now()}`,
        status: 'pending',
        current_period_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      });

    if (subError) {
      console.error('Error creating subscription:', subError);
      return NextResponse.json({ error: subError.message, details: subError }, { status: 500 });
    }

    console.log('Pending subscription created for user:', userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Create subscription error:', error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}
