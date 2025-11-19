export const API_BASE_URL = import.meta.env.VITE_API;


// Token helper: read both token and token_type if present
export function getAuth() {
  const token = localStorage.getItem("access_token");
  const tokenType = localStorage.getItem("token_type");
  // default to Bearer if server didn't store token_type
  return { token, tokenType: tokenType ?? "Bearer" };
}