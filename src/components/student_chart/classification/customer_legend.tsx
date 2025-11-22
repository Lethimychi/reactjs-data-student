// components/CustomLegend.tsx
import { LegendPayload } from "recharts"; // import the correct type

interface CustomLegendProps {
  payload?: readonly LegendPayload[]; // ← accept readonly array
}

export default function CustomLegend({ payload }: Readonly<CustomLegendProps>) {
  if (!payload) return null;

  return (
    <div className="flex flex-wrap justify-center gap-2 mt-2">
      {payload.map((entry) => (
        <span key={entry.value} style={{ color: "#64748b" }}>
          {entry.value}
        </span>
      ))}
    </div>
  );
}
