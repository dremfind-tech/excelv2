import { Card, CardContent } from "@/components/ui/card";

type Upload = {
  id: string;
  name: string;
  rows: number;
  status: "Processed" | "Queued" | "Failed";
  createdAt: string;
};

export function UploadsTable({ items }: { items: Upload[] }) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="text-lg font-semibold mb-3">Recent uploads</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-muted">
              <tr className="border-b border-white/10">
                <th className="text-left font-medium py-2 px-3">File</th>
                <th className="text-left font-medium py-2 px-3">Rows</th>
                <th className="text-left font-medium py-2 px-3">Status</th>
                <th className="text-left font-medium py-2 px-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id} className="border-b border-white/5 last:border-b-0">
                  <td className="py-2 px-3">{u.name}</td>
                  <td className="py-2 px-3">{u.rows.toLocaleString()}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      u.status === "Processed"
                        ? "bg-secondary/20 text-secondary"
                        : u.status === "Queued"
                        ? "bg-primary/20 text-primary"
                        : "bg-rose-500/20 text-rose-300"
                    }`}>{u.status}</span>
                  </td>
                  <td className="py-2 px-3 text-muted">{u.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

