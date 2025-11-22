"use client";

import { Award } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  getSubjectGradeRatio,
  SubjectGradeRatio,
} from "../../../utils/classification/api";
import { GRADE_COLORS, GradeName } from "../../../utils/grade.";
import CustomLegend from "./customer_legend";

interface StudentClassificationChartProps {
  semester: number; // Pass the semester as prop
}

export default function StudentClassificationChart({
  semester,
}: Readonly<StudentClassificationChartProps>) {
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SubjectGradeRatio[]>([]);

  // Fetch data on load
  useEffect(() => {
    async function load() {
      try {
        const res = await getSubjectGradeRatio();
        if (res) {
          setData(res);
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

const gradeCounts = useMemo(() => {
  const initial: Record<GradeName, number> = {
    Giỏi: 0,
    Khá: 0,
    "Trung bình": 0,
    Yếu: 0,
  };

  const semesterMap: Record<number, string> = {
    1: "HK1",
    2: "HK2",
  };

  const filtered =
    semester === -1
      ? data
      : data.filter((x) => x["Ten Hoc Ky"] === semesterMap[semester]);

  return filtered.reduce((acc, row) => {
    acc.Giỏi += row.TyLe_Gioi;
    acc.Khá += row.TyLe_Kha;
    acc["Trung bình"] += row.TyLe_TB;
    acc.Yếu += row.TyLe_Yeu;
    return acc;
  }, { ...initial });
}, [data, semester]);


  const totalPassed = Object.values(gradeCounts).reduce((a, b) => a + b, 0);

  const gradeDistributionData = Object.entries(gradeCounts).map(
    ([label, value]) => ({
      name: label as GradeName,
      value,
      percentage: totalPassed ? ((value / totalPassed) * 100).toFixed(1) : "0",
    })
  );

  if (loading) {
    return (
      <div className="p-6 bg-white shadow rounded-lg border border-slate-200">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
      {/* Title + Grade Filter */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Award className="w-6 h-6 text-indigo-600" />
          Phân loại môn học
        </h2>
      </div>

      <p className="text-sm text-slate-600 mb-4">
        Tỷ lệ môn học theo loại điểm
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={gradeDistributionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                onClick={(data) => setSelectedGradeFilter(data.name)}
              >
                {gradeDistributionData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={GRADE_COLORS[entry.name]}
                    style={{ cursor: "pointer" }}
                  />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "2px solid #e2e8f0",
                  borderRadius: "12px",
                }}
                formatter={(
                  value: number,
                  _name: string,
                  props: { payload?: { percentage?: string; name?: string } }
                ) => [
                  `${value} môn (${props.payload?.percentage ?? "0"}%)`,
                  props.payload?.name ?? "",
                ]}
              />

              <Legend content={(props) => <CustomLegend payload={props.payload} />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          {gradeDistributionData.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => setSelectedGradeFilter(item.name)}
              className={`p-3 w-full text-left rounded-lg border-2 transition-all cursor-pointer
                ${
                  selectedGradeFilter === item.name || selectedGradeFilter === "all"
                    ? "scale-105 shadow-lg"
                    : "opacity-70"
                }`}
              style={{
                borderColor: GRADE_COLORS[item.name] ?? "#999",
                backgroundColor: `${GRADE_COLORS[item.name] ?? "#999"}15`,
              }}
            >
              <p
                className="font-semibold text-sm mb-1"
                style={{ color: GRADE_COLORS[item.name] }}
              >
                {item.name}
              </p>

              <p className="text-2xl font-bold text-slate-800">{item.value}</p>

              <p className="text-xs text-slate-600 mt-1">môn học</p>

              <p className="text-xs font-semibold mt-2 text-slate-700">
                {item.percentage}%</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
