/**
 * Data calculation utilities for student dashboard
 */

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

/**
 * Calculate grade classification based on GPA (4.0 scale)
 */
export const getGradeRank = (gpa: number): string => {
  if (gpa >= 3.6) return "Giỏi";
  if (gpa >= 3.2) return "Khá";
  if (gpa >= 2.5) return "Trung bình";
  return "Yếu";
};

/**
 * Classify score on 10-point scale
 */
export const classifyScore = (score: number): string => {
  if (score >= 8.5) return "Giỏi";
  if (score >= 7.0) return "Khá";
  if (score >= 5.5) return "Trung bình";
  return "Yếu";
};

/**
 * Calculate dynamic Y-axis maximum for charts
 */
export const getDynamicAxisMax = (
  values: number[],
  minClamp: number,
  step: number = 1
): number => {
  if (!values || values.length === 0) return minClamp;

  const maxValue = Math.max(...values.filter((v) => Number.isFinite(v)));

  if (maxValue < minClamp) return minClamp;

  return Math.ceil(maxValue / step) * step;
};

/**
 * Extract numeric value from record, trying multiple key candidates
 */
export const getNumericField = (
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

/**
 * Normalize string key for fuzzy matching (strip diacritics, lowercase)
 */
export const normalizeKeyForMatching = (s: string): string =>
  s
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

/**
 * Extract string value from record, trying multiple key candidates
 */
export const getStringField = (
  obj: Record<string, unknown>,
  candidates: string[]
): string => {
  if (!obj || typeof obj !== "object") return "-";

  const normalizedMap = new Map<string, string>();
  Object.keys(obj || {}).forEach((k) => {
    try {
      normalizedMap.set(normalizeKeyForMatching(k), k);
    } catch {
      normalizedMap.set(k.toLowerCase(), k);
    }
  });

  // Try exact candidate matches first
  for (const c of candidates) {
    const nk = normalizeKeyForMatching(c);
    const orig = normalizedMap.get(nk);
    if (orig) {
      const v = obj[orig];
      if (typeof v === "string") {
        const s = v.trim();
        if (s !== "") return s;
      }
      if (typeof v === "number") return String(v);
    }
  }

  // Fallback: find any key that looks like a course name
  for (const [nk, orig] of normalizedMap.entries()) {
    if (nk.includes("ten") && nk.includes("mon")) {
      const v = obj[orig];
      if (typeof v === "string" && v.trim() !== "") return v.trim();
      if (typeof v === "number") return String(v);
    }
  }

  // Last resort: return first non-empty string or number value
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (typeof v === "string" && v.trim() !== "") return v.trim();
    if (typeof v === "number") return String(v);
  }

  return "-";
};

/**
 * Calculate pass rate statistics from courses
 */
export const calculatePassRateStats = (courses: Course[]) => {
  const totalCredits = courses.reduce(
    (s, c) => s + (Number(c?.credits) || 0),
    0
  );

  const passedCredits = courses.reduce(
    (s, c) =>
      s +
      (Number(c?.credits) || 0) *
        ((typeof c.score === "number" ? c.score : Number(c.score)) >= 5 ? 1 : 0),
    0
  );

  const failedCredits = Math.max(totalCredits - passedCredits, 0);

  return {
    totalCredits,
    passedCredits,
    failedCredits,
    passPercentage: totalCredits
      ? ((passedCredits / totalCredits) * 100).toFixed(1)
      : "0.0",
  };
};

/**
 * Create normalized map from object keys for fuzzy lookup
 */
export const buildNormalizedMap = (obj: Record<string, unknown>) => {
  const map = new Map<string, string>();
  Object.keys(obj || {}).forEach((k) => {
    try {
      map.set(normalizeKeyForMatching(k), k);
    } catch {
      map.set(k.toLowerCase(), k);
    }
  });
  return map;
};
