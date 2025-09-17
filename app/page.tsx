import { Hero } from "@/components/hero";
import { StatCard } from "@/components/stat-card";
import { FeatureCard } from "@/components/feature-card";
import { FAQ } from "@/components/faq";
import { Testimonials } from "@/components/testimonial";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Brain, BarChart3, ShieldCheck, Zap, FileSpreadsheet, Activity, LifeBuoy } from "lucide-react";
import { HowItWorks } from "@/components/how-it-works";

export default function Page() {
  return (
    <div>
      <Hero />

      <section className="container-section" aria-labelledby="trusted">
        <h2 id="trusted" className="sr-only">Trusted by Data Professionals</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <StatCard label="Files Processed" value="10K+" icon={<FileSpreadsheet size={18} />} />
          <StatCard label="Charts Generated" value="50K+" icon={<BarChart3 size={18} />} />
          <StatCard label="Uptime" value="99.9%" icon={<Activity size={18} />} />
          <StatCard label="Support" value="24/7" icon={<LifeBuoy size={18} />} />
        </div>
      </section>

      <section className="container-section" id="features">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">Why Choose Our Platform?</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <FeatureCard icon={<Brain size={18} />} title="Smart Data Analysis" description="AI-powered insights from your Excel files with automatic chart generation." />
          <FeatureCard icon={<BarChart3 size={18} />} title="Beautiful Visualizations" description="Clean, customizable dashboards with one-click themes." />
          <FeatureCard icon={<ShieldCheck size={18} />} title="Enterprise Security" description="SOC 2 readiness, encryption at rest & in transit." />
          <FeatureCard icon={<Zap size={18} />} title="Lightning Fast" description="Upload to insight in seconds with streaming previews." />
        </div>
      </section>

      <section className="container-section">
        <div className="grid gap-6 md:grid-cols-2 items-start">
          <Card>
            <CardContent className="py-6">
              <div className="text-lg font-semibold mb-3">Sheet Preview</div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-separate border-spacing-y-1">
                  <thead className="text-muted">
                    <tr>
                      <th className="text-left font-medium">Month</th>
                      <th className="text-left font-medium">Revenue</th>
                      <th className="text-left font-medium">Expenses</th>
                      <th className="text-left font-medium">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="">
                        <td className="py-2">M{i + 1}</td>
                        <td>$ {(10000 + i * 1234).toLocaleString()}</td>
                        <td>$ {(6000 + i * 987).toLocaleString()}</td>
                        <td className="text-secondary">$ {(4000 + i * 247).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Separator />
              <div className="mt-4 text-sm text-muted">Click “Generate Charts” to create visuals instantly.</div>
            </CardContent>
          </Card>
          <HowItWorks />
        </div>
      </section>

      <Testimonials />
      <FAQ />
    </div>
  );
}
