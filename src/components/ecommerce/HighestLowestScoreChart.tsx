import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import {
  fetchExtremeFailRateSubjects,
  ExtremeFailRateSubjectsResult,
} from "../../utils/ClassLecturerApi";

interface Props {
  selectedClassName?: string | null;
  selectedSemesterDisplayName?: string | null;
  className?: string;
}

function CustomTooltip(props: {
  active?: boolean;
  payload?: Array<{ payload?: Record<string, unknown> }>;
}) {
  const { active, payload } = props;
  if (!active || !payload || !payload.length) return null;
  const p = (payload[0].payload || {}) as Record<string, unknown>;
  const display = String(p["display"] ?? "Data");
  const highestName = String(p["highestName"] ?? "-");
  const lowestName = String(p["lowestName"] ?? "-");
  const hvRaw = p["highest"];
  const lvRaw = p["lowest"];
  const hv = typeof hvRaw === "number" ? hvRaw : Number(hvRaw as unknown);
  const lv = typeof lvRaw === "number" ? lvRaw : Number(lvRaw as unknown);
  const hvText = Number.isFinite(hv) ? hv.toFixed(2) : "-";
  const lvText = Number.isFinite(lv) ? lv.toFixed(2) : "-";
  return (
    <div
      className="p-2 text-xs text-white"
      style={{ background: "#0f172a", borderRadius: 6 }}
    >
      <div className="font-semibold">{display}</div>
      <div>
        <span className="text-slate-300">Cao nhất:</span> {highestName} —{" "}
        {hvText}
      </div>
      <div>
        <span className="text-slate-300">Thấp nhất:</span> {lowestName} —{" "}
        {lvText}
      </div>
    </div>
  );
}

export default function HighestLowestScoreChart({
  selectedClassName,
  selectedSemesterDisplayName,
  className,
}: Props) {
  const [raw, setRaw] = useState<ExtremeFailRateSubjectsResult>({});

  const cls = selectedClassName ?? undefined;
  const sem = selectedSemesterDisplayName ?? undefined;

  const q = useQuery({
    queryKey: ["extremeFailRate", cls, sem],
    queryFn: async () => fetchExtremeFailRateSubjects(cls, sem),
    enabled: !!cls,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!cls) {
      setRaw({});
      return;
    }
    if (q.isLoading) return;
    if (q.isError) {
      console.error(q.error);
      setRaw({});
      return;
    }
    setRaw(q.data ?? {});
  }, [cls, sem, q.isLoading, q.isError, q.data, q.error]);

  const highest = raw.highest;
  const lowest = raw.lowest;

  // Prefer avgScore; fall back to fail/pass percent
  const highestVal =
    highest?.avgScore ??
    (typeof highest?.failRatePercent === "number"
      ? highest!.failRatePercent
      : undefined) ??
    0;
  const lowestVal =
    lowest?.avgScore ??
    (typeof lowest?.passRatePercent === "number"
      ? lowest!.passRatePercent
      : undefined) ??
    0;

  const data = [
    {
      display: selectedSemesterDisplayName || selectedClassName || "",
      highest: highestVal,
      lowest: lowestVal,
      highestName: highest?.subjectName,
      lowestName: lowest?.subjectName,
    },
  ];

  // Choose Y domain: if values look like percentages (max > 10) use 0..100, else auto extend
  const maxVal = Math.max(highestVal ?? 0, lowestVal ?? 0, 10);
  const yDomain: [number, number] =
    maxVal > 10 ? [0, 100] : [0, Math.ceil(maxVal + 1)];

  const hasData = !!(highest || lowest);

  return (
    <div
      className={
        className ?? "rounded-2xl bg-white shadow-md shadow-slate-200 p-6"
      }
    >
      <h4 className="text-lg font-semibold text-slate-800 mb-1">
        Môn học có tỷ lệ rớt cao nhất và thấp nhất
      </h4>
      <p className="text-sm text-slate-500 mb-4">
        {selectedClassName && (
          <span className="text-xs text-slate-500">
            Lớp: <span className="font-medium">{selectedClassName}</span>
            {selectedSemesterDisplayName && (
              <span>{" • " + selectedSemesterDisplayName}</span>
            )}
          </span>
        )}
      </p>

      {q.isLoading ? (
        <div className="text-sm text-slate-500">Đang tải...</div>
      ) : q.isError ? (
        <div className="text-sm text-red-600">{String(q.error)}</div>
      ) : !hasData ? (
        <div className="text-sm text-slate-400">Không có dữ liệu</div>
      ) : (
        <div className="w-full h-64">
          <ResponsiveContainer>
            <BarChart data={data} margin={{ left: -10 }}>
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
              <XAxis
                dataKey="display"
                stroke="#64748B"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="#64748B"
                style={{ fontSize: "12px" }}
                domain={yDomain}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "none",
                  borderRadius: "6px",
                }}
                content={<CustomTooltip />}
              />
              <Bar dataKey="highest" fill={COLORS[1]} radius={[6, 6, 0, 0]} />
              <Bar dataKey="lowest" fill={COLORS[2]} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
