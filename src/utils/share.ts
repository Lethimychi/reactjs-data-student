export const API_BASE_URL = import.meta.env.VITE_API;

// Token helper: read both token and token_type if present
export function getAuth() {
  const token = localStorage.getItem("access_token");
  const tokenType = localStorage.getItem("token_type");
  const userId = localStorage.getItem("userId");
  // default to Bearer if server didn't store token_type
  return { token, tokenType: tokenType ?? "Bearer", userId };
}

// Generic fetch helper that attaches auth headers and validates JSON response
export async function fetchWithAuth<T = unknown>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  if (!API_BASE_URL) throw new Error("API_BASE_URL is not defined");
  const auth = getAuth();
  if (!auth.token) throw new Error("Thiếu token xác thực");

  const url = `${API_BASE_URL}${endpoint}`;
  const merged: RequestInit = {
    headers: {
      Authorization: `${auth.tokenType ?? "Bearer"} ${auth.token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "69420",
      ...(options && (options.headers as Record<string, string>)),
    },
    method: options?.method ?? "GET",
    body: options?.body,
  };

  const res = await fetch(url, merged);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const text = await res.text();
    throw new Error(
      `Unexpected response type: ${contentType}. ${text.slice(0, 200)}`
    );
  }

  return (await res.json()) as T;
}
