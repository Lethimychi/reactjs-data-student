export const useUser = () => {
  const raw = localStorage.getItem("user_info");
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("Invalid user_info:", err);
    return null;
  }
};
