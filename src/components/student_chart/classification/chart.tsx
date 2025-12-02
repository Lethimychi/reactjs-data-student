"use client";

import { Award } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  getSubjectGradeRatio,
  SubjectGradeRatio,
} from "../../../utils/classification/api";
import { GRADE_COLORS, GradeName } from "../../../utils/grade.";

// Convert hex color to rgba string with given alpha
function hexToRgba(hex: string | undefined, alpha = 1) {
  if (!hex) return `rgba(0,0,0,${alpha})`;
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const bigint = parseInt(full, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface StudentClassificationChartProps {
  semester: number; // Pass the semester as prop
}

// Mock data for demonstration/testing
const MOCK_DATA: SubjectGradeRatio[] = [
  {
    "Ten Nam Hoc": "2024-2025",
    "Ten Hoc Ky": "HK1",
    "Ma Sinh Vien": "DEMO001",
    TongMon: 44,
    So_A: 8,
    "So_B+": 12,
    So_B: 10,
    "So_C+": 6,
    So_C: 4,
    "So_D+": 2,
    So_D: 1,
    So_F: 1,
    TyLe_A: 18.2,
    "TyLe_B+": 27.3,
    TyLe_B: 22.7,
    "TyLe_C+": 13.6,
    TyLe_C: 9.1,
    "TyLe_D+": 4.5,
    TyLe_D: 2.3,
    TyLe_F: 2.3,
  },
  {
    "Ten Nam Hoc": "2024-2025",
    "Ten Hoc Ky": "HK2",
    "Ma Sinh Vien": "DEMO001",
    TongMon: 42,
    So_A: 10,
    "So_B+": 14,
    So_B: 8,
    "So_C+": 5,
    So_C: 3,
    "So_D+": 1,
    So_D: 1,
    So_F: 0,
    TyLe_A: 23.8,
    "TyLe_B+": 33.3,
    TyLe_B: 19.0,
    "TyLe_C+": 11.9,
    TyLe_C: 7.1,
    "TyLe_D+": 2.4,
    TyLe_D: 2.4,
    TyLe_F: 0.0,
  },
];

export default function StudentClassificationChart({
  semester,
}: Readonly<StudentClassificationChartProps>) {
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>("all");
  const [data, setData] = useState<SubjectGradeRatio[]>(MOCK_DATA); // Initialize with mock data

  // Fetch data on load
  useEffect(() => {
    console.log("🚀 Component mounted, using MOCK_DATA:", MOCK_DATA);

    async function load() {
      try {
        const res = await getSubjectGradeRatio();
        // Only use API data if it has actual content with grade counts
        if (res && res.length > 0) {
          // Check if API data has actual grade counts
          const hasValidData = res.some(
            (item) =>
              (item.So_A ?? 0) > 0 ||
              (item["So_B+"] ?? 0) > 0 ||
              (item.So_B ?? 0) > 0 ||
              (item["So_C+"] ?? 0) > 0 ||
              (item.So_C ?? 0) > 0
          );

          if (hasValidData) {
            console.log("✅ Using API data:", res);
            setData(res);
          } else {
            console.log("📦 API data is empty, keeping MOCK_DATA");
          }
        } else {
          console.log("📦 API returned empty, keeping MOCK_DATA");
        }
      } catch (error) {
        // Keep mock data on error
        console.error("❌ Error fetching grade data:", error);
        console.log("📦 Keeping MOCK_DATA due to error");
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

    const semesterMap: Record<number, string> = { 1: "HK1", 2: "HK2" };
    const filtered =
      semester === -1
        ? data
        : data.filter((x) => x["Ten Hoc Ky"] === semesterMap[semester]);

    console.log("📊 Classification Chart Debug:", {
      semester,
      semesterName: semesterMap[semester],
      totalData: data.length,
      filteredData: filtered.length,
      data,
      filtered,
    });

    const result = filtered.reduce(
      (acc, row) => {
        const gioi = row.So_A ?? 0;
        const kha = (row["So_B+"] ?? 0) + (row.So_B ?? 0);
        const trungBinh = (row["So_C+"] ?? 0) + (row.So_C ?? 0);
        const yeu = (row["So_D+"] ?? 0) + (row.So_D ?? 0) + (row.So_F ?? 0);

        console.log("🔍 Processing row:", {
          "Ten Hoc Ky": row["Ten Hoc Ky"],
          gioi,
          kha,
          trungBinh,
          yeu,
          row,
        });

        acc["Giỏi"] += gioi;
        acc["Khá"] += kha;
        acc["Trung bình"] += trungBinh;
        acc["Yếu"] += yeu;
        return acc;
      },
      { ...initial } as Record<GradeName, number>
    );

    console.log("📊 Final grade counts:", result);
    return result;
  }, [data, semester]);

  const totalPassed = Object.values(gradeCounts).reduce((a, b) => a + b, 0);

  const gradeDistributionData = Object.entries(gradeCounts).map(
    ([label, value]) => ({
      name: label as GradeName,
      value,
      percentage: totalPassed ? ((value / totalPassed) * 100).toFixed(1) : "0",
    })
  );

  console.log("📊 Grade Distribution Data:", {
    gradeCounts,
    totalPassed,
    gradeDistributionData,
  });

  console.log("🎨 Rendering chart component with data:", {
    dataLength: data.length,
    hasData: gradeDistributionData.length > 0,
    totalPassed,
  });

  // Show message if no data
  if (!data || data.length === 0 || totalPassed === 0) {
    console.warn("⚠️ No data to display!");
    return (
      <div className="p-6 bg-white shadow rounded-lg border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          Phân loại môn học
        </h2>
        <p className="text-slate-600">Không có dữ liệu để hiển thị</p>
        <p className="text-xs text-slate-400 mt-2">
          Debug: data.length={data.length}, totalPassed={totalPassed}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
      {/* Title */}
      <div className="flex items-center gap-2 mb-2">
        <Award className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-bold text-slate-800">Phân loại môn học</h2>
      </div>

      <p className="text-sm text-slate-500 mb-6">
        Tỷ lệ môn học theo loại điểm
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="h-[300px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={gradeDistributionData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                dataKey="value"
                onClick={(d) => setSelectedGradeFilter(d.name)}
              >
                {gradeDistributionData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={GRADE_COLORS[entry.name]}
                    style={{
                      cursor: "pointer",
                      // Dim non-selected slices when a filter is active
                      opacity:
                        selectedGradeFilter === "all" ||
                        selectedGradeFilter === entry.name
                          ? 1
                          : 0.45,
                      transition: "opacity 160ms ease",
                    }}
                  />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "2px solid #e2e8f0",
                  borderRadius: "12px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
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
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          {gradeDistributionData.map((item) => {
            // Short labels for cards
            const shortLabel = item.name === "Trung bình" ? "TB" : item.name;

            return (
              <div
                key={item.name}
                className="p-4 rounded-xl bg-white border-2 transition-all hover:shadow-md"
                style={{
                  borderColor: GRADE_COLORS[item.name],
                  backgroundColor: hexToRgba(
                    GRADE_COLORS[item.name] ?? "#CBD5E1",
                    0.05
                  ),
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="inline-block w-3 h-2 rounded-full"
                    style={{ background: GRADE_COLORS[item.name] }}
                  />
                  <p
                    className="font-semibold text-sm"
                    style={{ color: GRADE_COLORS[item.name] }}
                  >
                    {shortLabel}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-800 mb-1">
                    {item.value}
                  </div>
                  <div className="text-xs text-slate-500 mb-2">môn học</div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: GRADE_COLORS[item.name] }}
                  >
                    {item.percentage}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-1 border-t border-slate-200">
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {gradeDistributionData.map((g) => (
            <div key={`lg-${g.name}`} className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ background: GRADE_COLORS[g.name] }}
              />
              <span className="text-sm font-medium text-slate-700">
                {g.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
