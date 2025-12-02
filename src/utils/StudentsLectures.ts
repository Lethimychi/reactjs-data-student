import { fetchWithAuth } from "./share";

const STUDENT_INFO_ENDPOINT = "/api/giangvien/thong-tin-sinh-vien";
const STUDENT_GPA_ENDPOINT =
  "/api/giangvien/gpa-trung-binh-toan-khoa-cua-sinh-vien";
const STUDENT_PASS_RATE_ENDPOINT = "/api/giangvien/ty-le-qua-mon-cua-sinh-vien";

export async function fetchStudentInfo(
  masv: string,
  semesterDisplayName?: string
): Promise<Record<string, unknown> | null> {
  try {
    const payload: Record<string, unknown> = { masv };
    if (semesterDisplayName) {
      payload.semester = semesterDisplayName;
      const parts = String(semesterDisplayName).split(" - ");
      if (parts.length === 2) {
        payload["Ten Hoc Ky"] = parts[0].trim();
        payload["Ten Nam Hoc"] = parts[1].trim();
        payload.year = parts[1].trim();
        payload.term = parts[0].trim();
      } else {
        payload["Ten Hoc Ky"] = semesterDisplayName.trim();
        payload.term = semesterDisplayName.trim();
      }
      payload["Ma Hoc Ky"] = String(semesterDisplayName)
        .replace(/\s+/g, "")
        .toUpperCase()
        .match(/HK\d+/i)?.[0];
    }
    console.debug("fetchStudentInfo payload:", payload);

    const data = await fetchWithAuth<
      Record<string, unknown> | Record<string, unknown>[]
    >(STUDENT_INFO_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (Array.isArray(data)) return data.length ? data[0] : null;
    if (data && typeof data === "object")
      return data as Record<string, unknown>;
    return null;
  } catch {
    return null;
  }
}

export async function fetchStudentAccumulatedGPA(
  masv: string,
  semesterDisplayName?: string
): Promise<unknown> {
  try {
    const payload: Record<string, unknown> = { masv };
    if (semesterDisplayName) {
      payload.semester = semesterDisplayName;
      const parts = String(semesterDisplayName).split(" - ");
      if (parts.length === 2) {
        payload["Ten Hoc Ky"] = parts[0].trim();
        payload["Ten Nam Hoc"] = parts[1].trim();
        payload.year = parts[1].trim();
        payload.term = parts[0].trim();
      } else {
        payload["Ten Hoc Ky"] = semesterDisplayName.trim();
        payload.term = semesterDisplayName.trim();
      }
      payload["Ma Hoc Ky"] = String(semesterDisplayName)
        .replace(/\s+/g, "")
        .toUpperCase()
        .match(/HK\d+/i)?.[0];
    }
    console.debug("fetchStudentAccumulatedGPA payload:", payload);

    const data = await fetchWithAuth<unknown>(STUDENT_GPA_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return data;
  } catch {
    console.error("fetchStudentAccumulatedGPA error");
    return null;
  }
}

export async function fetchStudentPassRate(
  masv: string,
  semesterDisplayName?: string
): Promise<unknown> {
  try {
    const payload: Record<string, unknown> = { masv };
    if (semesterDisplayName) {
      payload.semester = semesterDisplayName;
      const parts = String(semesterDisplayName).split(" - ");
      if (parts.length === 2) {
        payload["Ten Hoc Ky"] = parts[0].trim();
        payload["Ten Nam Hoc"] = parts[1].trim();
        payload.year = parts[1].trim();
        payload.term = parts[0].trim();
      } else {
        payload["Ten Hoc Ky"] = semesterDisplayName.trim();
        payload.term = semesterDisplayName.trim();
      }
      payload["Ma Hoc Ky"] = String(semesterDisplayName)
        .replace(/\s+/g, "")
        .toUpperCase()
        .match(/HK\d+/i)?.[0];
    }
    console.debug("fetchStudentPassRate payload:", payload);

    const data = await fetchWithAuth<unknown>(STUDENT_PASS_RATE_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return data;
  } catch {
    console.error("fetchStudentPassRate error");
    return null;
  }
}

const STUDENT_GPA_TREND_ENDPOINT =
  "/api/giangvien/xu-huong-gpa-cua-sinh-vien-qua-cac-hoc-ky";

export async function fetchStudentGpaTrend(masv: string): Promise<unknown> {
  try {
    const payload = { masv };
    console.debug("fetchStudentGpaTrend payload:", payload);
    const data = await fetchWithAuth<unknown>(STUDENT_GPA_TREND_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return data;
  } catch (e) {
    console.error("fetchStudentGpaTrend error", e);
    return null;
  }
}

const STUDENT_REGISTERED_CREDITS_ENDPOINT =
  "/api/giangvien/so-tin-chi-dang-ki-cua-sinh-vien";

export async function fetchStudentRegisteredCredits(
  masv: string
): Promise<unknown> {
  try {
    const payload = { masv };
    console.debug("fetchStudentRegisteredCredits payload:", payload);
    const data = await fetchWithAuth<unknown>(
      STUDENT_REGISTERED_CREDITS_ENDPOINT,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );
    console.info("fetchStudentRegisteredCredits data:", data);
    return data;
  } catch (e) {
    console.error("fetchStudentRegisteredCredits error", e);
    return null;
  }
}

const STUDENT_COURSE_SCORES_ENDPOINT =
  "/api/giangvien/diem-chi-tiet-tung-mon-hoc-sinh-vien-da-hoc";

export async function fetchStudentCourseScores(
  masv: string,
  semesterDisplayName?: string
): Promise<unknown> {
  try {
    const payload: Record<string, unknown> = { masv };
    if (semesterDisplayName) {
      payload.semester = semesterDisplayName;
      const parts = String(semesterDisplayName).split(" - ");
      if (parts.length === 2) {
        payload["Ten Hoc Ky"] = parts[0].trim();
        payload["Ten Nam Hoc"] = parts[1].trim();
        payload.year = parts[1].trim();
        payload.term = parts[0].trim();
      } else {
        payload["Ten Hoc Ky"] = semesterDisplayName.trim();
        payload.term = semesterDisplayName.trim();
      }
      payload["Ma Hoc Ky"] = String(semesterDisplayName)
        .replace(/\s+/g, "")
        .toUpperCase()
        .match(/HK\d+/i)?.[0];
    }
    console.debug("fetchStudentCourseScores payload:", payload);

    const data = await fetchWithAuth<unknown>(STUDENT_COURSE_SCORES_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return data;
  } catch (e) {
    console.error("fetchStudentCourseScores error", e);
    return null;
  }
}

const STUDENT_COMPARE_ENDPOINT =
  "/api/giangvien/so-sanh-diem-trung-binh-mon-hoc-cua-sinh-vien-voi-lop";

export async function fetchStudentCompareScores(
  masv: string,
  semesterDisplayName?: string
): Promise<unknown> {
  try {
    const payload: Record<string, unknown> = { masv };
    if (semesterDisplayName) {
      payload.semester = semesterDisplayName;
      const parts = String(semesterDisplayName).split(" - ");
      if (parts.length === 2) {
        payload["Ten Hoc Ky"] = parts[0].trim();
        payload["Ten Nam Hoc"] = parts[1].trim();
        payload.year = parts[1].trim();
        payload.term = parts[0].trim();
      } else {
        payload["Ten Hoc Ky"] = semesterDisplayName.trim();
        payload.term = semesterDisplayName.trim();
      }
      payload["Ma Hoc Ky"] = String(semesterDisplayName)
        .replace(/\s+/g, "")
        .toUpperCase()
        .match(/HK\d+/i)?.[0];
    }
    console.debug("fetchStudentCompareScores payload:", payload);

    const data = await fetchWithAuth<unknown>(STUDENT_COMPARE_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return data;
  } catch (e) {
    console.error("fetchStudentCompareScores error", e);
    return null;
  }
}

const STUDENT_DRL_ENDPOINT =
  "/api/giangvien/diem-ren-luyen-cua-sinh-vien-trong-tung-hoc-ky";

export async function fetchStudentDRL(masv: string): Promise<unknown> {
  try {
    const payload = { masv };
    console.debug("fetchStudentDRL payload:", payload);

    const data = await fetchWithAuth<unknown>(STUDENT_DRL_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return data;
  } catch (e) {
    console.error("fetchStudentDRL error", e);
    return null;
  }
}

export default {
  fetchStudentInfo,
  fetchStudentAccumulatedGPA,
  fetchStudentPassRate,
  fetchStudentGpaTrend,
  fetchStudentRegisteredCredits,
  fetchStudentCourseScores,
  fetchStudentCompareScores,
  fetchStudentDRL,
};
