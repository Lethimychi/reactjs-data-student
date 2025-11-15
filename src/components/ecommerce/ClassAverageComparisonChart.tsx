import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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
    <div className="rounded-2xl bg-white p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
      <h4 className="font-semibold text-slate-700 text-lg mb-3">
        Class Average Comparison (Combo)
      </h4>
      <div className={className ?? "w-full h-64"}>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="course" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="student" barSize={16} fill="#3b82f6" />
            <Line
              type="monotone"
              dataKey="average"
              stroke="#10b981"
              strokeWidth={2}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
