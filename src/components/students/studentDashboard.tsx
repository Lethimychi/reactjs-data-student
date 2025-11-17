import React, { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  ScatterChart,
  Scatter,
} from "recharts";
import {
  User,
  GraduationCap,
  TrendingUp,
  Award,
  BookOpen,
  Target,
} from "lucide-react";

// Centralized mock data (to avoid exporting constants from component files)
import {
  studentsData as studentsDataRaw,
  semesters as semestersRaw,
  coursesPerSemester as coursesPerSemesterRaw,
  comparisonData as comparisonDataRaw,
} from "../../data/studentsMock";

// Types used in this file
type SemesterGPA = {
  semester: "HK1" | "HK2";
  year: string;
  gpa: number;
  rank: string;
};

type PassRate = {
  semester: string;
  passed: number;
  failed: number;
  total: number;
};

type Course = {
  course: string;
  score: number;
  credits: number;
  status: string;
};

type TrainingScore = { semester: string; score: number };

type Student = {
  id: number;
  info: { id: string; name: string; class: string; area: string };
  overallGPA: number;
  gpaData: SemesterGPA[];
  passRateData: PassRate[];
  detailedScores: Record<number, Course[]>;
  trainingScoreData: TrainingScore[];
};

type PredictionPanelProps = {
  currentStudent: Student;
  highlightedSubject: string | null;
  onHighlightSubject: (s: string | null) => void;
};

