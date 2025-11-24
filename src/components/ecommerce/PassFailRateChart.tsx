import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { COLORS } from "../../utils/colors";

export default function PassFailRateChart({
  className,
}: {
  className?: string;
}) {
  const data = [
    { semester: "HK1 22-23", passed: 22, failed: 6 },
    { semester: "HK2 22-23", passed: 24, failed: 8 },
    { semester: "HK1 23-24", passed: 27, failed: 1 },
    { semester: "HK2 23-24", passed: 30, failed: 2 },
  ];

  return (
    <div className="rounded-2xl bg-white shadow-md shadow-slate-200 p-6">
      <h4 className="text-lg font-semibold text-slate-800 mb-1">
        Pass / Fail Rate
      </h4>
      <p className="text-sm text-slate-500 mb-6">Student Performance</p>
      <div className={className ?? "w-full h-64"}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ left: -10 }}>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
            <XAxis
              dataKey="semester"
              stroke="#64748B"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="#64748B" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1E293B",
                border: "none",
                borderRadius: "6px",
                color: "#fff",
              }}
            />
            <Bar
              dataKey="passed"
              stackId="a"
              fill={COLORS[1]}
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="failed"
              stackId="a"
              fill="#FCA5A5"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
