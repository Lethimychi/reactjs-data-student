export type User = {
  loai_nguoi_dung?: string;
  role?: string;
  ho_ten?: string;
  username?: string;
  ma_sv?: string;
  [key: string]: unknown;
};

export const useUser = (): User | null => {
  const raw = localStorage.getItem("user_info");
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as User;
    return parsed;
  } catch (err) {
    console.error("Invalid user_info:", err);
    return null;
  }
};
