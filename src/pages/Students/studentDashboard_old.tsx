import React, { useEffect, useState } from "react";

import getStudentInfo, {
  getStudentCoursesBySemester,
  getStudentGpaBySemester,
  getStudentOverallGpa,
  CourseApiRecord,
  getStudentDetailedCourses,
  DetailedCourseApiRecord,
  getStudentPassRateBySemester,
  PassRateApiRecord,
  getStudentClassAverageComparison,
  ClassAverageRecord,
  getStudentTrainingScores,
} from "../../utils/student_api";

// Components
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
  normalizeStudent,
  getUserNameFromLocal,
  createEmptyStudent,
  makeSemesterKey,
  Student,
  SemesterGPA,
  StudentInfo,
  Course,
  TrainingScore,
  PassRate,
} from "../../utils/studentNormalizers";
import {
  getGradeRank,
  getDynamicAxisMax,
  getNumericField,
  getStringField,
  normalizeKeyForMatching,
  buildNormalizedMap,
  classifyScore,
} from "../../utils/dataCalculators";

// Types used in this file
type SemesterGPA = {
  semester: string;
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
  midScore?: number; // Diem Giua Ky
  finalScore?: number; // Diem Cuoi Ky
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

// NOTE: mock data file removed — derive semester/course lists from API-loaded student
const studentsData: Student[] = [];

/**
 * Calculate dynamic Y-axis maximum value
 * @param values - Array of numeric values to analyze
 * @param minClamp - Minimum value to clamp the result to
 * @param step - Step size for rounding (default: 1)
 * @returns Dynamic maximum value for Y-axis
 */
const getDynamicAxisMax = (
  values: number[],
  minClamp: number,
  step: number = 1
): number => {
  if (!values || values.length === 0) return minClamp;

  const maxValue = Math.max(...values.filter((v) => Number.isFinite(v)));

  if (maxValue < minClamp) return minClamp;

  // Round up to nearest step
  return Math.ceil(maxValue / step) * step;
};

const StudentDashboard: React.FC = () => {
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>("all");
  const [selectedTab, setSelectedTab] = useState<"overview" | "prediction">(
    "overview"
  );
  const [highlightedSubject, setHighlightedSubject] = useState<string | null>(
    null
  );

  // Use API-provided student when available; fall back to mock data.
  const EMPTY_STUDENT: Student = {
    id: 0,
    info: { id: "", name: "", class: "", area: "" },
    overallGPA: 0,
    gpaData: [],
    passRateData: [],
    detailedScores: {},
    trainingScoreData: [],
  };

  const [currentStudent, setCurrentStudent] = useState<Student>(
    studentsData[0] ?? EMPTY_STUDENT
  );
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Course API (per-semester) state
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [apiSemesters, setApiSemesters] = useState<
    { id: number; name: string; year: string }[]
  >([]);
  const [apiCoursesPerSemester, setApiCoursesPerSemester] = useState<
    Record<number, string[]>
  >({});
  const [apiCoursesDetailed, setApiCoursesDetailed] = useState<
    Record<number, Course[]>
  >({});
  const [apiPassRateMap, setApiPassRateMap] = useState<
    Record<number, { passed: number; total: number; pct: number }>
  >({});
  const [computedGpaData, setComputedGpaData] = useState<SemesterGPA[] | null>(
    null
  );
  // If API provides an overall GPA classification (e.g. GPA_ToanKhoa + Loai_Hoc_Luc_ToanKhoa),
  // store the classification string here so UI can prefer API-provided rank.
  const [apiOverallRank, setApiOverallRank] = useState<string | null>(null);

  // Read display name from localStorage if available (login saves `user_info`)
  const getUserNameFromLocal = (): string | null => {
    try {
      const raw = localStorage.getItem("user_info");
      if (!raw) return null;
      const ui = JSON.parse(raw) as Record<string, unknown>;
      return (
        (ui["ho_ten"] as string | undefined) ??
        (ui["hoTen"] as string | undefined) ??
        (ui["fullName"] as string | undefined) ??
        (ui["full_name"] as string | undefined) ??
        (ui["name"] as string | undefined) ??
        (ui["username"] as string | undefined) ??
        null
      );
    } catch {
      return null;
    }
  };

  const userDisplayName =
    getUserNameFromLocal() ?? currentStudent?.info?.name ?? "Sinh viên";

  const normalizeStudent = (raw: unknown): Student => {
    const fallback: Student = {
      id: 0,
      info: { id: "", name: "", class: "", area: "" },
      overallGPA: 0,
      gpaData: [],
      passRateData: [],
      detailedScores: {},
      trainingScoreData: [],
    };

    const r = (raw ?? {}) as Record<string, unknown>;

    const normalizeKey = (s: string) =>
      s
        .toString()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
    const findValue = (
      obj: Record<string, unknown> | undefined,
      candidates: string[]
    ) => {
      if (!obj || typeof obj !== "object") return undefined;
      const map: Record<string, string> = {};
      Object.keys(obj).forEach((k) => (map[normalizeKey(k)] = k));
      for (const c of candidates) {
        const nk = normalizeKey(c);
        if (map[nk]) return obj[map[nk]];
      }
      return undefined;
    };

    const infoSource =
      (r["info"] as Record<string, unknown>) ??
      (r["student_info"] as Record<string, unknown>) ??
      (r["sinh_vien"] as Record<string, unknown>) ??
      (r as Record<string, unknown>);
    const info = {
      id: String(
        findValue(infoSource, ["Ma Sinh Vien", "MaSinhVien", "mssv", "id"]) ??
          (infoSource && (infoSource.id ?? infoSource.mssv)) ??
          fallback.info.id
      ),
      name: String(
        findValue(infoSource, ["Ten", "Ho Ten", "ten", "ho_ten", "fullname"]) ??
          (infoSource && (infoSource.name ?? "")) ??
          fallback.info.name
      ),
      class: String(
        findValue(infoSource, ["Ten Lop", "TenLop", "lop", "class"]) ??
          (infoSource && (infoSource.class ?? infoSource.lop)) ??
          fallback.info.class
      ),
      area: String(
        findValue(infoSource, [
          "Ten Khu Vuc",
          "TenKhuVuc",
          "khu_vuc",
          "area",
        ]) ??
          (infoSource && (infoSource.area ?? infoSource.khu_vuc)) ??
          fallback.info.area
      ),
    };

    const toCourseArray = (arr: unknown): Course[] => {
      if (!arr || !Array.isArray(arr)) return [];
      return (arr as unknown[]).map((it) => {
        const itRec = (it ?? {}) as Record<string, unknown>;
        const course = String(itRec["course"] ?? itRec["name"] ?? "");
        const rawScore =
          itRec["score"] ??
          itRec["diem"] ??
          itRec["Diem"] ??
          itRec["DiemTrungBinh"];
        const score =
          typeof rawScore === "number"
            ? (rawScore as number)
            : Number(String(rawScore ?? "").replace(/[^0-9.-]/g, "")) || 0;
        const rawCredits =
          itRec["credits"] ??
          itRec["tin_chi"] ??
          itRec["So Tin Chi"] ??
          itRec["TinChi"];
        const credits =
          typeof rawCredits === "number"
            ? (rawCredits as number)
            : Number(String(rawCredits ?? "").replace(/[^0-9.-]/g, "")) || 0;
        const statusCandidate =
          (itRec["status"] as string | undefined) ??
          (itRec["passed"] as boolean | undefined);
        const status =
          typeof statusCandidate === "string"
            ? statusCandidate
            : statusCandidate === true
            ? "Đậu"
            : "Đậu";
        return {
          course,
          score,
          credits,
          status,
        } as Course;
      });
    };

    const rawDetails =
      (r["detailedScores"] as unknown) ??
      (r["detailed_scores"] as unknown) ??
      (r["scores"] as unknown) ??
      (r["diem"] as unknown) ??
      fallback.detailedScores;
    const detailedScores: Record<number, Course[]> = {};
    if (rawDetails && typeof rawDetails === "object") {
      Object.keys(rawDetails as Record<string, unknown>).forEach((k) => {
        const num = Number(k);
        const key = Number.isNaN(num) ? 1 : num;

        detailedScores[key] = toCourseArray(
          (rawDetails as Record<string, unknown>)[k]
        );
      });
    }

    const gpaData =
      (r["gpaData"] as unknown) ??
      (r["gpa_data"] as unknown) ??
      (r["gpa"] as unknown) ??
      fallback.gpaData;
    const passRateData =
      (r["passRateData"] as unknown) ??
      (r["pass_rate"] as unknown) ??
      (r["passRate"] as unknown) ??
      fallback.passRateData;
    const trainingScoreData =
      (r["trainingScoreData"] as unknown) ??
      (r["training_score"] as unknown) ??
      (r["trainingScore"] as unknown) ??
      fallback.trainingScoreData;

    const parsedId = Number(
      String(r["id"] ?? r["mssv"] ?? r["MaSinhVien"] ?? fallback.id)
    );

    const result: Student = {
      id: Number.isNaN(parsedId) ? fallback.id : parsedId,
      info,
      overallGPA:
        Number(r["overallGPA"] ?? r["overall_gpa"] ?? fallback.overallGPA) || 0,
      gpaData: Array.isArray(gpaData)
        ? (gpaData as SemesterGPA[])
        : fallback.gpaData,
      passRateData: Array.isArray(passRateData)
        ? (passRateData as PassRate[])
        : fallback.passRateData,
      detailedScores: Object.keys(detailedScores).length
        ? detailedScores
        : fallback.detailedScores,
      trainingScoreData: Array.isArray(trainingScoreData)
        ? (trainingScoreData as TrainingScore[])
        : fallback.trainingScoreData,
    };

    console.log("[normalizeStudent] ->", result);

    return result;
  };
  //API lấy thông tin sinh viên
  useEffect(() => {
    let isMounted = true;

    async function fetchStudent() {
      try {
        setLoading(true);

        // Gọi API
        const data = await getStudentInfo();
        console.log("👉 DATA TỪ API:", data);

        // ❌ 1. API trả null (không có token / lỗi backend)
        if (!isMounted) return;
        // If API returns null/undefined (e.g. not authenticated or no data),
        // fall back to placeholder student and keep the UI responsive.
        if (!data) {
          console.warn("API trả về null/undefined - dùng placeholder student.");
          setApiError(null);
          setCurrentStudent({
            id: 0,
            info: { id: "", name: "", class: "", area: "" },
            overallGPA: 0,
            gpaData: [],
            passRateData: [],
            detailedScores: {},
            trainingScoreData: [],
          });
          setSelectedTab("overview");
          return;
        }

        // 2. API trả object (không phải array)
        if (!Array.isArray(data)) {
          const normalized = normalizeStudent(data);
          setCurrentStudent(normalized);
          setSelectedTab("overview");
          return;
        }

        // 3. API trả mảng nhưng rỗng
        // Thay vì báo lỗi và dừng, dùng placeholder để UI vẫn hiển thị
        if (data.length === 0) {
          console.warn("API trả về mảng rỗng - dùng placeholder student.");
          setApiError(null);
          setCurrentStudent({
            id: 0,
            info: { id: "", name: "", class: "", area: "" },
            overallGPA: 0,
            gpaData: [],
            passRateData: [],
            detailedScores: {},
            trainingScoreData: [],
          });
          setSelectedTab("overview");
          return;
        }

        // 4. OK → lấy phần tử đầu tiên (và normalize)
        setCurrentStudent(normalizeStudent(data[0]));
        setSelectedTab("overview");
      } catch (err) {
        console.error("🔥 Lỗi fetch API sinh viên:", err);
        if (isMounted) {
          setApiError("Không thể tải thông tin sinh viên.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchStudent();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch pass-rate records and map them to the semester IDs we display
  useEffect(() => {
    let mounted = true;
    const loadPassRate = async () => {
      try {
        if (!apiSemesters || apiSemesters.length === 0) return;
        const data = await getStudentPassRateBySemester().catch((e) => {
          console.warn("Pass-rate API failed:", e);
          return null;
        });
        if (!mounted) return;
        if (!data || !Array.isArray(data)) {
          setApiPassRateMap({});
          return;
        }

        const map: Record<
          number,
          { passed: number; total: number; pct: number }
        > = {};

        const normalize = (s: unknown) => String(s ?? "").trim();

        // helper to read numeric candidates from the pass record
        const getNum = (rec: Record<string, unknown>, keys: string[]) => {
          for (const k of keys) {
            const v = rec[k] as unknown;
            if (typeof v === "number") return v as number;
            if (typeof v === "string") {
              const n = Number(v.replace(/[^0-9.-]/g, ""));
              if (!Number.isNaN(n)) return n;
            }
          }
          return undefined;
        };

        for (const rec of data as PassRateApiRecord[]) {
          const year = normalize(
            rec["Ten Nam Hoc"] ?? rec["TenNamHoc"] ?? rec["NamHoc"]
          );
          const hk = normalize(
            rec["Ten Hoc Ky"] ?? rec["TenHocKy"] ?? rec["HocKy"]
          );
          // find matching semester
          const sem = apiSemesters.find(
            (s) => s.year === year && s.name.includes(hk)
          );
          if (!sem) continue;

          const soDau =
            getNum(rec as Record<string, unknown>, [
              "So_Mon_Dau",
              "SoMonDau",
              "so_mon_dau",
              "so_dau",
            ]) ?? 0;
          const tong =
            getNum(rec as Record<string, unknown>, [
              "Tong_Mon",
              "TongMon",
              "tong_mon",
              "tong_mon_",
            ]) ?? 0;
          const rawRatio = getNum(rec as Record<string, unknown>, [
            "Ty_Le_Qua_Mon",
            "TyLeQuaMon",
            "ty_le_qua_mon",
          ]);
          let pct = 0;
          if (typeof rawRatio === "number") {
            // if API sends fraction (0-1) or percent (0-100)
            if (rawRatio <= 1) pct = rawRatio * 100;
            else pct = rawRatio;
          } else if (tong && tong > 0) {
            pct = (soDau / tong) * 100;
          }

          map[sem.id] = {
            passed: Number(soDau),
            total: Number(tong),
            pct: Number(Number(pct).toFixed(1)),
          };
        }

        setApiPassRateMap(map);
      } catch (e) {
        console.error("Error loading pass-rate records:", e);
        if (mounted) {
          setApiPassRateMap({});
        }
      }
    };

    loadPassRate();
    return () => {
      mounted = false;
    };
  }, [apiSemesters]);

  // Fetch GPA-per-semester from dedicated GPA endpoint (if available)
  useEffect(() => {
    let mounted = true;
    async function loadGpaTrend() {
      try {
        // Fetch per-semester GPA records
        const data = await getStudentGpaBySemester();
        // Also try fetching the overall GPA (separate endpoint)
        try {
          const overall = await getStudentOverallGpa();
          if (overall && mounted) {
            // find likely GPA and rank keys
            const keys = Object.keys(overall);
            const gpaKey = keys.find((k) => k.toLowerCase().includes("gpa"));
            if (gpaKey) {
              const raw = overall[gpaKey];
              const num = typeof raw === "number" ? raw : Number(raw);
              if (!Number.isNaN(num)) {
                setCurrentStudent((prev) => ({
                  ...prev,
                  overallGPA: Number(num),
                }));
              }
            }
            const rankKey = keys.find((k) => k.toLowerCase().includes("loai"));
            if (rankKey) {
              const rv = overall[rankKey];
              setApiOverallRank(typeof rv === "string" ? rv : null);
            }
          }
        } catch (e) {
          console.warn("Không lấy được GPA toàn khóa:", e);
        }
        if (!mounted) return;
        if (!data || !Array.isArray(data) || data.length === 0) return;

        // First, look for any "overall / toàn khóa" GPA keys so we can populate
        // the dashboard's overall GPA and API-provided classification if available.
        try {
          for (const rec of data as Record<string, unknown>[]) {
            const keys = Object.keys(rec || {});
            // find any key that looks like a GPA value
            const gpaKey = keys.find((k) => k.toLowerCase().includes("gpa"));
            if (!gpaKey) continue;
            const rawVal = rec[gpaKey];
            const num = typeof rawVal === "number" ? rawVal : Number(rawVal);
            if (Number.isNaN(num)) continue;

            const lk = gpaKey.toLowerCase();
            // detect if this GPA is a whole-program GPA by key name
            const isWholeProgram =
              lk.includes("toan") || // 'ToanKhoa', 'ToànKhóa', etc.
              lk.includes("toankhoa") ||
              lk.includes("toàn") ||
              // sometimes API returns a single object with GPA keys only
              (keys.length === 1 && !!num);

            if (isWholeProgram) {
              // find a matching rank/classification key
              const rankKey =
                keys.find(
                  (k) =>
                    k.toLowerCase().includes("loai") &&
                    k.toLowerCase().includes("toan")
                ) || keys.find((k) => k.toLowerCase().includes("loai"));
              const rankVal = rankKey
                ? (rec[rankKey] as string)
                : (rec["Loai_Hoc_Luc"] as string);

              // update currentStudent overallGPA and store API rank
              setCurrentStudent((prev) => ({
                ...prev,
                overallGPA: Number(num),
              }));
              setApiOverallRank(typeof rankVal === "string" ? rankVal : null);
              break; // prefer first whole-program record
            }
          }
        } catch (e) {
          console.warn("Could not detect overall GPA from API payload:", e);
        }

        // Map per-semester GPA records (unchanged behavior)
        const mapped: SemesterGPA[] = data
          .map((r) => {
            const year =
              (r["Ten Nam Hoc"] as string) ?? String(r["TenNamHoc"] ?? "");
            const hk =
              (r["Ten Hoc Ky"] as string) ?? String(r["TenHocKy"] ?? "");
            const raw = (r["GPA_Hocky"] ??
              r["GPA_HocKy"] ??
              r["GPA"] ??
              r["GPA_HocKy"]) as unknown;
            const gpa = typeof raw === "number" ? raw : Number(raw ?? NaN) || 0;
            const apiRank =
              (r["Loai_Hoc_Luc"] as string) ??
              (r["Loai_HocLuc"] as string) ??
              "";
            // If API provides classification, use it directly; otherwise
            // fall back to the local 4-point `getGradeRank` mapping.
            const rank = apiRank || getGradeRank(gpa);
            return {
              // show semester with year (e.g. "HK1 2024-2025")
              semester: `${hk || ""} ${year || ""}`.trim(),
              year: year || "",
              gpa,
              rank,
            };
          })
          .sort((a, b) => {
            const ay = Number(String(a.year).split("-")[0] ?? 0);
            const by = Number(String(b.year).split("-")[0] ?? 0);
            if (ay !== by) return ay - by;
            const an = Number(String(a.semester).replace(/\D/g, "") || 0);
            const bn = Number(String(b.semester).replace(/\D/g, "") || 0);
            return an - bn;
          });

        setComputedGpaData(mapped);
      } catch (err) {
        console.error("Error loading GPA trend:", err);
      }
    }
    loadGpaTrend();
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch course records grouped by semester from dedicated API endpoint
  useEffect(() => {
    let mounted = true;
    async function loadCourses() {
      try {
        setCoursesLoading(true);
        // Prefer detailed per-course endpoint when available
        const detailed = await getStudentDetailedCourses().catch((e) => {
          console.warn("Detailed courses API failed, falling back:", e);
          return null;
        });
        if (!mounted) return;

        let arr: {
          year: string;
          hk: string;
          records: Record<string, unknown>[];
        }[] = [];

        if (detailed && Array.isArray(detailed) && detailed.length) {
          // Group detailed records by year + hk
          const map = new Map<
            string,
            { year: string; hk: string; records: Record<string, unknown>[] }
          >();
          detailed.forEach((rec: DetailedCourseApiRecord) => {
            const year = String(rec["Ten Nam Hoc"] ?? "-");
            const hk = String(rec["Ten Hoc Ky"] ?? "-");
            const key = `${year}||${hk}`;
            if (!map.has(key)) map.set(key, { year, hk, records: [] });
            map.get(key)!.records.push(rec);
          });
          arr = Array.from(map.values());
        } else {
          // Fallback to simpler per-semester endpoint
          const data = await getStudentCoursesBySemester();
          if (!mounted) return;
          if (!data || !Array.isArray(data)) {
            setApiSemesters([]);
            setApiCoursesPerSemester({});
            setComputedGpaData(null);
            return;
          }

          const map = new Map<
            string,
            { year: string; hk: string; records: CourseApiRecord[] }
          >();

          data.forEach((rec) => {
            const year = (rec["Ten Nam Hoc"] as string) ?? "-";
            const hk = (rec["Ten Hoc Ky"] as string) ?? "-";
            const key = `${year}||${hk}`;
            if (!map.has(key)) map.set(key, { year, hk, records: [] });
            map.get(key)!.records.push(rec);
          });

          arr = Array.from(map.values());
        }

        arr = arr.sort((a, b) => {
          const ay = Number(String(a.year).split("-")[0] ?? 0);
          const by = Number(String(b.year).split("-")[0] ?? 0);
          if (ay !== by) return ay - by;
          const an = Number(String(a.hk).replace(/\D/g, "") || 0);
          const bn = Number(String(b.hk).replace(/\D/g, "") || 0);
          return an - bn;
        });

        const sems = arr.map((g, idx) => ({
          id: idx + 1,
          // show semester then year for consistency with chart labels
          name: `${g.hk} ${g.year}`,
          year: g.year,
        }));

        const coursesMap: Record<number, string[]> = {};
        const coursesDetailedMap: Record<number, Course[]> = {};

        // helper: try multiple possible keys for numeric fields (score, credits)
        const getNumericField = (
          obj: Record<string, unknown>,
          candidates: string[]
        ): number => {
          for (const k of candidates) {
            const v = obj[k];
            if (typeof v === "number") return v as number;
            if (typeof v === "string") {
              const n = Number(v.trim());
              if (!Number.isNaN(n)) return n;
            }
          }
          return 0;
        };

        // Fuzzy string field lookup: normalize keys (strip diacritics, lower, remove non-alnum)
        const normalizeKeyLocal = (s: string) =>
          s
            .toString()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");

        const buildNormalizedMap = (obj: Record<string, unknown>) => {
          const map = new Map<string, string>();
          Object.keys(obj || {}).forEach((k) => {
            try {
              map.set(normalizeKeyLocal(k), k);
            } catch {
              map.set(k.toLowerCase(), k);
            }
          });
          return map;
        };

        const getStringField = (
          obj: Record<string, unknown>,
          candidates: string[]
        ): string => {
          if (!obj || typeof obj !== "object") return "-";
          const map = buildNormalizedMap(obj);

          // try exact candidate matches first
          for (const c of candidates) {
            const nk = normalizeKeyLocal(c);
            const orig = map.get(nk);
            if (orig) {
              const v = obj[orig];
              if (typeof v === "string") {
                const s = v.trim();
                if (s !== "") return s;
              }
              if (typeof v === "number") return String(v);
            }
          }

          // fallback: find any key that looks like a course name (contains 'ten' and 'mon')
          for (const [nk, orig] of map.entries()) {
            if (nk.includes("ten") && nk.includes("mon")) {
              const v = obj[orig];
              if (typeof v === "string" && v.trim() !== "") return v.trim();
              if (typeof v === "number") return String(v);
            }
          }

          // last resort: return first non-empty string or number value
          for (const k of Object.keys(obj)) {
            const v = obj[k];
            if (typeof v === "string" && v.trim() !== "") return v.trim();
            if (typeof v === "number") return String(v);
          }

          return "-";
        };

        const scoreKeys = [
          "Diem Trung Binh",
          "DiemTrungBinh",
          "diem_trung_binh",
          "DiemTB",
          "Diem",
        ];
        // The API doesn't reliably return 'chuyên cần' (attendance) values.
        // We intentionally do not use CC for the detailed table. Keep mid/final only.
        const midKeys = ["Diem Giua Ky", "DiemGiuaKy", "DiemGiua", "Diem Giua"];
        const finalKeys = [
          "Diem Cuoi Ky",
          "DiemCuoiKy",
          "DiemCuoi",
          "Diem Cuoi",
        ];
        const creditKeys = [
          "So Tin Chi",
          "Tin Chi",
          "TinChi",
          "so_tin_chi",
          "Tin_Chi",
          "credits",
          "credit",
        ];
        const courseNameKeys = [
          "Ten Mon Hoc",
          "TenMonHoc",
          "ten_mon_hoc",
          "name",
          "Ten",
          "TenMon",
          "TenMonHocVn",
          "Ten_Mon_Hoc",
          "tenmonhoc",
        ];

        const gpaData: SemesterGPA[] = arr.map((g, idx) => {
          // collect numeric course scores for this semester
          const nums = g.records
            .map((r) =>
              getNumericField(r as Record<string, unknown>, scoreKeys)
            )
            .filter((n) => Number.isFinite(n));
          const avg = nums.length
            ? nums.reduce((a, b) => a + b, 0) / nums.length
            : 0;

          // Use raw average as returned by API (do NOT normalize to 4.0)
          const rawAvg = Math.round(avg * 100) / 100;

          // Build Course[] entries from API records, using fuzzy keys for credits and score
          const detailed: Course[] = g.records.map((r) => {
            const rec = r as Record<string, unknown>;
            const mid = getNumericField(rec, midKeys);
            const final = getNumericField(rec, finalKeys);
            // prefer explicit 'Diem Trung Binh' if present, otherwise compute average
            let avg = getNumericField(rec, scoreKeys);
            if (!avg && (mid || final)) {
              const parts = [mid, final].filter((n) => n > 0);
              avg = parts.length
                ? Math.round(
                    (parts.reduce((a, b) => a + b, 0) / parts.length) * 100
                  ) / 100
                : 0;
            }
            const score = typeof avg === "number" ? avg : 0;
            const credits = getNumericField(rec, creditKeys) || 0;
            const status = score >= 5 ? "Đậu" : "Rớt";
            // if course name missing, try to fallback to a course code/id
            const courseNameRaw = getStringField(rec, courseNameKeys);
            const courseCode = getStringField(rec, [
              "Ma Mon Hoc",
              "MaMonHoc",
              "MaMH",
              "Ma",
              "MaMon",
            ]);
            const finalCourseName =
              (courseNameRaw && courseNameRaw !== "-") || !courseCode
                ? courseNameRaw
                : `${courseCode}`;

            return {
              course: String(finalCourseName ?? "-"),
              score,
              credits,
              status,
              midScore: mid || undefined,
              finalScore: final || undefined,
            } as Course;
          });

          coursesMap[idx + 1] = detailed.map((d) => d.course);
          coursesDetailedMap[idx + 1] = detailed;

          // Infer semester classification only if API doesn't provide it elsewhere
          const inferredRankForSem =
            rawAvg > 4
              ? rawAvg >= 8.5
                ? "Giỏi"
                : rawAvg >= 7.0
                ? "Khá"
                : rawAvg >= 5.5
                ? "Trung bình"
                : "Yếu"
              : getGradeRank(rawAvg);

          return {
            semester: `${g.hk} ${g.year}`.trim(),
            year: g.year,
            gpa: rawAvg,
            rank: inferredRankForSem,
          };
        });

        // raw data available in `data` if needed; we only store grouped results
        setApiSemesters(sems);
        setApiCoursesPerSemester(coursesMap);
        setApiCoursesDetailed(coursesDetailedMap);
        setComputedGpaData(gpaData);
      } catch (err) {
        console.error("Error loading course records:", err);
        if (mounted) setCoursesError((err as Error)?.message ?? String(err));
      } finally {
        if (mounted) setCoursesLoading(false);
      }
    }
    loadCourses();
    return () => {
      mounted = false;
    };
  }, []);

  // Don't block rendering while student API loads — render with placeholder
  // `currentStudent` is initialized to an empty fallback so the UI is responsive.

  // Helper to build the same semester key format used in charts: "HKX YY-ZZ" -> e.g. "HK1 24-25"
  const makeSemKey = (hk: string | undefined, year: string | undefined) => {
    const hkStr = String(hk ?? "").trim();
    const yearStr = String(year ?? "").trim();
    if (!hkStr || !yearStr) return `${hkStr} ${yearStr}`.trim();
    const parts = yearStr.split("-");
    const start = parts[0] ?? "";
    const end = parts[1] ?? "";
    const yearShort =
      start.slice(-2) + (end ? `-${String(Number(end) - 2000)}` : "");
    return `${hkStr} ${yearShort}`.trim();
  };

  // Load training-score (DRL) records and map them into `currentStudent.trainingScoreData`
  useEffect(() => {
    let mounted = true;
    const loadTraining = async () => {
      try {
        const data = await getStudentTrainingScores().catch((e) => {
          console.warn("Training score API failed:", e);
          return null;
        });
        if (!mounted) return;
        if (!data || !Array.isArray(data) || data.length === 0) {
          // no data -> leave existing trainingScoreData alone
          return;
        }
        const mapped: TrainingScore[] = (data as unknown[]).map((r) => {
          const row = r as Record<string, unknown>;

          const year =
            (row["Ten Nam Hoc"] as string) ?? String(row["NamHoc"] ?? "");
          const hk =
            (row["Ten Hoc Ky"] as string) ?? String(row["HocKy"] ?? "");
          const raw = row["DRL"] ?? row["drl"] ?? row["DRL"];

          const score =
            typeof raw === "number"
              ? raw
              : Number(String(raw ?? "").replace(/[^0-9.-]/g, "")) || 0;

          return {
            semester: makeSemKey(hk, year),
            score,
          };
        });

        // merge into currentStudent state
        setCurrentStudent((prev) => ({
          ...prev,
          trainingScoreData: mapped,
        }));
      } catch (e) {
        console.warn("Error loading training scores:", e);
      }
    };
    loadTraining();
    return () => {
      mounted = false;
    };
  }, []);

  const getGradeRank = (gpa: number) => {
    if (gpa >= 3.6) return "Giỏi";
    if (gpa >= 3.2) return "Khá";
    if (gpa >= 2.5) return "Trung bình";
    return "Yếu";
  };

  // Prefer API-provided detailed course entries when available
  const currentScores =
    apiCoursesDetailed[selectedSemester] ??
    currentStudent?.detailedScores?.[selectedSemester] ??
    [];

  // (passChartData & overallPassRate will be computed after semesters are defined)

  // Prepare comparison data with student score (for selected semester)
  // Comparison data from API (class averages) for selected semester
  const [comparisonApiData, setComparisonApiData] = useState<
    { course: string; dtb_all: number; dtb_sv?: number }[]
  >([]);

  // Helper to normalize strings for fuzzy matching (strip diacritics, non-alnum)
  const normalizeForMatch = (s: string) =>
    s
      .toString()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

  // Load class-average comparison when semesters are available or selection changes
  useEffect(() => {
    let mounted = true;
    const loadComparison = async () => {
      try {
        if (!apiSemesters || apiSemesters.length === 0) return;
        const sem = apiSemesters.find((s) => s.id === selectedSemester);
        if (!sem) return;

        // try to pass semester info (year, hk) to the API if it accepts params
        const hkPart = sem.name.split(" ")[0] ?? "";
        const data = await getStudentClassAverageComparison(
          sem.year,
          hkPart
        ).catch((e) => {
          console.warn("Class average API failed:", e);
          return null;
        });
        if (!mounted) return;
        if (!data || !Array.isArray(data)) {
          setComparisonApiData([]);
          return;
        }

        // build normalized course list for selected semester to help filter
        // Prefer the `apiCoursesPerSemester` (the canonical list from the API)
        // otherwise fall back to detailed API entries or currentStudent data.
        const rawSemesterCourses: string[] =
          apiCoursesPerSemester[selectedSemester] ??
          (apiCoursesDetailed[selectedSemester]
            ? apiCoursesDetailed[selectedSemester].map((s) => s.course || "")
            : currentStudent?.detailedScores?.[selectedSemester]?.map(
                (s) => s.course || ""
              ) ?? []);

        const semesterCourses = rawSemesterCourses.map((c) =>
          normalizeForMatch(String(c || ""))
        );

        const normalized = (data as ClassAverageRecord[])
          .map((rec) => {
            // If API provides semester/year fields, prefer only records matching the selected semester
            const recYear =
              (rec["Ten Nam Hoc"] as string) ??
              (rec["NamHoc"] as string) ??
              (rec["TenNamHoc"] as string) ??
              null;
            const recHk =
              (rec["Ten Hoc Ky"] as string) ??
              (rec["HocKy"] as string) ??
              (rec["TenHocKy"] as string) ??
              null;

            if (recYear && recHk) {
              // Normalize and compare loosely
              const rYear = String(recYear).trim();
              const rHk = String(recHk).trim();
              const semYear = String(sem.year).trim();
              const semHk = String(sem.name.split(" ")[0] ?? "").trim();
              if (rYear !== semYear || rHk !== semHk) return null; // skip non-matching semester rows
            }

            // If the API record doesn't include semester fields, only include it
            // when its course name roughly matches a course from the selected semester.
            if (!recYear || !recHk) {
              const tmpCourse =
                (rec["Ten Mon Hoc"] as string) ||
                (rec["TenMonHoc"] as string) ||
                (rec["Ten"] as string) ||
                (rec["name"] as string) ||
                "";
              const normCourse = normalizeForMatch(String(tmpCourse || ""));
              // Require exact normalized equality with the semester's course list
              const hasMatch = semesterCourses.some((c) => {
                if (!c || !normCourse) return false;
                return c === normCourse;
              });
              if (!hasMatch) return null;
            }

            // Course name candidates
            let courseRaw =
              (rec["Ten Mon Hoc"] as string) ||
              (rec["TenMonHoc"] as string) ||
              (rec["Ten"] as string) ||
              (rec["name"] as string) ||
              "";

            // If course name is not found in expected keys, fall back to first plausible string column
            if (!courseRaw || courseRaw.trim() === "") {
              for (const k of Object.keys(rec)) {
                const v = rec[k];
                if (
                  typeof v === "string" &&
                  String(k).toLowerCase().indexOf("ten") === -1 &&
                  String(k).toLowerCase().indexOf("dtb") === -1 &&
                  String(k).toLowerCase().indexOf("nam") === -1 &&
                  v.trim() !== ""
                ) {
                  courseRaw = v;
                  break;
                }
              }
            }

            const dtbAllRaw = (rec["DTB_ALL"] ??
              rec["DTB"] ??
              rec["DiemTB"]) as number | string | undefined;
            const dtbSvRaw = (rec["DTB_SV"] ?? rec["DiemSV"]) as
              | number
              | string
              | undefined;
            const dtb_all =
              typeof dtbAllRaw === "number"
                ? dtbAllRaw
                : Number(String(dtbAllRaw ?? "").replace(/[^0-9.-]/g, "")) || 0;
            const dtb_sv =
              typeof dtbSvRaw === "number"
                ? dtbSvRaw
                : dtbSvRaw
                ? Number(String(dtbSvRaw).replace(/[^0-9.-]/g, ""))
                : undefined;

            return { course: String(courseRaw ?? ""), dtb_all, dtb_sv };
          })
          .filter(Boolean) as {
          course: string;
          dtb_all: number;
          dtb_sv?: number;
        }[];

        setComparisonApiData(normalized);
      } catch (e) {
        console.warn("Error loading class-average comparison:", e);
        if (mounted) setComparisonApiData([]);
      }
    };

    loadComparison();
    return () => {
      mounted = false;
    };
  }, [
    apiSemesters,
    selectedSemester,
    apiCoursesDetailed,
    currentStudent,
    apiCoursesPerSemester,
  ]);

  // Merge API comparison with student's own scores for the selected semester
  const comparisonWithStudent = comparisonApiData.map((item) => {
    const norm = normalizeForMatch(item.course || "");
    const matched = (
      apiCoursesDetailed[selectedSemester] ??
      currentStudent?.detailedScores?.[selectedSemester] ??
      []
    ).find((s) => {
      try {
        const a = normalizeForMatch(s.course || "");
        return a === norm; // exact normalized equality
      } catch {
        return false;
      }
    });
    const studentScore = matched
      ? Number(matched.score ?? 0)
      : Number(item.dtb_sv ?? 0);
    const avg = Number(item.dtb_all ?? 0);
    // classify grade on 10-point scale
    const classify = (v: number) => {
      if (v >= 8.5) return "Giỏi";
      if (v >= 7.0) return "Khá";
      if (v >= 5.5) return "Trung bình";
      return "Yếu";
    };
    const grade = classify(Number(studentScore ?? 0));
    return {
      course: item.course,
      average: avg,
      student: Number(studentScore ?? 0),
      grade,
    };
  });

  // Apply selected grade filter to comparison results (if any)
  const filteredComparison =
    selectedGradeFilter && selectedGradeFilter !== "all"
      ? comparisonWithStudent.filter((c) => c.grade === selectedGradeFilter)
      : comparisonWithStudent;

  // Calculate GPA vs Training Score correlation data

  const gradeCounts = { Giỏi: 0, Khá: 0, "Trung bình": 0, Yếu: 0 };

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
  // Prefer semester list and courses derived from the dedicated course API when available
  const semesters: { id: number; name: string; year: string }[] =
    apiSemesters.length > 0
      ? apiSemesters
      : (currentStudent?.gpaData ?? []).map((g, idx) => ({
          id: idx + 1,
          name: `${g.semester} ${g.year}`,
          year: g.year,
        }));

  const coursesPerSemester: Record<number, string[]> =
    Object.keys(apiCoursesPerSemester).length > 0
      ? apiCoursesPerSemester
      : (() => {
          const map: Record<number, string[]> = {};
          Object.entries(currentStudent?.detailedScores ?? {}).forEach(
            ([k, arr]) => {
              const id = Number(k);
              map[id] = Array.isArray(arr)
                ? (arr as Course[]).map((c) => c.course ?? "")
                : [];
            }
          );
          return map;
        })();

  // Build pass rate chart data using credits (preferred).
  // Prefer `apiCoursesDetailed` (detailed course list per semester) and fall
  // back to `currentStudent.detailedScores` when needed. Compute passed/failed
  // credits instead of counting courses.
  const passChartData: {
    semester: string;
    passedCredits: number;
    failedCredits: number;
    totalCredits: number;
  }[] = semesters.map((sem) => {
    // prefer API-detailed list for this semester
    const list: Course[] =
      apiCoursesDetailed[sem.id] ??
      currentStudent?.detailedScores?.[sem.id] ??
      [];

    const totalCredits = list.reduce(
      (s, c) => s + (Number(c?.credits) || 0),
      0
    );
    const passedCredits = list.reduce(
      (s, c) =>
        s +
        (Number(c?.credits) || 0) *
          ((typeof c.score === "number" ? c.score : Number(c.score)) >= 5
            ? 1
            : 0),
      0
    );
    const failedCredits = Math.max(totalCredits - passedCredits, 0);
    return {
      semester: sem.name,
      passedCredits,
      failedCredits,
      totalCredits,
    };
  });

  // Overall pass rate by credits (sum passed credits / sum total credits) — fallback to previous count-based data only if credits missing.
  const overallPassRate = (() => {
    const vals = passChartData.filter((p) => p.totalCredits > 0);
    if (vals.length > 0) {
      const totalPassed = vals.reduce((s, x) => s + x.passedCredits, 0);
      const totalAll = vals.reduce((s, x) => s + x.totalCredits, 0);
      return totalAll ? ((totalPassed / totalAll) * 100).toFixed(1) : "0.0";
    }
    // fallback: if we have no credit data, fall back to API count-based mapping if available
    const valsCounts = Object.values(apiPassRateMap);
    if (valsCounts.length > 0) {
      const totalPassed = valsCounts.reduce((s, x) => s + x.passed, 0);
      const totalAll = valsCounts.reduce((s, x) => s + x.total, 0);
      return totalAll ? ((totalPassed / totalAll) * 100).toFixed(1) : "0.0";
    }
    // last resort: use currentStudent.passRateData counts
    const totalPassedCourses = (currentStudent?.passRateData ?? []).reduce(
      (sum, item) => sum + item.passed,
      0
    );
    const totalCourses = (currentStudent?.passRateData ?? []).reduce(
      (sum, item) => sum + item.total,
      0
    );
    return totalCourses
      ? ((totalPassedCourses / totalCourses) * 100).toFixed(1)
      : "0.0";
  })();

  // Debug: log training score array so we can inspect what the API mapping produced
  const _trainingScoreData = currentStudent?.trainingScoreData ?? [];
  useEffect(() => {
    try {
      console.log("[StudentDashboard] trainingScoreData:", _trainingScoreData);
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.message);
      }
    }
  }, [_trainingScoreData]);

  // selectedSemesterName removed — previously used for per-bar stroke highlighting

  // (Pass/Fail by semester calculation removed — not used in simplified mock)

  return (
    <div
      className="min-h-screen bg-[#F5F7FA] p-6"
      style={{ fontFamily: "Inter, Manrope, Outfit, sans-serif" }}
    >
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
            Tổng quan
          </button>
          <button
            onClick={() => setSelectedTab("prediction")}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              selectedTab === "prediction"
                ? "bg-white shadow-md"
                : "bg-transparent"
            }`}
          >
            Dự đoán hiệu suất tương lai
          </button>
        </div>

        {/* Show top-level API error if any */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
            {apiError}
          </div>
        )}

        {/* Prediction tab content */}
        {selectedTab === "prediction" && (
          <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
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
            {loading ? (
              <div className="p-8 text-center text-slate-500">
                Đang tải dữ liệu...
              </div>
            ) : (
              <div className="bg-white rounded-lg p-8 border border-slate-200 shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
                <div className="flex items-center gap-6">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-lg">
                    <User className="w-12 h-12 text-white" />
                  </div>

                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">
                      {userDisplayName}
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
            )}
            {/* GPA Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-lg shadow-slate-200/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Xu hướng GPA theo học kỳ
                  </h2>
                </div>
                {(() => {
                  const chartGpaData =
                    computedGpaData ?? currentStudent.gpaData;

                  // Calculate dynamic Y-axis max
                  const maxGpa =
                    chartGpaData.length > 0
                      ? Math.max(...chartGpaData.map((d) => d.gpa))
                      : 0;

                  const dynamicYMax = maxGpa < 6 ? 6 : Math.ceil(maxGpa);

                  // Dynamic margin calculation based on data points
                  const dataPointCount = chartGpaData.length;
                  const rightMargin = dataPointCount <= 3 ? 30 : 10;
                  const leftMargin = dataPointCount <= 3 ? 10 : -20;

                  return (
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart
                        data={chartGpaData}
                        margin={{
                          top: 10,
                          right: rightMargin,
                          left: leftMargin,
                          bottom: 10,
                        }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e2e8f0"
                          opacity={0.6}
                        />
                        <XAxis
                          dataKey="semester"
                          stroke="#64748b"
                          tick={{ fontSize: 12 }}
                          padding={{ left: 0, right: 0 }}
                          interval="preserveStartEnd"
                          tickLine={false}
                          scale="point"
                        />
                        <YAxis
                          domain={[0, dynamicYMax]}
                          stroke="#64748b"
                          tick={{ fontSize: 12 }}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#fff",
                            border: "none",
                            borderRadius: "12px",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            padding: "12px 16px",
                          }}
                          labelStyle={{
                            fontWeight: "600",
                            color: "#1e293b",
                            fontSize: "13px",
                          }}
                          formatter={(
                            value: number,
                            _name: string,
                            props: { payload?: { rank?: string } }
                          ) => [
                            `${value.toFixed(2)} (${
                              props.payload?.rank ?? ""
                            })`,
                            "GPA",
                          ]}
                        />
                        <Legend
                          wrapperStyle={{ paddingTop: "16px" }}
                          iconType="circle"
                        />
                        <Line
                          type="monotone"
                          dataKey="gpa"
                          stroke="#3B82F6"
                          strokeWidth={3}
                          dot={{
                            fill: "#3B82F6",
                            r: 5,
                            strokeWidth: 2,
                            stroke: "#fff",
                          }}
                          activeDot={{ r: 7, fill: "#2563EB" }}
                          name="GPA"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  );
                })()}
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg shadow-slate-200/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-50 rounded-xl">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">
                    GPA Trung bình
                  </h2>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "GPA đạt được",
                          value: currentStudent.overallGPA,
                        },
                        {
                          name: "Còn lại",
                          value: 10 - currentStudent.overallGPA,
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
                      <Cell fill="#3B82F6" />
                      <Cell fill="#F1F5F9" />
                    </Pie>
                    <Tooltip
                      formatter={(value: number | string, name: string) => [
                        `${Number(value).toFixed(2)} / 10.0`,
                        name,
                      ]}
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        padding: "12px 16px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="text-center mt-4">
                  <div className="text-3xl font-bold text-blue-600">
                    {currentStudent.overallGPA.toFixed(2)}/10.0
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    Học lực:{" "}
                    <span className="font-bold">
                      {apiOverallRank ??
                        getGradeRank(currentStudent.overallGPA)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Semester Selection */}
            <Semester
              semesters={semesters}
              selectedSemester={selectedSemester}
              onSemesterChange={setSelectedSemester}
              coursesPerSemester={coursesPerSemester}
              coursesLoading={coursesLoading}
              coursesError={coursesError}
            />

            {/* Detailed Scores Table */}
            <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                Bảng điểm chi tiết -{" "}
                {
                  semesters.find(
                    (s: { id: number; name: string; year: string }) =>
                      s.id === selectedSemester
                  )?.name
                }
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left rounded-tl-xl">
                        Môn học
                      </th>
                      <th className="px-6 py-4 text-center">Tín chỉ</th>
                      <th className="px-6 py-4 text-center">GK</th>
                      <th className="px-6 py-4 text-center">CK</th>
                      <th className="px-6 py-4 text-center">TB</th>
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
                        <td className="px-6 py-4 text-center text-slate-600">
                          {typeof score.midScore === "number"
                            ? score.midScore.toFixed(2)
                            : "-"}
                        </td>
                        <td className="px-6 py-4 text-center text-slate-600">
                          {typeof score.finalScore === "number"
                            ? score.finalScore.toFixed(2)
                            : "-"}
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
                            {typeof score.score === "number"
                              ? score.score.toFixed(2)
                              : score.score}
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
            <div className="flex gap-6">
              {/* Pass Rate */}
              <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 w-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-xl">
                      <Target className="w-6 h-6 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">
                      Tỷ lệ Đậu/Rớt theo tín chỉ
                    </h2>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 px-6 py-4 rounded-xl border border-green-100">
                    <div className="text-sm font-medium text-green-700 mb-1">
                      Tỷ lệ qua môn toàn khóa
                    </div>
                    <div className="text-3xl font-bold text-green-600">
                      {overallPassRate}%
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart
                    data={passChartData}
                    margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
                    barCategoryGap="20%"
                    barGap={0}
                    layout="horizontal"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                      opacity={0.6}
                    />
                    <XAxis
                      dataKey="semester"
                      stroke="#64748b"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#64748b"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        padding: "12px 16px",
                      }}
                      labelStyle={{ fontWeight: "600", fontSize: "13px" }}
                      formatter={(
                        value: number,
                        name: string,
                        props: { payload?: { totalCredits?: number } }
                      ) => {
                        const total = props.payload?.totalCredits ?? 0;
                        const percentage =
                          total > 0 ? ((value / total) * 100).toFixed(1) : "0";
                        if (name === "Đậu") {
                          return [`${value} tín chỉ (${percentage}%)`, "Đậu"];
                        }
                        return [`${value} tín chỉ (${percentage}%)`, "Rớt"];
                      }}
                      labelFormatter={(label) => `Học kỳ: ${label}`}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: "16px" }}
                      iconType="circle"
                    />
                    <Bar
                      dataKey="passedCredits"
                      fill="#22C55E"
                      barSize={40}
                      name="Đậu"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="failedCredits"
                      fill="#EF4444"
                      name="Rớt"
                      barSize={40}
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <StudentScoreChartHighestLowest />
            </div>
            {/* Comparison with Average */}
            <div className="bg-white rounded-2xl p-8 shadow-lg shadow-slate-200/50 w-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  So sánh với điểm trung bình lớp
                </h2>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                {(() => {
                  // Calculate dynamic Y-axis max for comparison chart
                  const allScores = filteredComparison.flatMap((d) => [
                    d.student || 0,
                    d.average || 0,
                  ]);
                  const dynamicComparisonMax = getDynamicAxisMax(
                    allScores,
                    6,
                    1
                  );

                  return (
                    <ComposedChart
                      data={filteredComparison}
                      margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e2e8f0"
                        opacity={0.6}
                      />
                      <XAxis
                        dataKey="course"
                        stroke="#64748b"
                        tick={false}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#64748b"
                        domain={[0, dynamicComparisonMax]}
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "none",
                          borderRadius: "12px",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          padding: "12px 16px",
                        }}
                        labelStyle={{ fontWeight: "600", fontSize: "13px" }}
                        formatter={(value: number, name: string) => [
                          `${value.toFixed(1)} / 10.0`,
                          name,
                        ]}
                      />
                      <Legend
                        wrapperStyle={{ paddingTop: "16px" }}
                        iconType="circle"
                      />
                      <Bar
                        dataKey="student"
                        fill="#3B82F6"
                        name="Điểm của bạn"
                        barSize={24}
                        radius={[4, 4, 0, 0]}
                      />
                      <Line
                        type="monotone"
                        dataKey="average"
                        stroke="#EF4444"
                        strokeWidth={3}
                        name="Điểm trung bình môn học"
                        dot={{
                          fill: "#EF4444",
                          r: 5,
                          strokeWidth: 2,
                          stroke: "#fff",
                        }}
                        activeDot={{ r: 7, fill: "#DC2626" }}
                      />
                    </ComposedChart>
                  );
                })()}
              </ResponsiveContainer>
            </div>
            {/* Subject Grade Distribution */}
          <StudentClassificationChart semester={selectedSemester} />
            <div className="flex gap-6">
              {/* Training Score */}
              <div className="bg-white rounded-2xl p-8 shadow-lg shadow-slate-200/50 w-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-50 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Điểm rèn luyện qua các học kỳ
                  </h2>
                </div>
                {/* Defensive: show friendly placeholder when there's no DRL data */}
                {!(
                  currentStudent?.trainingScoreData &&
                  currentStudent.trainingScoreData.length
                ) ? (
                  <div className="p-6 text-center text-slate-500">
                    Không có dữ liệu điểm rèn luyện để hiển thị.
                    <div className="mt-3 text-xs text-slate-400">
                      (Nếu bạn đang dùng API thật, kiểm tra console để xem
                      payload.)
                    </div>
                    <pre className="mt-2 hidden" aria-hidden>
                      {JSON.stringify(
                        currentStudent?.trainingScoreData ?? [],
                        null,
                        2
                      )}
                    </pre>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    {(() => {
                      // Calculate dynamic Y-axis max for DRL chart
                      const drlScores = (
                        currentStudent.trainingScoreData || []
                      ).map((d) => d.score || 0);
                      const maxDrl = Math.max(
                        ...drlScores.filter((v) => Number.isFinite(v))
                      );
                      const dynamicDrlMax =
                        maxDrl < 60 ? 60 : Math.ceil(maxDrl / 10) * 10;

                      return (
                        <LineChart
                          data={currentStudent.trainingScoreData}
                          margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e2e8f0"
                            opacity={0.6}
                          />
                          <XAxis
                            dataKey="semester"
                            stroke="#64748b"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                          />
                          <YAxis
                            domain={[0, dynamicDrlMax]}
                            stroke="#64748b"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#fff",
                              border: "none",
                              borderRadius: "12px",
                              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                              padding: "12px 16px",
                            }}
                            labelStyle={{ fontWeight: "600", fontSize: "13px" }}
                            formatter={(value: number) => [
                              `${Number(value).toFixed(1)} điểm`,
                              "Điểm rèn luyện",
                            ]}
                          />
                          <Legend
                            wrapperStyle={{ paddingTop: "16px" }}
                            iconType="circle"
                          />
                          <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#6366F1"
                            strokeWidth={3}
                            dot={{
                              r: 5,
                              fill: "#6366F1",
                              stroke: "#fff",
                              strokeWidth: 2,
                            }}
                            activeDot={{ r: 7, fill: "#4F46E5" }}
                            name="Điểm rèn luyện"
                          />
                        </LineChart>
                      );
                    })()}
                  </ResponsiveContainer>
                )}
              </div>

              <RateGpaAndPoint />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
