import { API_BASE_URL, getAuth } from "../share";

export interface SubjectScore {
  "Ten Nam Hoc": string;
  "Ten Hoc Ky": string;
  "Ten Mon Hoc": string;
  DTB: number;
}

export async function getHighestScoreSubject(): Promise<SubjectScore[] | null> {
  try {
    const auth = getAuth();
    if (!auth.token) {
      console.error("⛔ Không có token → Không thể gọi API môn điểm cao nhất");
      return null;
    }

    const url = `${API_BASE_URL}/api/sinhvien/mon-hoc-diem-cao-nhat-trong-hoc-ky`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `${auth.tokenType} ${auth.token}`,
        "ngrok-skip-browser-warning": "69420",
      },
    });

    // Check for HTTP error response
    if (!res.ok) {
      const text = await res.text();
      console.error("❌ Lỗi API môn điểm cao nhất:", text);
      throw new Error(`API Error ${res.status}: ${text}`);
    }

    // Check JSON response
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      throw new Error(`Unexpected non-JSON response: ${text}`);
    }

    const data = await res.json();
    console.log("✅ API môn điểm cao nhất trả về:", data);

    // Ensure return is always an array
    if (Array.isArray(data)) return data as SubjectScore[];
    if (data && typeof data === "object") return [data] as SubjectScore[];

    return [];
  } catch (err) {
    console.error("❌ Lỗi khi gọi API môn điểm cao nhất:", err);
    throw err;
  }
}

export default async function getLowestScoreSubjectsInSemester(): Promise<
  | {
      "Ten Nam Hoc": string;
      "Ten Hoc Ky": string;
      "Ten Mon Hoc": string;
      DTB: number;
    }[]
  | null
> {
  try {
    const auth = getAuth();

    if (!auth.token) {
      console.error("⛔ Không có token → Không thể gọi API");
      return null;
    }

    const url = `${API_BASE_URL}/api/sinhvien/mon-hoc-diem-thap-nhat-trong-hoc-ky`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `${auth.tokenType} ${auth.token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ Lỗi API:", text);
      throw new Error(`API Error ${res.status}: ${text}`);
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      throw new Error(`Unexpected non-JSON response: ${text}`);
    }

    const data = await res.json();
    console.log("✅ API trả JSON:", data);

    if (Array.isArray(data)) return data as SubjectScore[];
    if (data && typeof data === "object") return [data] as SubjectScore[];

    return [];
  } catch (err) {
    console.error("❌ Lỗi gọi API:", err);
    throw err;
  }
}
