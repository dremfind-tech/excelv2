import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { password, accessToken, refreshToken } = await request.json();

    console.log('Reset password API: Processing password reset request');

    // Validate input
    if (!password || !accessToken || !refreshToken) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
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

    // Set the session using the tokens from the reset link
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError) {
      console.error('Session setup error:', sessionError);
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    if (!sessionData.user) {
      return NextResponse.json(
        { error: 'Invalid reset token' },
        { status: 400 }
      );
    }

    // Update the user's password
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });

    if (updateError) {
      console.error('Password update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update password. Please try again.' },
        { status: 500 }
      );
    }

    console.log('Reset password API: Password updated successfully');

    return NextResponse.json(
      { 
        success: true, 
        message: 'Password updated successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Reset password API error:', {
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