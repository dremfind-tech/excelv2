"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function CheckoutSuccessPage() {
  const [processing, setProcessing] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const plan = searchParams.get('plan');
  const billing = searchParams.get('billing');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Simulate processing payment confirmation
    const timer = setTimeout(() => {
      setProcessing(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (processing) {
    return (
      <section className="container-section">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h1 className="text-xl font-semibold mb-2">Processing your subscription...</h1>
              <p className="text-sm text-muted-foreground">
                Please wait while we set up your account.
              </p>
            </Card>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="container-section">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="p-6 text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Welcome to Excel Visualizer!</h1>
              <p className="text-lg text-muted-foreground">
                Your subscription has been activated successfully.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {plan && (
                <div className="bg-primary/5 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Subscription Details</h3>
                  <div className="text-sm space-y-1">
                    <p><strong>Plan:</strong> {plan.charAt(0).toUpperCase() + plan.slice(1).replace('-', ' ')}</p>
                    <p><strong>Billing:</strong> {billing === 'monthly' ? 'Monthly' : 'Yearly'}</p>
                    {sessionId && <p><strong>Transaction ID:</strong> {sessionId}</p>}
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <h3 className="font-semibold">What's next?</h3>
                <div className="grid gap-3 text-left">
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Upload your first Excel file</p>
                      <p className="text-sm text-muted-foreground">Start creating beautiful visualizations</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Explore AI-powered insights</p>
                      <p className="text-sm text-muted-foreground">Let our AI analyze your data automatically</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Export and share</p>
                      <p className="text-sm text-muted-foreground">Download charts in multiple formats</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  size="lg"
                  onClick={() => window.location.href = '/dashboard'}
                  className="sm:w-auto"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => window.location.href = '/upload'}
                  className="sm:w-auto"
                >
                  Upload First File
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}