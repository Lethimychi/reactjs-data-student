import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

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
    <div className="rounded-2xl bg-white p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
      <h4 className="font-semibold text-slate-700 text-lg mb-3">
        Pass / Fail Rate
      </h4>
      <div className={className ?? "w-full h-64"}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="semester" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="passed" stackId="a" fill="#3b82f6" />
            <Bar dataKey="failed" stackId="a" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
