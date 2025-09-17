import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Define pricing plans
const PLANS = {
  starter: {
    name: 'Starter',
    monthly: 9,
    yearly: 84,
    features: ['20 credits/mo', 'Excel uploads', 'Basic export formats'],
  },
  pro: {
    name: 'Pro',
    monthly: 29,
    yearly: 276,
    features: ['100 credits/mo', 'Excel uploads', 'All export formats', 'Priority support'],
  },
  'pro-plus': {
    name: 'Pro Plus',
    monthly: 59,
    yearly: 588,
    features: ['250 credits/mo', 'Excel uploads', 'Advanced features', 'Dedicated support'],
  },
};

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { planName, billing } = await request.json();

    // Validate input
    if (!planName || !billing) {
      return NextResponse.json(
        { error: 'Plan name and billing type are required' },
        { status: 400 }
      );
    }

    if (!PLANS[planName as keyof typeof PLANS]) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    if (!['monthly', 'yearly'].includes(billing)) {
      return NextResponse.json(
        { error: 'Invalid billing type' },
        { status: 400 }
      );
    }

    const plan = PLANS[planName as keyof typeof PLANS];
    const amount = billing === 'monthly' ? plan.monthly : plan.yearly;

    // For demo purposes, we'll simulate the checkout session creation
    // In a real implementation, you would use Stripe here
    
    // Simulate Stripe checkout session
    const checkoutSession = {
      id: `cs_test_${Math.random().toString(36).substr(2, 9)}`,
      url: `${process.env.NEXTAUTH_URL}/checkout/success?plan=${planName}&billing=${billing}`,
      customer_email: session.user.email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: plan.name,
            description: plan.features.join(', '),
          },
          unit_amount: amount * 100, // Convert to cents
          recurring: {
            interval: billing === 'monthly' ? 'month' : 'year',
          },
        },
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
    };

    console.log('Created checkout session for:', {
      user: session.user.email,
      plan: planName,
      billing,
      amount,
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });

  } catch (error) {
    console.error('Checkout session creation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      { status: 500 }
    );
  }
}

/* 
Real Stripe implementation would look like this:

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { planName, billing } = await request.json();
    const plan = PLANS[planName];
    const amount = billing === 'monthly' ? plan.monthly : plan.yearly;

    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: session.user.email,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: plan.name,
            description: plan.features.join(', '),
          },
          unit_amount: amount * 100,
          recurring: {
            interval: billing === 'monthly' ? 'month' : 'year',
          },
        },
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
      metadata: {
        userId: session.user.id,
        planName,
        billing,
      },
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error('Stripe error:', error);
    return NextResponse.json({ error: 'Payment processing failed' }, { status: 500 });
  }
}
*/