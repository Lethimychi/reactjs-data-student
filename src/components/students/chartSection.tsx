'use client';

import React from 'react';
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
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
// import React from "react";

/* -------------------------------------------------
   1. Mock data (copy-paste the whole object)
   ------------------------------------------------- */
const studentsData = [
  {
    id: 1,
    info: {
      id: "SV2021001234",
      name: "Nguyễn Văn An",
      class: "CNTT K65",
      area: "Hà Nội"
    },
    overallGPA: 3.58,
    gpaData: [
      { semester: "HK1", year: "2021-2022", gpa: 3.2, rank: "Khá" },
      { semester: "HK2", year: "2021-2022", gpa: 3.4, rank: "Khá" },
      { semester: "HK1", year: "2022-2023", gpa: 3.5, rank: "Khá" },
      { semester: "HK2", year: "2022-2023", gpa: 3.7, rank: "Giỏi" },
      { semester: "HK1", year: "2023-2024", gpa: 3.8, rank: "Giỏi" },
      { semester: "HK2", year: "2023-2024", gpa: 3.9, rank: "Giỏi" }
    ],
    passRateData: [
      { semester: "HK1 21-22", passed: 4, failed: 1, total: 5 },
      { semester: "HK2 21-22", passed: 5, failed: 0, total: 5 },
      { semester: "HK1 22-23", passed: 5, failed: 0, total: 5 },
      { semester: "HK2 22-23", passed: 5, failed: 0, total: 5 },
      { semester: "HK1 23-24", passed: 5, failed: 0, total: 5 },
      { semester: "HK2 23-24", passed: 6, failed: 0, total: 6 }
    ],
    detailedScores: {
      1: [
        { course: "Toán cao cấp A1", score: 7.5, credits: 4, status: "Đậu" },
        { course: "Vật lý đại cương", score: 6.8, credits: 3, status: "Đậu" },
        { course: "Lập trình C", score: 8.2, credits: 4, status: "Đậu" },
        { course: "Anh văn 1", score: 7.0, credits: 2, status: "Đậu" },
        { course: "Giáo dục thể chất", score: 4.5, credits: 1, status: "Rớt" }
      ],
      2: [
        { course: "Toán cao cấp A2", score: 7.8, credits: 4, status: "Đậu" },
        { course: "Cấu trúc dữ liệu", score: 8.5, credits: 4, status: "Đậu" },
        { course: "Lập trình hướng đối tượng", score: 8.0, credits: 4, status: "Đậu" },
        { course: "Anh văn 2", score: 7.5, credits: 2, status: "Đậu" },
        { course: "Triết học Mác-Lênin", score: 7.2, credits: 2, status: "Đậu" }
      ],
      3: [
        { course: "Cơ sở dữ liệu", score: 8.5, credits: 4, status: "Đậu" },
        { course: "Mạng máy tính", score: 8.0, credits: 3, status: "Đậu" },
        { course: "Thuật toán", score: 8.8, credits: 4, status: "Đậu" },
        { course: "Kinh tế chính trị", score: 7.5, credits: 2, status: "Đậu" },
        { course: "Kỹ năng mềm", score: 8.0, credits: 2, status: "Đậu" }
      ],
      4: [
        { course: "Phân tích thiết kế hệ thống", score: 9.0, credits: 4, status: "Đậu" },
        { course: "Lập trình Web", score: 8.7, credits: 4, status: "Đậu" },
        { course: "Trí tuệ nhân tạo", score: 8.5, credits: 3, status: "Đậu" },
        { course: "Lịch sử Đảng", score: 7.8, credits: 2, status: "Đậu" },
        { course: "An ninh mạng", score: 8.2, credits: 3, status: "Đậu" }
      ],
      5: [
        { course: "Học máy", score: 9.2, credits: 4, status: "Đậu" },
        { course: "Phát triển ứng dụng di động", score: 8.8, credits: 4, status: "Đậu" },
        { course: "Cloud Computing", score: 8.5, credits: 3, status: "Đậu" },
        { course: "Quản trị dự án", score: 8.0, credits: 2, status: "Đậu" },
        { course: "Pháp luật đại cương", score: 7.5, credits: 2, status: "Đậu" }
      ],
      6: [
        { course: "Blockchain", score: 9.5, credits: 3, status: "Đậu" },
        { course: "IoT", score: 9.0, credits: 3, status: "Đậu" },
        { course: "Big Data", score: 9.2, credits: 4, status: "Đậu" },
        { course: "Khởi nghiệp", score: 8.5, credits: 2, status: "Đậu" },
        { course: "Đồ án tốt nghiệp", score: 9.8, credits: 10, status: "Đậu" }
      ]
    },
    trainingScoreData: [
      { semester: "HK1 21-22", score: 85 },
      { semester: "HK2 21-22", score: 88 },
      { semester: "HK1 22-23", score: 90 },
      { semester: "HK2 22-23", score: 92 },
      { semester: "HK1 23-24", score: 95 },
      { semester: "HK2 23-24", score: 97 }
    ]
  },
  {
    id: 2,
    info: {
      id: "SV2021001235",
      name: "Trần Thị Bình",
      class: "CNTT K65",
      area: "TP.HCM"
    },
    overallGPA: 3.72,
    gpaData: [
      { semester: "HK1", year: "2021-2022", gpa: 3.4, rank: "Khá" },
      { semester: "HK2", year: "2021-2022", gpa: 3.6, rank: "Giỏi" },
      { semester: "HK1", year: "2022-2023", gpa: 3.7, rank: "Giỏi" },
      { semester: "HK2", year: "2022-2023", gpa: 3.8, rank: "Giỏi" },
      { semester: "HK1", year: "2023-2024", gpa: 3.85, rank: "Giỏi" },
      { semester: "HK2", year: "2023-2024", gpa: 3.95, rank: "Xuất sắc" }
    ],
    passRateData: [
      { semester: "HK1 21-22", passed: 5, failed: 0, total: 5 },
      { semester: "HK2 21-22", passed: 5, failed: 0, total: 5 },
      { semester: "HK1 22-23", passed: 5, failed: 0, total: 5 },
      { semester: "HK2 22-23", passed: 5, failed: 0, total: 5 },
      { semester: "HK1 23-24", passed: 5, failed: 0, total: 5 },
      { semester: "HK2 23-24", passed: 6, failed: 0, total: 6 }
    ],
    detailedScores: {
      1: [
        { course: "Toán cao cấp A1", score: 8.0, credits: 4, status: "Đậu" },
        { course: "Vật lý đại cương", score: 7.5, credits: 3, status: "Đậu" },
        { course: "Lập trình C", score: 8.5, credits: 4, status: "Đậu" },
        { course: "Anh văn 1", score: 8.2, credits: 2, status: "Đậu" },
        { course: "Giáo dục thể chất", score: 7.8, credits: 1, status: "Đậu" }
      ],
      2: [
        { course: "Toán cao cấp A2", score: 8.5, credits: 4, status: "Đậu" },
        { course: "Cấu trúc dữ liệu", score: 9.0, credits: 4, status: "Đậu" },
        { course: "Lập trình hướng đối tượng", score: 8.8, credits: 4, status: "Đậu" },
        { course: "Anh văn 2", score: 8.0, credits: 2, status: "Đậu" },
        { course: "Triết học Mác-Lênin", score: 7.8, credits: 2, status: "Đậu" }
      ],
      3: [
        { course: "Cơ sở dữ liệu", score: 9.0, credits: 4, status: "Đậu" },
        { course: "Mạng máy tính", score: 8.5, credits: 3, status: "Đậu" },
        { course: "Thuật toán", score: 9.2, credits: 4, status: "Đậu" },
        { course: "Kinh tế chính trị", score: 8.0, credits: 2, status: "Đậu" },
        { course: "Kỹ năng mềm", score: 8.5, credits: 2, status: "Đậu" }
      ],
      4: [
        { course: "Phân tích thiết kế hệ thống", score: 9.2, credits: 4, status: "Đậu" },
        { course: "Lập trình Web", score: 9.0, credits: 4, status: "Đậu" },
        { course: "Trí tuệ nhân tạo", score: 9.5, credits: 3, status: "Đậu" },
        { course: "Lịch sử Đảng", score: 8.2, credits: 2, status: "Đậu" },
        { course: "An ninh mạng", score: 8.8, credits: 3, status: "Đậu" }
      ],
      5: [
        { course: "Học máy", score: 9.5, credits: 4, status: "Đậu" },
        { course: "Phát triển ứng dụng di động", score: 9.2, credits: 4, status: "Đậu" },
        { course: "Cloud Computing", score: 9.0, credits: 3, status: "Đậu" },
        { course: "Quản trị dự án", score: 8.5, credits: 2, status: "Đậu" },
        { course: "Pháp luật đại cương", score: 8.0, credits: 2, status: "Đậu" }
      ],
      6: [
        { course: "Blockchain", score: 9.8, credits: 3, status: "Đậu" },
        { course: "IoT", score: 9.5, credits: 3, status: "Đậu" },
        { course: "Big Data", score: 9.7, credits: 4, status: "Đậu" },
        { course: "Khởi nghiệp", score: 9.0, credits: 2, status: "Đậu" },
        { course: "Đồ án tốt nghiệp", score: 9.9, credits: 10, status: "Đậu" }
      ]
    },
    trainingScoreData: [
      { semester: "HK1 21-22", score: 90 },
      { semester: "HK2 21-22", score: 92 },
      { semester: "HK1 22-23", score: 94 },
      { semester: "HK2 22-23", score: 96 },
      { semester: "HK1 23-24", score: 98 },
      { semester: "HK2 23-24", score: 100 }
    ]
  },
  {
    id: 3,
    info: {
      id: "SV2021001236",
      name: "Lê Minh Cường",
      class: "CNTT K65",
      area: "Đà Nẵng"
    },
    overallGPA: 3.25,
    gpaData: [
      { semester: "HK1", year: "2021-2022", gpa: 2.8, rank: "Trung bình" },
      { semester: "HK2", year: "2021-2022", gpa: 3.0, rank: "Trung bình" },
      { semester: "HK1", year: "2022-2023", gpa: 3.2, rank: "Khá" },
      { semester: "HK2", year: "2022-2023", gpa: 3.4, rank: "Khá" },
      { semester: "HK1", year: "2023-2024", gpa: 3.5, rank: "Khá" },
      { semester: "HK2", year: "2023-2024", gpa: 3.6, rank: "Giỏi" }
    ],
    passRateData: [
      { semester: "HK1 21-22", passed: 3, failed: 2, total: 5 },
      { semester: "HK2 21-22", passed: 4, failed: 1, total: 5 },
      { semester: "HK1 22-23", passed: 5, failed: 0, total: 5 },
      { semester: "HK2 22-23", passed: 5, failed: 0, total: 5 },
      { semester: "HK1 23-24", passed: 5, failed: 0, total: 5 },
      { semester: "HK2 23-24", passed: 6, failed: 0, total: 6 }
    ],
    detailedScores: {
      1: [
        { course: "Toán cao cấp A1", score: 6.5, credits: 4, status: "Đậu" },
        { course: "Vật lý đại cương", score: 5.8, credits: 3, status: "Đậu" },
        { course: "Lập trình C", score: 7.0, credits: 4, status: "Đậu" },
        { course: "Anh văn 1", score: 4.5, credits: 2, status: "Rớt" },
        { course: "Giáo dục thể chất", score: 4.0, credits: 1, status: "Rớt" }
      ],
      2: [
        { course: "Toán cao cấp A2", score: 7.0, credits: 4, status: "Đậu" },
        { course: "Cấu trúc dữ liệu", score: 7.5, credits: 4, status: "Đậu" },
        { course: "Lập trình hướng đối tượng", score: 7.2, credits: 4, status: "Đậu" },
        { course: "Anh văn 2", score: 6.5, credits: 2, status: "Đậu" },
        { course: "Triết học Mác-Lênin", score: 4.8, credits: 2, status: "Rớt" }
      ],
      3: [
        { course: "Cơ sở dữ liệu", score: 7.8, credits: 4, status: "Đậu" },
        { course: "Mạng máy tính", score: 7.5, credits: 3, status: "Đậu" },
        { course: "Thuật toán", score: 8.0, credits: 4, status: "Đậu" },
        { course: "Kinh tế chính trị", score: 7.0, credits: 2, status: "Đậu" },
        { course: "Kỹ năng mềm", score: 7.5, credits: 2, status: "Đậu" }
      ],
      4: [
        { course: "Phân tích thiết kế hệ thống", score: 8.2, credits: 4, status: "Đậu" },
        { course: "Lập trình Web", score: 8.0, credits: 4, status: "Đậu" },
        { course: "Trí tuệ nhân tạo", score: 7.8, credits: 3, status: "Đậu" },
        { course: "Lịch sử Đảng", score: 7.2, credits: 2, status: "Đậu" },
        { course: "An ninh mạng", score: 7.5, credits: 3, status: "Đậu" }
      ],
      5: [
        { course: "Học máy", score: 8.5, credits: 4, status: "Đậu" },
        { course: "Phát triển ứng dụng di động", score: 8.2, credits: 4, status: "Đậu" },
        { course: "Cloud Computing", score: 8.0, credits: 3, status: "Đậu" },
        { course: "Quản trị dự án", score: 7.5, credits: 2, status: "Đậu" },
        { course: "Pháp luật đại cương", score: 7.0, credits: 2, status: "Đậu" }
      ],
      6: [
        { course: "Blockchain", score: 8.8, credits: 3, status: "Đậu" },
        { course: "IoT", score: 8.5, credits: 3, status: "Đậu" },
        { course: "Big Data", score: 8.7, credits: 4, status: "Đậu" },
        { course: "Khởi nghiệp", score: 8.0, credits: 2, status: "Đậu" },
        { course: "Đồ án tốt nghiệp", score: 9.0, credits: 10, status: "Đậu" }
      ]
    },
    trainingScoreData: [
      { semester: "HK1 21-22", score: 75 },
      { semester: "HK2 21-22", score: 78 },
      { semester: "HK1 22-23", score: 82 },
      { semester: "HK2 22-23", score: 85 },
      { semester: "HK1 23-24", score: 88 },
      { semester: "HK2 23-24", score: 90 }
    ]
  }
];

