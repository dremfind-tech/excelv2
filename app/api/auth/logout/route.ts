import { createRouteHandlerClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient(request)
    
    // Get current session first
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    // Only attempt logout if there's actually a session
    if (session) {
      // Sign out from Supabase with global scope - this invalidates the session in the database
      const { error } = await supabase.auth.signOut({ scope: 'global' })
      
      if (error) {
        console.error('Logout error:', error)
        // Don't return error for AuthSessionMissingError as user is already logged out
        if (error.message !== 'Auth session missing!' && !error.message.includes('session missing')) {
          return NextResponse.json({ error: error.message }, { status: 400 })
        }
      }
    }

    // Create response - always return success if we get here
    const response = NextResponse.json({ 
      message: 'Logged out successfully',
      sessionCleared: !!session 
    })
    
    // Clear ALL possible auth-related cookies
    const cookiesToClear = [
      // Supabase auth cookies
      'supabase-auth-token',
      'supabase.auth.token',
      'sb-access-token', 
      'sb-refresh-token',
      // Common cookie patterns that might be used
      `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`,
      // Additional patterns
      'auth-token',
      'access-token',
      'refresh-token',
      'session',
      'user-session'
    ]
    
    cookiesToClear.forEach(cookieName => {
      // Clear with multiple configurations to ensure complete removal
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
      
      // Also clear with domain specification
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        domain: request.nextUrl.hostname,
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
    })

    return response
  } catch (error: any) {
    console.error('Logout API error:', error)
    
    // If it's a session missing error, treat as successful logout
    if (error.message === 'Auth session missing!' || error.message?.includes('session missing')) {
      const response = NextResponse.json({ 
        message: 'Already logged out',
        sessionCleared: false 
      })
      
      // Still clear cookies even for session missing errors
      const cookiesToClear = [
        'supabase-auth-token',
        'supabase.auth.token',
        'sb-access-token', 
        'sb-refresh-token',
        `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`,
        'auth-token',
        'access-token',
        'refresh-token',
        'session',
        'user-session'
      ]
      
      cookiesToClear.forEach(cookieName => {
        response.cookies.set(cookieName, '', {
          expires: new Date(0),
          path: '/',
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        })
        
        // Also clear with domain specification
        response.cookies.set(cookieName, '', {
          expires: new Date(0),
          path: '/',
          domain: request.nextUrl.hostname,
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax'
        })
      })
      
      return response
    }
    
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    )
  }
}