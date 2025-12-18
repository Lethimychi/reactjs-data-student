"use client";

import { Award } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  getSubjectGradeRatio,
  SubjectGradeRatio,
} from "../../../utils/classification/api";
import { GRADE_COLORS, GradeName } from "../../../utils/grade.";
import { getStudentDetailedCourses } from "../../../utils/student_api";
import { separateSemester } from "../../UserProfile/helper/BreakSemesterFilter";

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
  return `rgba(${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${
    bigint & 255
  }, ${alpha})`;
}

interface StudentClassificationChartProps {
  semester: number;
}

export default function StudentClassificationChart({
  semester,
}: Readonly<StudentClassificationChartProps>) {
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>("all");

  const [subjects, setSubjects] = useState<Record<GradeName, string[]>>({
    Giỏi: [],
    Khá: [],
    "Trung bình": [],
    Yếu: [],
  });

  const [data, setData] = useState<SubjectGradeRatio[]>([]);

  // Fetch data on load
  useEffect(() => {
    async function load() {
      try {
        const semesterBreak = separateSemester(semester);

        // --- FETCH SEMESTER GRADE COUNT FROM API ---
        const res = await getSubjectGradeRatio();
        console.log("✅ Fetched classification data (RAW):", res);
        const filtered = res?.filter(
          (x) =>
            x["Ten Hoc Ky"] === semesterBreak.semester &&
            x["Ten Nam Hoc"] === semesterBreak.year
        );
        console.log("✅ Filtered classification data (RAW):", filtered);
        if (filtered && filtered.length > 0) {
          const firstRow = filtered[0];
          console.log("✅ First row FULL object:", firstRow);
          console.log("✅ First row details:", {
            TyLe_Gioi: firstRow.TyLe_Gioi,
            TyLe_Kha: firstRow.TyLe_Kha,
            TyLe_TB: firstRow.TyLe_TB,
            TyLe_Yeu: firstRow.TyLe_Yeu,
            TongMon: firstRow.TongMon,
          });
          // Log calculated counts
          const totalSubs = firstRow.TongMon ?? 1;
          console.log("✅ Calculated counts:", {
            Gioi_count: Math.round((firstRow.TyLe_Gioi ?? 0) * totalSubs),
            Kha_count: Math.round((firstRow.TyLe_Kha ?? 0) * totalSubs),
            TB_count: Math.round((firstRow.TyLe_TB ?? 0) * totalSubs),
            Yeu_count: Math.round((firstRow.TyLe_Yeu ?? 0) * totalSubs),
          });
        }
        setData(filtered ?? []);

        // --- OPTIONAL: GET SUBJECT NAMES FOR TOOLTIP ---
        // Only use this to populate subject names, but calculate counts strictly from API tỷ lệ
        const subjectInSemester = await getStudentDetailedCourses();
        const filteredSubjects = subjectInSemester?.filter(
          (x) =>
            x["Ten Hoc Ky"] === semesterBreak.semester &&
            x["Ten Nam Hoc"] === semesterBreak.year
        );

        const grouped: Record<GradeName, string[]> = {
          Giỏi: [],
          Khá: [],
          "Trung bình": [],
          Yếu: [],
        };
        console.log("Filtered subjects for classification:", filteredSubjects);
        filteredSubjects?.forEach((x) => {
          const grade = x["Xep Loai"] as GradeName;
          const subjectName = x["Ten Mon Hoc"] ?? "Unknown";
          if (grouped[grade]) grouped[grade].push(subjectName);
        });

        setSubjects(grouped);
      } catch (err) {
        console.error("❌ Error fetching grade data:", err);
      }
    }

    load();
  }, []);

  // --- CALCULATE GRADE COUNTS ---
  const gradeCounts = useMemo(() => {
    const initial: Record<GradeName, number> = {
      Giỏi: 0,
      Khá: 0,
      "Trung bình": 0,
      Yếu: 0,
    };

    return data.reduce(
      (acc, row) => {
        // Convert ratio to actual count by multiplying by TongMon
        const totalSubjects = row.TongMon ?? 1;
        acc["Giỏi"] += Math.round((row.TyLe_Gioi ?? 0) * totalSubjects);
        acc["Khá"] += Math.round((row.TyLe_Kha ?? 0) * totalSubjects);
        acc["Trung bình"] += Math.round((row.TyLe_TB ?? 0) * totalSubjects);
        acc["Yếu"] += Math.round((row.TyLe_Yeu ?? 0) * totalSubjects);
        return acc;
      },
      { ...initial }
    );
  }, [data, semester]);

  const totalPassed = Object.values(gradeCounts).reduce((a, b) => a + b, 0);

  const gradeDistributionData = Object.entries(gradeCounts).map(
    ([label, value]) => ({
      name: label as GradeName,
      value,
      percentage: totalPassed ? ((value / totalPassed) * 100).toFixed(1) : "0",
      subjects: subjects[label as GradeName] ?? [],
    })
  );

  if (data.length === 0 || totalPassed === 0) {
    return (
      <div className="p-6 bg-white shadow rounded-lg border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-2">
          Phân loại môn học
        </h2>
        <p className="text-slate-600">Không có dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg">
      <div className="flex items-center gap-2 mb-2">
        <Award className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-bold text-slate-800">Phân loại môn học</h2>
      </div>

      <p className="text-sm text-slate-500 mb-6">
        Tỷ lệ môn học theo loại điểm
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PIE CHART */}
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
                    key={index}
                    fill={GRADE_COLORS[entry.name]}
                    style={{
                      cursor: "pointer",
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
                }}
                formatter={(
                  _value: number,
                  _name: string,
                  props: {
                    payload?: {
                      percentage?: number | string;
                      name?: string;
                    };
                  }
                ): [string, string] => {
                  const percentage = props.payload?.percentage ?? 0;
                  const label = props.payload?.name ?? "";

                  return [`${percentage}%`, label];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* RIGHT SIDE CARDS */}
        <div className="grid grid-cols-2 gap-3">
          {gradeDistributionData.map((item) => {
            const shortLabel = item.name === "Trung bình" ? "TB" : item.name;

            return (
              <div
                key={item.name}
                className="p-4 rounded-xl bg-white border-2 hover:shadow-md transition-all"
                style={{
                  borderColor: GRADE_COLORS[item.name],
                  backgroundColor: hexToRgba(GRADE_COLORS[item.name], 0.05),
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
                    {item.percentage}%
                  </div>

                  <div
                    className="text-xs text-slate-500 mb-2 truncate cursor-help"
                    title={item.subjects.join(", ")}
                  >
                    {item.subjects.join(", ")}
                  </div>

                  {/* <div
                    className="text-sm font-semibold"
                    style={{ color: GRADE_COLORS[item.name] }}
                  >
                    {item.percentage}%
                  </div> */}
                  <div className="text-sm font-semibold">
                    {item.subjects.length} môn
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LEGEND */}
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
