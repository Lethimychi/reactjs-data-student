import { TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getGpaDrlRatio, GPAGradeRatio } from "../../../utils/rate/rate_api";

export function RateGpaAndPoint() {
  const [correlationData, setCorrelationData] = useState<GPAGradeRatio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getGpaDrlRatio();
        if (data) setCorrelationData(data);
      } catch (err) {
        console.error("❌ Lỗi khi lấy dữ liệu GPA/DRL:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (!correlationData.length) return <p>Không có dữ liệu để hiển thị.</p>;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-purple-600" />
          Tương quan GPA và Điểm rèn luyện
        </h2>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            type="number"
            dataKey="GPA"
            domain={[0, 10]}
            label={{
              value: "GPA",
              position: "insideBottom",
              offset: -10,
              style: { fill: "#64748b", fontWeight: "bold" },
            }}
            stroke="#64748b"
          />
          <YAxis
            type="number"
            dataKey="DRL"
            domain={[0, 100]}
            label={{
              value: "Điểm rèn luyện",
              angle: -90,
              position: "insideLeft",
              style: { fill: "#64748b", fontWeight: "bold" },
            }}
            stroke="#64748b"
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            contentStyle={{
              backgroundColor: "#fff",
              border: "2px solid #e2e8f0",
              borderRadius: "12px",
            }}
            formatter={(value: number, name: string) => {
              if (name === "GPA") return [value.toFixed(2), "GPA"];
              return [value, "Điểm rèn luyện"];
            }}
            labelFormatter={(label) => `Học kỳ: ${label}`}
          />
          <Scatter data={correlationData} fill="#8b5cf6">
            {correlationData.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill="#8b5cf6" opacity={0.7} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      <p className="mt-4 text-sm text-gray-700">
        <strong>Nhận xét:</strong>{" "}
        <span className="text-green-600 font-semibold">
          Tương quan thuận rõ rệt
        </span>{" "}
        – điểm rèn luyện tăng khi GPA tăng.
      </p>
    </div>
  );
}
