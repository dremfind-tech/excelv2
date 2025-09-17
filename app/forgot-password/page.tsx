"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    if (!email) {
      setError("Please enter your email address");
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
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send reset email');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <section className="container-section">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-2">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h1 className="text-2xl font-semibold">Check your email</h1>
                <p className="text-sm text-muted">
                  We&apos;ve sent a password reset link to {email}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Didn&apos;t receive the email? Check your spam folder or{' '}
                  <button 
                    onClick={() => setSuccess(false)} 
                    className="underline hover:no-underline"
                  >
                    try again
                  </button>
                </p>
                <Link href="/signin">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to sign in
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="container-section">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="p-2">
            <CardHeader>
              <h1 className="text-2xl font-semibold">Reset your password</h1>
              <p className="text-sm text-muted">
                Enter your email address and we&apos;ll send you a link to reset your password.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <Input 
                      type="email"
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="you@company.com" 
                      className="pl-9" 
                    />
                  </div>
                </div>
                {error && <div className="text-sm text-red-400">{error}</div>}
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Sending..." : "Send reset link"}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <Link href="/signin" className="text-sm text-muted hover:underline inline-flex items-center gap-1">
                  <ArrowLeft size={14} />
                  Back to sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}