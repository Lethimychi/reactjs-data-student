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
  // overallPassRate,
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

        {/* (legend moved below chart for consistency with other widgets) */}
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
      {/* Centered legend below chart (matches other widgets) */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2 text-sky-600">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ background: COLORS[1] }}
            aria-hidden
          />
          <span className="text-sm">Đậu</span>
        </div>
        <div className="flex items-center gap-2 text-sky-400">
          <span
            className="inline-block w-3 h-3 rounded-full"
            style={{ background: COLORS[2] }}
            aria-hidden
          />
          <span className="text-sm">Rớt</span>
        </div>
      </div>
    </div>
  );
};

export default PassRateChart;
