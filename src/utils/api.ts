// ============================================
// 1. Định nghĩa kiểu trả về từ backend

// ============================================
export interface AuthResponse {
  access_token?: string;
  refresh_token?: string;
  user_info?: unknown;
  [key: string]: unknown;
}

const API_URL = import.meta.env.VITE_API?.trim();

if (!API_URL) {
  console.error("❌ VITE_API is missing in .env file.");
}

// ============================================
// 2. Gọi API LOGIN → Lưu token vào localStorage
// ============================================
export const loginApi = async (
  username: string,
  password: string
): Promise<AuthResponse> => {
  if (!API_URL) throw new Error("VITE_API is not defined!");

  const url = `${API_URL}/auth/login`;
  console.log("🔗 Calling API:", url);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ Login error:", text);
    throw new Error(text || "Login failed");
  }

  const data = (await res.json()) as AuthResponse;

  if (data.access_token)
    localStorage.setItem("access_token", String(data.access_token));
  if (data.refresh_token)
    localStorage.setItem("refresh_token", String(data.refresh_token));
  if (data.user_info)
    localStorage.setItem("user_info", JSON.stringify(data.user_info));
  // store token type if provided by backend (e.g. "bearer")
  const tt = data["token_type"];
  if (typeof tt === "string") localStorage.setItem("token_type", tt);
  if (data.user_info)
    localStorage.setItem("user_info", JSON.stringify(data.user_info));
  return data;
};

// ============================================
// 3. Hàm API chung → Tự động gắn token
// ============================================
export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<unknown> => {
  if (!API_URL) throw new Error("VITE_API is not defined!");

  const token = localStorage.getItem("access_token");
  const tokenType = localStorage.getItem("token_type") || "Bearer";

  // Merge headers safely using the Headers API (supports HeadersInit formats)
  const merged = new Headers(options.headers as HeadersInit | undefined);

  // Ensure JSON defaults
  if (!merged.has("Content-Type"))
    merged.set("Content-Type", "application/json");
  if (!merged.has("Accept")) merged.set("Accept", "application/json");

  if (token) merged.set("Authorization", `${tokenType} ${token}`);

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: merged,
  });

  if (res.status === 401) {
    console.warn("⚠ Token expired → Trying to refresh...");
    const newToken = await refreshTokenApi();

    if (!newToken) {
      console.warn("❌ Refresh token failed, logging out.");
      await logoutApi();
      throw new Error("Session expired. Please login again.");
    }

    // Retry request with new token
    return apiFetch(endpoint, options);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API request failed");
  }

  return res.json();
};

// ============================================
// 4. Refresh Token API (tự động gọi khi 401)
// ============================================
export const refreshTokenApi = async (): Promise<string | null> => {
  const refresh_token = localStorage.getItem("refresh_token");
  if (!refresh_token) return null;

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token }),
  });

  if (!res.ok) return null;

  const data = (await res.json()) as Record<string, unknown>;
  if (typeof data["access_token"] === "string")
    localStorage.setItem("access_token", data["access_token"] as string);
  const tt = data["token_type"];
  if (typeof tt === "string") localStorage.setItem("token_type", tt);

  return typeof data["access_token"] === "string" ? data["access_token"] : null;
};

// ============================================
// 4. Refresh Token API (tự động gọi khi 401)
// ============================================
export const logoutApi = async () => {
  if (!API_URL) throw new Error("VITE_API is not defined!");

  const access_token = localStorage.getItem("access_token");
  const refresh_token = localStorage.getItem("refresh_token");

  // Nếu không có token → đăng xuất local luôn
  if (!access_token || !refresh_token) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_info");

    return {
      status: 200,
      message: "Đã đăng xuất (local)",
    };
  }

  let json = null;

  try {
    const res = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        access_token,
        refresh_token,
        token_type: "bearer",
      }),
    });

    const text = await res.text();

    try {
      json = JSON.parse(text);
    } catch {
      json = { message: text };
    }

    // Xóa token ở FE dù backend trả gì
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_info");

    return {
      status: res.status,
      message: json?.message || "Đăng xuất thành công",
    };
  } catch (err) {
    console.error("Logout request failed:", err);

    // fallback — xóa local
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_info");

    return {
      status: 500,
      message: "Không thể kết nối server nhưng đã xoá session local",
    };
  }
};
