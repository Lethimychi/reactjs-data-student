// src/utils/student_api.ts

import { API_BASE_URL, getAuth } from "./share";

// Lấy base URL từ .env

console.log("🔗 BASE API URL:", API_BASE_URL);



// Types for API responses (records use Vietnamese keys)
export type CourseApiRecord = {
  "Ten Nam Hoc"?: string;
  "Ten Hoc Ky"?: string;
  "Ten Mon Hoc"?: string;
  "So Tin Chi"?: number;
  "Diem Trung Binh"?: number;
  [key: string]: unknown;
};

export type CourseApiResponse = CourseApiRecord[];

// Detailed per-course record (includes component scores)
export type DetailedCourseApiRecord = {
  "Ma Sinh Vien"?: string;
  "Ten Nam Hoc"?: string;
  "Ten Hoc Ky"?: string;
  "Ten Mon Hoc"?: string;
  "So Tin Chi"?: string | number;
  "Diem Chuyen Can"?: string | number;
  "Diem Giua Ky"?: string | number;
  "Diem Cuoi Ky"?: string | number;
  "Diem Trung Binh"?: string | number;
  [key: string]: unknown;
};

export type DetailedCourseApiResponse = DetailedCourseApiRecord[];

// Gọi API: Lấy thông tin sinh viên (dùng fetch)
export default async function getStudentInfo() {
  try {
    const auth = getAuth();

    // Nếu không có token → không gọi API
    if (!auth.token) {
      console.error("⛔ Không có token → Không thể gọi API");
      return null;
    }

    const url = `${API_BASE_URL}/api/sinhvien/thong-tin-sinh-vien`;

    console.log("📡 Gửi request GET", url);

    // Gọi API bằng fetch
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
      throw new Error(text || "API Error");
    }

    // Ensure response is JSON — sometimes servers (errors, proxies, auth pages)
    // return HTML which causes `res.json()` to throw `Unexpected token '<'`.
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      console.error("❌ API returned non-JSON response:", text.slice(0, 500));
      throw new Error(
        `Unexpected non-JSON response (status ${res.status}): ${text.slice(
          0,
          300
        )}`
      );
    }

    // Parse JSON
    const data = await res.json();
    console.log("✅ API trả về JSON:", data);

    return data;
  } catch (err) {
    console.error("❌ Lỗi gọi API:", err);
    throw err;
  }
}

