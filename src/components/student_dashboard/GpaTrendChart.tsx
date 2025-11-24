import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, Award } from "lucide-react";
import { SemesterGPA } from "../../utils/studentNormalizers";

interface GpaTrendChartProps {
  gpaData: SemesterGPA[];
  overallGPA: number;
  overallRank: string | null;
  getGradeRank: (gpa: number) => string;
}

export const GpaTrendChart: React.FC<GpaTrendChartProps> = ({
  gpaData,
  overallGPA,
  overallRank,
  getGradeRank,
}) => {
  const chartGpaData = gpaData && gpaData.length > 0 ? gpaData : [];

  const maxGpa =
    chartGpaData.length > 0 ? Math.max(...chartGpaData.map((d) => d.gpa)) : 0;

  const dynamicYMax = maxGpa < 6 ? 6 : Math.ceil(maxGpa);

  const dataPointCount = chartGpaData.length;
  const rightMargin = dataPointCount <= 3 ? 30 : 10;
  const leftMargin = dataPointCount <= 3 ? 10 : -20;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-md shadow-slate-200 border border-[#E2E8F0] relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <TrendingUp className="w-6 h-6 text-[#3B82F6]" />
          </div>
          <h2 className="text-xl font-semibold text-[#1E293B]">
            Xu hướng GPA theo học kỳ
          </h2>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={chartGpaData}
            margin={{
              top: 10,
              right: rightMargin,
              left: leftMargin,
              bottom: 10,
            }}
          >
            <CartesianGrid
              stroke="#E2E8F0"
              strokeDasharray="3 3"
              opacity={0.5}
            />
            <XAxis
              dataKey="semester"
              stroke="#64748B"
              tick={{ fontSize: 12 }}
              interval={0}
              tickLine={false}
            />
            <YAxis
              domain={[0, dynamicYMax]}
              stroke="#64748B"
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
              formatter={(value: number) => [
                `${Number(value).toFixed(2)}`,
                "GPA",
              ]}
            />
            <Line
              type="monotone"
              dataKey="gpa"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ r: 6, fill: "#3B82F6", stroke: "#1E40AF", strokeWidth: 2 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-md shadow-slate-200 border border-[#E2E8F0] relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Award className="w-6 h-6 text-[#3B82F6]" />
          </div>
          <h2 className="text-xl font-semibold text-[#1E293B]">
            GPA Trung bình
          </h2>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <defs>
              {/* three-tone blue palette could be used when pie has more slices; keep primary + light bg */}
            </defs>
            <Pie
              data={[
                { name: "GPA đạt được", value: overallGPA },
                { name: "Còn lại", value: 10 - overallGPA },
              ]}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              <Cell fill="#3B82F6" />
              <Cell fill="#93C5FD" />
            </Pie>
            <Tooltip
              formatter={(value: number | string) => [
                `${Number(value).toFixed(2)} / 10.0`,
                "GPA",
              ]}
              contentStyle={{
                background: "#fff",
                borderRadius: 10,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                border: "none",
                color: "#1E293B",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="text-center mt-6 relative">
          <div className="text-3xl font-bold text-[#1E293B]">
            {overallGPA.toFixed(2)}/10.0
          </div>
          <div className="text-sm text-[#64748B] mt-2 font-semibold">
            Học lực:{" "}
            <span className="text-[#3B82F6]">
              {overallRank ?? getGradeRank(overallGPA)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GpaTrendChart;
