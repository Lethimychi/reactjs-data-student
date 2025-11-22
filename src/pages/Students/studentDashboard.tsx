import React, { useState } from "react";

// Custom hooks for data fetching
import {
  useStudentInfoFetch,
  useGpaTrendFetch,
  useCoursesFetch,
  usePassRateFetch,
  useTrainingScoresFetch,
  useComparisonFetch,
} from "../../hooks/useStudentDashboard";
import { StudentScoreChartHighestLowest } from "../../components/student_chart/score/chart";
import { RateGpaAndPoint } from "../../components/student_chart/rate/chart";
import Semester from "../../components/students/Semester";
import StudentClassificationChart from "../../components/student_chart/classification/chart";
import { StudentHeader } from "../../components/student_dashboard/StudentHeader";
import { TabNavigation } from "../../components/student_dashboard/TabNavigation";
import { GpaTrendChart } from "../../components/student_dashboard/GpaTrendChart";
import { DetailedScoresTable } from "../../components/student_dashboard/DetailedScoresTable";
import { PassRateChart } from "../../components/student_dashboard/PassRateChart";
import { ComparisonChart } from "../../components/student_dashboard/ComparisonChart";
import { TrainingScoreChart } from "../../components/student_dashboard/TrainingScoreChart";
import { PredictionPanel } from "../../components/student_dashboard/PredictionPanel";

// Utilities
import {
  getUserNameFromLocal,
  Course,
} from "../../utils/studentNormalizers";
import {
  getGradeRank,
  normalizeKeyForMatching,
  classifyScore,
} from "../../utils/dataCalculators";

