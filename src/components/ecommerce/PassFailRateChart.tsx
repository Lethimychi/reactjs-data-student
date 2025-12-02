import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { COLORS } from "../../utils/colors";
import { AdvisorDashboardData } from "../../utils/ClassLecturerApi";

type RawPF = Record<string, unknown>;

function toNumber(v: unknown): number | undefined {
  if (v == null) return undefined;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

export default function PassFailRateChart({
  className,
  advisorData,
  loading: advisorLoading,
}: {
  className?: string;
  advisorData?: AdvisorDashboardData | null;
  loading?: boolean;
}) {
  const sample = [
    { semester: "HK1 22-23", passed: 22, failed: 6 },
    { semester: "HK2 22-23", passed: 24, failed: 8 },
    { semester: "HK1 23-24", passed: 27, failed: 1 },
    { semester: "HK2 23-24", passed: 30, failed: 2 },
  ];

  // Prefer aggregator-provided series when available.
  const rawSeries =
    (advisorData as unknown as Record<string, unknown>)?.passFailRate ||
    (advisorData as unknown as Record<string, unknown>)?.passFailSeries ||
    (advisorData as unknown as Record<string, unknown>)?.passFailBySemester ||
    undefined;

  let data = sample;

  if (Array.isArray(rawSeries) && rawSeries.length) {
    try {
      const rows = rawSeries as RawPF[];
      const mapped = rows.map((r) => {
        const sem = String(
          r["semester"] ?? r["display"] ?? r["term"] ?? r["label"] ?? ""
        );
        const passed =
          toNumber(r["passed"]) ??
          (toNumber(r["passPercent"]) != null && toNumber(r["total"]) != null
            ? Math.round(
                (toNumber(r["passPercent"])! / 100) * toNumber(r["total"])!
              )
            : undefined);
        const failed =
          toNumber(r["failed"]) ??
          (toNumber(r["failPercent"]) != null && toNumber(r["total"]) != null
            ? Math.round(
                (toNumber(r["failPercent"])! / 100) * toNumber(r["total"])!
              )
            : toNumber(r["total"]) != null && passed != null
            ? Math.round(toNumber(r["total"])! - passed)
            : undefined);
        return { semester: sem, passed: passed ?? 0, failed: failed ?? 0 };
      });
      if (mapped.length) data = mapped;
    } catch (err) {
      console.error("PassFailRate mapping failed:", err);
    }
  }

  if (advisorLoading) {
    return (
      <div className="rounded-2xl bg-white shadow-md shadow-slate-200 p-6">
        <h4 className="text-lg font-semibold text-slate-800 mb-1">
          Pass / Fail Rate
        </h4>
        <p className="text-sm text-slate-500 mb-6">Student Performance</p>
        <div className={className ?? "w-full h-64"}>
          <div className="flex items-center justify-center h-full">
            Đang tải...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white shadow-md shadow-slate-200 p-6">
      <h4 className="text-lg font-semibold text-slate-800 mb-1">
        Pass / Fail Rate
      </h4>
      <p className="text-sm text-slate-500 mb-6">Student Performance</p>
      <div className={className ?? "w-full h-64"}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ left: -10 }}>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
            <XAxis
              dataKey="semester"
              stroke="#64748B"
              style={{ fontSize: "12px" }}
            />
            <YAxis stroke="#64748B" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1E293B",
                border: "none",
                borderRadius: "6px",
                color: "#fff",
              }}
            />
            <Bar
              dataKey="passed"
              stackId="a"
              fill={COLORS[1]}
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="failed"
              stackId="a"
              fill="#FCA5A5"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
