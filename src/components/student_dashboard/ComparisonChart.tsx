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
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
      {/* Title */}
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-bold text-slate-800">
          So sánh với điểm trung bình lớp
        </h2>
      </div>

      <p className="text-sm text-slate-500 mb-6">
        Điểm số của bạn so với trung bình lớp
      </p>

      <ResponsiveContainer width="100%" height={300}>
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

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[1] }} />
            <span className="text-sm font-medium text-slate-700">Điểm của bạn</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded" style={{ backgroundColor: "#1E40AF" }} />
            <span className="text-sm font-medium text-slate-700">Điểm trung bình lớp</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonChart;
