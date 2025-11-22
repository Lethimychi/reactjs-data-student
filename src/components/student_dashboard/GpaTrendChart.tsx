import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
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
  console.log("GpaTrendChart overallGPA:", overallGPA);
  const chartGpaData = gpaData && gpaData.length > 0 ? gpaData : [];

  const maxGpa =
    chartGpaData.length > 0 ? Math.max(...chartGpaData.map((d) => d.gpa)) : 0;

  const dynamicYMax = maxGpa < 6 ? 6 : Math.ceil(maxGpa);

  const dataPointCount = chartGpaData.length;
  const rightMargin = dataPointCount <= 3 ? 30 : 10;
  const leftMargin = dataPointCount <= 3 ? 10 : -20;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 card-modern p-8">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/10 rounded-full -mr-16 -mt-16 blur-2xl" />

        <div className="relative flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
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
              strokeDasharray="3 3"
              stroke="#e0e7ff"
              opacity={0.4}
            />
            <XAxis
              dataKey="semester"
              stroke="#94a3b8"
              tick={{ fontSize: 12, fontWeight: 500 }}
              padding={{ left: 0, right: 0 }}
              interval="preserveStartEnd"
              tickLine={false}
              scale="point"
            />
            <YAxis
              domain={[0, dynamicYMax]}
              stroke="#94a3b8"
              tick={{ fontSize: 12, fontWeight: 500 }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "none",
                borderRadius: "16px",
                boxShadow: "0 10px 25px -5px rgb(59, 130, 246, 0.2)",
                padding: "14px 18px",
              }}
              labelStyle={{
                fontWeight: "700",
                color: "#1e293b",
                fontSize: "14px",
              }}
              formatter={(
                value: number,
                _name: string,
                props: { payload?: { rank?: string } }
              ) => [
                `${value.toFixed(2)} (${props.payload?.rank ?? ""})`,
                "GPA",
              ]}
            />
            <Legend wrapperStyle={{ paddingTop: "16px" }} iconType="circle" />
            <Line
              type="monotone"
              dataKey="gpa"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{
                fill: "#3B82F6",
                r: 6,
                strokeWidth: 2,
                stroke: "#fff",
              }}
              activeDot={{ r: 8, fill: "#1e40af", strokeWidth: 2 }}
              name="GPA"
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card-modern p-8">
        {/* Decorative elements */}
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-indigo-100/10 rounded-full -mr-20 -mb-20 blur-2xl" />

        <div className="relative flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl">
            <Award className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 bg-clip-text text-transparent">
            GPA Trung bình
          </h2>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={[
                {
                  name: "GPA đạt được",
                  value: overallGPA,
                },
                {
                  name: "Còn lại",
                  value: 10 - overallGPA,
                },
              ]}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              <Cell fill="#3B82F6" />
              <Cell fill="#E0E7FF" />
            </Pie>
            <Tooltip
              formatter={(value: number | string, name: string) => [
                `${Number(value).toFixed(2)} / 10.0`,
                name,
              ]}
              contentStyle={{
                backgroundColor: "#fff",
                border: "none",
                borderRadius: "16px",
                boxShadow: "0 10px 25px -5px rgb(59, 130, 246, 0.2)",
                padding: "14px 18px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="text-center mt-6 relative">
          <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {overallGPA.toFixed(2)}/10.0
          </div>
          <div className="text-sm text-slate-600 mt-2 font-semibold">
            Học lực:{" "}
            <span className="text-blue-600">
              {overallRank ?? getGradeRank(overallGPA)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GpaTrendChart;
