/**
 * Student data normalization and transformation utilities
 */

import { normalizeKeyForMatching } from "./dataCalculators";
import { getStudentOverallGpa } from "./student_api";

export type Course = {
  course: string;
  score: number;
  credits: number;
  status: string;
  midScore?: number;
  finalScore?: number;
};

export type SemesterGPA = {
  semester: string;
  year: string;
  gpa: number;
  rank: string;
};

export type PassRate = {
  semester: string;
  passed: number;
  failed: number;
  total: number;
};

export type TrainingScore = {
  semester: string;
  score: number;
};

export type StudentInfo = {
  id: string;
  name: string;
  class: string;
  area: string;
};

export type Student = {
  id: number;
  info: StudentInfo;
  overallGPA: number;
  gpaData: SemesterGPA[];
  passRateData: PassRate[];
  detailedScores: Record<number, Course[]>;
  trainingScoreData: TrainingScore[];
};

/**
 * Get user display name from localStorage
 */
export const getUserNameFromLocal = (): string | null => {
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

/**
 * Parse course array from API response
 */
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

/**
 * Normalize raw student data from API into Student type
 */
export const normalizeStudent = async (raw: unknown): Promise<Student> => {
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

  const findValue = (
    obj: Record<string, unknown> | undefined,
    candidates: string[]
  ) => {
    if (!obj || typeof obj !== "object") return undefined;
    const map: Record<string, string> = {};
    Object.keys(obj).forEach((k) => (map[normalizeKeyForMatching(k)] = k));
    for (const c of candidates) {
      const nk = normalizeKeyForMatching(c);
      if (map[nk]) return obj[map[nk]];
    }
    return undefined;
  };

  const infoSource =
    (r["info"] as Record<string, unknown>) ??
    (r["student_info"] as Record<string, unknown>) ??
    (r["sinh_vien"] as Record<string, unknown>) ??
    (r as Record<string, unknown>);

  const info: StudentInfo = {
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
      findValue(infoSource, ["Ten Khu Vuc", "TenKhuVuc", "khu_vuc", "area"]) ??
        (infoSource && (infoSource.area ?? infoSource.khu_vuc)) ??
        fallback.info.area
    ),
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

  console.log("GPA DATA: ", gpaData);

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

  const gpA = await getStudentOverallGpa();
  console.log("Overall GPA fetched:", gpA);
  const result: Student = {
    id: Number.isNaN(parsedId) ? fallback.id : parsedId,
    info,
    overallGPA: Number(gpA?.GPA_ToanKhoa ?? 0),
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

/**
 * Create empty fallback student object
 */
export const createEmptyStudent = (): Student => ({
  id: 0,
  info: { id: "", name: "", class: "", area: "" },
  overallGPA: 0,
  gpaData: [],
  passRateData: [],
  detailedScores: {},
  trainingScoreData: [],
});

/**
 * Normalize semester key format: "HKX YY-ZZ" -> "HK1 24-25"
 */
export const makeSemesterKey = (
  hk: string | undefined,
  year: string | undefined
): string => {
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
