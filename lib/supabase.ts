import { createBrowserClient } from '@supabase/ssr'
import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Server-side Supabase client for Route Handlers
export function createRouteHandlerClient(request: NextRequest) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        request.cookies.set({
          name,
          value,
          ...options,
        })
      },
      remove(name: string, options: any) {
        request.cookies.set({
          name,
          value: '',
          ...options,
        })
      },
    },
  })
}

// Middleware Supabase client
export function createMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        response.cookies.set({
          name,
          value,
          ...options,
        })
      },
      remove(name: string, options: any) {
        response.cookies.set({
          name,
          value: '',
          ...options,
        })
      },
    },
  })

  return { supabase, response }
}

// Type definitions for our User model
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  plan: 'Free' | 'Pro' | 'Enterprise'
  created_at: string
  updated_at: string
}

// Database table types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}