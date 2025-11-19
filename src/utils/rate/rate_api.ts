import { API_BASE_URL, getAuth } from "../share";

export interface GPAGradeRatio {
  "Ten Nam Hoc": string;
  "Ten Hoc Ky": string;
  GPA: number;
  DRL: number;
  Do_Lech_Chuan: number;
  Ti_Le_Thuan: string;
}

export async function getGpaDrlRatio(): Promise<GPAGradeRatio[] | null> {
  try {
    const auth = getAuth();

    if (!auth.token) {
      console.error(
        "⛔ Không có token → Không thể gọi API tỷ lệ thuận GPA và DRL"
      );
      return null;
    }

    const url = `${API_BASE_URL}/api/sinhvien/ty-le-thuan-cua-gpa-va-diem-ren-luyen-cua-sinh-vien`;

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

    if (Array.isArray(data)) return data as GPAGradeRatio[];
    if (data && typeof data === "object") return [data] as GPAGradeRatio[];

    return [];
  } catch (err) {
    console.error("❌ Lỗi gọi API:", err);
    throw err;
  }
}
