import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Target } from "lucide-react";
import { Course } from "../../utils/studentNormalizers";
import { calculatePassRateStats } from "../../utils/dataCalculators";
import { COLORS } from "../../utils/config/colors";

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
    <div className="card-modern p-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-xl">
            <Target className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">
            Tỷ lệ Đậu/Rớt theo tín chỉ
          </h2>
        </div>
        <div className="bg-blue-500 px-6 py-4 rounded-xl border border-green-100">
          <div className="text-sm font-medium text-white mb-1">
            Tỷ lệ qua môn toàn khóa
          </div>
          <div className="text-3xl font-bold text-white">
            {overallPassRate}%
          </div>
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
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
          <XAxis
            dataKey="semester"
            stroke="#64748b"
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <YAxis stroke="#64748b" tick={{ fontSize: 12 }} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "none",
              borderRadius: "12px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              padding: "12px 16px",
            }}
            labelStyle={{ fontWeight: "600", fontSize: "13px" }}
            formatter={(
              value: number,
              name: string,
              props: { payload?: { totalCredits?: number } }
            ) => {
              const total = props.payload?.totalCredits ?? 0;
              const percentage =
                total > 0 ? ((value / total) * 100).toFixed(1) : "0";
              if (name === "Đậu") {
                return [`${value} tín chỉ (${percentage}%)`, "Đậu"];
              }
              return [`${value} tín chỉ (${percentage}%)`, "Rớt"];
            }}
            labelFormatter={(label) => `Học kỳ: ${label}`}
          />
          <Legend wrapperStyle={{ paddingTop: "16px" }} iconType="circle" />
          <Bar
            dataKey="passedCredits"
            fill={COLORS.RATE.GOOD}
            barSize={40}
            name="Đậu"
            radius={[6, 6, 0, 0]}
          />
          <Bar
            dataKey="failedCredits"
            fill={COLORS.RATE.POOR}
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
