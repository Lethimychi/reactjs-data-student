import React, { useEffect, useState } from "react";
import { Award } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { COLORS } from "../../../utils/colors";
import { loadHighestLowestData } from "../../../utils/score/handler_highes_lowest";

// -------------------------
// TYPE CHUẨN – KHÔNG ANY
// -------------------------
export interface HighestLowest {
  semester: string;
  highestScore: number;
  highestSubject: string;
  highestCredits: number;
  lowestScore: number;
  lowestSubject: string;
  lowestCredits: number;
}

interface CustomTooltipPayload {
  name: string;
  value: number;
  dataKey: "highestScore" | "lowestScore";
  payload: HighestLowest;
}

// -------------------------
// COMPONENT CHÍNH
// -------------------------
export function StudentScoreChartHighestLowest() {
  const [allData, setAllData] = useState<HighestLowest[]>([]);
  // state value only — setter intentionally omitted while the semester filter UI is disabled
  const [selectedSemester] = useState<string>("");

  // -------------------------
  // LOAD DATA – KHÔNG ANY
  // -------------------------
  useEffect(() => {
    loadHighestLowestData().then((data) => {
      if (!Array.isArray(data)) {
        setAllData([]);
        return;
      }

      const mapped: HighestLowest[] = data.map((row) => {
        const rec = row as Record<string, unknown>;

        return {
          semester: String(rec["semester"] ?? ""),
          highestScore: Number(rec["highestScore"] ?? 0),
          highestSubject: String(rec["highestSubject"] ?? ""),
          highestCredits: Number(rec["highestCredits"] ?? 0),
          lowestScore: Number(rec["lowestScore"] ?? 0),
          lowestSubject: String(rec["lowestSubject"] ?? ""),
          lowestCredits: Number(rec["lowestCredits"] ?? 0),
        };
      });

      setAllData(mapped);
    });
  }, []);

  const displayData =
    selectedSemester === ""
      ? allData
      : allData.filter((item) => item.semester === selectedSemester);

  // Determine Y-axis upper bound dynamically from the data.
  // If there's no data or the max is non-positive, fall back to 10.
  const maxScoreFromData =
    displayData && displayData.length
      ? Math.max(
          ...displayData.map((d) => Math.max(d.highestScore, d.lowestScore))
        )
      : 0;
  const yMax = maxScoreFromData > 0 ? Math.ceil(maxScoreFromData) : 10;

  // -------------------------
  // CUSTOM TOOLTIP – KHÔNG ANY
  // -------------------------
  const CustomTooltip: React.FC<TooltipProps<number, string>> = (props) => {
    const { active, payload } = props as TooltipProps<number, string> & {
      payload?: unknown[];
    };

    if (!active || !payload || payload.length === 0) return null;

    const items = payload as unknown as CustomTooltipPayload[];

    return (
      <div className="bg-white p-4 rounded-xl shadow-lg border-none">
        <div className="font-semibold text-slate-800 mb-2 text-sm">{}</div>

        {items.map((item) => (
          <div key={item.dataKey} className="text-sm text-slate-700 mb-1">
            <strong className="font-semibold">{item.name}:</strong> {item.value}{" "}
            điểm —{" "}
            {item.dataKey === "highestScore"
              ? item.payload.highestSubject
              : item.payload.lowestSubject}
          </div>
        ))}
      </div>
    );
  };

  // -------------------------
  // RENDER CHART
  // -------------------------
  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-md shadow-slate-200 p-6 border border-[#E2E8F0]">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Award className="w-6 h-6 text-[#3B82F6]" />
          </div>
          <h2 className="text-xl font-semibold text-[#1E293B]">
            Hiệu suất theo học kỳ (Cao nhất vs Thấp nhất)
          </h2>
        </div>

        <div className="w-full h-100">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={displayData}
              margin={{ top: 10, right: 10, left: -10, bottom: 10 }}
              barCategoryGap="35%"
              barGap={10}
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
                tickLine={false}
              />
              <YAxis
                domain={[0, yMax]}
                stroke="#64748B"
                tick={{ fontSize: 12 }}
                tickLine={false}
              />

              <Tooltip content={<CustomTooltip />} />

              <Legend
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: "16px" }}
                iconType="circle"
              />

              <Bar
                dataKey="highestScore"
                name="Cao nhất"
                barSize={20}
                fill={COLORS[1]}
                radius={[4, 4, 0, 0]}
              >
                {displayData.map((_, idx) => (
                  <Cell key={`hi-${idx}`} fill={COLORS[1]} />
                ))}
              </Bar>

              <Bar
                dataKey="lowestScore"
                name="Thấp nhất"
                barSize={20}
                fill={COLORS[2]}
                radius={[4, 4, 0, 0]}
              >
                {displayData.map((_, idx) => (
                  <Cell key={`low-${idx}`} fill={COLORS[2]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
