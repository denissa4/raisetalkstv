import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId, displayName } = await request.json();

    if (!userId || !displayName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        display_name: displayName,
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=e50914&color=fff&size=200`,
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      return NextResponse.json({ error: profileError.message }, { status: 500 });
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
      // Non-critical - user will go through checkout
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Create profile error:', error);
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
  }
}
