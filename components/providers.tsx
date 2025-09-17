"use client";
// import { SessionProvider as CustomSessionProvider } from '@/contexts/session-context';
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      {children}
    </NextAuthSessionProvider>
  );
}
