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

export default function HighestLowestScoreChart({
  className,
}: {
  className?: string;
}) {
  const data = [
    { semester: "HK1 22-23", highest: 9.2, lowest: 4.8 },
    { semester: "HK2 22-23", highest: 9.0, lowest: 4.5 },
    { semester: "HK1 23-24", highest: 9.5, lowest: 5.0 },
    { semester: "HK2 23-24", highest: 9.6, lowest: 5.2 },
  ];

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
      <h4 className="font-semibold text-slate-700 text-lg mb-3">
        Môn học có điểm cao nhất và thấp nhất
      </h4>
      <div className={className ?? "w-full h-64"}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="semester" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="highest" fill="#10b981" />
            <Bar dataKey="lowest" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
