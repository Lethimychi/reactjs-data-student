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

/**
 * Calculate dynamic Y-axis maximum value
 * @param values - Array of numeric values to analyze
 * @param minClamp - Minimum value to clamp the result to
 * @param step - Step size for rounding (default: 1)
 * @returns Dynamic maximum value for Y-axis
 */
const getDynamicAxisMax = (
  values: number[],
  minClamp: number,
  step: number = 1
): number => {
  if (!values || values.length === 0) return minClamp;

  const maxValue = Math.max(...values.filter((v) => Number.isFinite(v)));

  if (maxValue < minClamp) return minClamp;

  // Round up to nearest step
  return Math.ceil(maxValue / step) * step;
};

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

  // Calculate dynamic axis maximums for scatter plot
  const gpaValues = correlationData.map((d) => d.GPA || 0);
  const drlValues = correlationData.map((d) => d.DRL || 0);

  const dynamicGpaMax = getDynamicAxisMax(gpaValues, 6, 1);
  const dynamicDrlMax = getDynamicAxisMax(drlValues, 60, 10);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-md shadow-blue-100/40 w-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
          <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
          Tương quan GPA và Điểm rèn luyện
        </h2>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
          <XAxis
            type="number"
            dataKey="GPA"
            domain={[0, dynamicGpaMax]}
            label={{
              value: "GPA",
              position: "insideBottom",
              offset: -5,
              style: { fill: "#64748b", fontWeight: "600", fontSize: 13 },
            }}
            stroke="#64748b"
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            type="number"
            dataKey="DRL"
            domain={[0, dynamicDrlMax]}
            label={{
              value: "Điểm rèn luyện",
              angle: -90,
              position: "insideLeft",
              style: { fill: "#64748b", fontWeight: "600", fontSize: 13 },
            }}
            stroke="#64748b"
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3", stroke: "#94a3b8" }}
            contentStyle={{
              backgroundColor: "#fff",
              border: "none",
              borderRadius: "12px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              padding: "12px 16px",
            }}
            labelStyle={{ fontWeight: "600", fontSize: "13px" }}
            formatter={(value: number, name: string) => {
              if (name === "GPA") return [value.toFixed(2), "GPA"];
              return [value, "Điểm rèn luyện"];
            }}
            labelFormatter={(label) => `Học kỳ: ${label}`}
          />
          <Scatter data={correlationData} fill="#2752ffff">
            {correlationData.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill="#2752ffff" opacity={0.8} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      
    </div>
  );
}
