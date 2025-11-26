import React from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { COLORS } from "../../utils/colors";
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
    <div className="bg-white rounded-2xl p-6 shadow-md shadow-slate-200 w-full border border-[#E2E8F0] h-113">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          <TrendingUp className="w-6 h-6 text-[#3B82F6]" />
        </div>
        <h2 className="text-xl font-semibold text-[#1E293B]">
          So sánh với điểm trung bình lớp
        </h2>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart
          data={comparisonData}
          margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
        >
          <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" opacity={0.5} />
          <XAxis
            dataKey="course"
            stroke="#64748B"
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            stroke="#64748B"
            domain={[0, dynamicComparisonMax]}
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#fff",
              borderRadius: 10,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              border: "none",
              color: "#1E293B",
            }}
            labelStyle={{ fontWeight: 600 }}
            formatter={(value: number, name: string) => [
              `${value.toFixed(1)} / 10.0`,
              name,
            ]}
          />
          <Bar
            dataKey="student"
            fill={COLORS[1]}
            name="Điểm của bạn"
            barSize={24}
            radius={[4, 4, 0, 0]}
          />
          <Line
            type="monotone"
            dataKey="average"
            stroke="#1E40AF"
            strokeWidth={3}
            name="Điểm trung bình môn học"
            dot={{ fill: "#3B82F6", r: 5, strokeWidth: 2, stroke: "#1E40AF" }}
            activeDot={{ r: 7 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ComparisonChart;
