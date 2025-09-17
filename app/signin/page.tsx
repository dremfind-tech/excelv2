"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Mail, Lock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    if (!email || !password) {
      setError("Please enter email and password");
      setLoading(false);
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }
    
    try {
      // Use NextAuth signIn with credentials
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }

      // Redirect to dashboard on successful login
      router.push("/dashboard");
    } catch (err) {
      setError("Sign in failed. Please check your credentials.");
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      await signIn("google", {
        callbackUrl: "/dashboard",
      });
    } catch (err) {
      setError("Failed to sign in with Google. Please try again.");
    }
  }

  return (
    <section className="container-section">
      <div className="grid gap-8 md:grid-cols-2 items-stretch">
        <motion.div
          className="glass relative overflow-hidden p-8 flex flex-col justify-center"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="text-2xl font-semibold">Welcome back</div>
          <p className="mt-2 text-foreground/80">Sign in to continue creating beautiful visualizations from your spreadsheets.</p>
          <ul className="mt-6 space-y-2 text-sm text-foreground/90">
            <li className="flex items-center gap-2"><CheckCircle2 className="text-secondary" size={16} /> Enterprise-grade security</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="text-secondary" size={16} /> AI-powered insights</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="text-secondary" size={16} /> Lightning fast uploads</li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.05 }}
        >
          <Card className="p-2">
            <CardHeader>
              <h1 className="text-2xl font-semibold">Sign in</h1>
              <p className="text-sm text-muted">Use your email and password.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="pl-9" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-9" />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted">
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" className="accent-primary" /> Remember me
                    </label>
                    <button 
                      type="button"
                      onClick={() => window.location.href = '/forgot-password'}
                      className="hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>
                {error && <div className="text-sm text-red-400">{error}</div>}
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Signing in…" : "Sign in"}
                </Button>
              </form>
              
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  className="w-full mt-6"
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </div>
              <div className="mt-4 text-sm text-muted">No account? <button onClick={() => window.location.href = '/signup'} className="underline hover:no-underline">Create one</button></div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
