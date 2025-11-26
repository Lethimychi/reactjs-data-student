import { API_BASE_URL, getAuth } from "./share";

export interface Semester {
  id: number;
  name: string;
}

export interface ClassItem {
  id: number;
  name: string;
  semesterId: number;
}

interface AdvisorRecord {
  "Ten Nam Hoc"?: string;
  "Ten Hoc Ky"?: string;
  "Ten Lop"?: string;
  "Fact Hoc Tap Count"?: number | string;
  [key: string]: unknown;
}

// Common fetch function for all API calls
async function fetchWithAuth<T>(endpoint: string): Promise<T> {
  if (!API_BASE_URL) throw new Error("API_BASE_URL is not defined");

  const auth = getAuth();
  if (!auth.token) throw new Error("Thiếu token xác thực");

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `${auth.tokenType ?? "Bearer"} ${auth.token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "69420",
    },
  });

  if (!res.ok) {
    throw new Error(
      (await res.text()) || `Request failed with status ${res.status}`
    );
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const text = await res.text();
    throw new Error(
      `Unexpected response type: ${contentType}. Payload: ${text.slice(0, 300)}`
    );
  }

  return res.json();
}

const ADVISOR_ENDPOINT = "/api/giangvien/Giang-Vien-Co-Van-Lop-Hoc-Theo-Ky";

const semesterKeyById = new Map<number, string>();
const semesterIdByKey = new Map<string, number>();
let cachedRecords: AdvisorRecord[] | null = null;
// Roster cache per class (normalized class name -> set of student names)
const rosterByClass = new Map<string, Set<string>>();
// Cache for GPA/DRL endpoint to avoid repeated network requests
let cachedGpaConductPayload: unknown | null = null;
let gpaConductFetchPromise: Promise<unknown> | null = null;

const normalizeTerm = (raw: string): string => {
  const t = raw.trim();
  // Accept HK_3, HK3, hk 3 -> HK3
  let m = /^HK[_\s]?(\d+)$/i.exec(t);
  if (m) return `HK${m[1]}`;
  // Accept "Học kỳ 3" / "Hoc ky 3" -> HK3
  m = /^(Học kỳ|Hoc ky)\s*(\d+)$/i.exec(t);
  if (m) return `HK${m[2]}`;
  return t.replace(/HK_(\d+)/i, (_, d) => `HK${d}`); // final cleanup if pattern inside
};

const buildSemesterKey = (record: AdvisorRecord): string | null => {
  const year = (record["Ten Nam Hoc"] as string)?.trim() || "";
  const termRaw =
    (record["Ten Hoc Ky"] as string)?.trim() ||
    (record["Ma Hoc Ky"] as string)?.trim() ||
    "";
  const term = termRaw ? normalizeTerm(termRaw) : "";
  return year || term ? `${year}|${term}` : null;
};

const parseNumericId = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const fetchAdvisorRecords = async (): Promise<AdvisorRecord[]> => {
  if (cachedRecords) return cachedRecords;

  try {
    const data = await fetchWithAuth<AdvisorRecord[] | AdvisorRecord>(
      ADVISOR_ENDPOINT
    );
    cachedRecords = Array.isArray(data) ? data : [];
    return cachedRecords;
  } catch (error) {
    cachedRecords = null;
    console.error("Không thể tải dữ liệu giảng viên cố vấn", error);
    throw error instanceof Error
      ? error
      : new Error("Không thể tải dữ liệu giảng viên cố vấn.");
  }
};

// Return all distinct classes irrespective of semester
export async function fetchAllClasses(): Promise<ClassItem[]> {
  const records = await fetchAdvisorRecords();
  const classMap = new Map<string, ClassItem>();
  let nextId = 1;
  records.forEach((r) => {
    const raw = (r["Ten Lop"] as string)?.trim();
    if (!raw) return;
    const key = raw.toLowerCase();
    if (classMap.has(key)) return;
    classMap.set(key, { id: nextId++, name: raw, semesterId: 0 });
  });
  return Array.from(classMap.values());
}

export async function fetchSemesters(): Promise<Semester[]> {
  const records = await fetchAdvisorRecords();

  const semesters: Semester[] = [];
  const seenKeys = new Set<string>();

  records.forEach((record) => {
    const key = buildSemesterKey(record);
    if (!key || seenKeys.has(key)) {
      return;
    }

    seenKeys.add(key);
    let id = semesterIdByKey.get(key);

    if (id === undefined) {
      id = semesterIdByKey.size + 1;
      semesterIdByKey.set(key, id);
      semesterKeyById.set(id, key);
    }

    const [year, term] = key.split("|");
    const displayName = [term, year].filter(Boolean).join(" - ") || `HK${id}`;

    semesters.push({
      id,
      name: displayName,
    });
  });

  return semesters;
}

export async function fetchClassesBySemester(
  semesterId: number
): Promise<ClassItem[]> {
  const key = semesterKeyById.get(semesterId);
  if (!key) return [];

  const [targetYear, targetTerm] = key.split("|");
  const records = await fetchAdvisorRecords();
  const classMap = new Map<string, ClassItem>();
  const usedIds = new Set<number>();

  records.forEach((record) => {
    const year = (record["Ten Nam Hoc"] as string)?.trim() || "";
    const term = (record["Ten Hoc Ky"] as string)?.trim() || "";

    if (year !== targetYear || term !== targetTerm) return;

    const rawName = (record["Ten Lop"] as string)?.trim() || "";
    const name = rawName || `Lớp ${classMap.size + 1}`;
    const normalizedName = name.toLowerCase();

    if (classMap.has(normalizedName)) return;

    let id = parseNumericId(record["Fact Hoc Tap Count"]);
    if (id === null || usedIds.has(id)) {
      id = semesterId * 1000 + usedIds.size + 1;
      while (usedIds.has(id)) id++;
    }

    usedIds.add(id);
    classMap.set(normalizedName, { id, name, semesterId });
  });

  return Array.from(classMap.values());
}

// Student count: endpoint has structure [{"Ten Lop": "...", other numeric fields}]
const STUDENT_COUNT_ENDPOINT = "/api/giangvien/Tong-So-Sinh-Vien-Theo-Lop";
export async function fetchStudentCount(
  className?: string
): Promise<number | null> {
  try {
    const data = await fetchWithAuth<unknown>(STUDENT_COUNT_ENDPOINT);
    const records: Array<Record<string, unknown>> = Array.isArray(data)
      ? (data as Array<Record<string, unknown>>)
      : [];
    if (records.length === 0) return null;
    // Normalize className to space version
    const target = className?.trim().toLowerCase();
    const findRecord = target
      ? records.find(
          (r) => (r["Ten Lop"] as string)?.trim().toLowerCase() === target
        )
      : records[0];
    if (!findRecord) return null;
    // Extract first numeric value excluding the class name field
    let count: number | null = null;
    Object.keys(findRecord).forEach((k) => {
      if (k === "Ten Lop") return;
      const v = findRecord[k];
      const num = parseNumericId(v);
      if (num !== null && count === null) count = num;
    });
    return count;
  } catch (e) {
    console.error("Không thể tải số lượng sinh viên", e);
    return null;
  }
}

// Male / Female counts per class
const STUDENT_GENDER_ENDPOINT =
  "/api/giangvien/So-Luong-Sinh-Vien-Nam-Nu-Theo-Lop";

export async function fetchGenderCountByClass(
  className?: string,
  fallbackClass: string = "14DHBM02"
): Promise<{ male: number; female: number } | null> {
  try {
    const data = await fetchWithAuth<unknown>(STUDENT_GENDER_ENDPOINT);
    const records: Array<Record<string, unknown>> = Array.isArray(data)
      ? (data as Array<Record<string, unknown>>)
      : [];

    const target = (className || fallbackClass).trim().toLowerCase();
    const match = records.find(
      (r) =>
        String(r["Ten Lop"] ?? "")
          .trim()
          .toLowerCase() === target
    );

    if (!match) return { male: 0, female: 0 };

    const maleRaw =
      match["SoNam"] ?? match["SoNam"] ?? match["So Nam"] ?? match["So_Nam"];
    const femaleRaw =
      match["SoNu"] ?? match["SoNu"] ?? match["So Nu"] ?? match["So_Nu"];

    const male = parseNumericId(maleRaw) ?? 0;
    const female = parseNumericId(femaleRaw) ?? 0;
    return { male, female };
  } catch (e) {
    console.error("Không thể tải số lượng nam/nữ theo lớp", e);
    return null;
  }
}

// Pass rate & debt count (tỷ lệ đậu / số rớt) theo lớp / học kỳ / năm học
interface ClassPerformance {
  passRate: number | null; // Ty_Le_Dau (0..1)
  debtCount: number | null; // So_Rot
}

const CLASS_PERFORMANCE_ENDPOINT =
  "/api/giangvien/Ty-Le-Phan-Tram-Qua-Rot-Mon-Theo-Lop-Hoc-Ky-Nam-Hoc";

export async function fetchClassPerformance(
  className?: string,
  semesterDisplayName?: string
): Promise<ClassPerformance> {
  try {
    const data = await fetchWithAuth<unknown>(CLASS_PERFORMANCE_ENDPOINT);
    const records: Array<Record<string, unknown>> = Array.isArray(data)
      ? (data as Array<Record<string, unknown>>)
      : [];
    if (!className) return { passRate: null, debtCount: null };

    // Normalize class name
    const target = className.trim().toLowerCase();

    // If semesterDisplayName provided like "HK_3 - 2023-2024" try to extract year/term parts for filtering
    let yearFilter: string | null = null;
    let termFilter: string | null = null;
    if (semesterDisplayName) {
      const parts = semesterDisplayName.split(" - ");
      if (parts.length === 2) {
        termFilter = normalizeTerm(parts[0].trim());
        yearFilter = parts[1].trim();
      } else {
        termFilter = normalizeTerm(semesterDisplayName.trim());
      }
    }

    // Find matching record; prefer one matching both class and semester filters if available
    let match: Record<string, unknown> | undefined = records.find((r) => {
      const lop = (r["Ten Lop"] as string | undefined)?.trim().toLowerCase();
      if (!lop || lop !== target) return false;
      if (yearFilter) {
        const year = (r["Ten Nam Hoc"] as string | undefined)?.trim();
        if (year !== yearFilter) return false;
      }
      if (termFilter) {
        const termMa = (r["Ma Hoc Ky"] as string | undefined)?.trim();
        const termTen = (r["Ten Hoc Ky"] as string | undefined)?.trim();
        const normalizedMa = termMa ? normalizeTerm(termMa) : null;
        const normalizedTen = termTen ? normalizeTerm(termTen) : null;
        if (normalizedMa !== termFilter && normalizedTen !== termFilter)
          return false;
      }
      return true;
    });

    // If no strict match and filters were provided, fallback to first record for class
    if (!match) {
      match = records.find(
        (r) =>
          (r["Ten Lop"] as string | undefined)?.trim().toLowerCase() === target
      );
    }

    if (!match) return { passRate: null, debtCount: null };

    const passRaw = match["Ty_Le_Dau"]; // value between 0..1
    const debtRaw = match["So_Rot"]; // integer count
    const passRate =
      typeof passRaw === "number" ? passRaw : parseNumericId(passRaw);
    const debtCount =
      typeof debtRaw === "number" ? debtRaw : parseNumericId(debtRaw) ?? null;
    return {
      passRate: passRate === null ? null : passRate,
      debtCount,
    };
  } catch (e) {
    console.error("Không thể tải tỷ lệ qua/rớt", e);
    return { passRate: null, debtCount: null };
  }
}

// GPA trung bình theo lớp / học kỳ / năm học
const CLASS_GPA_ENDPOINT =
  "/api/giangvien/GPA-Trung-Binh-Theo-Lop-Hoc-Ky-Nam-Hoc";

export async function fetchClassAverageGPA(
  className?: string,
  semesterDisplayName?: string
): Promise<number | null> {
  try {
    const data = await fetchWithAuth<unknown>(CLASS_GPA_ENDPOINT);
    const records: Array<Record<string, unknown>> = Array.isArray(data)
      ? (data as Array<Record<string, unknown>>)
      : [];
    if (!className) return null;

    const target = className.trim().toLowerCase();

    let yearFilter: string | null = null;
    let termFilter: string | null = null;
    if (semesterDisplayName) {
      const parts = semesterDisplayName.split(" - ");
      if (parts.length === 2) {
        termFilter = parts[0].trim();
        yearFilter = parts[1].trim();
      } else {
        // fallback: maybe "Học kỳ X" only
        termFilter = semesterDisplayName.trim();
      }
    }

    let match: Record<string, unknown> | undefined = records.find((r) => {
      const lop = (r["Ten Lop"] as string | undefined)?.trim().toLowerCase();
      if (!lop || lop !== target) return false;
      if (yearFilter) {
        const year = (r["Ten Nam Hoc"] as string | undefined)?.trim();
        if (year !== yearFilter) return false;
      }
      if (termFilter) {
        const termMa = (r["Ma Hoc Ky"] as string | undefined)?.trim();
        const termTen = (r["Ten Hoc Ky"] as string | undefined)?.trim();
        const normalizedMa = termMa ? normalizeTerm(termMa) : null;
        const normalizedTen = termTen ? normalizeTerm(termTen) : null;
        if (normalizedMa !== termFilter && normalizedTen !== termFilter)
          return false;
      }
      return true;
    });

    if (!match) {
      match = records.find(
        (r) =>
          (r["Ten Lop"] as string | undefined)?.trim().toLowerCase() === target
      );
    }

    if (!match) return null;
    const raw = match["GPA"];
    if (typeof raw === "number") return raw;
    const parsed = parseNumericId(raw);
    return parsed === null ? null : parsed;
  } catch (e) {
    console.error("Không thể tải GPA trung bình lớp", e);
    return null;
  }
}

// Phân bố học lực theo lớp / học kỳ (xuất sắc, giỏi, khá, trung bình, yếu)
const GRADE_DISTRIBUTION_ENDPOINT =
  "/api/giangvien/Ty-Le-Phan-Tram-Hoc-Luc-Theo-Lop-Hoc-Ky";

export async function fetchGradeDistribution(
  className?: string,
  semesterDisplayName?: string,
  // when true, require matching semester/year and DO NOT fallback to other semesters
  requireSemesterMatch: boolean = false,
  fallbackSemester: string = "HK2 - 2024-2025",
  fallbackClass: string = "14DHBM02"
): Promise<{
  xuatSac: number;
  gioi: number;
  kha: number;
  trungBinh: number;
  yeu: number;
} | null> {
  try {
    const data = await fetchWithAuth<unknown>(GRADE_DISTRIBUTION_ENDPOINT);
    const records: Array<Record<string, unknown>> = Array.isArray(data)
      ? (data as Array<Record<string, unknown>>)
      : [];

    const effectiveClass = (className || fallbackClass).trim().toLowerCase();
    const effectiveSemester = semesterDisplayName || fallbackSemester;

    let yearFilter: string | null = null;
    let termFilter: string | null = null;
    if (effectiveSemester) {
      const parts = effectiveSemester.split(" - ");
      if (parts.length === 2) {
        termFilter = normalizeTerm(parts[0].trim());
        yearFilter = parts[1].trim();
      } else {
        termFilter = normalizeTerm(effectiveSemester.trim());
      }
    }

    // Find a matching record for the class (and semester/year if provided)
    let match = records.find((r) => {
      const lop = (r["Ten Lop"] as string | undefined)?.trim().toLowerCase();
      if (!lop || lop !== effectiveClass) return false;
      if (yearFilter) {
        const year = (r["Ten Nam Hoc"] as string | undefined)?.trim();
        if (year !== yearFilter) return false;
      }
      if (termFilter) {
        const termMa = (r["Ma Hoc Ky"] as string | undefined)?.trim();
        const termTen = (r["Ten Hoc Ky"] as string | undefined)?.trim();
        const normalizedMa = termMa ? normalizeTerm(termMa) : null;
        const normalizedTen = termTen ? normalizeTerm(termTen) : null;
        if (normalizedMa !== termFilter && normalizedTen !== termFilter)
          return false;
      }
      return true;
    });

    if (!match && !requireSemesterMatch) {
      match = records.find(
        (r) =>
          (r["Ten Lop"] as string | undefined)?.trim().toLowerCase() ===
          effectiveClass
      );
    }

    if (!match) return null;

    const getNum = (k: string) => {
      const v = match![k];
      const n = typeof v === "number" ? v : parseNumericId(v);
      return n === null ? 0 : n;
    };

    // Some APIs return fractions (0..1); keep caller expectations (percentage)
    const xuatSac = getNum("TL_XuatSac") * 100;
    const gioi = getNum("TL_Gioi") * 100;
    const kha = getNum("TL_Kha") * 100;
    const trungBinh = getNum("TL_TB") * 100;
    const yeu = getNum("TL_Yeu") * 100;

    return { xuatSac, gioi, kha, trungBinh, yeu };
  } catch (e) {
    console.error("Không thể tải phân bố học lực", e);
    return null;
  }
}

// Tỷ lệ qua môn theo từng môn cho lớp / học kỳ
const PASS_RATE_BY_SUBJECT_ENDPOINT =
  "/api/giangvien/Ty-Le-qua-mon-theo-lop-hoc-hoc-ky";

export interface SubjectPassRate {
  tenNamHoc?: string;
  tenHocKy?: string;
  tenLop?: string;
  tenMonHoc?: string;
  tongSVMon?: number;
  svQuaMon?: number;
  tiLeQuaMon?: number; // fraction 0..1
}

export async function fetchPassRateBySubject(
  className?: string,
  semesterDisplayName?: string,
  fallbackSemester: string = "HK2 - 2024-2025",
  fallbackClass: string = "14DHBM02"
): Promise<SubjectPassRate[]> {
  try {
    const data = await fetchWithAuth<unknown>(PASS_RATE_BY_SUBJECT_ENDPOINT);
    const records: Array<Record<string, unknown>> = Array.isArray(data)
      ? (data as Array<Record<string, unknown>>)
      : [];

    const effectiveClass = (className || fallbackClass).trim().toLowerCase();
    const effectiveSemester = semesterDisplayName || fallbackSemester;

    let yearFilter: string | null = null;
    let termFilter: string | null = null;
    if (effectiveSemester) {
      const parts = effectiveSemester.split(" - ");
      if (parts.length === 2) {
        termFilter = normalizeTerm(parts[0].trim());
        yearFilter = parts[1].trim();
      } else {
        termFilter = normalizeTerm(effectiveSemester.trim());
      }
    }

    const results: SubjectPassRate[] = [];
    records.forEach((r) => {
      const lop = (r["Ten Lop"] as string | undefined)?.trim().toLowerCase();
      if (!lop || lop !== effectiveClass) return;
      if (yearFilter) {
        const year = (r["Ten Nam Hoc"] as string | undefined)?.trim();
        if (year !== yearFilter) return;
      }
      if (termFilter) {
        const termMa = (r["Ma Hoc Ky"] as string | undefined)?.trim();
        const termTen = (r["Ten Hoc Ky"] as string | undefined)?.trim();
        const normalizedMa = termMa ? normalizeTerm(termMa) : null;
        const normalizedTen = termTen ? normalizeTerm(termTen) : null;
        if (normalizedMa !== termFilter && normalizedTen !== termFilter) return;
      }

      const tenMon = (r["Ten Mon Hoc"] as string | undefined)?.trim() || "";
      const tong =
        typeof r["Tong_SV_Mon"] === "number"
          ? (r["Tong_SV_Mon"] as number)
          : parseNumericId(r["Tong_SV_Mon"]) ?? 0;
      const qua =
        typeof r["SV_QuaMon"] === "number"
          ? (r["SV_QuaMon"] as number)
          : parseNumericId(r["SV_QuaMon"]) ?? 0;
      const tile =
        typeof r["TiLe_QuaMon"] === "number"
          ? (r["TiLe_QuaMon"] as number)
          : parseNumericId(r["TiLe_QuaMon"]) ?? (tong ? qua / tong : 0);

      results.push({
        tenNamHoc: (r["Ten Nam Hoc"] as string | undefined) || undefined,
        tenHocKy: (r["Ten Hoc Ky"] as string | undefined) || undefined,
        tenLop: (r["Ten Lop"] as string | undefined) || undefined,
        tenMonHoc: tenMon,
        tongSVMon: tong,
        svQuaMon: qua,
        tiLeQuaMon: tile,
      });
    });

    return results;
  } catch (e) {
    console.error("Không thể tải tỷ lệ qua môn theo môn", e);
    return [];
  }
}

// Mối tương quan giữa GPA và điểm rèn luyện (per-student) theo lớp / học kỳ
const GPA_CONDUCT_ENDPOINT =
  "/api/giangvien/Moi-Tuong-Quan-Giua-Diem-Ren-Luyen-Trung-Binh-Va-GPA-Trung-Binh";

export interface StudentGpaConductRecord {
  tenNamHoc?: string;
  tenHocKy?: string;
  tenLop?: string;
  hoTen?: string;
  gpa?: number;
  drl?: number; // điểm rèn luyện
}

export async function fetchGpaConductByClass(
  className?: string,
  semesterDisplayName?: string,
  // when true, require matching semester/year and DO NOT fallback to other semesters
  requireSemesterMatch: boolean = false,
  fallbackSemester: string = "HK2 - 2024-2025",
  fallbackClass: string = "14DHBM02"
): Promise<Array<{ studentName: string; gpa: number; conduct: number }>> {
  try {
    // Use request-level cache to avoid fetching the same endpoint repeatedly when
    // many components mount/trigger useEffect. This caches the raw payload and
    // also deduplicates concurrent requests via a shared promise.
    let dataPayload: unknown;
    if (cachedGpaConductPayload !== null) {
      dataPayload = cachedGpaConductPayload;
    } else if (gpaConductFetchPromise) {
      dataPayload = await gpaConductFetchPromise;
    } else {
      gpaConductFetchPromise = fetchWithAuth<unknown>(GPA_CONDUCT_ENDPOINT)
        .then((d) => {
          cachedGpaConductPayload = d;
          gpaConductFetchPromise = null;
          return d;
        })
        .catch((err) => {
          gpaConductFetchPromise = null;
          throw err;
        });
      dataPayload = await gpaConductFetchPromise;
    }

    const records: Array<Record<string, unknown>> = Array.isArray(dataPayload)
      ? (dataPayload as Array<Record<string, unknown>>)
      : [];

    const effectiveClass = (className || fallbackClass).trim().toLowerCase();
    const effectiveSemester = semesterDisplayName || fallbackSemester;

    let yearFilter: string | null = null;
    let termFilter: string | null = null;
    if (effectiveSemester) {
      const parts = effectiveSemester.split(" - ");
      if (parts.length === 2) {
        termFilter = normalizeTerm(parts[0].trim());
        yearFilter = parts[1].trim();
      } else {
        termFilter = normalizeTerm(effectiveSemester.trim());
      }
    }

    const results: Array<{
      studentName: string;
      gpa: number;
      conduct: number;
    }> = [];
    let _sampleLogged = false;
    // debug: help identify field names returned by API (only in dev)
    try {
      console.debug(
        "fetchGpaConductByClass: effectiveClass,effectiveSemester",
        {
          effectiveClass,
          effectiveSemester,
          received: records.length,
        }
      );
      if (records.length > 0) {
        console.debug(
          "fetchGpaConductByClass: sample record keys",
          Object.keys(records[0]).slice(0, 40)
        );
      }
    } catch {
      /* ignore logging errors in environments without console */
    }

    const findField = (r: Record<string, unknown>, candidates: string[]) => {
      // try exact names first
      for (const c of candidates) {
        if (c in r) return r[c];
      }
      // then try case-insensitive / normalized match (remove spaces/underscores, toLowerCase)
      const map = new Map<string, string>();
      Object.keys(r).forEach((k) => {
        const nk = k.replace(/[_\s]/g, "").toLowerCase();
        map.set(nk, k);
      });
      for (const c of candidates) {
        const nk = c.replace(/[_\s]/g, "").toLowerCase();
        const found = map.get(nk);
        if (found) return r[found];
      }
      return undefined;
    };
    // Normalization helper for potential class name variants
    const normalizeClassKey = (s: string) =>
      s.replace(/[\s_-]/g, "").toLowerCase();
    const targetNormalized = normalizeClassKey(effectiveClass);

    records.forEach((r) => {
      const lopRaw = (r["Ten Lop"] as string | undefined)?.trim();
      if (!lopRaw) return;
      const lop = lopRaw.toLowerCase();
      const lopNormalized = normalizeClassKey(lopRaw);
      // strict or normalized match
      if (lop !== effectiveClass && lopNormalized !== targetNormalized) return;
      if (yearFilter) {
        const year = (r["Ten Nam Hoc"] as string | undefined)?.trim();
        if (year !== yearFilter) return;
      }
      if (termFilter) {
        const termMa = (r["Ma Hoc Ky"] as string | undefined)?.trim();
        const termTen = (r["Ten Hoc Ky"] as string | undefined)?.trim();
        const normalizedMa = termMa ? normalizeTerm(termMa) : null;
        const normalizedTen = termTen ? normalizeTerm(termTen) : null;
        if (normalizedMa !== termFilter && normalizedTen !== termFilter) return;
      }

      const studentName = String(
        r["Ho Ten"] ??
          r["Ten Sinh Vien"] ??
          r["StudentName"] ??
          r["hoTen"] ??
          ""
      ).trim();

      const gpaRaw = findField(r, [
        "GPA_HocKy",
        "GPA",
        "GPA_Lop",
        "DiemTB",
        "Diem",
      ]);
      const drlRaw = findField(r, [
        "DRL",
        "DRL_Lop",
        "Diem_RL",
        "DiemRenLuyen",
        "DRLlop",
      ]);

      const gpa =
        typeof gpaRaw === "number" ? gpaRaw : parseNumericId(gpaRaw) ?? 0;
      const conduct =
        typeof drlRaw === "number" ? drlRaw : parseNumericId(drlRaw) ?? 0;

      // one-time debug of parsed numeric values (no PII)
      if (!_sampleLogged) {
        try {
          console.debug("fetchGpaConductByClass: parsed first row", {
            gpa,
            conduct,
          });
        } catch {
          /* ignore */
        }
        _sampleLogged = true;
      }

      if (studentName) results.push({ studentName, gpa, conduct });
    });

    // Fallback: if no results matched semester filter but class exists in dataset, try again ignoring semester
    // Only do this relaxed fallback when the caller allows it (requireSemesterMatch === false)
    if (results.length === 0 && termFilter && !requireSemesterMatch) {
      const relaxed: Array<{
        studentName: string;
        gpa: number;
        conduct: number;
      }> = [];
      records.forEach((r) => {
        const lopRaw = (r["Ten Lop"] as string | undefined)?.trim();
        if (!lopRaw) return;
        const lopNormalized = normalizeClassKey(lopRaw);
        if (lopNormalized !== targetNormalized) return;
        // Ignore year/term filters here intentionally
        const studentName = String(
          r["Ho Ten"] ??
            r["Ten Sinh Vien"] ??
            r["StudentName"] ??
            r["hoTen"] ??
            ""
        ).trim();
        const gpaRaw = findField(r, [
          "GPA_HocKy",
          "GPA",
          "GPA_Lop",
          "DiemTB",
          "Diem",
        ]);
        const drlRaw = findField(r, [
          "DRL",
          "DRL_Lop",
          "Diem_RL",
          "DiemRenLuyen",
          "DRLlop",
        ]);
        const gpa =
          typeof gpaRaw === "number" ? gpaRaw : parseNumericId(gpaRaw) ?? 0;
        const conduct =
          typeof drlRaw === "number" ? drlRaw : parseNumericId(drlRaw) ?? 0;
        if (studentName) relaxed.push({ studentName, gpa, conduct });
      });
      if (relaxed.length) {
        console.debug(
          "fetchGpaConductByClass: no semester match; using relaxed (ignore semester) dataset",
          { count: relaxed.length }
        );
        results.push(...relaxed);
      }
    }

    // If DRL values look like they are on a small scale (0..1 or 0..5), scale them to 0..100 for display
    try {
      const conductVals = results.map((x) => x.conduct);
      const maxConduct = conductVals.length ? Math.max(...conductVals) : 0;
      if (maxConduct > 0 && maxConduct <= 1) {
        // fraction 0..1 => percentage
        results.forEach((x) => {
          x.conduct = Math.round(x.conduct * 100);
        });
        console.debug("fetchGpaConductByClass: scaled DRL from 0..1 to 0..100");
      } else if (maxConduct > 0 && maxConduct <= 5) {
        // 0..5 scale (e.g., 0-5) => convert to 0..100
        results.forEach((x) => {
          x.conduct = Math.round(x.conduct * 20);
        });
        console.debug("fetchGpaConductByClass: scaled DRL from 0..5 to 0..100");
      }
    } catch {
      /* ignore scaling errors */
    }

    return results;
  } catch (e) {
    console.error("Không thể tải dữ liệu GPA/DRL theo lớp", e);
    return [];
  }
}

// GPA từng sinh viên trong lớp tại học kỳ năm học
export interface StudentGPARecord {
  studentName: string;
  gpa: number;
}

const STUDENT_GPA_ENDPOINT =
  "/api/giangvien/GPA-tung-sinh-vien-trong-lop-tai-hoc-ki-nam-hoc";

export async function fetchStudentGPAs(
  className?: string,
  semesterDisplayName?: string,
  fallbackSemester: string = "HK2 - 2024-2025",
  fallbackClass: string = "14DHBM02"
): Promise<StudentGPARecord[]> {
  try {
    const data = await fetchWithAuth<unknown>(STUDENT_GPA_ENDPOINT);
    const records: Array<Record<string, unknown>> = Array.isArray(data)
      ? (data as Array<Record<string, unknown>>)
      : [];

    const effectiveClass = (className || fallbackClass).trim().toLowerCase();
    const effectiveSemester = semesterDisplayName || fallbackSemester;

    let yearFilter: string | null = null;
    let termFilter: string | null = null;
    if (effectiveSemester) {
      const parts = effectiveSemester.split(" - ");
      if (parts.length === 2) {
        termFilter = normalizeTerm(parts[0].trim());
        yearFilter = parts[1].trim();
      } else {
        termFilter = normalizeTerm(effectiveSemester.trim());
      }
    }

    // Collect GPA records for the selected class and semester
    const semesterResult: StudentGPARecord[] = [];
    records.forEach((r) => {
      const lop = (r["Ten Lop"] as string | undefined)?.trim().toLowerCase();
      if (!lop || lop !== effectiveClass) return;

      if (yearFilter) {
        const year = (r["Ten Nam Hoc"] as string | undefined)?.trim();
        if (year && year !== yearFilter) return;
      }
      if (termFilter) {
        const termMa = (r["Ma Hoc Ky"] as string | undefined)?.trim();
        const termTen = (r["Ten Hoc Ky"] as string | undefined)?.trim();
        const normalizedMa = termMa ? normalizeTerm(termMa) : null;
        const normalizedTen = termTen ? normalizeTerm(termTen) : null;
        if (normalizedMa !== termFilter && normalizedTen !== termFilter) return;
      }

      const name = String(
        r["Ho Ten"] ?? r["Ten Sinh Vien"] ?? r["StudentName"] ?? ""
      ).trim();
      const gpaRaw =
        r["GPA_HocKy"] ?? r["GPA"] ?? r["gpa"] ?? r["DiemTB"] ?? r["Diem"];
      const gpa = typeof gpaRaw === "number" ? gpaRaw : parseNumericId(gpaRaw);
      if (name && gpa !== null) semesterResult.push({ studentName: name, gpa });
    });

    // If no per-student GPA records were found for the selected semester, return empty to indicate 'no data'
    if (semesterResult.length === 0) return [];

    // Sort by student name for stable ordering
    semesterResult.sort((a, b) =>
      a.studentName.localeCompare(b.studentName, "vi")
    );
    return semesterResult;
  } catch (e) {
    console.error("Không thể tải GPA sinh viên", e);
    return [];
  }
}

// Course averages vs faculty GPA per course
const COURSE_AVERAGE_ENDPOINT =
  "/api/giangvien/Diem-Trung-Binh-Mon-So-Voi-GPA-Toan-Khoa";

export interface CourseAverageRecord {
  tenNamHoc?: string;
  maHocKy?: string;
  tenLop?: string;
  tenMonHoc?: string;
  gpaLop?: number;
  gpaKhoa?: number;
}

export async function fetchCourseAverages(
  className?: string,
  semesterDisplayName?: string,
  fallbackSemester: string = "HK2 - 2024-2025",
  fallbackClass: string = "14DHBM02"
): Promise<CourseAverageRecord[]> {
  try {
    const data = await fetchWithAuth<unknown>(COURSE_AVERAGE_ENDPOINT);
    const records: Array<Record<string, unknown>> = Array.isArray(data)
      ? (data as Array<Record<string, unknown>>)
      : [];

    const effectiveClass = (className || fallbackClass).trim().toLowerCase();
    const effectiveSemester = semesterDisplayName || fallbackSemester;

    let yearFilter: string | null = null;
    let termFilter: string | null = null;
    if (effectiveSemester) {
      const parts = effectiveSemester.split(" - ");
      if (parts.length === 2) {
        termFilter = normalizeTerm(parts[0].trim());
        yearFilter = parts[1].trim();
      } else {
        termFilter = normalizeTerm(effectiveSemester.trim());
      }
    }

    const results: CourseAverageRecord[] = [];
    records.forEach((r) => {
      const lop = (r["Ten Lop"] as string | undefined)?.trim().toLowerCase();
      if (!lop || lop !== effectiveClass) return;
      if (yearFilter) {
        const year = (r["Ten Nam Hoc"] as string | undefined)?.trim();
        if (year !== yearFilter) return;
      }
      if (termFilter) {
        const termMa = (r["Ma Hoc Ky"] as string | undefined)?.trim();
        const termTen = (r["Ten Hoc Ky"] as string | undefined)?.trim();
        const normalizedMa = termMa ? normalizeTerm(termMa) : null;
        const normalizedTen = termTen ? normalizeTerm(termTen) : null;
        if (normalizedMa !== termFilter && normalizedTen !== termFilter) return;
      }

      const tenMon = (r["Ten Mon Hoc"] as string | undefined)?.trim() || "";
      const rawLop = r["GPA_Lop"];
      const rawKhoa = r["GPA_Khoa"];
      const gpaLop =
        typeof rawLop === "number" ? rawLop : parseNumericId(rawLop) ?? 0;
      const gpaKhoa =
        typeof rawKhoa === "number" ? rawKhoa : parseNumericId(rawKhoa) ?? 0;

      results.push({
        tenNamHoc: (r["Ten Nam Hoc"] as string | undefined) || undefined,
        maHocKy: (r["Ma Hoc Ky"] as string | undefined) || undefined,
        tenLop: (r["Ten Lop"] as string | undefined) || undefined,
        tenMonHoc: tenMon,
        gpaLop,
        gpaKhoa,
      });
    });

    return results;
  } catch (e) {
    console.error("Không thể tải điểm trung bình theo môn", e);
    return [];
  }
}

export function clearClassAdvisorCache(): void {
  cachedRecords = null;
  semesterKeyById.clear();
  semesterIdByKey.clear();
  rosterByClass.clear();
  // clear GPA/DRL cache as well
  cachedGpaConductPayload = null;
  gpaConductFetchPromise = null;
}

export interface AdvisorClass {
  Ten_Lop: string;
  [key: string]: unknown;
}

// -----------------------------------------
// Danh sách sinh viên theo lớp (POST body: { lop: string })
const STUDENT_LIST_BY_CLASS_ENDPOINT =
  "/api/giangvien/Danh-Sach-Sinh-Vien-Lop-X";

export async function fetchStudentsByClass(
  lop: string,
  semesterDisplayName?: string
): Promise<Array<Record<string, unknown>>> {
  try {
    if (!API_BASE_URL) throw new Error("API_BASE_URL is not defined");
    const auth = getAuth();
    if (!auth.token) throw new Error("Thiếu token xác thực");

    const url = `${API_BASE_URL}${STUDENT_LIST_BY_CLASS_ENDPOINT}`;
    const payload: Record<string, unknown> = { lop };
    if (semesterDisplayName) {
      payload.semester = semesterDisplayName;
      // Also include common fields the backend sometimes expects:
      // split by ' - ' (term - year) e.g. "HK1 - 2023-2024" or "HK1 - 2023"
      const parts = semesterDisplayName.split(" - ");
      if (parts.length === 2) {
        payload["Ten Hoc Ky"] = parts[0].trim();
        payload["Ten Nam Hoc"] = parts[1].trim();
        payload.year = parts[1].trim();
        payload.term = parts[0].trim();
      } else {
        // fallback: treat whole string as term
        payload["Ten Hoc Ky"] = semesterDisplayName.trim();
        payload.term = semesterDisplayName.trim();
      }
      // also add normalized Ma Hoc Ky if possible (HK1/HK2)
      const norm = String(semesterDisplayName)
        .replace(/\s+/g, "")
        .toUpperCase();
      const maMatch = norm.match(/HK\d+/i)?.[0];
      if (maMatch) payload["Ma Hoc Ky"] = maMatch;

      // also add numeric and alternative keys that some endpoints expect
      // e.g. { HocKy: 1, NamHoc: "2023-2024", HocKyNamHoc: "HK1 - 2023-2024" }
      try {
        const termNumberMatch = String(
          maMatch ?? payload["Ten Hoc Ky"] ?? ""
        ).match(/(\d+)/);
        const termNumber = termNumberMatch
          ? Number(termNumberMatch[1])
          : undefined;
        if (termNumber && Number.isFinite(termNumber))
          payload["HocKy"] = termNumber;
      } catch {
        /* ignore */
      }
      if (parts && parts.length === 2) {
        payload["NamHoc"] = parts[1].trim();
      }
      payload["HocKyNamHoc"] = semesterDisplayName;

      // add camelCase / no-space variants in case backend uses different keys
      if (payload["Ten Hoc Ky"]) payload["tenHocKy"] = payload["Ten Hoc Ky"];
      if (payload["Ten Nam Hoc"]) payload["tenNamHoc"] = payload["Ten Nam Hoc"];
      if (payload["Ma Hoc Ky"]) payload["maHocKy"] = payload["Ma Hoc Ky"];
    }

    console.debug("fetchStudentsByClass payload:", payload);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `${auth.tokenType ?? "Bearer"} ${auth.token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Request failed with status ${res.status}`);
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      throw new Error(
        `Unexpected response type: ${contentType}. Payload: ${text.slice(
          0,
          300
        )}`
      );
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("Không thể tải danh sách sinh viên theo lớp", e);
    return [];
  }
}

// ================== Môn có tỷ lệ rớt cao / thấp nhất theo lớp ==================
const SUBJECT_HIGHEST_FAIL_ENDPOINT =
  "/api/giangvien/Mon-Hoc-Ty-Le-Rot-Cao-Nhat-Theo-Lop";
const SUBJECT_LOWEST_FAIL_ENDPOINT =
  "/api/giangvien/Mon-Hoc-Ty-Le-Rot-Thap-Nhat-Theo-Lop";

export interface ExtremeFailRateSubject {
  year?: string; // Ten Nam Hoc
  term?: string; // Ten Hoc Ky (normalized)
  className?: string; // Ten Lop
  subjectName?: string; // Ten Mon Hoc
  totalStudents?: number; // Tong_SV
  failCount?: number; // SV_Rot (highest fail endpoint)
  passCount?: number; // SV_Dau (lowest fail endpoint)
  failRatePercent?: number; // Ty_Le_Rot (0..1 => %) or already percentage
  passRatePercent?: number; // Ty_Le_Dau (0..1 => %) or already percentage
  avgScore?: number; // DTB (điểm trung bình môn)
}

export interface ExtremeFailRateSubjectsResult {
  highest?: ExtremeFailRateSubject; // từ endpoint cao nhất
  lowest?: ExtremeFailRateSubject; // từ endpoint thấp nhất
}

export async function fetchExtremeFailRateSubjects(
  className?: string,
  semesterDisplayName?: string,
  fallbackSemester: string = "HK2 - 2024-2025",
  fallbackClass: string = "14DHBM02"
): Promise<ExtremeFailRateSubjectsResult> {
  try {
    const effectiveClass = (className || fallbackClass).trim().toLowerCase();
    const effectiveSemester = semesterDisplayName || fallbackSemester;

    let yearFilter: string | null = null;
    let termFilter: string | null = null;
    if (effectiveSemester) {
      const parts = effectiveSemester.split(" - ");
      if (parts.length === 2) {
        termFilter = normalizeTerm(parts[0].trim());
        yearFilter = parts[1].trim();
      } else {
        termFilter = normalizeTerm(effectiveSemester.trim());
      }
    }

    const toPercent = (v: unknown): number | undefined => {
      if (typeof v === "number") return v <= 1 ? v * 100 : v;
      if (typeof v === "string") {
        const num = Number(v.trim());
        if (Number.isFinite(num)) return num <= 1 ? num * 100 : num;
      }
      return undefined;
    };

    const parseSingle = (
      raw: unknown,
      isHighest: boolean
    ): ExtremeFailRateSubject | undefined => {
      if (!raw || typeof raw !== "object") return undefined;
      const r = raw as Record<string, unknown>;
      const lop = (r["Ten Lop"] as string | undefined)?.trim().toLowerCase();
      if (!lop) return undefined;
      if (lop !== effectiveClass) return undefined;
      if (yearFilter) {
        const year = (r["Ten Nam Hoc"] as string | undefined)?.trim();
        if (year !== yearFilter) return undefined;
      }
      if (termFilter) {
        const termTen = (r["Ten Hoc Ky"] as string | undefined)?.trim();
        const termNorm = termTen ? normalizeTerm(termTen) : null;
        if (termNorm && termNorm !== termFilter) return undefined;
      }
      return {
        year: (r["Ten Nam Hoc"] as string | undefined) || undefined,
        term: (r["Ten Hoc Ky"] as string | undefined) || undefined,
        className: (r["Ten Lop"] as string | undefined) || undefined,
        subjectName: (r["Ten Mon Hoc"] as string | undefined) || undefined,
        totalStudents:
          typeof r["Tong_SV"] === "number"
            ? (r["Tong_SV"] as number)
            : parseNumericId(r["Tong_SV"]) ?? undefined,
        failCount: isHighest
          ? typeof r["SV_Rot"] === "number"
            ? (r["SV_Rot"] as number)
            : parseNumericId(r["SV_Rot"]) ?? undefined
          : undefined,
        passCount: !isHighest
          ? typeof r["SV_Dau"] === "number"
            ? (r["SV_Dau"] as number)
            : parseNumericId(r["SV_Dau"]) ?? undefined
          : undefined,
        failRatePercent: isHighest ? toPercent(r["Ty_Le_Rot"]) : undefined,
        passRatePercent: !isHighest ? toPercent(r["Ty_Le_Dau"]) : undefined,
        avgScore:
          typeof r["DTB"] === "number"
            ? (r["DTB"] as number)
            : parseNumericId(r["DTB"]) ?? undefined,
      };
    };

    const [highestRaw, lowestRaw] = await Promise.all([
      fetchWithAuth<unknown>(SUBJECT_HIGHEST_FAIL_ENDPOINT),
      fetchWithAuth<unknown>(SUBJECT_LOWEST_FAIL_ENDPOINT),
    ]);

    const extractFirst = (
      payload: unknown,
      isHighest: boolean
    ): ExtremeFailRateSubject | undefined => {
      if (Array.isArray(payload)) {
        for (const item of payload) {
          const parsed = parseSingle(item, isHighest);
          if (parsed) return parsed;
        }
        return undefined;
      }
      return parseSingle(payload, isHighest);
    };

    const highest = extractFirst(highestRaw, true);
    const lowest = extractFirst(lowestRaw, false);
    return { highest, lowest };
  } catch (e) {
    console.error("Không thể tải dữ liệu môn có tỷ lệ rớt cao/thấp nhất", e);
    return {};
  }
}
