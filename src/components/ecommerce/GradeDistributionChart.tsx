import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const data = [
  { name: "Giỏi", value: 12 },
  { name: "Khá", value: 36 },
  { name: "Trung bình", value: 18 },
  { name: "Yếu", value: 6 },
];

const COLORS = ["#3B82F6", "#60A5FA", "#93C5FD", "#DBEAFE"];

export default function GradeDistributionChart({
  className,
}: {
  className?: string;
}) {
  return (
    <div className="rounded-2xl bg-white shadow-md shadow-slate-200 p-6">
      <h4 className="text-lg font-semibold text-slate-800 mb-1">
        Phân bố học lực
      </h4>
      <p className="text-sm text-slate-500 mb-6">Analysis</p>
      <div className={className ?? "w-full h-72"}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#d4dbe5ff",
                border: "none",
                borderRadius: "6px",
                color: "#000000ff",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
