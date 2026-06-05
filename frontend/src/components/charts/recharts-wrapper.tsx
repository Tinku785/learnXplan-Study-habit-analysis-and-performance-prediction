"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from "recharts";

interface RechartsWrapperProps {
  data: Record<string, number>;
}

export default function RechartsWrapper({ data }: RechartsWrapperProps) {
  const chartData = Object.entries(data).map(([key, val]) => ({
    name: key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase()),
    value: val,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
      >
        <XAxis 
          type="number" 
          stroke="#64748b" 
          fontSize={10} 
          tickLine={false}
          axisLine={false} 
        />
        <YAxis 
          type="category" 
          dataKey="name" 
          stroke="#94a3b8" 
          fontSize={10} 
          width={130} 
          tickLine={false}
          axisLine={false} 
        />
        <Tooltip
          cursor={{ fill: "rgba(255, 255, 255, 0.03)" }}
          contentStyle={{ 
            backgroundColor: "#0f172a", 
            borderColor: "#334155", 
            borderRadius: "12px", 
            color: "#f8fafc" 
          }}
          labelClassName="text-slate-400 text-xs font-semibold mb-1"
          itemStyle={{ color: "#818cf8", fontSize: "12px" }}
        />
        
        <ReferenceLine x={0} stroke="#334155" />
        
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.value >= 0 ? "rgba(16, 185, 129, 0.85)" : "rgba(244, 63, 94, 0.85)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
