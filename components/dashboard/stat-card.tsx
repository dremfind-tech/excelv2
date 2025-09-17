import { Card, CardContent } from "@/components/ui/card";

export function StatCard({ label, value, hint, icon }: { label: string; value: string; hint?: string; icon?: React.ReactNode }) {
  return (
    <Card className="h-full">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted">{label}</div>
            <div className="text-xl font-semibold">{value}</div>
            {hint && <div className="text-xs text-muted mt-1">{hint}</div>}
          </div>
          {icon && <div className="text-secondary">{icon}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
