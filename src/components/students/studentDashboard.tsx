import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart } from 'recharts';
import { User, GraduationCap, TrendingUp, Award, BookOpen, Target, Users, ChevronRight } from 'lucide-react';

// Mock Data for 3 students
export const studentsData = [
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

export const semesters = [
  { id: 1, name: "HK1 2021-2022", year: "2021-2022" },
  { id: 2, name: "HK2 2021-2022", year: "2021-2022" },
  { id: 3, name: "HK1 2022-2023", year: "2022-2023" },
  { id: 4, name: "HK2 2022-2023", year: "2022-2023" },
  { id: 5, name: "HK1 2023-2024", year: "2023-2024" },
  { id: 6, name: "HK2 2023-2024", year: "2023-2024" }
];

export const coursesPerSemester = {
  1: ["Toán cao cấp A1", "Vật lý đại cương", "Lập trình C", "Anh văn 1", "Giáo dục thể chất"],
  2: ["Toán cao cấp A2", "Cấu trúc dữ liệu", "Lập trình hướng đối tượng", "Anh văn 2", "Triết học Mác-Lênin"],
  3: ["Cơ sở dữ liệu", "Mạng máy tính", "Thuật toán", "Kinh tế chính trị", "Kỹ năng mềm"],
  4: ["Phân tích thiết kế hệ thống", "Lập trình Web", "Trí tuệ nhân tạo", "Lịch sử Đảng", "An ninh mạng"],
  5: ["Học máy", "Phát triển ứng dụng di động", "Cloud Computing", "Quản trị dự án", "Pháp luật đại cương"],
  6: ["Blockchain", "IoT", "Big Data", "Khởi nghiệp", "Đồ án tốt nghiệp"]
};

export const comparisonData = [
  { course: "Toán cao cấp A1", average: 6.8 },
  { course: "Vật lý", average: 7.0 },
  { course: "Lập trình C", average: 7.2 },
  { course: "Anh văn 1", average: 7.5 },
  { course: "GDTC", average: 8.0 }
];

const StudentDashboard = () => {
  const [selectedStudent, setSelectedStudent] = useState(1);
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [showStudentList, setShowStudentList] = useState(false);

  const currentStudent = studentsData.find(s => s.id === selectedStudent);

  const getGradeColor = (gpa) => {
    if (gpa >= 3.6) return 'text-green-600';
    if (gpa >= 3.2) return 'text-blue-600';
    if (gpa >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeRank = (gpa) => {
    if (gpa >= 3.6) return 'Giỏi';
    if (gpa >= 3.2) return 'Khá';
    if (gpa >= 2.5) return 'Trung bình';
    return 'Yếu';
  };

  const currentScores = currentStudent.detailedScores[selectedSemester] || [];
  const highestScore = currentScores.reduce((max, item) => item.score > max.score ? item : max, currentScores[0]);
  const lowestScore = currentScores.reduce((min, item) => item.score < min.score ? item : min, currentScores[0]);

  const totalPassed = currentStudent.passRateData.reduce((sum, item) => sum + item.passed, 0);
  const totalCourses = currentStudent.passRateData.reduce((sum, item) => sum + item.total, 0);
  const overallPassRate = ((totalPassed / totalCourses) * 100).toFixed(1);

  // Prepare comparison data with student score
  const comparisonWithStudent = comparisonData.map(item => ({
    ...item,
    student: currentStudent.detailedScores[1].find(s => s.course.includes(item.course.split(' ')[0]))?.score || 0
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Student List Toggle Button */}
        <button
          onClick={() => setShowStudentList(!showStudentList)}
          className="mb-4 flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          <Users className="w-5 h-5" />
          {showStudentList ? 'Ẩn danh sách sinh viên' : 'Xem danh sách sinh viên'}
        </button>

        {/* Student List Table */}
        {showStudentList && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200 mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Users className="w-7 h-7 text-purple-600" />
              Danh sách sinh viên
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left rounded-tl-xl">MSSV</th>
                    <th className="px-6 py-4 text-left">Họ và tên</th>
                    <th className="px-6 py-4 text-left">Lớp</th>
                    <th className="px-6 py-4 text-left">Khu vực</th>
                    <th className="px-6 py-4 text-center">GPA</th>
                    <th className="px-6 py-4 text-center">Học lực</th>
                    <th className="px-6 py-4 text-center">Tỷ lệ đậu</th>
                    <th className="px-6 py-4 text-center rounded-tr-xl">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {studentsData.map((student) => {
                    const passed = student.passRateData.reduce((sum, item) => sum + item.passed, 0);
                    const total = student.passRateData.reduce((sum, item) => sum + item.total, 0);
                    const passRate = ((passed / total) * 100).toFixed(1);
                    
                    return (
                      <tr 
                        key={student.id} 
                        className={`hover:bg-blue-50 transition-colors ${selectedStudent === student.id ? 'bg-blue-100' : ''}`}
                      >
                        <td className="px-6 py-4 font-mono text-sm text-slate-700">{student.info.id}</td>
                        <td className="px-6 py-4 font-semibold text-slate-800">{student.info.name}</td>
                        <td className="px-6 py-4 text-slate-600">{student.info.class}</td>
                        <td className="px-6 py-4 text-slate-600">{student.info.area}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`font-bold text-lg ${getGradeColor(student.overallGPA)}`}>
                            {student.overallGPA.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            student.overallGPA >= 3.6 ? 'bg-green-100 text-green-700' :
                            student.overallGPA >= 3.2 ? 'bg-blue-100 text-blue-700' :
                            student.overallGPA >= 2.5 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {getGradeRank(student.overallGPA)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-semibold text-green-600">{passRate}%</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => {
                              setSelectedStudent(student.id);
                              setShowStudentList(false);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all hover:scale-105 flex items-center gap-2 mx-auto"
                          >
                            Xem chi tiết
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Header - Student Info */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <div className="flex items-center gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl">
              <User className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">{currentStudent.info.name}</h1>
              <div className="flex gap-6 text-slate-600">
                <span className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  <strong>MSSV:</strong> {currentStudent.info.id}
                </span>
                <span><strong>Lớp:</strong> {currentStudent.info.class}</span>
                <span><strong>Khu vực:</strong> {currentStudent.info.area}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500 mb-1">GPA Tích lũy</div>
              <div className={`text-4xl font-bold ${getGradeColor(currentStudent.overallGPA)}`}>
                {currentStudent.overallGPA.toFixed(2)}
              </div>
              <div className="text-sm text-slate-600 font-semibold mt-1">
                {getGradeRank(currentStudent.overallGPA)}
              </div>
            </div>
          </div>
        </div>

        {/* Semester Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              Thông tin học kỳ
            </h2>
            <span className="text-sm text-slate-600 bg-blue-100 px-4 py-2 rounded-full font-semibold">
              Tổng: {semesters.length} học kỳ
            </span>
          </div>
          
          <select 
            className="w-full p-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(Number(e.target.value))}
          >
            {semesters.map(sem => (
              <option key={sem.id} value={sem.id}>{sem.name}</option>
            ))}
          </select>
          
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
            <h3 className="font-semibold text-slate-700 mb-3">Môn học trong kỳ:</h3>
            <div className="flex flex-wrap gap-2">
              {coursesPerSemester[selectedSemester]?.map((course, idx) => (
                <span key={idx} className="bg-white px-4 py-2 rounded-lg text-sm text-slate-700 shadow-sm border border-slate-200">
                  {course}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* GPA Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              Xu hướng GPA theo học kỳ
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={currentStudent.gpaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="semester" stroke="#64748b" />
                <YAxis domain={[0, 4]} stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '2px solid #e2e8f0', borderRadius: '12px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                />
                <Legend />
                <Line type="monotone" dataKey="gpa" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 6 }} name="GPA" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-purple-600" />
              GPA Trung bình
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'GPA đạt được', value: currentStudent.overallGPA },
                    { name: 'Còn lại', value: 4 - currentStudent.overallGPA }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#e2e8f0" />
                </Pie>
                <Tooltip 
                  formatter={(value) => value.toFixed(2)}
                  contentStyle={{ backgroundColor: '#fff', border: '2px solid #e2e8f0', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-4">
              <div className="text-3xl font-bold text-blue-600">{currentStudent.overallGPA.toFixed(2)}/4.0</div>
              <div className="text-sm text-slate-600 mt-1">Học lực: <span className="font-bold">{getGradeRank(currentStudent.overallGPA)}</span></div>
            </div>
          </div>
        </div>

        {/* Pass Rate */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Target className="w-6 h-6 text-green-600" />
              Tỷ lệ đậu/rớt môn học
            </h2>
            <div className="bg-green-100 px-6 py-3 rounded-xl">
              <div className="text-sm text-green-700">Tỷ lệ qua môn toàn khóa</div>
              <div className="text-3xl font-bold text-green-600">{overallPassRate}%</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={currentStudent.passRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="semester" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '2px solid #e2e8f0', borderRadius: '12px' }}
              />
              <Legend />
              <Bar dataKey="passed" fill="#10b981" name="Đậu" radius={[8, 8, 0, 0]} />
              <Bar dataKey="failed" fill="#ef4444" name="Rớt" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Highest & Lowest Scores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white/20 p-3 rounded-xl">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <div className="text-sm opacity-90">Điểm cao nhất</div>
                <div className="text-3xl font-bold">{highestScore?.score}</div>
              </div>
            </div>
            <div className="text-lg font-semibold mt-2">{highestScore?.course}</div>
            <div className="text-sm opacity-90 mt-1">{highestScore?.credits} tín chỉ</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white/20 p-3 rounded-xl">
                <TrendingUp className="w-8 h-8 rotate-180" />
              </div>
              <div>
                <div className="text-sm opacity-90">Điểm thấp nhất</div>
                <div className="text-3xl font-bold">{lowestScore?.score}</div>
              </div>
            </div>
            <div className="text-lg font-semibold mt-2">{lowestScore?.course}</div>
            <div className="text-sm opacity-90 mt-1">{lowestScore?.credits} tín chỉ</div>
          </div>
        </div>

        {/* Detailed Scores Table */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Bảng điểm chi tiết - {semesters.find(s => s.id === selectedSemester)?.name}</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left rounded-tl-xl">Môn học</th>
                  <th className="px-6 py-4 text-center">Tín chỉ</th>
                  <th className="px-6 py-4 text-center">Điểm</th>
                  <th className="px-6 py-4 text-center rounded-tr-xl">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {currentScores.map((score, idx) => (
                  <tr key={idx} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{score.course}</td>
                    <td className="px-6 py-4 text-center text-slate-600">{score.credits}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-bold ${score.score >= 8 ? 'text-green-600' : score.score >= 5 ? 'text-blue-600' : 'text-red-600'}`}>
                        {score.score}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-4 py-1 rounded-full text-sm font-semibold ${score.status === 'Đậu' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {score.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Comparison with Average */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4">So sánh với điểm trung bình lớp (HK1)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={comparisonWithStudent}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="course" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '2px solid #e2e8f0', borderRadius: '12px' }}
              />
              <Legend />
              <Bar dataKey="student" fill="#3b82f6" name="Điểm của bạn" radius={[8, 8, 0, 0]} />
              <Line type="monotone" dataKey="average" stroke="#ef4444" strokeWidth={3} name="Điểm TB lớp" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Training Score */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Điểm rèn luyện qua các học kỳ</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={currentStudent.trainingScoreData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="semester" stroke="#64748b" />
              <YAxis domain={[0, 100]} stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '2px solid #e2e8f0', borderRadius: '12px' }}
              />
              <Bar dataKey="score" fill="#8b5cf6" name="Điểm rèn luyện" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default StudentDashboard;