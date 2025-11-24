/**
 * Custom hooks for student dashboard data fetching and state management
 * Consolidates 6 useEffect hooks into organized, reusable hooks
 */

import { useEffect, useState, useCallback } from "react";
import {
  Course,
  createEmptyStudent,
  makeSemesterKey,
  normalizeStudent,
  SemesterGPA,
  Student,
  TrainingScore,
} from "../utils/studentNormalizers";
import getStudentInfo, {
  ClassAverageRecord,
  CourseApiRecord,
  getStudentClassAverageComparison,
  getStudentCoursesBySemester,
  getStudentDetailedCourses,
  getStudentGpaBySemester,
  getStudentOverallGpa,
  getStudentPassRateBySemester,
  getStudentTrainingScores,
  PassRateApiRecord,
} from "../utils/student_api";
import {
  getNumericField,
  getStringField,
  normalizeKeyForMatching,
} from "../utils/dataCalculators";

// ========== TYPE DEFINITIONS ==========

interface SemesterInfo {
  id: number;
  name: string;
  year: string;
}

interface ComparisonData {
  course: string;
  dtb_all: number;
  dtb_sv?: number;
}

interface PassRateMap {
  [semesterId: number]: {
    passed: number;
    total: number;
    pct: number;
  };
}

// ========== CONSTANTS ==========
const EMPTY_STUDENT = createEmptyStudent();

// ========== HOOK 1: FETCH STUDENT INFO ==========
/**
 * Fetches and normalizes student information from API
 * Runs ONCE on component mount (empty dependency array)
 */
export const useStudentInfoFetch = () => {
  const [currentStudent, setCurrentStudent] = useState<Student>(EMPTY_STUDENT);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchStudent = async () => {
      try {
        setLoading(true);
        const data = await getStudentInfo();
        console.log("👉 DATA TỪ API:", data);

        if (!isMounted) return;

        if (!Array.isArray(data)) {
          setCurrentStudent(await normalizeStudent(data));
          return;
        }

        console.log("👉 DỮ LIỆU MẢNG TỪ API:", data);
        setCurrentStudent(await normalizeStudent(data[0]));
      } catch (err) {
        console.error("Lỗi fetch API sinh viên:", err);
        if (isMounted) {
          setApiError("Không thể tải thông tin sinh viên.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchStudent();

    return () => {
      isMounted = false;
    };
  }, []);

  return { currentStudent, loading, apiError, setCurrentStudent };
};

// ========== HOOK 2: FETCH GPA TRENDS ==========
/**
 * Fetches GPA trends per semester and overall GPA
 */
export const useGpaTrendFetch = () => {
  const [computedGpaData, setComputedGpaData] = useState<SemesterGPA[] | null>(
    null
  );
  const [apiOverallRank, setApiOverallRank] = useState<string | null>(null);
  const [overallGpa, setOverallGpa] = useState<number>(0);

  useEffect(() => {
    let mounted = true;

    const loadGpaTrend = async () => {
      try {
        const data = await getStudentGpaBySemester();

        // Fetch overall GPA separately
        try {
          const overall = await getStudentOverallGpa();
          if (overall && mounted) {
            const keys = Object.keys(overall);
            const gpaKey = keys.find((k) => k.toLowerCase().includes("gpa"));
            if (gpaKey) {
              const raw = overall[gpaKey];
              const num = typeof raw === "number" ? raw : Number(raw);
              if (!Number.isNaN(num)) {
                setOverallGpa(Number(num));
              }
            }
            const rankKey = keys.find((k) => k.toLowerCase().includes("loai"));
            if (rankKey) {
              const rv = overall[rankKey];
              setApiOverallRank(typeof rv === "string" ? rv : null);
            }
          }
        } catch (e) {
          console.warn("Could not fetch overall GPA:", e);
        }

        if (!mounted) return;
        if (!data || !Array.isArray(data) || data.length === 0) return;

        // Extract overall GPA from semester data
        try {
          for (const rec of data as Record<string, unknown>[]) {
            const keys = Object.keys(rec || {});
            const gpaKey = keys.find((k) => k.toLowerCase().includes("gpa"));
            if (!gpaKey) continue;

            const rawVal = rec[gpaKey];
            const num = typeof rawVal === "number" ? rawVal : Number(rawVal);
            if (Number.isNaN(num)) continue;

            const lk = gpaKey.toLowerCase();
            const isWholeProgram =
              lk.includes("toan") ||
              lk.includes("toankhoa") ||
              lk.includes("toàn") ||
              (keys.length === 1 && !!num);

            if (isWholeProgram) {
              const rankKey =
                keys.find(
                  (k) =>
                    k.toLowerCase().includes("loai") &&
                    k.toLowerCase().includes("toan")
                ) || keys.find((k) => k.toLowerCase().includes("loai"));

              const rankVal = rankKey ? (rec[rankKey] as string) : null;
              setOverallGpa(Number(num));
              setApiOverallRank(typeof rankVal === "string" ? rankVal : null);
              break;
            }
          }
        } catch (e) {
          console.warn("Could not extract overall GPA:", e);
        }

        // Map per-semester GPA
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
            const gpa = typeof raw === "number" ? raw : Number(raw ?? 0) || 0;
            const apiRank =
              (r["Loai_Hoc_Luc"] as string) ??
              (r["Loai_HocLuc"] as string) ??
              "";

            return {
              semester: `${hk || ""} ${year || ""}`.trim(),
              year: year || "",
              gpa,
              rank: apiRank || "",
            };
          })
          .sort((a, b) => {
            const ay = Number(String(a.year).split("-")[0] ?? 0);
            const by = Number(String(b.year).split("-")[0] ?? 0);
            if (ay !== by) return ay - by;
            const an = Number(String(a.semester).replaceAll(/\D/g, "") || 0);
            const bn = Number(String(b.semester).replaceAll(/\D/g, "") || 0);
            return an - bn;
          });

        setComputedGpaData(mapped);
      } catch (err) {
        console.error("Error loading GPA trend:", err);
      }
    };

    loadGpaTrend();
    return () => {
      mounted = false;
    };
  }, []);

  return { computedGpaData, apiOverallRank, overallGpa, setOverallGpa };
};

