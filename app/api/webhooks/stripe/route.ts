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

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature provided' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Checkout session completed:', session.id);
        console.log('User ID from metadata:', session.metadata?.user_id);
        
        if (session.mode === 'subscription' && session.subscription) {
          const subscriptionData = await stripe.subscriptions.retrieve(
            session.subscription as string
          ) as unknown as { id: string; status: string; current_period_end: number };

          console.log('Subscription retrieved:', subscriptionData.id, 'Status:', subscriptionData.status);

          const periodEnd = new Date(subscriptionData.current_period_end * 1000).toISOString();

          // Try to update existing subscription first, then insert if not found
          const { data: existing } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('user_id', session.metadata?.user_id)
            .maybeSingle();

          let error;
          if (existing) {
            // Update existing
            const result = await supabase
              .from('subscriptions')
              .update({
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: subscriptionData.id,
                status: 'active',
                current_period_end: periodEnd,
              })
              .eq('user_id', session.metadata?.user_id);
            error = result.error;
          } else {
            // Insert new
            const result = await supabase.from('subscriptions').insert({
              user_id: session.metadata?.user_id,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscriptionData.id,
              status: 'active',
              current_period_end: periodEnd,
            });
            error = result.error;
          }

          if (error) {
            console.error('Error saving subscription:', error);
            throw error;
          }
          console.log('Subscription saved successfully');
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as unknown as { 
          id: string; 
          status: string; 
          current_period_end: number 
        };

        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Error updating subscription:', error);
          throw error;
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
          })
          .eq('stripe_subscription_id', subscription.id);

        if (error) {
          console.error('Error canceling subscription:', error);
          throw error;
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Error processing webhook:', err);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}