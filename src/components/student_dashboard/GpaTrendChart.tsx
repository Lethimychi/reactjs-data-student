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
import { getDynamicAxisMax } from "../../utils/dataCalculators";

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
      <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-lg shadow-slate-200/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-xl">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">
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
              stroke="#e2e8f0"
              opacity={0.6}
            />
            <XAxis
              dataKey="semester"
              stroke="#64748b"
              tick={{ fontSize: 12 }}
              padding={{ left: 0, right: 0 }}
              interval="preserveStartEnd"
              tickLine={false}
              scale="point"
            />
            <YAxis
              domain={[0, dynamicYMax]}
              stroke="#64748b"
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
              labelStyle={{
                fontWeight: "600",
                color: "#1e293b",
                fontSize: "13px",
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
            <Legend
              wrapperStyle={{ paddingTop: "16px" }}
              iconType="circle"
            />
            <Line
              type="monotone"
              dataKey="gpa"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{
                fill: "#3B82F6",
                r: 5,
                strokeWidth: 2,
                stroke: "#fff",
              }}
              activeDot={{ r: 7, fill: "#2563EB" }}
              name="GPA"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-lg shadow-slate-200/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-50 rounded-xl">
            <Award className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">GPA Trung bình</h2>
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
              <Cell fill="#F1F5F9" />
            </Pie>
            <Tooltip
              formatter={(value: number | string, name: string) => [
                `${Number(value).toFixed(2)} / 10.0`,
                name,
              ]}
              contentStyle={{
                backgroundColor: "#fff",
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                padding: "12px 16px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="text-center mt-4">
          <div className="text-3xl font-bold text-blue-600">
            {overallGPA.toFixed(2)}/10.0
          </div>
          <div className="text-sm text-slate-600 mt-1">
            Học lực:{" "}
            <span className="font-bold">
              {overallRank ?? getGradeRank(overallGPA)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GpaTrendChart;
