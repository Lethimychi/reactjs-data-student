import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import {
  fetchStudentGPAs,
  StudentGPARecord,
  fetchStudentsByClass,
} from "../../utils/ClassLecturerApi";

interface StatisticsChartProps {
  selectedClassName?: string | null;
  selectedSemesterDisplayName?: string | null;
}

export default function StatisticsChart({
  selectedClassName,
  selectedSemesterDisplayName,
}: StatisticsChartProps) {
  const [data, setData] = useState<StudentGPARecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (!selectedClassName || !selectedSemesterDisplayName) {
        setData([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Fetch both roster and semester GPAs, then merge so every roster student appears
        const [roster, gpas] = await Promise.all([
          fetchStudentsByClass(selectedClassName),
          fetchStudentGPAs(selectedClassName, selectedSemesterDisplayName),
        ]);

        // If roster is empty -> treat as no data for this semester
        if (!roster || roster.length === 0) {
          if (!ignore) setData([]);
          return;
        }

        // Build quick lookup of GPA by student name (normalized)
        const gpaByName = new Map<string, number>();
        for (const r of gpas || []) {
          const nm = (r.studentName || "").trim();
          if (nm) gpaByName.set(nm, Number.isFinite(r.gpa) ? r.gpa : 0);
        }

        // For each roster entry, prefer roster name fields and fallback to GPA list order
        const merged: StudentGPARecord[] = roster.map((st) => {
          const name = String(
            st["Ho Ten"] ?? st["Ten Sinh Vien"] ?? st["StudentName"] ?? ""
          ).trim();
          const gpa = gpaByName.has(name) ? (gpaByName.get(name) as number) : 0; // default 0 when student has no GPA for that semester
          return { studentName: name || "(không tên)", gpa };
        });

        // If roster has entries but none have GPA entries and gpas was empty,
        // still show roster students with GPA=0 (per requirement). Only when roster empty
        // do we show 'Không có dữ liệu'.
        if (!ignore) setData(merged);
      } catch (err) {
        console.error("StatisticsChart load error:", err);
        if (!ignore) setError("Không thể tải dữ liệu GPA sinh viên");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [selectedClassName, selectedSemesterDisplayName]);

  const categories = data.map((d) => d.studentName);
  const series = [
    {
      name: "GPA học kỳ",
      data: data.map((d) => d.gpa),
    },
  ];

  const dynamicWidth = Math.max(600, categories.length * 90);
  const rotateAngle = categories.length > 12 ? -45 : -25;

  // Chuẩn bị dữ liệu hỗ trợ cho tooltip nâng cao
  const ranked = [...data].sort((a, b) => b.gpa - a.gpa);
  const rankMap = new Map(ranked.map((d, i) => [d.studentName, i + 1]));
  const classify = (g: number) => {
    if (g >= 9.0)
      return { label: "Xuất sắc", color: "bg-purple-700 text-white" };
    if (g >= 8.0 && g < 9.0)
      return { label: "Giỏi", color: "bg-indigo-700 text-white" };
    if (g >= 7.0 && g < 8.0)
      return { label: "Khá", color: "bg-blue-100 text-blue-700" };

    if (g >= 5.0 && g < 7.0)
      return { label: "Trung bình", color: "bg-amber-600 text-white" };
    if (g >= 4.0 && g < 5.0)
      return { label: "Yếu", color: "bg-red-600 text-white" };
    return { label: "Kém", color: "bg-red-600 text-white" };
  };

  const options: ApexOptions = {
    legend: { show: false },
    colors: ["#3B82F6"],
    chart: {
      fontFamily: "Inter, sans-serif",
      height: 310,
      type: "area",
      toolbar: { show: false },
      animations: { enabled: false },
    },
    stroke: { curve: "smooth", width: 3 },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.35,
        opacityTo: 0,
        colorStops: [
          { offset: 0, color: "#3B82F6", opacity: 0.35 },
          { offset: 100, color: "#3B82F6", opacity: 0 },
        ],
      },
    },
    markers: {
      size: 4,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 7 },
    },
    grid: {
      borderColor: "#E2E8F0",
      strokeDashArray: 3,
    },
    dataLabels: { enabled: false },
    xaxis: {
      type: "category",
      categories,
      labels: {
        rotate: rotateAngle,
        trim: true,
        style: { fontSize: "12px", colors: "#64748B" },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: {
      min: 0,
      max: 10,
      tickAmount: 6,
      forceNiceScale: true,
      labels: {
        style: { fontSize: "12px", colors: "#64748B" },
        formatter: (val: number) => Math.round(val).toString(),
      },
    },
    tooltip: {
      custom: ({ series, seriesIndex, dataPointIndex }) => {
        const student = categories[dataPointIndex];
        const raw = series[seriesIndex][dataPointIndex];
        const gpa = typeof raw === "number" ? raw : Number(raw);
        const gpaStr = gpa.toFixed(2);
        const rank = rankMap.get(student);
        const total = data.length;
        const { label, color } = classify(gpa);
        return (
          `<div class="rounded-lg shadow-lg bg-slate-800/95 text-xs text-slate-100 min-w-[190px] px-3 py-2">` +
          `<div class="font-semibold mb-1 truncate" title="${student}">${student}</div>` +
          `<div class="flex items-center justify-between mb-2"><div class="text-[11px]">GPA: <span class="font-bold text-indigo-400">${gpaStr}</span></div><div class="inline-flex items-center px-2 py-0.5 rounded-full ${color} font-semibold text-[10px]">${label}</div></div>` +
          `<div class="flex items-center justify-between"><span class="text-[10px] uppercase tracking-wide text-slate-400">Rank</span><span class="text-[11px] font-medium">#${rank}/${total}</span></div>` +
          `</div>`
        );
      },
    },
  };

  return (
    <div className="rounded-2xl bg-white shadow-md shadow-slate-200 p-6">
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 m-0">
              GPA của sinh viên trong lớp
            </h3>
            <p className="mt-1 text-slate-500 text-sm">
              {selectedClassName && selectedSemesterDisplayName
                ? `${selectedClassName} • ${selectedSemesterDisplayName}`
                : "Mặc định: 12DHTH10 • HK1 - 2024-2025"}
            </p>
          </div>
        </div>
      </div>

      {!selectedClassName || !selectedSemesterDisplayName ? (
        <div className="h-[300px] flex items-center justify-center">
          <span className="text-sm text-slate-500">
            Chọn lớp và học kỳ để xem GPA sinh viên
          </span>
        </div>
      ) : loading ? (
        <div className="h-[300px] flex items-center justify-center">
          <span className="text-sm text-slate-500">Đang tải...</span>
        </div>
      ) : error ? (
        <div className="h-[300px] flex items-center justify-center">
          <span className="text-sm text-red-600">{error}</span>
        </div>
      ) : data.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center">
          <span className="text-sm text-slate-500">Không có dữ liệu</span>
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div style={{ minWidth: dynamicWidth }}>
            <Chart options={options} series={series} type="area" height={310} />
          </div>
        </div>
      )}
    </div>
  );
}
