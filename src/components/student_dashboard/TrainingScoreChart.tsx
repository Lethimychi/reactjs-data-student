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
} from "recharts";
import { TrendingUp } from "lucide-react";
import { TrainingScore } from "../../utils/studentNormalizers";

interface TrainingScoreChartProps {
  trainingScoreData: TrainingScore[];
}

export const TrainingScoreChart: React.FC<TrainingScoreChartProps> = ({
  trainingScoreData,
}) => {
  // Show placeholder if no data
  if (!trainingScoreData || trainingScoreData.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg shadow-slate-200/50 w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-50 rounded-xl">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">
            Điểm rèn luyện qua các học kỳ
          </h2>
        </div>
        <div className="p-6 text-center text-slate-500">
          Không có dữ liệu điểm rèn luyện để hiển thị.
          <div className="mt-3 text-xs text-slate-400">
            (Nếu bạn đang dùng API thật, kiểm tra console để xem payload.)
          </div>
        </div>
      </div>
    );
  }

  // Calculate dynamic Y-axis max for DRL chart
  const drlScores = trainingScoreData.map((d) => d.score || 0);
  const maxDrl = Math.max(...drlScores.filter((v) => Number.isFinite(v)));
  const dynamicDrlMax = maxDrl < 60 ? 60 : Math.ceil(maxDrl / 10) * 10;

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg shadow-slate-200/50 w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-50 rounded-xl">
          <TrendingUp className="w-6 h-6 text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">
          Điểm rèn luyện qua các học kỳ
        </h2>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart
          data={trainingScoreData}
          margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
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
            tickLine={false}
          />
          <YAxis
            domain={[0, dynamicDrlMax]}
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
            labelStyle={{ fontWeight: "600", fontSize: "13px" }}
            formatter={(value: number) => [
              `${Number(value).toFixed(1)} điểm`,
              "Điểm rèn luyện",
            ]}
          />
          <Legend
            wrapperStyle={{ paddingTop: "16px" }}
            iconType="circle"
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#6366F1"
            strokeWidth={3}
            dot={{
              r: 5,
              fill: "#6366F1",
              stroke: "#fff",
              strokeWidth: 2,
            }}
            activeDot={{ r: 7, fill: "#4F46E5" }}
            name="Điểm rèn luyện"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrainingScoreChart;
