import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <section className="container-section">
      <h1 className="text-3xl font-bold">Settings</h1>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="text-lg font-semibold">Profile</div>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="block text-sm text-muted">Name</label>
            <Input placeholder="Your name" />
            <label className="block text-sm text-muted">Email</label>
            <Input placeholder="you@example.com" type="email" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="text-lg font-semibold">Preferences</div>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="block text-sm text-muted">Theme</label>
            <select className="rounded-xl bg-white/5 border border-white/10 text-sm px-3 py-2">
              <option>Dark</option>
              <option>Light</option>
              <option>System</option>
            </select>
            <label className="block text-sm text-muted">Compact mode</label>
            <select className="rounded-xl bg-white/5 border border-white/10 text-sm px-3 py-2">
              <option>Off</option>
              <option>On</option>
            </select>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <div className="text-lg font-semibold">API</div>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="block text-sm text-muted">API Key</label>
            <Input placeholder="••••-••••-••••-••••" type="password" />
            <label className="block text-sm text-muted">Notes</label>
            <Textarea rows={3} placeholder="Notes about your integration" />
            <div className="pt-2 flex gap-2">
              <Button>Save</Button>
              <Button variant="ghost">Reset</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

