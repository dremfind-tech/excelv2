"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Sparkles, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Don't render navbar on dashboard - it's integrated into the sidebar
  if (isDashboard) {
    return null;
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full backdrop-blur supports-[backdrop-filter]:bg-black/20",
        scrolled ? "border-b border-[color:var(--border)]" : ""
      )}
    >
      <div className="mx-auto max-w-7xl px-6 md:px-8 py-3">
        <div className="flex h-11 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/20 text-primary">
              <Sparkles size={18} />
            </span>
            <span className="font-semibold text-base md:text-lg whitespace-nowrap">Excel Visualizer</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-base text-foreground/80">
            <Link href="/" className="hover:text-foreground transition-colors whitespace-nowrap">Home</Link>
            <Link href="/pricing" className="hover:text-foreground transition-colors whitespace-nowrap">Pricing</Link>
            <DashboardLink />
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 -mr-2 z-10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <AuthButtons />
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[color:var(--border)] mt-3 relative z-20">
            <nav className="flex flex-col gap-3">
              <Link 
                href="/" 
                className="text-foreground/80 hover:text-foreground py-2 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/pricing" 
                className="text-foreground/80 hover:text-foreground py-2 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <DashboardLink mobile onClose={() => setMobileMenuOpen(false)} />
              <div className="pt-3 border-t border-[color:var(--border)] mt-3">
                <AuthButtons />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

function AuthButtons() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ 
      callbackUrl: '/',
      redirect: false 
    });
    router.push('/');
  };

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-foreground/70">
          {session.user?.email}
        </span>
        <Link href="/dashboard">
          <Button size="sm" variant="default">
            Dashboard
          </Button>
        </Link>
        <Button 
          size="sm" 
          variant="outline"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    );
  }

  return (
    <Link href="/signin">
      <Button size="sm" className="relative overflow-hidden">
        <span className="relative z-10">Get Started</span>
        <span className="absolute inset-0 -z-0 bg-gradient-to-r from-primary/40 via-primary/60 to-secondary/50" />
      </Button>
    </Link>
  );
}

function DashboardLink({ mobile, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  if (mobile) {
    return (
      <Link 
        href="/dashboard" 
        className="text-foreground/80 hover:text-foreground py-2 transition-colors"
        onClick={onClose}
      >
        Dashboard
      </Link>
    );
  }

  return (
    <Link href="/dashboard" className="hover:text-foreground transition-colors whitespace-nowrap">
      Dashboard
    </Link>
  );
}
