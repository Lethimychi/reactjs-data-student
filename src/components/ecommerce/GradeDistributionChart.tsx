import { useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { COLORS } from "../../utils/colors";
import { AdvisorDashboardData } from "../../utils/ClassLecturerApi";

export default function GradeDistributionChart({
  className,
  selectedClassName,
  selectedSemesterDisplayName,
  advisorData,
  loading,
}: {
  className?: string;
  selectedClassName?: string | null;
  selectedSemesterDisplayName?: string | null;
  advisorData?: AdvisorDashboardData | null;
  loading?: boolean;
}) {
  // Consume aggregated advisorData when available to avoid extra network calls

  const data = useMemo(() => {
    const dist = advisorData?.gradeDistribution ?? [];
    if (!dist || dist.length === 0) {
      return [
        { name: "Xuất sắc", value: 0 },
        { name: "Giỏi", value: 0 },
        { name: "Khá", value: 0 },
        { name: "Trung bình", value: 0 },
        { name: "Yếu", value: 0 },
      ];
    }
    // Map by labels to maintain the explicit ordering expected by UI
    const order = ["Xuất sắc", "Giỏi", "Khá", "Trung bình", "Yếu"];
    const mapped = order.map((label) => {
      const found = dist.find((d) => d.label === label);
      return { name: label, value: found ? Number(found.value) : 0 };
    });
    return mapped;
  }, [advisorData]);

  const noData = !advisorData || data.every((d) => !d.value);
  const isLoading = Boolean(loading);

  return (
    <div className="rounded-2xl bg-white shadow-md shadow-slate-200 p-6">
      <h4 className="text-lg font-semibold text-slate-800 mb-1">
        Phân bố học lực
      </h4>
      <p className="mt-1 text-slate-500 text-sm">
        {selectedClassName && selectedSemesterDisplayName
          ? `${selectedClassName} • ${selectedSemesterDisplayName}`
          : "Mặc định: 14DHBM02 • HK2 - 2024-2025"}
      </p>
      <div className={className ?? "w-full h-72"}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            Đang tải...
          </div>
        ) : noData ? (
          <div className="flex items-center justify-center h-full text-sm text-slate-400">
            Không có dữ liệu
          </div>
        ) : (
          <>
            <div className="h-56">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {data.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(
                      value: number | string,
                      name?: string | number
                    ) => {
                      const num =
                        typeof value === "number" ? value : Number(value);
                      const text = Number.isFinite(num)
                        ? `${num.toFixed(2)}%`
                        : String(value) + "%";
                      return [text, name !== undefined ? String(name) : ""];
                    }}
                    contentStyle={{
                      backgroundColor: "#c1e6ffff",
                      border: "none",
                      borderRadius: "8px",
                      color: "#1a1919ff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-1 justify-center">
              {data.map((item, i) => (
                <div
                  key={item.name}
                  className="flex items-center gap-1 bg-white/0 px-2 py-1 rounded"
                >
                  <span
                    className="inline-block w-3 h-3 rounded"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    aria-hidden
                  />
                  <span className="text-sm text-slate-700 mr-2">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
