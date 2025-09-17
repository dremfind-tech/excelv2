import { Card, CardContent } from "@/components/ui/card";

export function StatCard({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <Card className="text-center">
      <CardContent className="py-8">
        <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-primary">
          {icon}
        </div>
        <div className="text-2xl font-semibold">{value}</div>
        <div className="text-sm text-muted">{label}</div>
      </CardContent>
    </Card>
  );
}

