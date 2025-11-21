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

const buildSemesterKey = (record: AdvisorRecord): string | null => {
  const year = (record["Ten Nam Hoc"] as string)?.trim() || "";
  const term = (record["Ten Hoc Ky"] as string)?.trim() || "";
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
    const displayName =
      [term, year].filter(Boolean).join(" - ") || `Học kỳ ${id}`;

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
      // Expect format "HK_x - yyyy-yyyy"
      const parts = semesterDisplayName.split(" - ");
      if (parts.length === 2) {
        termFilter = parts[0].trim();
        yearFilter = parts[1].trim();
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
        const term = (r["Ma Hoc Ky"] as string | undefined)?.trim();
        if (term !== termFilter) return false;
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
        const term = (r["Ma Hoc Ky"] as string | undefined)?.trim();
        if (term !== termFilter) return false;
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

export function clearClassAdvisorCache(): void {
  cachedRecords = null;
  semesterKeyById.clear();
  semesterIdByKey.clear();
}

export interface AdvisorClass {
  Ten_Lop: string;
  [key: string]: unknown;
}
