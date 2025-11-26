import { API_BASE_URL, getAuth } from "../share";

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ChangePasswordResponse {
  message: string;
  detail?: string;
  success?: boolean;
}

export async function changePassword(
  payload: ChangePasswordPayload
): Promise<ChangePasswordResponse | null> {
  try {
    const auth = getAuth();

    if (!auth.token) {
      console.error("⛔ Không có token → Không thể đổi mật khẩu");
      return null;
    }

    const url = `${API_BASE_URL}/auth/change-password`;

    console.log("📨 Sending Change Password request →", payload);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `${auth.tokenType} ${auth.token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "69420",
      },
      body: JSON.stringify(payload),
    });

    const contentType = res.headers.get("content-type") ?? "";

    // --------- ❌ API error (400/401/500…) ---------
    if (!res.ok) {
      let errorBody = "";

      if (contentType.includes("application/json")) {
        const json = await res.json();
        errorBody = JSON.stringify(json);
      } else {
        errorBody = await res.text();
      }

      console.error(`❌ API Error ${res.status}:`, errorBody);
      throw new Error(errorBody);
    }

    // --------- ✅ API success ---------
    if (!contentType.includes("application/json")) {
      const text = await res.text();
      throw new Error(`Unexpected non-JSON response: ${text}`);
    }

    const data = (await res.json()) as ChangePasswordResponse;

    console.log("✅ API response:", data);
    return data;
  } catch (err) {
    console.error("❌ Lỗi gọi API đổi mật khẩu:", err);
    throw err;
  }
}
