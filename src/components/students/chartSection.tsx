"use client";

import React from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
// import React from "react";

import getStudentInfo from "../../utils/student_api";
import { COLORS as PALETTE } from "../../utils/colors";
import { useEffect, useState } from "react";

// Local state will hold the students fetched from API (direct call)
const useStudentsFromApi = () => {
  const [students, setStudents] = useState<Student[]>([]);
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await getStudentInfo();
        if (!mounted) return;
        if (!data) return setStudents([]);
        setStudents(
          Array.isArray(data) ? (data as Student[]) : [data as Student]
        );
      } catch (err) {
        console.error("Error loading students for charts:", err);
        if (mounted) setStudents([]);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);
  return students;
};

/* -------------------------------------------------
   2. Types (you can move them to a separate file)
   ------------------------------------------------- */
type SemesterGPA = {
  semester: "HK1" | "HK2";
  year: string;
  gpa: number;
  rank: string;
};

type TrainingScore = {
  semester: string;
  score: number;
};

type Course = {
  course: string;
  score: number;
  credits: number;
  status: "Đậu" | "Rớt";
};

type Student = {
  id: number;
  info: {
    id: string;
    name: string;
    class: string;
    area: string;
  };
  overallGPA: number;
  gpaData: SemesterGPA[];
  trainingScoreData: TrainingScore[];
  detailedScores: Record<number, Course[]>;
};

/* -------------------------------------------------
   3. Component
   ------------------------------------------------- */
const ChartsSection: React.FC = () => {
  /* ---------- Task 8: GPA ↔ Điểm rèn luyện ---------- */
  const studentsData: Student[] = useStudentsFromApi();
  const correlationData = studentsData.flatMap((student: Student) =>
    (student.gpaData ?? []).map((g: SemesterGPA) => {
      const year = g.year ?? "";
      const yearShort =
        year && year.includes("-")
          ? year.split("-")[0].slice(-2) +
            "-" +
            (Number(year.split("-")[1]) - 2000)
          : g.semester;
      const semKey = `${g.semester} ${yearShort}`;
      const train =
        (student.trainingScoreData ?? []).find(
          (t: TrainingScore) => t.semester === semKey
        )?.score ?? 0;
      return {
        studentId: student.info?.id ?? String(student.id),
        semester: semKey,
        gpa: g.gpa ?? 0,
        trainingScore: train,
      };
    })
  );

  /* ---------- Task 9: Phân loại môn học ---------- */
  const gradeLabel = (s: number): "Giỏi" | "Khá" | "Trung bình" | "Yếu" => {
    if (s >= 8.5) return "Giỏi";
    if (s >= 7.0) return "Khá";
    if (s >= 5.5) return "Trung bình";
    return "Yếu";
  };

  const counts = { Giỏi: 0, Khá: 0, "Trung bình": 0, Yếu: 0 };
  studentsData.forEach((s: Student) => {
    const details: Record<number, Course[]> = s.detailedScores ?? {};
    Object.values(details).forEach((courses: Course[]) => {
      (courses || []).forEach((c) => {
        if ((c?.status ?? "") === "Đậu") {
          counts[gradeLabel(c.score ?? 0)]++;
        }
      });
    });
  });

  const totalPassed = Object.values(counts).reduce((a, b) => a + b, 0);
  const pieData = Object.entries(counts).map(([label, value]) => ({
    name: label as keyof typeof counts,
    value,
    percentage: totalPassed ? ((value / totalPassed) * 100).toFixed(1) : "0",
  }));

  const COLORS: Record<string, string> = {
    Giỏi: PALETTE[1],
    Khá: PALETTE[2],
    "Trung bình": PALETTE[3],
    Yếu: PALETTE[4],
  };

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* ---------- 8. Scatter ---------- */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">
            8. Tương quan giữa GPA và điểm rèn luyện
          </CardTitle>
          <p className="text-sm text-gray-600">
            Kiểm tra xem GPA và điểm rèn luyện có tỷ lệ thuận với nhau không.
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="gpa"
                  domain={[2, 4]}
                  label={{
                    value: "GPA",
                    position: "insideBottom",
                    offset: -10,
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="trainingScore"
                  domain={[70, 100]}
                  label={{
                    value: "Điểm rèn luyện",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  formatter={(v: number, name: string) =>
                    name === "gpa" ? v.toFixed(2) : v
                  }
                />
                <Scatter data={correlationData} fill={PALETTE[1]}>
                  {correlationData.map((_, i) => (
                    <Cell key={i} fill={PALETTE[1]} opacity={0.7} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-4 text-sm text-gray-700">
            <strong>Nhận xét:</strong>{" "}
            <span className="text-green-600 font-semibold">
              Tương quan thuận rõ rệt
            </span>{" "}
            – điểm rèn luyện tăng khi GPA tăng.
          </p>
        </CardContent>
      </Card>

      {/* ---------- 9. Donut ---------- */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800">
            9. Phân loại môn học
          </CardTitle>
          <p className="text-sm text-gray-600">
            Tỷ lệ môn học đạt loại Giỏi, Khá, Trung bình, Yếu.
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  /* label removed to avoid strict Pie label prop typing in this simplified mock */
                >
                  {pieData.map((e, i) => (
                    <Cell key={i} fill={COLORS[e.name]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `${v} môn`} />
                <Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {pieData.map((item) => (
              <div
                key={item.name}
                className="p-3 rounded-lg border"
                style={{ borderColor: COLORS[item.name] }}
              >
                <p
                  className="font-semibold"
                  style={{ color: COLORS[item.name] }}
                >
                  {item.name}
                </p>
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-xs text-gray-500">môn</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartsSection;
