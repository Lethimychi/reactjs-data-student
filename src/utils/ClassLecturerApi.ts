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
  if (!API_BASE_URL) throw new Error("API_BASE_URL is not defined");

  const auth = getAuth();
  if (!auth.token) throw new Error("Thiếu token xác thực");

  try {
    const res = await fetch(`${API_BASE_URL}${ADVISOR_ENDPOINT}`, {
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
        `Unexpected response type: ${contentType}. Payload: ${text.slice(
          0,
          300
        )}`
      );
    }

    const data = await res.json();
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

export interface StudentStats {
  "Ten Lop": string;
  Tong_SV: number;
}

const STUDENT_COUNT_ENDPOINT = "/api/giangvien/Tong-So-Sinh-Vien-Theo-Lop";

export async function fetchStudentStats(
  className?: string
): Promise<StudentStats | null> {
  if (!API_BASE_URL) throw new Error("API_BASE_URL is not defined");

  const auth = getAuth();
  if (!auth.token) throw new Error("Thiếu token xác thực");

  try {
    const res = await fetch(`${API_BASE_URL}${STUDENT_COUNT_ENDPOINT}`, {
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

    const data = await res.json();
    const records = Array.isArray(data) ? data : [];

    if (!className || records.length === 0) {
      const first = records[0];
      return first
        ? {
            "Ten Lop": (first["Ten Lop"] as string)?.trim() || "N/A",
            Tong_SV: parseNumericId(first["Tong_SV"]) ?? 0,
          }
        : null;
    }

    const match = records.find(
      (r) =>
        ((r["Ten Lop"] as string)?.trim() || "").toLowerCase() ===
        className.toLowerCase()
    );
    return match
      ? {
          "Ten Lop": (match["Ten Lop"] as string)?.trim() || "N/A",
          Tong_SV: parseNumericId(match["Tong_SV"]) ?? 0,
        }
      : null;
  } catch (error) {
    console.error("Không thể tải số lượng sinh viên", error);
    throw error instanceof Error
      ? error
      : new Error("Không thể tải số lượng sinh viên.");
  }
}

export function clearClassAdvisorCache(): void {
  cachedRecords = null;
  semesterKeyById.clear();
  semesterIdByKey.clear();
}
