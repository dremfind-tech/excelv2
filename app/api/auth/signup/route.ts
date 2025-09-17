import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    console.log('Signup API: Received request for email:', email); // Debug log

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
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
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { error: 'Server configuration error. Please check environment variables.' },
        { status: 500 }
      );
    }

    // Create Supabase client with service role key for server-side operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('Signup API: Creating user account...'); // Debug log

    // Check if user already exists first
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error checking existing users:', listError);
      return NextResponse.json(
        { error: 'Unable to verify user status. Please try again.' },
        { status: 500 }
      );
    }

    const existingUser = existingUsers.users.find(u => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'This email is already registered. Please sign in instead.' },
        { status: 409 }
      );
    }

    // Create user with Supabase Admin API
    // Email confirmation is disabled in supabase/config.toml (enable_confirmations = false)
    // Users can sign in immediately after signup without email verification
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        name,
      },
      email_confirm: true, // Set to true to avoid email confirmation step
    });

    console.log('Signup API: Supabase response:', { 
      userEmail: data?.user?.email, 
      errorMessage: error?.message 
    }); // Debug log

    if (error) {
      console.error('Supabase signup error details:', error);
      
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        return NextResponse.json(
          { error: 'This email is already registered. Please sign in instead.' },
          { status: 409 }
        );
      }
      
      if (error.message.includes('422') || error.message.includes('invalid')) {
        return NextResponse.json(
          { error: 'Invalid email or password format. Please check your input.' },
          { status: 422 }
        );
      }

      if (error.message.includes('weak password')) {
        return NextResponse.json(
          { error: 'Password is too weak. Please use a stronger password with at least 8 characters.' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: error.message || 'Failed to create account' },
        { status: 500 }
      );
    }

    if (!data.user) {
      console.error('Signup API: No user returned from Supabase');
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    console.log('Signup API: User created successfully:', data.user.email); // Debug log

    // The profile should be created automatically by the database trigger
    // Let's verify it was created and create manually if needed
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Signup API: Profile verification error:', profileError);
      }

      if (!profile) {
        // Create profile manually if the trigger didn't work
        console.log('Signup API: Creating profile manually');
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            name: name,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email}`,
            plan: 'Free',
          });

        if (createProfileError) {
          console.error('Signup API: Failed to create profile:', createProfileError);
          // Don't fail the signup if profile creation fails
        } else {
          console.log('Signup API: Profile created manually');
        }
      } else {
        console.log('Signup API: Profile exists:', profile.email);
      }
    } catch (profileCheckError) {
      console.error('Signup API: Error checking/creating profile:', profileCheckError);
      // Don't fail the signup if profile operations fail
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Account created successfully. You can now sign in.',
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Signup API error details:', {
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