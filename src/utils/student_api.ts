// src/utils/student_api.ts

import { fetchWithAuth } from "./share";

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
    // Delegate to shared helper which adds auth headers and validates JSON
    const data = await fetchWithAuth<unknown>(
      "/api/sinhvien/thong-tin-sinh-vien"
    );
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
    const data = await fetchWithAuth<CourseApiResponse>(
      "/api/sinhvien/mon-hoc-sinh-vien-da-hoc-theo-hoc-ky"
    );
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
    const data = await fetchWithAuth<GpaApiRecord[]>(
      "/api/sinhvien/gpa-sinh-vien-theo-hoc-ky-nam-hoc"
    );
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
    const data = await fetchWithAuth<DetailedCourseApiResponse>(
      "/api/sinhvien/diem-chi-tiet-tung-mon-hoc-sinh-vien-da-hoc"
    );
    return data;
  } catch (err) {
    console.error("❌ Lỗi gọi API điểm chi tiết:", err);
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
    const data = await fetchWithAuth<PassRateApiRecord[]>(
      "/api/sinhvien/ty-le-qua-mon-cua-sinh-vien"
    );
    return data;
  } catch (err) {
    console.error("❌ Lỗi API tỷ lệ qua môn:", err);
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
    const data = await fetchWithAuth<unknown>(
      "/api/sinhvien/gpa-trung-binh-toan-khoa-cua-sinh-vien"
    );
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
    let endpoint =
      "/api/sinhvien/so-sanh-diem-trung-binh-mon-hoc-cua-sinh-vien-voi-lop";
    const params: string[] = [];
    if (year) params.push(`year=${encodeURIComponent(year)}`);
    if (hk) params.push(`hk=${encodeURIComponent(hk)}`);
    if (params.length) endpoint = `${endpoint}?${params.join("&")}`;

    const data = await fetchWithAuth<ClassAverageRecord[]>(endpoint);
    return data;
  } catch (err) {
    console.error("❌ Lỗi khi gọi API so sánh điểm:", err);
    throw err;
  }
}

// -----------------------------------------
// Lấy điểm rèn luyện (DRL) theo từng học kỳ
// Endpoint example: /api/sinhvien/diem-ren-luyen-cua-sinh-vien-trong-tung-hoc-ky
export type TrainingScoreApiRecord = {
  "Ten Nam Hoc"?: string;
  "Ten Hoc Ky"?: string;
  DRL?: number | string;
  [key: string]: unknown;
};

export async function getStudentTrainingScores(): Promise<
  TrainingScoreApiRecord[] | null
> {
  try {
    const data = await fetchWithAuth<TrainingScoreApiRecord[]>(
      "/api/sinhvien/diem-ren-luyen-cua-sinh-vien-trong-tung-hoc-ky"
    );
    return data;
  } catch (err) {
    console.error("❌ Lỗi khi gọi API DRL:", err);
    throw err;
  }
}

// -----------------------------------------
// Dự đoán hiệu suất tương lai của sinh viên
// Endpoint: /api/sinhvien/du-doan?MaSinhVien=...
export type PredictionResult = {
  MaSinhVien?: number | string;
  HoTen?: string;
  GPA_He10?: number;
  GPA_He4?: number;
  TongTinChi?: number;
  ConLai?: number;
  DuDoan?: {
    PhuongPhap?: string;
    SoKichBan?: number;
    GPA_HienTai_He10?: number;
    GPA_HienTai_He4?: number;
    Loai_HienTai?: string;
    XacSuat_DatLoai?: Record<string, number>;
    DiemCanDat_O_ConLai_DeDat?: Record<string, number>;
    GhiChu?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export async function getStudentPrediction(
  maSinhVien: string | number
): Promise<PredictionResult | null> {
  try {
    const query = `?MaSinhVien=${encodeURIComponent(String(maSinhVien))}`;
    const data = await fetchWithAuth<PredictionResult>(
      `/dudoan/sac-suat-dat-loai-khi-tot-nghiep${query}`
    );
    return data;
  } catch (err) {
    console.error("❌ Lỗi gọi API dự đoán:", err);
    return null;
  }
}
