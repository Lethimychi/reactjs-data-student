import { API_BASE_URL, getAuth } from "../share";

export interface SubjectGradeRatio {
  "Ten Nam Hoc": string;
  "Ten Hoc Ky": string;
  "Ma Sinh Vien": string;

  TongMon: number;

  So_A: number;
  "So_B+": number;
  So_B: number;
  "So_C+": number;
  So_C: number;
  "So_D+": number;
  So_D: number;
  So_F: number;

  TyLe_A: number;
  "TyLe_B+": number;
  TyLe_B: number;
  "TyLe_C+": number;
  TyLe_C: number;
  "TyLe_D+": number;
  TyLe_D: number;
  TyLe_F: number;
}

export async function getSubjectGradeRatio(): Promise<
  SubjectGradeRatio[] | null
> {
  try {
    const auth = getAuth();

    if (!auth.token) {
      console.error(
        "⛔ Không có token → Không thể gọi API tỷ lệ môn học đạt loại"
      );
      return null;
    }

    const url = `${API_BASE_URL}/api/sinhvien/ty-le-mon-hoc-dat-loai-cua-sinh-vien`;

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

    if (Array.isArray(data)) return data as SubjectGradeRatio[];
    if (data && typeof data === "object") return [data] as SubjectGradeRatio[];

    return [];
  } catch (err) {
    console.error("❌ Lỗi gọi API:", err);
    throw err;
  }
}

export interface SubjectGradeRatioGV {
  "Ten Nam": string;
  "Ten Nam Hoc": string;
  "Ten Hoc Ky": string;

  TyLe_Gioi: number;
  TyLe_Kha: number;
  TyLe_TB: number;
  TyLe_Yeu: number;

  TongMon: number;
}

export async function getSubjectGradeRatioGV(
  masv: string
): Promise<SubjectGradeRatioGV[] | null> {
  try {
    const auth = getAuth();
    const url = `${API_BASE_URL}/api/giangvien/ty-le-mon-hoc-dat-loai-cua-sinh-vien`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `${auth.tokenType} ${auth.token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420",
      },
      body: JSON.stringify({ masv }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API Error ${res.status}: ${text}`);
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      throw new Error(`Unexpected non-JSON response: ${text}`);
    }

    const data = await res.json();

    if (Array.isArray(data)) return data as SubjectGradeRatioGV[];
    if (data && typeof data === "object")
      return [data] as SubjectGradeRatioGV[];

    return [];
  } catch (err) {
    console.error("❌ Lỗi gọi API:", err);
    throw err;
  }
}
