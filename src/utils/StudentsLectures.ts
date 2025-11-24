import { API_BASE_URL, getAuth } from "./share";

const STUDENT_INFO_ENDPOINT = "/api/giangvien/thong-tin-sinh-vien";

export async function fetchStudentInfo(
  masv: string
): Promise<Record<string, unknown> | null> {
  try {
    if (!API_BASE_URL) throw new Error("API_BASE_URL is not defined");
    const auth = getAuth();
    if (!auth.token) throw new Error("Thiếu token xác thực");

    const res = await fetch(`${API_BASE_URL}${STUDENT_INFO_ENDPOINT}`, {
      method: "POST",
      headers: {
        Authorization: `${auth.tokenType ?? "Bearer"} ${auth.token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420",
      },
      body: JSON.stringify({ masv }),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || `Request failed with status ${res.status}`);
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      throw new Error(
        `Unexpected response type: ${contentType}. ${text.slice(0, 200)}`
      );
    }

    const data = await res.json();
    if (Array.isArray(data))
      return data.length ? (data[0] as Record<string, unknown>) : null;
    if (data && typeof data === "object")
      return data as Record<string, unknown>;
    return null;
  } catch (e) {
    console.error("fetchStudentInfo error:", e);
    return null;
  }
}

export default { fetchStudentInfo };
