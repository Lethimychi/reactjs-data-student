import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const data = [
  { name: "Giỏi", value: 12 },
  { name: "Khá", value: 36 },
  { name: "Trung bình", value: 18 },
  { name: "Yếu", value: 6 },
];

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

export default function GradeDistributionChart({
  className,
}: {
  className?: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
      <h4 className="font-semibold text-slate-700 text-lg mb-3">
        Grade Distribution (Donut)
      </h4>
      <div className={className ?? "w-full h-64"}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={40}
              outerRadius={70}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