/* -------------------------------------------------
   2. Types (you can move them to a separate file)
   ------------------------------------------------- */
type SemesterGPA = {
  semester: 'HK1' | 'HK2';
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
  status: 'Đậu' | 'Rớt';
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
  const correlationData = studentsData.flatMap((student: Student) =>
    student.gpaData.map((g: SemesterGPA) => {
      const yearShort = g.year.split('-')[0].slice(-2) + '-' + (Number(g.year.split('-')[1]) - 2000);
      const semKey = `${g.semester} ${yearShort}`;
      const train = student.trainingScoreData.find((t) => t.semester === semKey)?.score ?? 0;
      return {
        studentId: student.info.id,
        semester: semKey,
        gpa: g.gpa,
        trainingScore: train,
      };
    })
  );

  /* ---------- Task 9: Phân loại môn học ---------- */
  const gradeLabel = (s: number): 'Giỏi' | 'Khá' | 'Trung bình' | 'Yếu' => {
    if (s >= 8.5) return 'Giỏi';
    if (s >= 7.0) return 'Khá';
    if (s >= 5.5) return 'Trung bình';
    return 'Yếu';
  };

  const counts = { Giỏi: 0, Khá: 0, 'Trung bình': 0, Yếu: 0 };

  studentsData.forEach((s: Student) => {
    Object.values(s.detailedScores).forEach((courses) => {
      courses.forEach((c) => {
        if (c.status === 'Đậu') {
          counts[gradeLabel(c.score)]++;
        }
      });
    });
  });

  const totalPassed = Object.values(counts).reduce((a, b) => a + b, 0);
  const pieData = Object.entries(counts).map(([label, value]) => ({
    name: label as keyof typeof counts,
    value,
    percentage: totalPassed ? ((value / totalPassed) * 100).toFixed(1) : '0',
  }));

  const COLORS = {
    Giỏi: '#10b981',
    Khá: '#3b82f6',
    'Trung bình': '#f59e0b',
    Yếu: '#ef4444',
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
              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="gpa"
                  domain={[2, 4]}
                  label={{ value: 'GPA', position: 'insideBottom', offset: -10 }}
                />
                <YAxis
                  type="number"
                  dataKey="trainingScore"
                  domain={[70, 100]}
                  label={{ value: 'Điểm rèn luyện', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(v: number, name: string) =>
                    name === 'gpa' ? v.toFixed(2) : v
                  }
                />
                <Scatter data={correlationData} fill="#8b5cf6">
                  {correlationData.map((_, i) => (
                    <Cell key={i} fill="#8b5cf6" opacity={0.7} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-4 text-sm text-gray-700">
            <strong>Nhận xét:</strong>{' '}
            <span className="text-green-600 font-semibold">
              Tương quan thuận rõ rệt
            </span>{' '}
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
                  label={({ percentage }) => `${percentage}%`}
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
                <p className="font-semibold" style={{ color: COLORS[item.name] }}>
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