// ========== HOOK 3: FETCH COURSES & SEMESTERS ==========
/**
 * Fetches detailed courses and builds semester list
 */
export const useCoursesFetch = () => {
  const [apiSemesters, setApiSemesters] = useState<SemesterInfo[]>([]);
  const [apiCoursesPerSemester, setApiCoursesPerSemester] = useState<
    Record<number, string[]>
  >({});
  const [apiCoursesDetailed, setApiCoursesDetailed] = useState<
    Record<number, Course[]>
  >({});
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadCourses = async () => {
      try {
        setCoursesLoading(true);

        const detailed = await getStudentDetailedCourses().catch((e) => {
          console.warn("Detailed courses API failed:", e);
          return null;
        });

        if (!mounted) return;

        let arr: {
          year: string;
          hk: string;
          records: Record<string, unknown>[];
        }[] = [];

        if (detailed && Array.isArray(detailed) && detailed.length) {
          const map = new Map<
            string,
            {
              year: string;
              hk: string;
              records: Record<string, unknown>[];
            }
          >();

          for (const rec of detailed) {
            const year = String(rec["Ten Nam Hoc"] ?? "-");
            const hk = String(rec["Ten Hoc Ky"] ?? "-");
            const key = `${year}||${hk}`;
            if (!map.has(key)) map.set(key, { year, hk, records: [] });
            map.get(key)!.records.push(rec);
          }

          arr = Array.from(map.values());
        } else {
          const data = await getStudentCoursesBySemester();
          if (!mounted) return;
          if (!data || !Array.isArray(data)) {
            setApiSemesters([]);
            setApiCoursesPerSemester({});
            return;
          }

          const map = new Map<
            string,
            { year: string; hk: string; records: CourseApiRecord[] }
          >();

          for (const rec of data) {
            const year = (rec["Ten Nam Hoc"] as string) ?? "-";
            const hk = (rec["Ten Hoc Ky"] as string) ?? "-";
            const key = `${year}||${hk}`;
            if (!map.has(key)) map.set(key, { year, hk, records: [] });
            map.get(key)!.records.push(rec);
          }

          arr = Array.from(map.values());
        }

        arr = arr.sort((a, b) => {
          const ay = Number(String(a.year).split("-")[0] ?? 0);
          const by = Number(String(b.year).split("-")[0] ?? 0);
          if (ay !== by) return ay - by;
          const an = Number(String(a.hk).replaceAll(/\D/g, "") || 0);
          const bn = Number(String(b.hk).replaceAll(/\D/g, "") || 0);
          return an - bn;
        });

        const sems = arr.map((g, idx) => ({
          id: idx + 1,
          name: `${g.hk} ${g.year}`,
          year: g.year,
        }));

        const coursesMap: Record<number, string[]> = {};
        const coursesDetailedMap: Record<number, Course[]> = {};

        const scoreKeys = [
          "Diem Trung Binh",
          "DiemTrungBinh",
          "diem_trung_binh",
          "DiemTB",
          "Diem",
        ];
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

        for (let idx = 0; idx < arr.length; idx++) {
          const g = arr[idx];
          const detailed: Course[] = g.records.map((r) => {
            const rec = r as Record<string, unknown>;
            const mid = getNumericField(rec, midKeys);
            const final = getNumericField(rec, finalKeys);

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
                : courseCode;

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
        }

        setApiSemesters(sems);
        setApiCoursesPerSemester(coursesMap);
        setApiCoursesDetailed(coursesDetailedMap);
      } catch (err) {
        console.error("Error loading courses:", err);
        if (mounted) {
          setCoursesError((err as Error)?.message ?? String(err));
        }
      } finally {
        if (mounted) {
          setCoursesLoading(false);
        }
      }
    };

    loadCourses();
    return () => {
      mounted = false;
    };
  }, []);

  return {
    apiSemesters,
    apiCoursesPerSemester,
    apiCoursesDetailed,
    coursesLoading,
    coursesError,
  };
};

