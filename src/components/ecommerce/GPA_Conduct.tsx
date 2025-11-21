import { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

export default function GPAConductScatter() {
  const correlationData = useMemo(
    () => [
      { semester: "HK1 22-23", gpa: 3.1, conduct: 75 },
      { semester: "HK2 22-23", gpa: 3.25, conduct: 78 },
      { semester: "HK1 23-24", gpa: 3.4, conduct: 82 },
      { semester: "HK2 23-24", gpa: 3.45, conduct: 85 },
    ],
    []
  );

  const gpaValues = correlationData.map((d) => d.gpa);
  const conductValues = correlationData.map((d) => d.conduct);

  const minGpa = Math.floor(Math.min(...gpaValues) * 10) / 10;
  const maxGpa = Math.ceil(Math.max(...gpaValues) * 10) / 10;
  const minConduct = Math.floor(Math.min(...conductValues) / 5) * 5;
  const maxConduct = Math.ceil(Math.max(...conductValues) / 5) * 5;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h4 className="text-lg font-semibold text-slate-800 mb-1">
        Sự tương quan giữa GPA và điểm rèn luyện sinh viên
      </h4>
      <p className="text-sm text-slate-500 mb-4">Correlation Analysis</p>

      <div className="w-full h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid
              stroke="#CBD5E1" // slate-300
              strokeDasharray="3 3"
              opacity={0.4}
            />

            <XAxis
              type="number"
              dataKey="gpa"
              domain={[minGpa, maxGpa]}
              tick={{ fontSize: 12, fill: "#475569" }}
              tickLine={false}
              axisLine={{ stroke: "#CBD5E1" }}
              label={{
                value: "GPA",
                position: "insideBottomRight",
                offset: -5,
                fill: "#334155",
                fontSize: 12,
              }}
            />

            <YAxis
              type="number"
              dataKey="conduct"
              domain={[minConduct, maxConduct]}
              tick={{ fontSize: 12, fill: "#475569" }}
              tickLine={false}
              axisLine={{ stroke: "#CBD5E1" }}
              label={{
                value: "Điểm rèn luyện",
                angle: -90,
                position: "insideLeft",
                fill: "#334155",
                fontSize: 12,
                offset: 0,
              }}
            />

            <Tooltip
              cursor={{ strokeDasharray: "3 3", stroke: "#94A3B8" }}
              contentStyle={{
                backgroundColor: "#F8FAFC",
                border: "1px solid #CBD5E1",
                borderRadius: "10px",
                color: "#0F172A",
                padding: "8px 10px",
              }}
              formatter={(value: number, name: string) => {
                if (name === "gpa") return [value.toFixed(2), "GPA"];
                if (name === "conduct") return [value, "Điểm rèn luyện"];
                return value;
              }}
            />

            <Scatter name="Sinh viên" data={correlationData}>
              {correlationData.map((_, index) => (
                <Cell key={index} fill="#3B82F6" r={8} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
