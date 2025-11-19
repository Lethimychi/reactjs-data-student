import React, { useEffect, useState } from "react";

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
} from "../../utils/student_api";
import { StudentScoreChartHighestLowest } from "../student_chart/score/chart";
import { RateGpaAndPoint } from "../student_chart/rate/chart";

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

type HighestLowest = {
  semester: string;
  highestScore: number;
  highestSubject: string;
  highestCredits: number;
  lowestScore: number;
  lowestSubject: string;
  lowestCredits: number;
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

  // Helper: normalize API response into our `Student` shape with safe defaults
  /* eslint-disable @typescript-eslint/no-explicit-any */
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

    // allow flexible mapping from unknown API shape
    const r: any = raw as any;

    // fuzzy key lookup: normalize keys (lowercase, remove non-alphanum)
    const normalizeKey = (s: string) =>
      s
        .toString()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
    const findValue = (obj: Record<string, any>, candidates: string[]) => {
      if (!obj || typeof obj !== "object") return undefined;
      const map: Record<string, string> = {};
      Object.keys(obj).forEach((k) => (map[normalizeKey(k)] = k));
      for (const c of candidates) {
        const nk = normalizeKey(c);
        if (map[nk]) return obj[map[nk]];
      }
      return undefined;
    };

    const infoSource = r?.info ?? r?.student_info ?? r?.sinh_vien ?? r ?? {};
    const info = {
      id: String(
        findValue(infoSource, ["Ma Sinh Vien", "MaSinhVien", "mssv", "id"]) ??
          infoSource.id ??
          infoSource.mssv ??
          fallback.info.id
      ),
      name: String(
        findValue(infoSource, ["Ten", "Ho Ten", "ten", "ho_ten", "fullname"]) ??
          infoSource.name ??
          fallback.info.name
      ),
      class: String(
        findValue(infoSource, ["Ten Lop", "TenLop", "lop", "class"]) ??
          infoSource.class ??
          infoSource.lop ??
          fallback.info.class
      ),
      area: String(
        findValue(infoSource, [
          "Ten Khu Vuc",
          "TenKhuVuc",
          "khu_vuc",
          "area",
        ]) ??
          infoSource.area ??
          infoSource.khu_vuc ??
          fallback.info.area
      ),
    };

    const toCourseArray = (arr: unknown): Course[] => {
      if (!arr || !Array.isArray(arr)) return [];
      return (arr as any[]).map((it) => ({
        course: (it as any).course ?? (it as any).name ?? "",
        score:
          typeof (it as any).score === "number"
            ? (it as any).score
            : Number((it as any).score) || 0,
        credits:
          typeof (it as any).credits === "number"
            ? (it as any).credits
            : Number((it as any).credits) || 0,
        status:
          (it as any).status ??
          ((it as any).passed ? "Đậu" : (it as any).status) ??
          "Đậu",
      }));
    };

    // detailedScores might come as object with string keys
    const rawDetails =
      r?.detailedScores ??
      r?.detailed_scores ??
      r?.scores ??
      r?.diem ??
      fallback.detailedScores;
    const detailedScores: Record<number, Course[]> = {};
    if (rawDetails && typeof rawDetails === "object") {
      Object.keys(rawDetails).forEach((k) => {
        const num = Number(k);
        const key = Number.isNaN(num) ? 1 : num;
        detailedScores[key] = toCourseArray(rawDetails[k]);
      });
    }

    const gpaData = r?.gpaData ?? r?.gpa_data ?? r?.gpa ?? fallback.gpaData;
    const passRateData =
      r?.passRateData ?? r?.pass_rate ?? r?.passRate ?? fallback.passRateData;
    const trainingScoreData =
      r?.trainingScoreData ??
      r?.training_score ??
      r?.trainingScore ??
      fallback.trainingScoreData;

    const result: Student = {
      id: r?.id ?? fallback.id,
      info,
      overallGPA:
        Number(r?.overallGPA ?? r?.overall_gpa ?? fallback.overallGPA) || 0,
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

    // debug: show mapped object so you can tune mapping
    console.log("[normalizeStudent] ->", result);

    return result;
  };
  /* eslint-enable @typescript-eslint/no-explicit-any */
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
  const correlationData = (currentStudent?.gpaData ?? []).map((g) => {
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

  const highestLowestData = semesters.map(
    (sem: { id: number; name: string; year: string }) => {
      const list = currentStudent?.detailedScores?.[sem.id] ?? [];
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
    }
  );

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
            {loading ? (
              <div className="p-8 text-center text-slate-500">
                Đang tải dữ liệu...
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
                <div className="flex items-center gap-6">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-2xl">
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
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                  Xu hướng GPA theo học kỳ
                </h2>
                {(() => {
                  const chartGpaData =
                    computedGpaData ?? currentStudent.gpaData;
                  return (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartGpaData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="semester" stroke="#64748b" />
                        <YAxis domain={[0, 10]} stroke="#64748b" />
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
                            `${value.toFixed(2)} (${
                              props.payload?.rank ?? ""
                            })`,
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
                  );
                })()}
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
                      <Cell fill="#3b82f6" style={{ cursor: "pointer" }} />
                      <Cell fill="#e2e8f0" style={{ cursor: "pointer" }} />
                    </Pie>
                    <Tooltip
                      formatter={(value: number | string, name: string) => [
                        `${Number(value).toFixed(2)} / 10.0`,
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

              <div className="mb-2 text-sm text-slate-500">
                {coursesLoading
                  ? "Đang tải danh sách học kỳ..."
                  : coursesError
                  ? `Lỗi tải học kỳ: ${coursesError}`
                  : ""}
              </div>

              <select
                className="w-full p-3 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(Number(e.target.value))}
              >
                {semesters.map(
                  (sem: { id: number; name: string; year: string }) => (
                    <option key={sem.id} value={sem.id}>
                      {sem.name}
                    </option>
                  )
                )}
              </select>

              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <h3 className="font-semibold text-slate-700 mb-3">
                  Môn học trong kỳ:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {coursesPerSemester[selectedSemester]
                    ?.filter((c) => c && c !== "-")
                    .map((course: string, idx: number) => (
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

            {/* Detailed Scores Table */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
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
            <div className="flex gap-4">
              {/* Pass Rate */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 w-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Target className="w-6 h-6 text-green-600" />
                    Tỷ lệ Đậu/Rớt theo tín chỉ
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
                        value: "Số tín chỉ",
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
                      dataKey="passedCredits"
                      stackId="a"
                      fill="#10b981"
                      barSize={14}
                      name="Đậu"
                      style={{ cursor: "pointer" }}
                    >
                      {passChartData.map((_, idx) => (
                        <Cell key={idx} fill="#10b981" />
                      ))}
                    </Bar>
                    <Bar
                      dataKey="failedCredits"
                      stackId="a"
                      fill="#ef4444"
                      name="Rớt"
                      barSize={14}
                      style={{ cursor: "pointer" }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <StudentScoreChartHighestLowest />
            </div>
            {/* Comparison with Average */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 w-full">
              <h2 className="text-xl font-bold text-slate-800 mb-33 mt-6 flex items-center gap-2 ">
                So sánh với điểm trung bình lớp
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={filteredComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  {/* Hide course names on X axis (keep tooltips active) */}
                  <XAxis dataKey="course" stroke="#64748b" tick={false} />
                  <YAxis stroke="#64748b" domain={[0, 10]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "2px solid #e2e8f0",
                      borderRadius: "12px",
                    }}
                    formatter={(value: number, name: string) => [
                      `${value.toFixed(1)} / 10.0`,
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
                    name="Điểm trung bình môn học"
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

              <RateGpaAndPoint/>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
