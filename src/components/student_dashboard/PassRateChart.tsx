import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Target } from "lucide-react";
import { Course } from "../../utils/studentNormalizers";
import { calculatePassRateStats } from "../../utils/dataCalculators";
import { COLORS } from "../../utils/colors";

interface PassRateChartProps {
  semesters: Array<{ id: number; name: string }>;
  coursesPerSemester: Record<number, Course[]>;
  overallPassRate: string;
}

export const PassRateChart: React.FC<PassRateChartProps> = ({
  semesters,
  coursesPerSemester,
  overallPassRate,
}) => {
  const passChartData = semesters.map((sem) => {
    const courses = coursesPerSemester[sem.id] ?? [];
    const stats = calculatePassRateStats(courses);

    return {
      semester: sem.name,
      passedCredits: stats.passedCredits,
      failedCredits: stats.failedCredits,
      totalCredits: stats.totalCredits,
    };
  });

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md shadow-slate-200 w-full border border-[#E2E8F0]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg">
            <Target className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-[#1E293B]">
            Tỷ lệ Đậu/Rớt theo tín chỉ
          </h2>
        </div>
        <div className="bg-[#3B82F6] px-5 py-3 rounded-lg text-white text-right">
          <div className="text-xs font-medium opacity-90">
            Tỷ lệ qua môn toàn khóa
          </div>
          <div className="text-2xl font-bold mt-1">{overallPassRate}%</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={360}>
        <BarChart
          data={passChartData}
          margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
          barCategoryGap="20%"
          barGap={0}
          layout="horizontal"
        >
          <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" opacity={0.5} />
          <XAxis
            dataKey="semester"
            stroke="#64748B"
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <YAxis stroke="#64748B" tick={{ fontSize: 12 }} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: "#fff",
              borderRadius: 10,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              border: "none",
              color: "#1E293B",
            }}
            labelStyle={{ fontWeight: 600 }}
            formatter={(
              value: number,
              name: string,
              props: { payload?: { totalCredits?: number } }
            ) => {
              const total = props.payload?.totalCredits ?? 0;
              const percentage =
                total > 0 ? ((value / total) * 100).toFixed(1) : "0";
              if (name === "Đậu")
                return [`${value} tín chỉ (${percentage}%)`, "Đậu"];
              return [`${value} tín chỉ (${percentage}%)`, "Rớt"];
            }}
            labelFormatter={(label) => `Học kỳ: ${label}`}
          />
          <Bar
            dataKey="passedCredits"
            fill={COLORS[1]}
            barSize={40}
            name="Đậu"
            radius={[6, 6, 0, 0]}
          />
          <Bar
            dataKey="failedCredits"
            fill={COLORS[2]}
            name="Rớt"
            barSize={40}
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PassRateChart;
