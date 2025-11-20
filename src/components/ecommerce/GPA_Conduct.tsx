import { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function GPAConductScatter() {
  const correlationData = useMemo(
    () => [
      { semester: "HK1 22-23", gpa: 3.1, conduct: 75 },
      { semester: "HK2 22-23", gpa: 3.25, conduct: 78 },
      { semester: "HK1 23-24", gpa: 3.4, conduct: 82 },
      { semester: "HK2 23-24", gpa: 3.45, conduct: 85 },
    ],
    []
  );
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
      <h4 className="font-semibold mb-3">GPA vs Conduct (Scatter)</h4>
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <ScatterChart>
            <CartesianGrid />
            <XAxis type="number" dataKey="gpa" name="GPA" domain={[2.5, 4]} />
            <YAxis type="number" dataKey="conduct" name="Conduct" />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter name="Students" data={correlationData} fill="#3b82f6" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
