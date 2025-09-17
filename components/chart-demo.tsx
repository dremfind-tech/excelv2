"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { useEffect, useState } from "react";

const data = Array.from({ length: 12 }).map((_, i) => ({
  name: `M${i + 1}`,
  files: Math.round(200 + Math.random() * 300),
  charts: Math.round(100 + Math.random() * 400),
  errors: Math.round(Math.random() * 30),
}));

export function ChartDemo() {
  const [processing, setProcessing] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setProcessing(false), 1200);
    return () => clearTimeout(t);
  }, []);

  if (processing) {
    return (
      <div className="glass h-72 w-full animate-pulse" aria-busy="true" aria-label="Processing" />
    );
  }

  return (
    <div className="glass p-4">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C5CFA" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#7C5CFA" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="name" stroke="#A6A6B3" />
            <YAxis stroke="#A6A6B3" />
            <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
            <Area type="monotone" dataKey="charts" stroke="#7C5CFA" fill="url(#g1)" />
            <Line type="monotone" dataKey="files" stroke="#00D1B2" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

