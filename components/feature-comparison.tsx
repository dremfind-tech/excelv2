"use client";
import { Check, X } from "lucide-react";

type Row = {
  feature: string;
  starter: string | boolean;
  pro: string | boolean;
  proPlus: string | boolean;
};

const rows: Row[] = [
  { feature: "Monthly credits", starter: "20", pro: "100", proPlus: "250" },
  { feature: "Credit rollover", starter: "Up to 60", pro: "Up to 300", proPlus: "Up to 750" },
  { feature: "Excel uploads", starter: true, pro: true, proPlus: true },
  { feature: "Chart refinements", starter: "0.5 credit", pro: "Unlimited", proPlus: "Unlimited" },
  { feature: "Export formats", starter: "PNG, JPG", pro: "PNG, JPG, PDF, PPT, CSV", proPlus: "All (Advanced)" },
  { feature: "AI analytics insights", starter: false, pro: false, proPlus: true },
  { feature: "Support", starter: "Basic email", pro: "Priority", proPlus: "Dedicated priority" },
];

function CellValue({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return (
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full">
        {value ? (
          <Check size={16} className="text-secondary" />
        ) : (
          <X size={16} className="text-rose-500" />
        )}
      </span>
    );
  }
  return <span>{value}</span>;
}

export function FeatureComparisonTable({ billing = "monthly" as const }: { billing?: "monthly" | "yearly" }) {
  const isYearly = billing === "yearly";
  const title = `Feature Comparison Table${isYearly ? " (Yearly Plans)" : ""}`;
  return (
    <section className="container-section" aria-labelledby={`feature-comparison-${billing}`}>
      <h2 id={`feature-comparison-${billing}`} className="text-2xl md:text-3xl font-semibold mb-4">
        {title}
      </h2>
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[color:var(--card)]">
        <table className="min-w-full text-sm">
          <thead className="text-muted">
            <tr className="border-b border-white/10">
              <th className="text-left font-medium py-3 px-4">Feature</th>
              <th className="text-left font-medium py-3 px-4">
                {isYearly ? "Starter ($84/year)" : "Starter ($9)"}
              </th>
              <th className="text-left font-medium py-3 px-4">
                {isYearly ? "Pro ($276/year)" : "Pro ($29)"}
              </th>
              <th className="text-left font-medium py-3 px-4">
                {isYearly ? "Pro Plus ($588/year)" : "Pro Plus ($59)"}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.feature} className="border-b border-white/10 last:border-b-0">
                <td className="py-4 px-4 font-medium">{r.feature}</td>
                <td className="py-4 px-4"><CellValue value={r.starter} /></td>
                <td className="py-4 px-4"><CellValue value={r.pro} /></td>
                <td className="py-4 px-4"><CellValue value={r.proPlus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default FeatureComparisonTable;
