import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  // Legend not used but kept for future extension
} from "recharts";
import { COLORS } from "../../utils/colors";
import { getStudentGpaBySemester, GpaApiRecord } from "../../utils/student_api";

export default function GpaTrendByStudents({
  height = 160,
  data: propData,
  useMock = true,
}: // optional props to show under the title (if available)

{
  className?: string;
  height?: number;
  // optional data to render instead of fetching from API
  data?: { semester: string; gpa: number }[] | null;
  // if true, render generated mock data and do not call the API
  useMock?: boolean;
  selectedClassName?: string | null;
  selectedSemesterDisplayName?: string | null;
}) {
  const [data, setData] = useState<{ semester: string; gpa: number }[] | null>(
    propData ?? null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extracted fetch function so we can retry on demand
  const fetchGpa = async () => {
    if (propData) {
      setData(propData);
      return;
    }

    if (useMock) {
      const now = new Date();
      const currentYear = now.getFullYear();
      const mock: { semester: string; gpa: number }[] = [];
      for (let i = 0; i < 6; i++) {
        const yearOffset = Math.floor(i / 2);
        const hk = i % 2 === 0 ? "HK1" : "HK2";
        const startYear = currentYear - (2 - yearOffset);
        const endYear = startYear + 1;
        const label = `${hk} - ${startYear}-${endYear}`;
        const gpa =
          Math.round((6 + Math.random() * 3 + (i - 3) * 0.1) * 100) / 100;
        mock.push({ semester: label, gpa });
      }
      setData(mock);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const rows = await getStudentGpaBySemester();
      // treat null as empty data (e.g., no token) so UI shows 'Không có dữ liệu'
      if (!rows || rows.length === 0) {
        setData([]);
        return;
      }

      const mapped = (rows as GpaApiRecord[]).map((r, idx) => {
        const tenHocKy = (r["Ten Hoc Ky"] as string) || "";
        const tenNamHoc = (r["Ten Nam Hoc"] as string) || "";
        const semesterLabel =
          tenHocKy && tenNamHoc
            ? `${tenHocKy} - ${tenNamHoc}`
            : tenHocKy || tenNamHoc || `HK${idx + 1}`;

        const termMatch = /([0-9]+)/.exec(tenHocKy || "");
        const termNum = termMatch ? Number(termMatch[1]) : 0;

        const yearMatch = /([0-9]{4})/.exec(tenNamHoc || "");
        const yearStart = yearMatch ? Number(yearMatch[1]) : 0;

        let gpaRaw: unknown = undefined;
        const gpaKey = Object.keys(r).find((k) => /gpa/i.test(k));
        if (gpaKey) gpaRaw = r[gpaKey];
        if (gpaRaw === undefined) {
          gpaRaw =
            r["GPA_HocKy"] ??
            r["GPA_Hocky"] ??
            r["GPA"] ??
            r["Diem Trung Binh"];
        }
        if (gpaRaw === undefined) {
          const numeric = Object.values(r).find(
            (v) =>
              typeof v === "number" ||
              (!Number.isNaN(Number(v)) && String(v).trim() !== "")
          );
          gpaRaw = numeric as unknown;
        }

        const gpa =
          typeof gpaRaw === "number" ? gpaRaw : Number(String(gpaRaw)) || 0;
        return { semester: semesterLabel, gpa, termNum, yearStart };
      });

      mapped.sort((a, b) => {
        if (a.yearStart !== b.yearStart)
          return (a.yearStart || 0) - (b.yearStart || 0);
        if (a.termNum !== b.termNum) return (a.termNum || 0) - (b.termNum || 0);
        return 0;
      });

      setData(mapped.map((m) => ({ semester: m.semester, gpa: m.gpa })));
    } catch (e) {
      console.error("GPA fetch error:", e);
      const message = e instanceof Error ? e.message : String(e);
      setError(`Lỗi khi tải dữ liệu GPA${message ? `: ${message}` : ""}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    // only call fetch if component still mounted
    (async () => {
      if (!mounted) return;
      await fetchGpa();
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propData, useMock]);

  const renderContent = () => {
    if (loading)
      return (
        <div className="h-full flex items-center justify-center">
          Đang tải...
        </div>
      );
    if (error)
      return (
        <div className="h-full flex flex-col items-center justify-center text-sm text-red-600 gap-3">
          <div className="text-center">{error}</div>
          <button
            type="button"
            onClick={() => fetchGpa()}
            className="text-sm px-3 py-1 rounded-md bg-white border border-gray-200 hover:shadow-sm"
          >
            Thử lại
          </button>
        </div>
      );
    if (!data || data.length === 0)
      return (
        <div className="h-full flex items-center justify-center text-sm text-slate-500">
          Không có dữ liệu
        </div>
      );

    return (
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 6, right: 12, left: 0, bottom: 6 }}
        >
          <defs>
            <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS[1]} stopOpacity={0.5} />
              <stop offset="100%" stopColor={COLORS[1]} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E2E8F0"
            strokeOpacity={0.6}
          />
          <XAxis
            dataKey="semester"
            tick={{ fontSize: 12, fill: "#94A3B8", opacity: 0.8 }}
            tickFormatter={(label: string) =>
              typeof label === "string" && label.length > 12
                ? `${label.slice(0, 12)}...`
                : label
            }
            interval={0}
            axisLine={{ stroke: "#CBD5E1", strokeWidth: 1, opacity: 0 }}
            tickLine={{ stroke: "#CBD5E1", strokeWidth: 0.6, opacity: 0 }}
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fontSize: 12, fill: "#94A3B8", opacity: 0.8 }}
            tickCount={6}
            axisLine={{ stroke: "#CBD5E1", strokeWidth: 1, opacity: 0 }}
            tickLine={{ stroke: "#CBD5E1", strokeWidth: 0.6, opacity: 0 }}
          />
          <Tooltip
            formatter={(value: number) => Number(value).toFixed(2)}
            labelFormatter={(label) => String(label)}
          />
          <Area
            type="monotone"
            dataKey="gpa"
            stroke={COLORS[1]}
            strokeWidth={3}
            fill="url(#gpaGradient)"
            dot={{ stroke: COLORS[1], strokeWidth: 2, r: 4, fill: "#fff" }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="rounded-2xl px-4">
      <div className="flex flex-col gap-1 mb-3">
        <p className="text-lg font-semibold text-slate-800 text-center">
          GPA của sinh viên theo học kỳ
        </p>
      </div>
      <div style={{ height }}>{renderContent()}</div>
    </div>
  );
}