// ========== HOOK 4: FETCH PASS RATES ==========
/**
 * Fetches pass rate data per semester
 */
export const usePassRateFetch = (apiSemesters: SemesterInfo[]) => {
  const [apiPassRateMap, setApiPassRateMap] = useState<PassRateMap>({});

  useEffect(() => {
    if (!apiSemesters || apiSemesters.length === 0) return;

    let mounted = true;

    const loadPassRate = async () => {
      try {
        const data = await getStudentPassRateBySemester().catch((e) => {
          console.warn("Pass-rate API failed:", e);
          return null;
        });

        if (!mounted) return;
        if (!data || !Array.isArray(data)) {
          setApiPassRateMap({});
          return;
        }

        const map: PassRateMap = {};

        for (const rec of data as PassRateApiRecord[]) {
          const year = String(
            rec["Ten Nam Hoc"] ?? rec["TenNamHoc"] ?? ""
          ).trim();
          const hk = String(rec["Ten Hoc Ky"] ?? rec["TenHocKy"] ?? "").trim();

          const sem = apiSemesters.find(
            (s) => s.year === year && s.name.includes(hk)
          );
          if (!sem) continue;

          const soDau = getNumericField(rec as Record<string, unknown>, [
            "So_Mon_Dau",
            "SoMonDau",
            "so_mon_dau",
            "so_dau",
          ]);

          const tong = getNumericField(rec as Record<string, unknown>, [
            "Tong_Mon",
            "TongMon",
            "tong_mon",
          ]);

          const rawRatio = getNumericField(rec as Record<string, unknown>, [
            "Ty_Le_Qua_Mon",
            "TyLeQuaMon",
            "ty_le_qua_mon",
          ]);

          let pct = 0;
          if (typeof rawRatio === "number") {
            pct = rawRatio <= 1 ? rawRatio * 100 : rawRatio;
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
        console.error("Error loading pass rates:", e);
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

  return { apiPassRateMap };
};

// ========== HOOK 5: FETCH TRAINING SCORES ==========
/**
 * Fetches training/conduct scores (DRL)
 */
export const useTrainingScoresFetch = () => {
  const [trainingScoreData, setTrainingScoreData] = useState<TrainingScore[]>(
    []
  );

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
          return;
        }

        const mapped: TrainingScore[] = (data as unknown[]).map((r) => {
          const row = r as Record<string, unknown>;
          const year =
            (row["Ten Nam Hoc"] as string) ?? String(row["NamHoc"] ?? "");
          const hk =
            (row["Ten Hoc Ky"] as string) ?? String(row["HocKy"] ?? "");
          const raw = row["DRL"] ?? row["drl"];

          const score =
            typeof raw === "number"
              ? raw
              : Number(String(raw ?? "").replaceAll(/[^0-9.-]/g, "")) || 0;

          return {
            semester: makeSemesterKey(hk, year),
            score,
          };
        });

        setTrainingScoreData(mapped);
      } catch (e) {
        console.warn("Error loading training scores:", e);
      }
    };

    loadTraining();
    return () => {
      mounted = false;
    };
  }, []);

  return { trainingScoreData };
};

// ========== HOOK 6: FETCH COMPARISON DATA ==========
/**
 * Fetches class average comparison data
 */
export const useComparisonFetch = (
  apiSemesters: SemesterInfo[],
  selectedSemester: number,
  apiCoursesPerSemester: Record<number, string[]>,
  apiCoursesDetailed: Record<number, Course[]>,
  currentStudent: Student
) => {
  const [comparisonApiData, setComparisonApiData] = useState<ComparisonData[]>(
    []
  );

  useEffect(() => {
    let mounted = true;

    const loadComparison = async () => {
      try {
        if (!apiSemesters || apiSemesters.length === 0) return;

        const sem = apiSemesters.find((s) => s.id === selectedSemester);
        if (!sem) return;

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

        const rawSemesterCourses: string[] =
          apiCoursesPerSemester[selectedSemester] ??
          (apiCoursesDetailed[selectedSemester]
            ? apiCoursesDetailed[selectedSemester].map((s) => s.course || "")
            : currentStudent?.detailedScores?.[selectedSemester]?.map(
                (s) => s.course || ""
              ) ?? []);

        const semesterCourses = rawSemesterCourses.map((c) =>
          normalizeKeyForMatching(String(c || ""))
        );

        const normalized = (data as ClassAverageRecord[])
          .map((rec) => {
            const recYear =
              (rec["Ten Nam Hoc"] as string) ??
              (rec["NamHoc"] as string) ??
              null;
            const recHk =
              (rec["Ten Hoc Ky"] as string) ?? (rec["HocKy"] as string) ?? null;

            if (recYear && recHk) {
              const rYear = String(recYear).trim();
              const rHk = String(recHk).trim();
              const semYear = String(sem.year).trim();
              const semHk = String(sem.name.split(" ")[0] ?? "").trim();
              if (rYear !== semYear || rHk !== semHk) return null;
            }

            if (!recYear || !recHk) {
              const tmpCourse =
                (rec["Ten Mon Hoc"] as string) ||
                (rec["TenMonHoc"] as string) ||
                (rec["Ten"] as string) ||
                (rec["name"] as string) ||
                "";
              const normCourse = normalizeKeyForMatching(
                String(tmpCourse || "")
              );
              const hasMatch = semesterCourses.some((c) => {
                if (!c || !normCourse) return false;
                return c === normCourse;
              });
              if (!hasMatch) return null;
            }

            let courseRaw =
              (rec["Ten Mon Hoc"] as string) ||
              (rec["TenMonHoc"] as string) ||
              (rec["Ten"] as string) ||
              (rec["name"] as string) ||
              "";

            if (!courseRaw || courseRaw.trim() === "") {
              for (const k of Object.keys(rec)) {
                const v = rec[k];
                if (
                  typeof v === "string" &&
                  !String(k).toLowerCase().includes("ten") &&
                  !String(k).toLowerCase().includes("dtb") &&
                  !String(k).toLowerCase().includes("nam") &&
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
                : Number(String(dtbAllRaw ?? "").replaceAll(/[^0-9.-]/g, "")) ||
                  0;
            const dtb_sv =
              typeof dtbSvRaw === "number"
                ? dtbSvRaw
                : dtbSvRaw
                ? Number(String(dtbSvRaw).replaceAll(/[^0-9.-]/g, ""))
                : undefined;

            return { course: String(courseRaw ?? ""), dtb_all, dtb_sv };
          })
          .filter(Boolean) as ComparisonData[];

        setComparisonApiData(normalized);
      } catch (e) {
        console.warn("Error loading comparison:", e);
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

  return { comparisonApiData };
};
