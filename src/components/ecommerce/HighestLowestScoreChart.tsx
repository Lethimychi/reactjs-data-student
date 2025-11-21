import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function HighestLowestScoreChart({
  className,
}: {
  className?: string;
}) {
  const data = [{ semester: "HK1 22-23", highest: 10, lowest: 4.8 }];

  return (
    <div className="rounded-2xl bg-white shadow-md shadow-slate-200 p-6">
      <h4 className="text-lg font-semibold text-slate-800 mb-1">
        Điểm cao nhất và thấp nhất
      </h4>
      <p className="text-sm text-slate-500 mb-6">Comparison by Semester</p>
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
            <Bar dataKey="highest" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            <Bar dataKey="lowest" fill="#60A5FA" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
