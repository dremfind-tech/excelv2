"use client";
import { ChatSidebar } from "@/components/chat/sidebar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading
    
    if (!session) {
      console.log('Dashboard Layout - No session, redirecting to signin');
      router.push('/signin');
      return;
    }
    
    console.log('Dashboard Layout - User authenticated:', session.user?.email);
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/70">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <ChatSidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}