// -----------------------------------------
// Lấy danh sách môn học sinh viên đã học theo học kỳ
// Endpoint: /api/sinhvien/mon-hoc-sinh-vien-da-hoc-theo-hoc-ky
// Trả về mảng các object có keys kiểu tiếng Việt: "Ten Nam Hoc", "Ten Hoc Ky", "Ten Mon Hoc", "Diem Trung Binh"
export async function getStudentCoursesBySemester(): Promise<CourseApiResponse | null> {
  try {
    const auth = getAuth();
    if (!auth.token) {
      console.error("⛔ Không có token → Không thể gọi API môn học");
      return null;
    }

    const url = `${API_BASE_URL}/api/sinhvien/mon-hoc-sinh-vien-da-hoc-theo-hoc-ky`;
    console.log("📡 Gửi request GET (courses):", url, {
      Authorization: `${auth.tokenType} ${auth.token}`,
    });

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `${auth.tokenType} ${auth.token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        // When using ngrok in some setups the browser shows an interstitial HTML page;
        // adding this header suppresses the ngrok browser warning and returns JSON.
        "ngrok-skip-browser-warning": "69420",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ Lỗi API môn học:", text);
      throw new Error(
        `API returned status ${res.status}: ${text.slice(0, 300)}`
      );
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      console.error("❌ API môn học trả về HTML/other:", text.slice(0, 500));
      throw new Error(
        `Unexpected non-JSON response (status ${res.status}): ${text.slice(
          0,
          300
        )}`
      );
    }

    const data = (await res.json()) as CourseApiResponse;
    console.log("✅ API môn học trả về:", data);
    return data;
  } catch (err) {
    console.error("❌ Lỗi khi gọi API môn học:", err);
    throw err;
  }
}

// -----------------------------------------
// Lấy GPA sinh viên theo học kỳ/năm học
// Endpoint: /api/sinhvien/gpa-sinh-vien-theo-hoc-ky-nam-hoc
export type GpaApiRecord = {
  "Ten Nam Hoc"?: string;
  "Ten Hoc Ky"?: string;
  GPA_Hocky?: number;
  GPA_HocKy?: number;
  Loai_Hoc_Luc?: string;
  [key: string]: unknown;
};

export async function getStudentGpaBySemester(): Promise<
  GpaApiRecord[] | null
> {
  try {
    const auth = getAuth();
    if (!auth.token) {
      console.error("⛔ Không có token → Không thể gọi API GPA");
      return null;
    }

    const url = `${API_BASE_URL}/api/sinhvien/gpa-sinh-vien-theo-hoc-ky-nam-hoc`;
    console.log("📡 Gửi request GET (gpa per semester):", url, {
      Authorization: `${auth.tokenType} ${auth.token}`,
    });

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
      console.error("❌ Lỗi API GPA:", text);
      throw new Error(
        `API returned status ${res.status}: ${text.slice(0, 300)}`
      );
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      console.error("❌ API GPA trả về HTML/other:", text.slice(0, 500));
      throw new Error(
        `Unexpected non-JSON response (status ${res.status}): ${text.slice(
          0,
          300
        )}`
      );
    }

    const data = (await res.json()) as GpaApiRecord[];
    console.log("✅ API GPA trả về:", data);
    return data;
  } catch (err) {
    console.error("❌ Lỗi khi gọi API GPA:", err);
    throw err;
  }
}

// -----------------------------------------
// Lấy chi tiết điểm từng môn sinh viên đã học
// Endpoint (example from screenshot): /api/sinhvien/diem-chi-tiet-tung-mon-hoc-sinh-vien-da-hoc
export async function getStudentDetailedCourses(): Promise<DetailedCourseApiResponse | null> {
  try {
    const auth = getAuth();
    if (!auth.token) {
      console.error("⛔ Không có token → Không thể gọi API điểm chi tiết");
      return null;
    }

    const url = `${API_BASE_URL}/api/sinhvien/diem-chi-tiet-tung-mon-hoc-sinh-vien-da-hoc`;
    console.log("📡 Gửi request GET (detailed courses):", url, {
      Authorization: `${auth.tokenType} ${auth.token}`,
    });

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
      console.error("❌ Lỗi API điểm chi tiết:", text);
      throw new Error(
        `API returned status ${res.status}: ${text.slice(0, 300)}`
      );
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      console.error(
        "❌ API điểm chi tiết trả về HTML/other:",
        text.slice(0, 500)
      );
      throw new Error(
        `Unexpected non-JSON response (status ${res.status}): ${text.slice(
          0,
          300
        )}`
      );
    }

    const data = (await res.json()) as DetailedCourseApiResponse;
    console.log("✅ API điểm chi tiết trả về:", data);
    return data;
  } catch (err) {
    console.error("❌ Lỗi khi gọi API điểm chi tiết:", err);
    throw err;
  }
}

// -----------------------------------------
// Lấy tỷ lệ qua môn của sinh viên theo học kỳ
// Endpoint: /api/sinhvien/ty-le-qua-mon-cua-sinh-vien
export type PassRateApiRecord = {
  "Ma Sinh Vien"?: string;
  "Ten Nam Hoc"?: string;
  "Ten Hoc Ky"?: string;
  So_Mon_Dau?: number;
  Tong_Mon?: number;
  Ty_Le_Qua_Mon?: number; // ratio e.g. 1 or 0.85
  [key: string]: unknown;
};

export async function getStudentPassRateBySemester(): Promise<
  PassRateApiRecord[] | null
> {
  try {
    const auth = getAuth();
    if (!auth.token) {
      console.error("⛔ Không có token → Không thể gọi API tỷ lệ qua môn");
      return null;
    }

    const url = `${API_BASE_URL}/api/sinhvien/ty-le-qua-mon-cua-sinh-vien`;
    console.log("📡 Gửi request GET (pass rate by semester):", url, {
      Authorization: `${auth.tokenType} ${auth.token}`,
    });

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
      console.error("❌ Lỗi API tỷ lệ qua môn:", text);
      throw new Error(
        `API returned status ${res.status}: ${text.slice(0, 300)}`
      );
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      console.error(
        "❌ API tỷ lệ qua môn trả về HTML/other:",
        text.slice(0, 500)
      );
      throw new Error(
        `Unexpected non-JSON response (status ${res.status}): ${text.slice(
          0,
          300
        )}`
      );
    }

    const data = (await res.json()) as PassRateApiRecord[];
    console.log("✅ API tỷ lệ qua môn trả về:", data);
    return data;
  } catch (err) {
    console.error("❌ Lỗi khi gọi API tỷ lệ qua môn:", err);
    throw err;
  }
}

// -----------------------------------------
// Lấy GPA trung bình toàn khóa của sinh viên
// Endpoint: /api/sinhvien/gpa-trung-binh-toan-khoa-cua-sinh-vien
export async function getStudentOverallGpa(): Promise<Record<
  string,
  unknown
> | null> {
  try {
    const auth = getAuth();
    if (!auth.token) {
      console.error("⛔ Không có token → Không thể gọi API GPA toàn khóa");
      return null;
    }

    const url = `${API_BASE_URL}/api/sinhvien/gpa-trung-binh-toan-khoa-cua-sinh-vien`;
    console.log("📡 Gửi request GET (gpa overall):", url, {
      Authorization: `${auth.tokenType} ${auth.token}`,
    });

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
      console.error("❌ Lỗi API GPA toàn khóa:", text);
      throw new Error(
        `API returned status ${res.status}: ${text.slice(0, 300)}`
      );
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      console.error(
        "❌ API GPA toàn khóa trả về HTML/other:",
        text.slice(0, 500)
      );
      throw new Error(
        `Unexpected non-JSON response (status ${res.status}): ${text.slice(
          0,
          300
        )}`
      );
    }

    const data = await res.json();
    console.log("✅ API GPA toàn khóa trả về:", data);

    // API may return an array or an object. Prefer first element if array.
    if (Array.isArray(data))
      return data.length ? (data[0] as Record<string, unknown>) : null;
    if (data && typeof data === "object")
      return data as Record<string, unknown>;
    return null;
  } catch (err) {
    console.error("❌ Lỗi khi gọi API GPA toàn khóa:", err);
    throw err;
  }
}

// -----------------------------------------
// Lấy điểm trung bình môn: so sánh điểm trung bình sinh viên vs lớp
// Endpoint (example): /api/sinhvien/so-sanh-diem-trung-binh-mon-hoc-cua-sinh-vien-voi-lop
export type ClassAverageRecord = {
  "Ten Mon Hoc"?: string;
  TenMonHoc?: string;
  DTB_SV?: number | string; // điểm TB của sinh viên cho môn
  DTB_ALL?: number | string; // điểm TB của lớp cho môn
  [key: string]: unknown;
};

export async function getStudentClassAverageComparison(
  year?: string,
  hk?: string
): Promise<ClassAverageRecord[] | null> {
  try {
    const auth = getAuth();
    if (!auth.token) {
      console.error("⛔ Không có token → Không thể gọi API so sánh điểm");
      return null;
    }

    let url = `${API_BASE_URL}/api/sinhvien/so-sanh-diem-trung-binh-mon-hoc-cua-sinh-vien-voi-lop`;
    // if year/hk provided, append as query params (best-effort)
    const params: string[] = [];
    if (year) params.push(`year=${encodeURIComponent(year)}`);
    if (hk) params.push(`hk=${encodeURIComponent(hk)}`);
    if (params.length) url = `${url}?${params.join("&")}`;

    console.log("📡 Gửi request GET (class average comparison):", url);

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
      console.error("❌ Lỗi API so sánh điểm:", text);
      throw new Error(
        `API returned status ${res.status}: ${text.slice(0, 300)}`
      );
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      console.error(
        "❌ API so sánh điểm trả về HTML/other:",
        text.slice(0, 500)
      );
      throw new Error(
        `Unexpected non-JSON response (status ${res.status}): ${text.slice(
          0,
          300
        )}`
      );
    }

    const data = (await res.json()) as ClassAverageRecord[];
    console.log("✅ API so sánh điểm trả về:", data);
    return data;
  } catch (err) {
    console.error("❌ Lỗi khi gọi API so sánh điểm:", err);
    throw err;
  }
}
