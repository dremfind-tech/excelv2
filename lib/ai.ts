import type { ChartSpec } from "@/types/chart-spec";

type Input = {
  prompt: string;
  schema: { columns: { name: string; type: string }[] };
  rows: any[];
};

const COLORS = ["#7C5CFA", "#00D1B2", "#A6A6B3", "#F59E0B", "#EF4444", "#10B981"]; 

export async function getChartSuggestions(input: Input): Promise<ChartSpec[]> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  try {
    if (apiKey) {
      // Lazy load to avoid bundling serverless if not needed
      const { OpenAI } = await import("openai");
      const client = new OpenAI({ apiKey });
      const sys = `You are a data viz assistant. Given a table schema and a natural language instruction, output 1-3 Chart.js-ready specs.
Respond strictly as JSON array of objects with fields: id, type in [bar,line,pie], title, labels (string[]), datasets ({label,data:number[]}[]).`;
      const user = JSON.stringify({ prompt: input.prompt, schema: input.schema, sample: input.rows.slice(0, 20) });
      const res = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: user },
        ],
        temperature: 0.3,
      });
      let text = res.choices[0]?.message?.content?.trim() || "[]";
      if (text.startsWith("```")) {
        const first = text.indexOf("[");
        const last = text.lastIndexOf("]");
        text = first >= 0 && last >= 0 ? text.slice(first, last + 1) : "[]";
      }
      const parsed = JSON.parse(text) as ChartSpec[];
      return parsed.slice(0, 3);
    }
  } catch (e) {
    console.warn("AI call failed, falling back:", e);
  }

  // Fallback heuristic: pick first numeric column vs first string column
  const strCol = input.schema.columns.find((c) => c.type === "string")?.name;
  const numCol = input.schema.columns.find((c) => c.type === "number")?.name;
  const labels = input.rows.map((r) => String(r[strCol ?? Object.keys(r)[0]] ?? ""));
  const data = input.rows.map((r) => Number(r[numCol ?? Object.keys(r)[1]] ?? 0));
  const dataset = [{ label: numCol ?? "Value", data, backgroundColor: COLORS[0] }];
  const base: ChartSpec = {
    id: "chart_1",
    type: "bar",
    title: input.prompt || "Generated Chart",
    labels,
    datasets: dataset,
  };
  return [base];
}
