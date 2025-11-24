import { useEffect, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { fetchGradeDistribution } from "../../utils/ClassLecturerApi";
import { COLORS } from "../../utils/colors";

export default function GradeDistributionChart({
  className,
  selectedClassName,
  selectedSemesterDisplayName,
}: {
  className?: string;
  selectedClassName?: string | null;
  selectedSemesterDisplayName?: string | null;
}) {
  // Require explicit class + semester selection. Do not fall back to other semesters.

  const [data, setData] = useState([
    { name: "Xuất sắc", value: 0 },
    { name: "Giỏi", value: 0 },
    { name: "Khá", value: 0 },
    { name: "Trung bình", value: 0 },
    { name: "Yếu", value: 0 },
  ]);
  const [noData, setNoData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // If class or semester is not explicitly provided, do not call API and show no-data
    if (!selectedClassName || !selectedSemesterDisplayName) {
      setNoData(true);
      setData((d) => d.map((x) => ({ ...x, value: 0 })));
      return () => {
        mounted = false;
      };
    }

    const cls = selectedClassName as string;
    const sem = selectedSemesterDisplayName as string;

    const load = async () => {
      setLoading(true);
      setError(null);
      setNoData(false);
      try {
        // Call API with explicit filters only — require exact semester match (no fallback to other semesters)
        const res = await fetchGradeDistribution(cls, sem, true);
        if (!mounted) return;
        if (!res) {
          setNoData(true);
          setData((d) => d.map((x) => ({ ...x, value: 0 })));
        } else {
          const mapped = [
            { name: "Xuất sắc", value: Number(res.xuatSac.toFixed(2)) },
            { name: "Giỏi", value: Number(res.gioi.toFixed(2)) },
            { name: "Khá", value: Number(res.kha.toFixed(2)) },
            { name: "Trung bình", value: Number(res.trungBinh.toFixed(2)) },
            { name: "Yếu", value: Number(res.yeu.toFixed(2)) },
          ];
          const sum = mapped.reduce((s, it) => s + (Number(it.value) || 0), 0);
          if (sum === 0) {
            setNoData(true);
            setData(mapped.map((x) => ({ ...x, value: 0 })));
          } else {
            setNoData(false);
            setData(mapped);
          }
        }
      } catch (e) {
        console.error(e);
        if (!mounted) return;
        setError("Lỗi khi tải dữ liệu");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [selectedClassName, selectedSemesterDisplayName]);

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
        {loading ? (
          <div className="flex items-center justify-center h-full">
            Đang tải...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-sm text-red-600">
            {error}
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
                    ) => [`${value}%`, name !== undefined ? String(name) : ""]}
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
