import React from "react";
import type { Student } from "../../utils/studentNormalizers";
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { COLORS } from "../../utils/config/colors";
import type { PredictionResult } from "../../utils/student_api";

interface PredictionPanelProps {
  currentStudent: Student;
  highlightedSubject: string | null;
  onHighlightSubject: (s: string | null) => void;
  prediction?: PredictionResult | null;
  predLoading?: boolean;
  predError?: string | null;
}

export const PredictionPanel: React.FC<PredictionPanelProps> = ({
  prediction,
}) => {
  const gpa10Display = prediction?.GPA_He10 ?? "-";
  const gpa4Display = prediction?.GPA_He4 ?? "-";
  const totalCredits = prediction?.TongTinChi ?? "-";
  const remainingCredits = prediction?.ConLai ?? "-";
  const currentClassification = prediction?.DuDoan?.Loai_HienTai ?? "-";

  const distribution: { name: string; value: number }[] = prediction?.DuDoan
    ?.XacSuat_DatLoai
    ? Object.entries(prediction.DuDoan.XacSuat_DatLoai)
        .map(([k, v]) => ({
          name: k,
          value: Number(v) || 0,
        }))
        .filter(
          (item) =>
            item.name.toLowerCase() !== "yếu" &&
            item.name.toLowerCase() !== "kém"
        )
    : [];

  const pieColors = [
    COLORS.RATE.AVERAGE,
    COLORS.RATE.POOR,
    COLORS.RATE.POOR,
    COLORS.RATE.GOOD,
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 bg-white rounded-lg p-6 border shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg p-4">
              <div className="text-xs text-gray-500 uppercase">GPA HỆ 10</div>
              <div className="text-2xl font-semibold text-slate-700 mt-2">
                {gpa10Display}
              </div>
            </div>
            <div className="rounded-lg p-4">
              <div className="text-xs text-gray-500 uppercase">GPA HỆ 4</div>
              <div className="text-2xl font-semibold text-slate-700 mt-2">
                {gpa4Display}
              </div>
            </div>
            <div className="rounded-lg p-4">
              <div className="text-xs text-gray-500 uppercase">
                Tổng tín chỉ
              </div>
              <div className="text-2xl font-semibold text-slate-700 mt-2">
                {totalCredits}
              </div>
            </div>
            <div className="rounded-lg p-4">
              <div className="text-xs text-gray-500 uppercase">Còn lại</div>
              <div className="text-2xl font-semibold text-slate-700 mt-2">
                {remainingCredits}
              </div>
            </div>
          </div>

          <div className="mt-6 text-center py-6 rounded-lg bg-white/50 border border-dashed">
            <div className="text-sm text-gray-500">Xếp loại hiện tại</div>
            <div
              className="mt-3 text-3xl font-bold"
              style={{ color: COLORS.RATE.GOOD }}
            >
              {currentClassification}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border shadow-sm flex flex-col items-center">
          <div className="text-sm font-semibold text-slate-700 mb-2">
            Xác Suất Đạt Loại (%)
          </div>
          <div className="w-full h-56 flex items-center justify-center">
            {distribution.length === 0 ? (
              <div className="text-sm text-slate-500">
                Chưa có dữ liệu để hiển thị
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={80}
                    paddingAngle={6}
                    dataKey="value"
                  >
                    {distribution.map((_, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={pieColors[idx % pieColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value}`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-3 w-full">
            <div className="flex flex-wrap gap-2 justify-center text-sm">
              {distribution.map((d, idx) => (
                <div key={`leg-${idx}`} className="flex items-center gap-2">
                  <span
                    style={{ background: pieColors[idx % pieColors.length] }}
                    className="w-3 h-3 rounded-sm inline-block"
                  />
                  <span className="text-slate-600">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {prediction?.DuDoan && (
        <div className="bg-white rounded-lg p-6 border shadow-sm">
          {prediction.DuDoan.DiemCanDat_O_ConLai_DeDat && (
            <div>
              <div className="text-sm text-gray-500">
                Điểm cần đạt trên phần còn lại để đạt loại
              </div>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                {Object.entries(
                  prediction.DuDoan.DiemCanDat_O_ConLai_DeDat
                ).map(([k, v]) => (
                  <div key={k} className="p-2 border rounded text-sm">
                    <div className="text-xs text-gray-500">{k}</div>
                    <div className="font-semibold">{Number(v).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {prediction.DuDoan.GhiChu && (
            <div
              className="mt-4 text-sm text-slate-700"
              dangerouslySetInnerHTML={{
                __html: String(prediction.DuDoan.GhiChu),
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default PredictionPanel;
