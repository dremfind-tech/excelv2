import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Ava Thompson",
    role: "Data Analyst, Northstar",
    quote:
      "The fastest way from spreadsheet to story. Our team ship insights hours sooner.",
  },
  {
    name: "Marcus Lee",
    role: "Head of BI, Altitude",
    quote:
      "Beautiful charts with sane defaults. It just works and looks premium.",
  },
  {
    name: "Priya Singh",
    role: "Ops Manager, Cobalt",
    quote:
      "Upload, clean, visualize—it's that simple. The team loves it.",
  },
];

export function Testimonials() {
  return (
    <section className="container-section">
      <h2 className="text-2xl md:text-3xl font-semibold mb-6">What customers say</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <Card key={t.name}>
            <CardContent className="py-6">
              <p className="text-foreground/90">“{t.quote}”</p>
              <div className="mt-4 text-sm text-muted">{t.name} · {t.role}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

