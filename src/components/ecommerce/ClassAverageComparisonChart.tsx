import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { COLORS } from "../../utils/colors";
import {
  fetchCourseAverages,
  CourseAverageRecord,
  AdvisorDashboardData,
} from "../../utils/ClassLecturerApi";

export default function ClassAverageComparisonChart({
  className,
  selectedClassName,
  selectedSemesterDisplayName,
  advisorData,
  loading: advisorLoading,
}: {
  className?: string;
  selectedClassName?: string | null;
  selectedSemesterDisplayName?: string | null;
  advisorData?: AdvisorDashboardData | null;
  loading?: boolean;
}) {
  // Do not use fallbacks here — require explicit class + semester selection

  const [data, setData] = useState<
    { course: string; student: number; average: number }[]
  >([]);
  const [noData, setNoData] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  const cls = selectedClassName ?? undefined;
  const sem = selectedSemesterDisplayName ?? undefined;

  const q = useQuery({
    queryKey: ["courseAverages", cls, sem],
    queryFn: async () => fetchCourseAverages(cls, sem),
    // if parent provided aggregated data, skip the local fetch
    enabled: !!cls && !!sem && !advisorData,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!cls || !sem) {
      setData([]);
      setNoData(true);
      return;
    }

    // If parent aggregator is loading, reflect that
    if (advisorLoading) {
      setData([]);
      setNoData(true);
      return;
    }

    // If advisorData contains course averages, use them
    const ad = advisorData as unknown as
      | {
          courseAverages?: CourseAverageRecord[];
          classCourseAverages?: CourseAverageRecord[];
          courseAveraGes?: CourseAverageRecord[];
        }
      | undefined;

    const maybeCourseAverages =
      ad?.courseAverages ?? ad?.classCourseAverages ?? ad?.courseAveraGes;

    if (Array.isArray(maybeCourseAverages) && maybeCourseAverages.length) {
      try {
        const rows = maybeCourseAverages as CourseAverageRecord[];
        const mapped = rows.map((r: CourseAverageRecord) => ({
          course: (r.tenMonHoc as string) || "(không tên)",
          student: Number(r.gpaLop ?? 0),
          average: Number(r.gpaKhoa ?? 0),
        }));
        const sum = mapped.reduce(
          (s, it) => s + (Number(it.student || 0) + Number(it.average || 0)),
          0
        );
        if (sum === 0) {
          setData([]);
          setNoData(true);
        } else {
          setData(mapped);
          setNoData(false);
        }
        return;
      } catch (err) {
        console.error("Mapping advisorData.courseAverages failed:", err);
      }
    }

    if (q.isLoading) return;
    if (q.isError) {
      console.error(q.error);
      setData([]);
      setNoData(true);
      return;
    }

    const rows = (q.data ?? []) as CourseAverageRecord[];
    if (!rows || rows.length === 0) {
      setData([]);
      setNoData(true);
    } else {
      const mapped = rows.map((r) => ({
        course: r.tenMonHoc || "(không tên)",
        student: Number(r.gpaLop ?? 0),
        average: Number(r.gpaKhoa ?? 0),
      }));
      const sum = mapped.reduce(
        (s, it) => s + (Number(it.student || 0) + Number(it.average || 0)),
        0
      );
      if (sum === 0) {
        setData([]);
        setNoData(true);
      } else {
        setData(mapped);
        setNoData(false);
      }
    }
  }, [
    cls,
    sem,
    q.isLoading,
    q.isError,
    q.data,
    q.error,
    advisorData,
    advisorLoading,
  ]);

  const formatTooltip = (value: number | string, name?: string) => {
    const num = typeof value === "number" ? value : Number(value);
    const formatted = Number.isFinite(num) ? num.toFixed(2) : String(value);
    let label = name ?? "";
    if (label === "student") label = "GPA Lớp";
    else if (label === "average") label = "GPA toàn Khoa";
    return [formatted, label] as [string, string];
  };

  // Determine whether labels fit; if not, show only the first character
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () =>
      setContainerWidth(Math.floor(el.getBoundingClientRect().width || 0));

    updateWidth();
    const ResizeObs = (
      window as unknown as { ResizeObserver?: typeof ResizeObserver }
    ).ResizeObserver;
    if (ResizeObs) {
      const ro = new ResizeObs(() => updateWidth());
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const tickFormatter = (val: string) => {
    const label = String(val ?? "");
    const count = Math.max(data.length, 1);
    const perTick = containerWidth ? containerWidth / count : 100;
    // estimate char width in px; adjust if your font differs
    const avgCharPx = 8;
    const needed = Math.max(label.length * avgCharPx, avgCharPx);
    if (perTick >= needed) return label;

    // If not enough room for full label, prefer the first word (e.g., "Thực" from "Thực hành CSDL")
    const firstWord = label.split(/\s+/)[0] || label.charAt(0);
    const firstNeeded = Math.max(firstWord.length * avgCharPx, avgCharPx);
    if (perTick >= firstNeeded) return firstWord;

    // If still not enough, truncate the first word to fit (at least one char)
    const fitChars = Math.max(1, Math.floor(perTick / avgCharPx));
    return firstWord.slice(0, fitChars);
  };

  return (
    <div className="rounded-2xl bg-white shadow-md shadow-slate-200 p-6">
      <h4 className="text-lg font-semibold text-slate-800 mb-1">
        Điểm trung bình theo môn học
      </h4>
      <p className="text-sm text-slate-500 mb-6">
        {selectedClassName && (
          <span className="text-xs text-slate-500">
            Lớp: <span className="font-medium">{selectedClassName}</span>
            {selectedSemesterDisplayName && (
              <span>{" • " + selectedSemesterDisplayName}</span>
            )}
          </span>
        )}{" "}
        <br></br>
      </p>

      <div ref={containerRef} className={className ?? "w-full h-64"}>
        {q.isLoading ? (
          <div className="flex items-center justify-center h-full">
            Đang tải...
          </div>
        ) : q.isError ? (
          <div className="flex items-center justify-center h-full text-sm text-red-600">
            {String(q.error ?? "Không thể tải dữ liệu")}
          </div>
        ) : noData ? (
          <div className="flex items-center justify-center h-full text-sm text-slate-400">
            Không có dữ liệu
          </div>
        ) : (
          <ResponsiveContainer>
            <ComposedChart data={data} margin={{ left: -10 }}>
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
              <XAxis
                dataKey="course"
                stroke="#64748B"
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => `${tickFormatter(value)}  ...`}
              />
              <YAxis stroke="#64748B" style={{ fontSize: "12px" }} />
              <Tooltip
                formatter={formatTooltip}
                contentStyle={{
                  backgroundColor: "#e2edffff",
                  border: "none",
                  borderRadius: "6px",
                  color: "#151515ff",
                }}
              />
              <Bar
                dataKey="student"
                barSize={16}
                fill={COLORS[1]}
                radius={[6, 6, 0, 0]}
              />
              <Line
                type="monotone"
                dataKey="average"
                stroke={COLORS[2]}
                strokeWidth={3}
                dot={{ fill: COLORS[2], r: 3 }}
                activeDot={{ r: 7 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
