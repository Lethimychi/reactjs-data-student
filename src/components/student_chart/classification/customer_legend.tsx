// components/CustomLegend.tsx
import { LegendPayload } from "recharts"; // import the correct type
import { COLORS } from "../../../utils/config/colors";

interface CustomLegendProps {
  payload?: readonly LegendPayload[]; // ← accept readonly array
}

export default function CustomLegend({ payload }: Readonly<CustomLegendProps>) {
  console.log("Legend payload:", payload);
  if (!payload) return null;

  return (
    <div className="flex flex-wrap justify-center gap-2 mt-2">
      <div className="flex items-center gap-1">
        <div
          style={{
            width: 12,
            height: 12,
            backgroundColor: COLORS.RATE.GOOD,
            borderRadius: "14px",
          }}
        />
        <span className="text-sm text-slate-600">Giỏi</span>
      </div>
      <div className="flex items-center gap-1">
        <div
          style={{
            width: 12,
            height: 12,
            backgroundColor: COLORS.RATE.FAIR,
            borderRadius: "14px",
          }}
        />
        <span className="text-sm text-slate-600">Khá</span>
      </div>
      <div className="flex items-center gap-1">
        <div
          style={{
            width: 12,
            height: 12,
            backgroundColor: COLORS.RATE.AVERAGE,
            borderRadius: "14px",
          }}
        />
        <span className="text-sm text-slate-600">Trung bình</span>
      </div>
      <div className="flex items-center gap-1">
        <div
          style={{
            width: 12,
            height: 12,
            backgroundColor: COLORS.RATE.POOR,
            borderRadius: "14px",
          }}
        />
        <span className="text-sm text-slate-600">Yếu</span>
      </div>
    </div>
  );
}
