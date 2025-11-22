import React from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { getDynamicAxisMax } from "../../utils/dataCalculators";

interface ComparisonItem {
  course: string;
  average: number;
  student: number;
  grade: string;
}

interface ComparisonChartProps {
  comparisonData: ComparisonItem[];
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  comparisonData,
}) => {
  const allScores = comparisonData.flatMap((d) => [
    d.student || 0,
    d.average || 0,
  ]);

  const dynamicComparisonMax = getDynamicAxisMax(allScores, 6, 1);

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg shadow-slate-200/50 w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-xl">
          <TrendingUp className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">
          So sánh với điểm trung bình lớp
        </h2>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart
          data={comparisonData}
          margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e2e8f0"
            opacity={0.6}
          />
          <XAxis
            dataKey="course"
            stroke="#64748b"
            tick={false}
            tickLine={false}
          />
          <YAxis
            stroke="#64748b"
            domain={[0, dynamicComparisonMax]}
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "none",
              borderRadius: "12px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              padding: "12px 16px",
            }}
            labelStyle={{ fontWeight: "600", fontSize: "13px" }}
            formatter={(value: number, name: string) => [
              `${value.toFixed(1)} / 10.0`,
              name,
            ]}
          />
          <Legend
            wrapperStyle={{ paddingTop: "16px" }}
            iconType="circle"
          />
          <Bar
            dataKey="student"
            fill="#3B82F6"
            name="Điểm của bạn"
            barSize={24}
            radius={[4, 4, 0, 0]}
          />
          <Line
            type="monotone"
            dataKey="average"
            stroke="#EF4444"
            strokeWidth={3}
            name="Điểm trung bình môn học"
            dot={{
              fill: "#EF4444",
              r: 5,
              strokeWidth: 2,
              stroke: "#fff",
            }}
            activeDot={{ r: 7, fill: "#DC2626" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ComparisonChart;
