import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-white/10">
      <div className="container-section grid gap-8 md:grid-cols-3">
        <div>
          <div className="text-lg font-semibold mb-3">Excel Visualizer</div>
          <p className="text-sm text-muted">Upload spreadsheets, clean data, and generate AI-driven charts.</p>
        </div>
        <div>
          <div className="font-medium mb-2">Product</div>
          <ul className="space-y-1 text-sm text-foreground/80">
            <li><a href="#features" className="hover:underline">Features</a></li>
            <li><a href="/pricing" className="hover:underline">Pricing</a></li>
            <li><a href="#faq" className="hover:underline">FAQ</a></li>
          </ul>
        </div>
        <div>
          <div className="font-medium mb-2">Stay in the loop</div>
          <div className="flex gap-2">
            <Input placeholder="you@example.com" aria-label="Email" />
            <Button>Subscribe</Button>
          </div>
        </div>
      </div>
      <div className="container-section pt-0 text-xs text-muted">© {year} Excel Visualizer. All rights reserved.</div>
    </footer>
  );
}
