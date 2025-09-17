import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { SupabaseAdapter } from "@auth/supabase-adapter"
import { createClient } from "@supabase/supabase-js"

// Create Supabase client for NextAuth adapter
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const authOptions: NextAuthOptions = {
  // Remove the adapter for JWT strategy to work properly
  // adapter: SupabaseAdapter({
  //   url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  // }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error('Missing credentials');
          return null;
        }

        try {
          // Check environment variables
          if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            console.error('Missing Supabase environment variables');
            return null;
          }

          // Create a Supabase client with admin privileges for authentication
          const adminSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
              auth: {
                autoRefreshToken: false,
                persistSession: false
              }
            }
          );

          console.log('Attempting to authenticate user:', credentials.email);

          // First, try to find the user by email using admin privileges
          const { data: userList, error: listError } = await adminSupabase.auth.admin.listUsers();
          
          if (listError) {
            console.error('Error listing users:', listError);
            return null;
          }

          const existingUser = userList.users.find(u => u.email === credentials.email);
          
          if (!existingUser) {
            console.error('User not found:', credentials.email);
            return null;
          }

          // Validate password by attempting to sign in with regular auth client
          const authSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          );

          const { data: signInData, error: signInError } = await authSupabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (signInError) {
            console.error('Password validation failed:', signInError.message);
            return null;
          }

          if (!signInData.user) {
            console.error('No user returned from sign in');
            return null;
          }

          console.log('User authenticated successfully:', existingUser.email);

          // Get user profile from profiles table
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', existingUser.email)
            .single();

          if (!profile) {
            // Create profile if it doesn't exist
            const { data: newProfile, error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: existingUser.id,
                email: existingUser.email!,
                name: existingUser.user_metadata?.name || existingUser.email!.split('@')[0],
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${existingUser.email}`,
                plan: 'Free',
              })
              .select()
              .single();

            if (profileError) {
              console.error('Error creating profile:', profileError);
            }
          }

          return {
            id: existingUser.id,
            email: existingUser.email!,
            name: profile?.name || existingUser.user_metadata?.name || existingUser.email!.split('@')[0],
            image: profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${existingUser.email}`,
          };
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      // Initial sign in
      if (account && user) {
        console.log('JWT callback - Initial sign in:', user.email);
        token.accessToken = account.access_token;
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      
      // Return previous token if the access token has not expired yet
      if (token.id) {
        console.log('JWT callback - Returning existing token for:', token.email);
      }
      
      return token;
    },
    async session({ session, token }) {
      console.log('Session callback - Token:', token);
      console.log('Session callback - Session before:', session);
      
      // Send properties to the client, using token data
      if (token && session.user) {
        (session.user as any).id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        (session as any).accessToken = token.accessToken;
      }
      
      console.log('Session callback - Session after:', session);
      return session;
    },
    async signIn({ user, account, profile }) {
      // Auto-create user profile in our profiles table when they sign in
      if (user.email) {
        try {
          // Check if profile already exists
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', user.email)
            .single()

          if (!existingProfile) {
            // Create profile in our profiles table
            const { error } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email,
                name: user.name || user.email.split('@')[0],
                avatar: user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
                plan: 'Free',
              })

            if (error) {
              console.error('Error creating user profile:', error);
            }
          }
        } catch (error) {
          console.error('Error in signIn callback:', error);
        }
      }
      return true;
    },
  },
  pages: {
    signIn: '/signin',
    signOut: '/',
    error: '/signin',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
}