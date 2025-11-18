// ============================================
// 1. Kiểu trả về từ backend
// ============================================
export interface AuthResponse {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  user_info?: unknown;
  [key: string]: unknown;
}

const API_URL = import.meta.env.VITE_API?.trim();

if (!API_URL) {
  console.error("❌ VITE_API is missing in .env file.");
}

// ============================================
// 2. LOGIN → Lưu token vào localStorage
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

  // Lưu token — DÙNG CHUNG 1 KEY "access_token"
  if (data.access_token) {
    localStorage.setItem("access_token", data.access_token);
  }
  if (data.refresh_token) {
    localStorage.setItem("refresh_token", data.refresh_token);
  }

  // Lưu token_type (mặc định là "Bearer" nếu backend không trả)
  const tokenType = data.token_type || "Bearer";
  localStorage.setItem("token_type", tokenType);

  // Lưu user_info
  if (data.user_info) {
    localStorage.setItem("user_info", JSON.stringify(data.user_info));
  }

  return data;
};

// ============================================
// 3. HÀM API CHUNG — Tự động gắn token
// ============================================
export const apiFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<unknown> => {
  if (!API_URL) throw new Error("VITE_API is not defined!");

  const token = localStorage.getItem("access_token");
  const tokenType = localStorage.getItem("token_type") || "Bearer";

  // Gộp headers
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");
  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  // Gắn Authorization nếu có token
  if (token) headers.set("Authorization", `${tokenType} ${token}`);

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Token hết hạn → tự động refresh
  if (res.status === 401) {
    console.warn("⚠ Token expired → Trying to refresh...");
    const newToken = await refreshTokenApi();

    if (!newToken) {
      console.warn("❌ Refresh token failed → logout");
      await logoutApi();
      throw new Error("Session expired. Please login again.");
    }

    // Thử lại request sau khi refresh thành công
    return apiFetch(endpoint, options);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API request failed");
  }

  return res.json();
};

// ============================================
// 4. REFRESH TOKEN API
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

  const data = (await res.json()) as AuthResponse;

  if (data.access_token) {
    localStorage.setItem("access_token", data.access_token);
  }
  if (data.token_type) {
    localStorage.setItem("token_type", data.token_type);
  }

  return data.access_token || null;
};

// ============================================
// 5. LOGOUT API
// ============================================
export const logoutApi = async () => {
  if (!API_URL) throw new Error("VITE_API is not defined!");

  const access_token = localStorage.getItem("access_token");
  const refresh_token = localStorage.getItem("refresh_token");

  // Không có token thì logout local luôn
  if (!access_token || !refresh_token) {
    localStorage.clear();
    return { status: 200, message: "Đã đăng xuất (local)" };
  }

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
      }),
    });

    const text = await res.text();
    let json: Record<string, unknown>;

    try {
      json = JSON.parse(text);
    } catch {
      json = { message: text };
    }

    localStorage.clear();

    return {
      status: res.status,
      message: json?.message || "Đăng xuất thành công",
    };
  } catch (err) {
    console.error("Logout request failed:", err);

    localStorage.clear();

    return {
      status: 500,
      message: "Không thể kết nối server nhưng đã xoá session local",
    };
  }
};
