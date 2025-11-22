import { COLORS } from "./config/colors";


export type GradeName = "Giỏi" | "Khá" | "Trung bình" | "Yếu";
export const GRADE_COLORS: Record<GradeName, string> = {
  Giỏi: COLORS.RATE.GOOD,
  Khá: COLORS.RATE.FAIR,
  "Trung bình": COLORS.RATE.AVERAGE,
  Yếu: COLORS.RATE.POOR,
};

export const gradeCounts = { Giỏi: 0, Khá: 0, "Trung bình": 0, Yếu: 0 };
