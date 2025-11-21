import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function ClassAverageComparisonChart({
  className,
}: {
  className?: string;
}) {
  const data = [
    { course: "Toán cao cấp", student: 6.8, average: 8.5 },
    { course: "Lập trình C", student: 7.2, average: 8.8 },
    { course: "Anh văn 1", student: 6.1, average: 6.4 },
    { course: "CSDL", student: 8.2, average: 7.1 },
  ];

  return (
    <div className="rounded-2xl bg-white shadow-md shadow-slate-200 p-6">
      <h4 className="text-lg font-semibold text-slate-800 mb-1">
        Điểm trung bình theo môn học
      </h4>
      <p className="text-sm text-slate-500 mb-6">
        So sánh lớp vs tất cả các lớp
      </p>
      <div className={className ?? "w-full h-64"}>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ left: -10 }}>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
            <XAxis
              dataKey="course"
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
              dataKey="student"
              barSize={16}
              fill="#3B82F6"
              radius={[6, 6, 0, 0]}
            />
            <Line
              type="monotone"
              dataKey="average"
              stroke="#60A5FA"
              strokeWidth={3}
              dot={{ fill: "#60A5FA", r: 3 }}
              activeDot={{ r: 7 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
