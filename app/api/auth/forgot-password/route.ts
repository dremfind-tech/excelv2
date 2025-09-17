import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    console.log('Forgot password API: Received request for email:', email);

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Check for required environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { error: 'Server configuration error. Please check environment variables.' },
        { status: 500 }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    console.log('Forgot password API: Sending password reset email...');

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password`,
    });

    if (error) {
      console.error('Supabase password reset error:', error);
      
      // Don't reveal whether the email exists or not for security
      // Always return success to prevent email enumeration
      if (error.message.includes('User not found') || error.message.includes('Invalid email')) {
        console.log('User not found, but returning success for security');
      } else {
        return NextResponse.json(
          { error: 'Failed to send reset email. Please try again.' },
          { status: 500 }
        );
      }
    }

    console.log('Forgot password API: Reset email sent successfully');

    return NextResponse.json(
      { 
        success: true, 
        message: 'If an account with that email exists, we have sent a password reset link.'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Forgot password API error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    });
    
    return NextResponse.json(
      { 
        error: 'Internal server error. Please try again.',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      { status: 500 }
    );
  }
}