import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ReactNode } from "react";

export function FeatureCard({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <Card className="hover:-translate-y-1 transition-transform">
      <CardHeader>
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">{icon}</div>
        <div className="mt-3 text-lg font-semibold">{title}</div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted">{description}</p>
      </CardContent>
    </Card>
  );
}

