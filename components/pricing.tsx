"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Tier = {
  name: string;
  monthly: number | "Custom";
  yearly?: { perMonth: number; billed: number } | "Custom";
  blurb: string;
  features: string[];
  highlight?: boolean;
  cta?: string;
};

const baseTiers: Tier[] = [
  {
    name: "Starter",
    monthly: 9,
    yearly: { perMonth: 7, billed: 84 },
    blurb: "Great for getting started.",
    features: [
      "20 credits/mo (rollover up to 60)",
      "Excel uploads",
      "Chart refinements: 0.5 credit",
      "Export: PNG, JPG",
      "Support: Basic email",
    ],
    cta: "Get Starter",
  },
  {
    name: "Pro",
    monthly: 29,
    yearly: { perMonth: 23, billed: 276 },
    blurb: "For professionals who need more.",
    features: [
      "100 credits/mo (rollover up to 300)",
      "Excel uploads",
      "Chart refinements: Unlimited",
      "Export: PNG, JPG, PDF, PPT, CSV",
      "Support: Priority",
    ],
    highlight: true,
    cta: "Start Pro Trial",
  },
  {
    name: "Pro Plus",
    monthly: 59,
    yearly: { perMonth: 49, billed: 588 },
    blurb: "Advanced features and priority service.",
    features: [
      "250 credits/mo (rollover up to 750)",
      "Excel uploads",
      "Chart refinements: Unlimited",
      "Export: All (Advanced)",
      "AI analytics insights",
      "Support: Dedicated priority",
    ],
    cta: "Upgrade to Pro Plus",
  },
];

function Price({ value, suffix }: { value: number | "Custom"; suffix?: string }) {
  if (value === "Custom") return <span className="text-3xl font-bold">Custom</span>;
  return (
    <span className="text-3xl font-bold">
      ${value}
      {suffix && <span className="text-sm font-normal text-muted">{suffix}</span>}
    </span>
  );
}