const PredictionPanel: React.FC<PredictionPanelProps> = ({
  currentStudent,
  highlightedSubject,
  onHighlightSubject,
}) => {
  // Predict only the next semester's GPA (simple heuristic) and subject grades
  const lastActualGpa =
    currentStudent.gpaData && currentStudent.gpaData.length
      ? currentStudent.gpaData[currentStudent.gpaData.length - 1].gpa
      : 0;

  // Simple heuristic: small improvement over last GPA, capped at 4.0
  const predictedGpaNext = Math.min(
    4,
    Number((lastActualGpa + 0.05).toFixed(2))
  );

  // Mock predicted subject grades for the next semester (scale 0-10)
  const predictedSubjects = [
    { subject: "Toán cao cấp", predicted: 8.6 },
    { subject: "Lập trình C", predicted: 9.1 },
    { subject: "Anh văn 1", predicted: 6.3 },
    { subject: "CSDL", predicted: 8.8 },
  ];

  const improvementRate = lastActualGpa
    ? (((predictedGpaNext - lastActualGpa) / lastActualGpa) * 100).toFixed(1)
    : "0.0";

  // Prepare pie data for predicted GPA (achieved vs remaining)
  const predictedGpaPie = [
    { name: "Predicted", value: Number(predictedGpaNext.toFixed(2)) },
    { name: "Remaining", value: Number((4 - predictedGpaNext).toFixed(2)) },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Left: predicted subject scores as horizontal bars (span 2 on large) */}
        <div className="lg:col-span-2 bg-white rounded-lg p-4 border">
          <div className="text-sm font-semibold text-slate-700 mb-2">
            Dự đoán điểm môn học (kỳ tới)
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={predictedSubjects}
                margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                barCategoryGap="30%" // <-- add spacing between subject rows
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 10]} stroke="#64748b" />
                <YAxis
                  type="category"
                  dataKey="subject"
                  width={160}
                  stroke="#64748b"
                />
                <Tooltip formatter={(v: number) => `${v.toFixed(1)} điểm`} />
                <Bar
                  dataKey="predicted"
                  name="Dự đoán"
                  fill="#2563eb"
                  barSize={12} // thinner horizontal bars
                >
                  {predictedSubjects.map((entry, index) => (
                    <Cell
                      key={`cell-pred-${index}`}
                      fill={
                        highlightedSubject &&
                        highlightedSubject !== entry.subject
                          ? "#c7c7c7"
                          : "#2563eb"
                      }
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        onHighlightSubject(
                          highlightedSubject === entry.subject
                            ? null
                            : entry.subject
                        )
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: predicted GPA pie chart */}
        <div className="bg-white rounded-lg p-4 border flex flex-col items-center justify-center">
          <div className="text-sm font-semibold text-slate-700 mb-2">
            Dự đoán GPA (kỳ tới)
          </div>
          <div className="w-full h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={predictedGpaPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  <Cell key="cell-0" fill="#7c3aed" />
                  <Cell key="cell-1" fill="#e2e8f0" />
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${Number(value).toFixed(2)} / 4.0`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-center">
            <div className="text-3xl font-bold text-indigo-700">
              {predictedGpaNext.toFixed(2)}
            </div>
            <div className="text-sm text-slate-600">
              Trên thang 4.0 · Cải thiện {improvementRate}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Cast centralized mock data into local types
const studentsData: Student[] = studentsDataRaw as unknown as Student[];
const semesters = semestersRaw as unknown as {
  id: number;
  name: string;
  year: string;
}[];
const coursesPerSemester: Record<number, string[]> =
  coursesPerSemesterRaw as unknown as Record<number, string[]>;
const comparisonData: { course: string; average: number }[] =
  comparisonDataRaw as unknown as { course: string; average: number }[];

const StudentDashboard: React.FC = () => {
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>("all");
  const [selectedTab, setSelectedTab] = useState<"overview" | "prediction">(
    "overview"
  );
  const [highlightedSubject, setHighlightedSubject] = useState<string | null>(
    null
  );

  const currentStudent = studentsData[0] ?? null;

  // Guard: if for some reason no student found, show a friendly message
  if (!currentStudent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center text-slate-700">
          Không tìm thấy sinh viên.
        </div>
      </div>
    );
  }

  const getGradeRank = (gpa: number) => {
    if (gpa >= 3.6) return "Giỏi";
    if (gpa >= 3.2) return "Khá";
    if (gpa >= 2.5) return "Trung bình";
    return "Yếu";
  };

  const currentScores =
    (currentStudent ? currentStudent.detailedScores[selectedSemester] : []) ||
    [];

  const totalPassedCourses = currentStudent
    ? currentStudent.passRateData.reduce((sum, item) => sum + item.passed, 0)
    : 0;
  const totalCourses = currentStudent
    ? currentStudent.passRateData.reduce((sum, item) => sum + item.total, 0)
    : 0;
  const overallPassRate = totalCourses
    ? ((totalPassedCourses / totalCourses) * 100).toFixed(1)
    : "0.0";

  // Build chart data with two 'passed' series so we can control rounding per-semester
  const passChartData = currentStudent.passRateData.map((d) => ({
    ...d,
    passedRounded: d.failed === 0 ? d.passed : 0,
    passedNormal: d.failed > 0 ? d.passed : 0,
  }));

  // Prepare comparison data with student score (for selected semester)
  const comparisonWithStudent = comparisonData.map((item) => ({
    ...item,
    student:
      currentStudent?.detailedScores?.[selectedSemester]?.find((s) =>
        s.course.includes(item.course.split(" ")[0])
      )?.score || 0,
  }));

  // Calculate GPA vs Training Score correlation data
  const correlationData = currentStudent.gpaData.map((g) => {
    const yearShort =
      g.year.split("-")[0].slice(-2) +
      "-" +
      (Number(g.year.split("-")[1]) - 2000);
    const semKey = `${g.semester} ${yearShort}`;
    const train =
      currentStudent.trainingScoreData.find((t) => t.semester === semKey)
        ?.score ?? 0;
    return {
      semester: semKey,
      gpa: g.gpa,
      trainingScore: train,
    };
  });

  // Calculate subject grade distribution
  const gradeLabel = (score: number): "Giỏi" | "Khá" | "Trung bình" | "Yếu" => {
    if (score >= 8.5) return "Giỏi";
    if (score >= 7.0) return "Khá";
    if (score >= 5.5) return "Trung bình";
    return "Yếu";
  };

  const gradeCounts = { Giỏi: 0, Khá: 0, "Trung bình": 0, Yếu: 0 };

  // Scope grade counts to the selected semester
  const semesterCoursesForGrades =
    currentStudent.detailedScores[selectedSemester] || [];
  semesterCoursesForGrades.forEach((c) => {
    if (c.status === "Đậu") {
      gradeCounts[gradeLabel(c.score)]++;
    }
  });

  const totalPassed = Object.values(gradeCounts).reduce((a, b) => a + b, 0);
  const gradeDistributionData = Object.entries(gradeCounts).map(
    ([label, value]) => ({
      name: label as keyof typeof gradeCounts,
      value,
      percentage: totalPassed ? ((value / totalPassed) * 100).toFixed(1) : "0",
    })
  );

  const GRADE_COLORS = {
    Giỏi: "#10b981",
    Khá: "#3b82f6",
    "Trung bình": "#f59e0b",
    Yếu: "#ef4444",
  };

  // Build per-semester highest/lowest dataset based on actual scores
  const highestLowestData = semesters.map((sem) => {
    const list = currentStudent.detailedScores[sem.id] || [];
    if (!list || !list.length) {
      return {
        semester: sem.name || "",
        highestScore: 0,
        highestSubject: "",
        highestCredits: 0,
        lowestScore: 0,
        lowestSubject: "",
        lowestCredits: 0,
      };
    }
    const highest = list.reduce(
      (acc, cur) => (cur.score > acc.score ? cur : acc),
      list[0]
    );
    const lowest = list.reduce(
      (acc, cur) => (cur.score < acc.score ? cur : acc),
      list[0]
    );
    return {
      semester: sem.name || "",
      highestScore: highest.score,
      highestSubject: highest.course,
      highestCredits: highest.credits,
      lowestScore: lowest.score,
      lowestSubject: lowest.course,
      lowestCredits: lowest.credits,
    };
  });

  // selectedSemesterName removed — previously used for per-bar stroke highlighting

  // (Pass/Fail by semester calculation removed — not used in simplified mock)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 rounded-lg">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedTab("overview")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              selectedTab === "overview"
                ? "bg-white shadow-md"
                : "bg-transparent"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedTab("prediction")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              selectedTab === "prediction"
                ? "bg-white shadow-md"
                : "bg-transparent"
            }`}
          >
            Future Performance Prediction
          </button>
        </div>

        {/* Prediction tab content */}
        {selectedTab === "prediction" && (
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Dự đoán hiệu suất tương lai
            </h2>
            {/* Mock predicted data (local to the component) */}
            {/* Predicted GPA trend for next 4 semesters */}
            {/** Note: scale uses 0-4.0 like GPA */}
            <PredictionPanel
              currentStudent={currentStudent}
              highlightedSubject={highlightedSubject}
              onHighlightSubject={(s) => setHighlightedSubject(s)}
            />
          </div>
        )}
        {/* Header - Student Info (Overview only) */}
        {selectedTab === "overview" && (
          <>
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
              <div className="flex items-center gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl">
                  <User className="w-12 h-12 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-slate-800 mb-2">
                    {currentStudent.info.name}
                  </h1>
                  <div className="flex gap-6 text-slate-600">
                    <span className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      <strong>MSSV:</strong> {currentStudent.info.id}
                    </span>
                    <span>
                      <strong>Lớp:</strong> {currentStudent.info.class}
                    </span>
                    <span>
                      <strong>Khu vực:</strong> {currentStudent.info.area}
                    </span>
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
                {semesters.map((sem) => (
                  <option key={sem.id} value={sem.id}>
                    {sem.name}
                  </option>
                ))}
              </select>

              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <h3 className="font-semibold text-slate-700 mb-3">
                  Môn học trong kỳ:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {coursesPerSemester[selectedSemester]?.map((course, idx) => (
                    <span
                      key={idx}
                      className="bg-white px-4 py-2 rounded-lg text-sm text-slate-700 shadow-sm border border-slate-200"
                    >
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
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "2px solid #e2e8f0",
                        borderRadius: "12px",
                      }}
                      labelStyle={{ fontWeight: "bold", color: "#1e293b" }}
                      formatter={(
                        value: number,
                        _name: string,
                        props: { payload?: { rank?: string } }
                      ) => [
                        `${value.toFixed(2)} (${props.payload?.rank ?? ""})`,
                        "GPA",
                      ]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="gpa"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: "#3b82f6", r: 6, cursor: "pointer" }}
                      activeDot={{ r: 8, cursor: "pointer" }}
                      name="GPA"
                    />
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
                        {
                          name: "GPA đạt được",
                          value: currentStudent.overallGPA,
                        },
                        {
                          name: "Còn lại",
                          value: 4 - currentStudent.overallGPA,
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      onClick={(data) => {
                        console.log("Clicked GPA donut segment:", data);
                      }}
                    >
                      <Cell fill="#3b82f6" style={{ cursor: "pointer" }} />
                      <Cell fill="#e2e8f0" style={{ cursor: "pointer" }} />
                    </Pie>
                    <Tooltip
                      formatter={(value: number | string, name: string) => [
                        `${Number(value).toFixed(2)} / 4.0`,
                        name,
                      ]}
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "2px solid #e2e8f0",
                        borderRadius: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="text-center mt-4">
                  <div className="text-3xl font-bold text-blue-600">
                    {currentStudent.overallGPA.toFixed(2)}/4.0
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    Học lực:{" "}
                    <span className="font-bold">
                      {getGradeRank(currentStudent.overallGPA)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Detailed Scores Table */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                Bảng điểm chi tiết -{" "}
                {semesters.find((s) => s.id === selectedSemester)?.name}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left rounded-tl-xl">
                        Môn học
                      </th>
                      <th className="px-6 py-4 text-center">Tín chỉ</th>
                      <th className="px-6 py-4 text-center">Điểm</th>
                      <th className="px-6 py-4 text-center rounded-tr-xl">
                        Trạng thái
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {currentScores.map((score, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-blue-50 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-slate-800">
                          {score.course}
                        </td>
                        <td className="px-6 py-4 text-center text-slate-600">
                          {score.credits}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`font-bold ${
                              score.score >= 8
                                ? "text-green-600"
                                : score.score >= 5
                                ? "text-blue-600"
                                : "text-red-600"
                            }`}
                          >
                            {score.score}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-4 py-1 rounded-full text-sm font-semibold ${
                              score.status === "Đậu"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {score.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex gap-4">
              {/* Pass Rate */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 w-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Target className="w-6 h-6 text-green-600" />
                    Tỷ lệ Đậu/Rớt theo Học kỳ (Tín chỉ)
                  </h2>
                  <div className="bg-green-100 px-3 py-3 rounded-lg text-center w-54">
                    <div className="text-sm text-green-700">
                      Tỷ lệ qua môn toàn khóa
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {overallPassRate}%
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  {/* Chart data prepared earlier as `passChartData` */}
                  <BarChart
                    data={passChartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    barCategoryGap="40%" // more spacing between semesters
                    barGap={8} // spacing between stacked/grouped bars
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="semester"
                      stroke="#64748b"
                      label={{
                        value: "Học kỳ",
                        position: "insideBottom",
                        offset: -10,
                        style: { fill: "#64748b", fontWeight: "bold" },
                      }}
                    />
                    <YAxis
                      stroke="#64748b"
                      label={{
                        value: "Số môn học",
                        angle: -90,
                        position: "insideLeft",
                        style: { fill: "#64748b", fontWeight: "bold" },
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "2px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "12px",
                      }}
                      formatter={(
                        value: number,
                        name: string,
                        props: { payload?: { total?: number } }
                      ) => {
                        const total = props.payload?.total ?? 0;
                        const percentage =
                          total > 0 ? ((value / total) * 100).toFixed(1) : "0";
                        if (name === "Đậu") {
                          return [`${value} môn (${percentage}%)`, "Đậu"];
                        }
                        return [`${value} môn (${percentage}%)`, "Rớt"];
                      }}
                      labelFormatter={(label) => `Học kỳ: ${label}`}
                    />
                    <Legend
                      formatter={(value) => (
                        <span style={{ color: "#64748b", cursor: "pointer" }}>
                          {value}
                        </span>
                      )}
                      onClick={(e) => {
                        console.log("Legend clicked:", e.value);
                      }}
                      wrapperStyle={{ paddingTop: "20px" }}
                    />
                    {/* Render passed bars in two layers:
                        - topRoundedPassedData: semesters with no failed courses -> rounded top corners
                        - normalPassedData: semesters with failed courses -> no rounding (lower segment)
                        This avoids double-rounded visuals while keeping passed-only bars rounded. */}
                    <Bar
                      dataKey="passed"
                      stackId="a"
                      fill="#10b981"
                      barSize={14}
                      name="Đậu"
                      style={{ cursor: "pointer" }}
                    >
                      {passChartData.map((d, idx) =>
                        d.failed === 0 ? (
                          <Cell key={idx} fill="#10b981" />
                        ) : (
                          <Cell key={idx} fill="#10b981" />
                        )
                      )}
                    </Bar>
                    <Bar
                      dataKey="failed"
                      stackId="a"
                      fill="#ef4444"
                      name="Rớt"
                      // top segment should have rounded top corners when present

                      barSize={14}
                      style={{ cursor: "pointer" }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pass/Fail Course Rate by Semester and Academic Year */}

              {/* Highest & Lowest Scores (Grouped by Semester) */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 w-full">
                <div className="flex items-center justify-between mb-4 mt-6">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 ">
                    <Award className="w-6 h-6 text-indigo-600" />
                    Hiệu suất theo học kỳ (Cao nhất vs Thấp nhất)
                  </h2>
                </div>

                <div className="w-full h-80 mt-25">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={highestLowestData}
                      margin={{ top: 10, right: 24, left: 0, bottom: 20 }}
                      barCategoryGap="40%" // space groups out more
                      barGap={10} // spacing between the two bars in a group
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="semester" stroke="#64748b" />
                      <YAxis domain={[0, 10]} stroke="#64748b" />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload || !payload.length)
                            return null;
                          return (
                            <div className="bg-white p-3 rounded shadow">
                              <div className="font-semibold mb-2">{label}</div>
                              {payload.map((p) => (
                                <div
                                  key={p.dataKey}
                                  className="text-sm text-slate-700"
                                >
                                  <span className="font-semibold">
                                    {p.name}:
                                  </span>{" "}
                                  {p.value} điểm —{" "}
                                  {
                                    p.payload[
                                      p.dataKey === "highestScore"
                                        ? "highestSubject"
                                        : "lowestSubject"
                                    ]
                                  }{" "}
                                  (
                                  {
                                    p.payload[
                                      p.dataKey === "highestScore"
                                        ? "highestCredits"
                                        : "lowestCredits"
                                    ]
                                  }{" "}
                                  tín chỉ)
                                </div>
                              ))}
                            </div>
                          );
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="highestScore"
                        name="Cao nhất"
                        fill="#10b981"
                        barSize={14} // thinner grouped bar
                      >
                        {highestLowestData.map((_, idx) => (
                          <Cell key={`h-${idx}`} fill="#10b981" />
                        ))}
                      </Bar>
                      <Bar
                        dataKey="lowestScore"
                        name="Thấp nhất"
                        fill="#ef4444"
                        barSize={14} // thinner grouped bar
                      >
                        {highestLowestData.map((_, idx) => (
                          <Cell key={`l-${idx}`} fill="#ef4444" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            {/* Comparison with Average */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 w-full">
              <h2 className="text-xl font-bold text-slate-800 mb-33 mt-6 flex items-center gap-2 ">
                So sánh với điểm trung bình lớp
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={comparisonWithStudent}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="course" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "2px solid #e2e8f0",
                      borderRadius: "12px",
                    }}
                    formatter={(value: number, name: string) => [
                      `${value.toFixed(1)} điểm`,
                      name,
                    ]}
                  />
                  <Legend />
                  <Bar
                    dataKey="student"
                    fill="#3b82f6"
                    name="Điểm của bạn"
                    barSize={30} // thinner bars for comparison
                    style={{ cursor: "pointer" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke="#ef4444"
                    strokeWidth={3}
                    name="Điểm TB lớp"
                    dot={{ fill: "#ef4444", r: 5, cursor: "pointer" }}
                    activeDot={{ r: 7, cursor: "pointer" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            {/* Subject Grade Distribution */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Award className="w-6 h-6 text-indigo-600" />
                  Phân loại môn học
                </h2>
                <select
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={selectedGradeFilter}
                  onChange={(e) => setSelectedGradeFilter(e.target.value)}
                >
                  <option value="all">Tất cả</option>
                  <option value="Giỏi">Giỏi</option>
                  <option value="Khá">Khá</option>
                  <option value="Trung bình">Trung bình</option>
                  <option value="Yếu">Yếu</option>
                </select>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Tỷ lệ môn học đạt loại Giỏi, Khá, Trung bình, Yếu
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                        onClick={(data) => {
                          console.log("Clicked grade category:", data.name);
                          setSelectedGradeFilter(data.name);
                        }}
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
                          props: {
                            payload?: { percentage?: string; name?: string };
                          }
                        ) => [
                          `${value} môn (${props.payload?.percentage ?? "0"}%)`,
                          props.payload?.name ?? "",
                        ]}
                      />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        formatter={(value) => (
                          <span style={{ color: "#64748b" }}>{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 ">
                  {gradeDistributionData.map((item) => (
                    <div
                      key={item.name}
                      className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedGradeFilter === item.name ||
                        selectedGradeFilter === "all"
                          ? "scale-105 shadow-lg"
                          : "opacity-70"
                      }`}
                      style={{
                        borderColor: GRADE_COLORS[item.name],
                        backgroundColor: `${GRADE_COLORS[item.name]}15`,
                      }}
                      onClick={() => setSelectedGradeFilter(item.name)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      <p
                        className="font-semibold text-sm mb-1"
                        style={{ color: GRADE_COLORS[item.name] }}
                      >
                        {item.name}
                      </p>
                      <p className="text-2xl font-bold text-slate-800">
                        {item.value}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">môn học</p>
                      <p className="text-xs font-semibold mt-2 text-slate-700">
                        {item.percentage}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              {/* Training Score */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 w-full">
                <h2 className="text-xl font-bold text-slate-800 mb-14">
                  Điểm rèn luyện qua các học kỳ
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={currentStudent.trainingScoreData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="semester" stroke="#64748b" />
                    <YAxis domain={[0, 100]} stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "2px solid #e2e8f0",
                        borderRadius: "12px",
                      }}
                      formatter={(value: number) => [
                        `${value} điểm`,
                        "Điểm rèn luyện",
                      ]}
                    />
                    <Bar
                      dataKey="score"
                      fill="#8b5cf6"
                      name="Điểm rèn luyện"
                      barSize={12} // thinner training score bars
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* GPA vs Training Score Correlation */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 w-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                    Tương quan GPA và Điểm rèn luyện
                  </h2>
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <ScatterChart
                    margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      type="number"
                      dataKey="gpa"
                      domain={[2.5, 4]}
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
                      dataKey="trainingScore"
                      domain={[70, 100]}
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
                        if (name === "gpa") return [value.toFixed(2), "GPA"];
                        return [value, "Điểm rèn luyện"];
                      }}
                      labelFormatter={(label) => `Học kỳ: ${label}`}
                    />
                    <Scatter data={correlationData} fill="#8b5cf6">
                      {correlationData.map((_entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill="#8b5cf6"
                          opacity={0.7}
                        />
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
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
