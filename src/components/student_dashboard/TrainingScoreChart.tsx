import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
      <div className="bg-white rounded-2xl p-6 shadow-md shadow-slate-200 w-full border border-[#E2E8F0]">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <TrendingUp className="w-6 h-6 text-[#3B82F6]" />
          </div>
          <h2 className="text-xl font-semibold text-[#1E293B]">
            Điểm rèn luyện qua các học kỳ
          </h2>
        </div>
        <div className="p-4 text-center text-[#64748B]">
          Không có dữ liệu điểm rèn luyện để hiển thị.
          <div className="mt-2 text-xs text-[#94A3B8]">
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
    <div className="bg-white rounded-2xl p-6 shadow-md shadow-slate-200 w-full border border-[#E2E8F0]">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          <TrendingUp className="w-6 h-6 text-[#3B82F6]" />
        </div>
        <h2 className="text-xl font-semibold text-[#1E293B]">
          Điểm rèn luyện qua các học kỳ
        </h2>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart
          data={trainingScoreData}
          margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
        >
          <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" opacity={0.5} />
          <XAxis
            dataKey="semester"
            stroke="#64748B"
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            domain={[0, dynamicDrlMax]}
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
              `${Number(value).toFixed(1)} điểm`,
              "Điểm rèn luyện",
            ]}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#3B82F6"
            strokeWidth={3}
            dot={{ r: 5, fill: "#3B82F6", stroke: "#1E40AF", strokeWidth: 2 }}
            activeDot={{ r: 7 }}
            name="Điểm rèn luyện"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrainingScoreChart;
