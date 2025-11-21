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
  fallbackSemester: string = "HK1 - 2024-2025",
  fallbackClass: string = "12DHTH11"
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

    // 1. Thu thập roster đầy đủ của lớp bất kể học kỳ (quét toàn bộ records)
    const fullRosterSet = new Set<string>();
    records.forEach((r) => {
      const lop = (r["Ten Lop"] as string | undefined)?.trim().toLowerCase();
      if (!lop || lop !== effectiveClass) return;
      const name = (r["Ho Ten"] as string | undefined)?.trim();
      if (name) fullRosterSet.add(name);
    });

    // 2. Lọc GPA theo học kỳ được chọn
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
      const studentName = (r["Ho Ten"] as string | undefined)?.trim();
      const gpaRaw = r["GPA_HocKy"];
      const gpa = typeof gpaRaw === "number" ? gpaRaw : parseNumericId(gpaRaw);
      if (studentName && gpa !== null)
        semesterResult.push({ studentName, gpa });
    });

    // 3. Cập nhật roster cache (hợp nhất với roster mới quét)
    const rosterKey = effectiveClass;
    let rosterSet = rosterByClass.get(rosterKey);
    if (!rosterSet) {
      rosterSet = new Set<string>();
      rosterByClass.set(rosterKey, rosterSet);
    }
    fullRosterSet.forEach((n) => rosterSet!.add(n));

    // 4. Xây dựng danh sách cuối cùng: toàn bộ roster, GPA=0 nếu không có trong học kỳ
    const rosterArray = Array.from(rosterSet).sort((a, b) =>
      a.localeCompare(b, "vi")
    );
    const gpaMap = new Map(semesterResult.map((r) => [r.studentName, r.gpa]));
    return rosterArray.map((name) => ({
      studentName: name,
      gpa: gpaMap.get(name) ?? 0,
    }));
  } catch (e) {
    console.error("Không thể tải GPA từng sinh viên", e);
    return [];
  }
}

export function clearClassAdvisorCache(): void {
  cachedRecords = null;
  semesterKeyById.clear();
  semesterIdByKey.clear();
  rosterByClass.clear();
}

export interface AdvisorClass {
  Ten_Lop: string;
  [key: string]: unknown;
}