const StudentDashboard: React.FC = () => {
  // ========== UI STATE ==========
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [selectedTab, setSelectedTab] = useState<"overview" | "prediction">(
    "overview"
  );
  const [highlightedSubject, setHighlightedSubject] = useState<string | null>(
    null
  );

  // ========== CUSTOM HOOKS (Consolidated 6 useEffect hooks) ==========
  const { currentStudent, loading, apiError } = useStudentInfoFetch();
  const { computedGpaData, apiOverallRank } = useGpaTrendFetch();
  const {
    apiSemesters,
    apiCoursesPerSemester,
    apiCoursesDetailed,
    coursesLoading,
    coursesError,
  } = useCoursesFetch();
  const { apiPassRateMap } = usePassRateFetch(apiSemesters);
  const { trainingScoreData } = useTrainingScoresFetch();
  const { comparisonApiData } = useComparisonFetch(
    apiSemesters,
    selectedSemester,
    apiCoursesPerSemester,
    apiCoursesDetailed,
    currentStudent
  );

  // ========== HELPERS ==========
  const userDisplayName =
    getUserNameFromLocal() ?? currentStudent?.info?.name ?? "Sinh viên";

  const normalizeForMatch = (s: string) => normalizeKeyForMatching(s);

  // ========== COMPUTED VALUES ==========
  const currentScores =
    apiCoursesDetailed[selectedSemester] ??
    currentStudent?.detailedScores?.[selectedSemester] ??
    [];

  const comparisonWithStudent = comparisonApiData.map((item) => {
    const norm = normalizeForMatch(item.course || "");
    const matched = (
      apiCoursesDetailed[selectedSemester] ??
      currentStudent?.detailedScores?.[selectedSemester] ??
      []
    ).find((s) => {
      try {

        
        const a = normalizeForMatch(s.course || "");
        return a === norm;
      } catch {
        return false;
      }
    });

    const studentScore = matched
      ? Number(matched.score ?? 0)
      : Number(item.dtb_sv ?? 0);
    const avg = Number(item.dtb_all ?? 0);

    return {
      course: item.course,
      average: avg,
      student: Number(studentScore ?? 0),
      grade: classifyScore(Number(studentScore ?? 0)),
    };
  });

  // Note: selectedGradeFilter was used but is no longer needed with custom hooks
  const filteredComparison = comparisonWithStudent;

  // Semesters list
  const semesters: { id: number; name: string; year: string }[] =
    apiSemesters.length > 0
      ? apiSemesters
      : (currentStudent?.gpaData ?? []).map((g: { semester: string; year: string }, idx: number) => ({
          id: idx + 1,
          name: `${g.semester} ${g.year}`,
          year: g.year,
        }));

  // Courses per semester
  const coursesPerSemester: Record<number, Course[]> = (() => {
    const map: Record<number, Course[]> = {};
    for (const [k, v] of Object.entries(apiCoursesDetailed)) {
      map[Number(k)] = v as Course[];
    }
    if (Object.keys(map).length === 0) {
      for (const [k, v] of Object.entries(currentStudent?.detailedScores ?? {})) {
        map[Number(k)] = v as Course[];
      }
    }
    return map;
  })();

  // Overall pass rate
  const overallPassRate = (() => {
    const vals = semesters
      .map((sem) => coursesPerSemester[sem.id] ?? [])
      .filter((courses) => courses.length > 0);

    if (vals.length > 0) {
      let totalPassed = 0;
      let totalAll = 0;

      for (const courses of vals) {
        const totalCredits = courses.reduce(
          (s: number, c: Course) => s + (Number(c?.credits) || 0),
          0
        );
        const passedCredits = courses.reduce(
          (s: number, c: Course) => {
            const scoreValue = typeof c.score === "number" ? c.score : Number(c.score);
            return s + (Number(c?.credits) || 0) * (scoreValue >= 5 ? 1 : 0);
          },
          0
        );

        totalPassed += passedCredits;
        totalAll += totalCredits;
      }

      return totalAll ? ((totalPassed / totalAll) * 100).toFixed(1) : "0.0";
    }

    const valsCounts = Object.values(apiPassRateMap);
    if (valsCounts.length > 0) {
      const totalPassed = valsCounts.reduce((s: number, x) => s + x.passed, 0);
      const totalAll = valsCounts.reduce((s: number, x) => s + x.total, 0);
      return totalAll ? ((totalPassed / totalAll) * 100).toFixed(1) : "0.0";
    }

    const totalPassedCourses = (currentStudent?.passRateData ?? []).reduce(
      (sum: number, item: any) => sum + item.passed,
      0
    );
    const totalCourses = (currentStudent?.passRateData ?? []).reduce(
      (sum: number, item: any) => sum + item.total,
      0
    );
    return totalCourses
      ? ((totalPassedCourses / totalCourses) * 100).toFixed(1)
      : "0.0";
  })();

  // ========== RENDER ==========
  return (
    <div
      className="min-h-screen bg-[#F5F7FA] p-6"
      style={{ fontFamily: "Inter, Manrope, Outfit, sans-serif" }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Tabs */}
        <TabNavigation
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
        />

        {/* API Error */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
            {apiError}
          </div>
        )}

        {/* Prediction Tab */}
        {selectedTab === "prediction" && (
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Dự đoán hiệu suất tương lai
            </h2>
            <PredictionPanel
              currentStudent={currentStudent}
              highlightedSubject={highlightedSubject}
              onHighlightSubject={(s) => setHighlightedSubject(s)}
            />
          </div>
        )}

        {/* Overview Tab */}
        {selectedTab === "overview" && (
          <>
            {/* Header */}
            <StudentHeader
              studentName={userDisplayName}
              studentInfo={currentStudent.info}
              isLoading={loading}
            />

            {/* GPA Charts */}
            <GpaTrendChart
              gpaData={computedGpaData ?? currentStudent.gpaData}
              overallGPA={currentStudent.overallGPA}
              overallRank={apiOverallRank}
              getGradeRank={getGradeRank}
            />

            {/* Semester Selection */}
            <Semester
              semesters={semesters}
              selectedSemester={selectedSemester}
              onSemesterChange={setSelectedSemester}
              coursesPerSemester={apiCoursesPerSemester}
              coursesLoading={coursesLoading}
              coursesError={coursesError}
            />

            {/* Detailed Scores Table */}
            <DetailedScoresTable
              courses={currentScores}
              semesterName={
                semesters.find(
                  (s: { id: number; name: string; year: string }) =>
                    s.id === selectedSemester
                )?.name ?? ""
              }
            />

            {/* Pass Rate Chart */}
            <PassRateChart
              semesters={semesters}
              coursesPerSemester={coursesPerSemester}
              overallPassRate={overallPassRate}
            />

            {/* Other Components */}
            <div className="flex gap-6">
              <StudentScoreChartHighestLowest />
            </div>

            {/* Comparison Chart */}
            <ComparisonChart comparisonData={filteredComparison} />

            {/* Classification Chart */}
            <StudentClassificationChart semester={selectedSemester} />

            {/* Training Score & Rate */}
            <div className="flex gap-6">
              <TrainingScoreChart trainingScoreData={trainingScoreData} />
              <RateGpaAndPoint />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