export function Pricing() {
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleProceedToPay = async (planName: string, billing: 'monthly' | 'yearly') => {
    if (!session) {
      // Redirect to sign up if not authenticated
      router.push('/signup');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planName: planName.toLowerCase().replace(' ', '-'),
          billing,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create checkout session');
      }

      // Redirect to checkout URL (in real implementation, this would be Stripe checkout)
      window.location.href = result.url;
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error instanceof Error ? error.message : 'Failed to proceed to checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="pricing" className="container-section">
      <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-blue-500/10 to-purple-500/10 p-6 md:p-8">
        <div className="absolute inset-0 pointer-events-none"
             style={{
               backgroundImage:
                 "radial-gradient(circle at 20% 10%, rgba(255,255,255,0.08), transparent 25%), radial-gradient(circle at 80% 0%, rgba(124,92,250,0.12), transparent 30%)",
             }}
        />

        <div className="relative mb-6">
          <Tabs defaultValue="monthly" className="w-full">
            <div className="flex flex-col items-center gap-3">
              <h2 className="text-2xl md:text-3xl font-semibold">Pricing</h2>
              <TabsList className="mx-auto rounded-full p-1.5">
                <TabsTrigger value="monthly">Billed Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Billed Yearly</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="monthly">
              <div className="mt-6 grid gap-6 md:grid-cols-3">
                {baseTiers.map((t) => (
                  <div
                    key={`${t.name}-m`}
                    role="radio"
                    aria-checked={selected === t.name}
                    tabIndex={0}
                    onClick={() => setSelected(t.name)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelected(t.name);
                      }
                    }}
                    className={`relative overflow-hidden rounded-3xl shadow-2xl border cursor-pointer transition-all ${
                      selected === t.name
                        ? "border-primary/50 ring-2 ring-primary/60 bg-gradient-to-b from-primary/10 to-secondary/10"
                        : "border-[color:var(--border)] bg-[color:var(--card)]"
                    } text-[color:var(--foreground)]`}
                  >
                    <div className="absolute inset-0 opacity-40 pattern-grid" />
                    <div className="relative p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-semibold">{t.name}</div>
                          <div className="text-xs text-gray-600">{t.blurb}</div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          selected === t.name ? "bg-secondary/20 text-secondary" : t.highlight ? "bg-primary/20 text-primary" : "bg-[color:var(--card)] border border-[color:var(--border)] text-foreground/70"
                        }`}>{selected === t.name ? "SELECTED" : t.highlight ? "POPULAR" : ""}</span>
                      </div>
                      <div className="mt-4"><span className="text-3xl font-bold">{t.monthly === 0 ? "Free" : `$${t.monthly}`}</span><span className="text-sm text-gray-600 dark:text-foreground/70">{t.monthly === 0 ? "" : "/month"}</span></div>
                      <ul className="mt-4 space-y-2 text-sm">
                        {t.features.map((f) => (
                          <li key={f} className="flex items-center gap-2">
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white"><Check size={12} /></span>
                            {f}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className={`mt-6 w-full rounded-full ${
                          selected === t.name ? "bg-secondary text-black hover:opacity-90" : ""
                        }`}
                        disabled={loading}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card selection
                          if (selected === t.name) {
                            handleProceedToPay(t.name, 'monthly');
                          } else {
                            setSelected(t.name);
                          }
                        }}
                      >
                        {loading && selected === t.name ? "Processing..." : selected === t.name ? "Proceed to pay" : t.cta ?? `Choose ${t.name}`}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="yearly">
              <div className="mt-6 grid gap-6 md:grid-cols-3">
                {baseTiers.map((t) => (
                  <div
                    key={`${t.name}-y`}
                    role="radio"
                    aria-checked={selected === t.name}
                    tabIndex={0}
                    onClick={() => setSelected(t.name)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelected(t.name);
                      }
                    }}
                    className={`relative overflow-hidden rounded-3xl shadow-2xl border cursor-pointer transition-all ${
                      selected === t.name
                        ? "border-primary/50 ring-2 ring-primary/60 bg-gradient-to-b from-primary/10 to-secondary/10"
                        : "border-[color:var(--border)] bg-[color:var(--card)]"
                    } text-[color:var(--foreground)]`}
                  >
                    <div className="absolute inset-0 opacity-40 pattern-grid" />
                    <div className="relative p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-semibold">{t.name}</div>
                          <div className="text-xs text-gray-600 dark:text-foreground/70">{t.blurb}</div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          selected === t.name ? "bg-secondary/20 text-secondary" : t.highlight ? "bg-primary/20 text-primary" : "bg-[color:var(--card)] border border-[color:var(--border)] text-foreground/70"
                        }`}>{selected === t.name ? "SELECTED" : t.highlight ? "BEST VALUE" : ""}</span>
                      </div>
                      {t.yearly && t.yearly !== "Custom" ? (
                        <div className="mt-4 flex items-baseline gap-2">
                          <span className="text-3xl font-bold">${t.yearly.perMonth}</span>
                          <span className="text-sm text-gray-600 dark:text-foreground/70">/month, billed ${t.yearly.billed}/yr</span>
                        </div>
                      ) : (
                        <div className="mt-4 text-3xl font-bold">Custom</div>
                      )}
                      <ul className="mt-4 space-y-2 text-sm">
                        {t.features.map((f) => (
                          <li key={f} className="flex items-center gap-2">
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white"><Check size={12} /></span>
                            {f}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className={`mt-6 w-full rounded-full ${
                          selected === t.name ? "bg-secondary text-black hover:opacity-90" : ""
                        }`}
                        disabled={loading}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card selection
                          if (selected === t.name) {
                            handleProceedToPay(t.name, 'yearly');
                          } else {
                            setSelected(t.name);
                          }
                        }}
                      >
                        {loading && selected === t.name ? "Processing..." : selected === t.name ? "Proceed to pay" : t.cta ?? `Choose ${t.name}`}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}